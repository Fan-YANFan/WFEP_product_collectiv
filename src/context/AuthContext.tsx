"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { RecyclingCollectionPoint } from "@/lib/csdi/types";

export type OrderTimelineStep =
  | "accepted"
  | "en_route"
  | "collected"
  | "at_facility"
  | "sorted";

export type MemberOrder = {
  id: string;
  date: string;
  items: string;
  total: number;
  status: "Delivered" | "Processing" | "Shipped";
  timeline?: {
    current: OrderTimelineStep;
    eta?: string;
  };
  ecoImpact?: {
    carbonDivertedKg: number;
    largeItems: number;
  };
};

export type BookmarkedPoint = {
  cp_id: string;
  address: string;
  district: string | null;
  wasteTypes: string | null;
  savedAt: string;
};

export type EventReminder = {
  id: string;
  title: string;
  date: string;
  notes: string;
};

export type Member = {
  email: string;
};

type AuthContextValue = {
  member: Member | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  orders: MemberOrder[];
  bookmarks: BookmarkedPoint[];
  reminders: EventReminder[];
  addBookmark: (point: RecyclingCollectionPoint, address: string) => void;
  removeBookmark: (cpId: string) => void;
  isBookmarked: (cpId: string) => boolean;
  addReminder: (title: string, date: string, notes: string) => void;
  removeReminder: (id: string) => void;
  addOrder: (order: Omit<MemberOrder, "id">) => void;
  ecoStats: { carbonDivertedKg: number; largeItemsRecycled: number };
};

const SESSION_KEY = "collectiv-member-session";
const ACCOUNTS_KEY = "collectiv-member-accounts";
const ORDERS_KEY = "collectiv-member-orders";
const BOOKMARKS_KEY = "collectiv-member-bookmarks";
const REMINDERS_KEY = "collectiv-member-reminders";

const DEFAULT_ACCOUNT_EMAIL = "collectiv@gmail.com";
const DEFAULT_ACCOUNT_PASSWORD = "123456";

type StoredAccounts = Record<string, string>;

function loadSession(): Member | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Member;
  } catch {
    return null;
  }
}

function loadAccounts(): StoredAccounts {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as StoredAccounts;
  } catch {
    return {};
  }
}

function ensureDefaultAccount() {
  if (typeof window === "undefined") return;
  const accounts = loadAccounts();
  accounts[DEFAULT_ACCOUNT_EMAIL] = DEFAULT_ACCOUNT_PASSWORD;
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function loadMemberData<T>(key: string, email: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const all = JSON.parse(raw) as Record<string, T>;
    return all[email] ?? fallback;
  } catch {
    return fallback;
  }
}

function saveMemberData<T>(key: string, email: string, data: T) {
  const raw = localStorage.getItem(key);
  const all = raw ? (JSON.parse(raw) as Record<string, T>) : {};
  all[email] = data;
  localStorage.setItem(key, JSON.stringify(all));
}

function seedDemoOrders(): MemberOrder[] {
  const twoDaysFromNow = new Date();
  twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
  const pickupDate = twoDaysFromNow.toISOString().slice(0, 10);

  return [
    {
      id: "ORD-10042",
      date: pickupDate,
      items: "Mixed recyclables — plastics, paper, 2 large appliances",
      total: 485,
      status: "Processing",
      timeline: { current: "en_route", eta: "3:30 PM" },
      ecoImpact: { carbonDivertedKg: 42, largeItems: 2 },
    },
    {
      id: "ORD-10038",
      date: "2025-11-18",
      items: "E-waste, metals, cardboard — flat clearance",
      total: 720,
      status: "Delivered",
      timeline: { current: "sorted" },
      ecoImpact: { carbonDivertedKg: 85, largeItems: 6 },
    },
  ];
}

function seedDemoReminders(): EventReminder[] {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 2);
  return [
    {
      id: "demo-ssp-books",
      title: "Sham Shui Po Book Recycling Drive",
      date: endDate.toISOString().slice(0, 10),
      notes: "Shek Kip Mei Community Hall, 10am–4pm. Bring paperback books only.",
    },
  ];
}

function computeEcoStats(orders: MemberOrder[]) {
  return orders.reduce(
    (acc, o) => ({
      carbonDivertedKg: acc.carbonDivertedKg + (o.ecoImpact?.carbonDivertedKg ?? 0),
      largeItemsRecycled: acc.largeItemsRecycled + (o.ecoImpact?.largeItems ?? 0),
    }),
    { carbonDivertedKg: 0, largeItemsRecycled: 0 },
  );
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);
  const [ready, setReady] = useState(false);
  const [orders, setOrders] = useState<MemberOrder[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkedPoint[]>([]);
  const [reminders, setReminders] = useState<EventReminder[]>([]);
  const [ecoStats, setEcoStats] = useState({ carbonDivertedKg: 0, largeItemsRecycled: 0 });

  const loadMemberState = useCallback((email: string) => {
    let memberOrders = loadMemberData<MemberOrder[]>(ORDERS_KEY, email, []);
    if (memberOrders.length === 0) {
      memberOrders = seedDemoOrders();
      saveMemberData(ORDERS_KEY, email, memberOrders);
    }
    setOrders(memberOrders);
    setEcoStats(computeEcoStats(memberOrders));
    setBookmarks(loadMemberData<BookmarkedPoint[]>(BOOKMARKS_KEY, email, []));
    let memberReminders = loadMemberData<EventReminder[]>(REMINDERS_KEY, email, []);
    if (memberReminders.length === 0) {
      memberReminders = seedDemoReminders();
      saveMemberData(REMINDERS_KEY, email, memberReminders);
    }
    setReminders(memberReminders);
  }, []);

  useEffect(() => {
    ensureDefaultAccount();
    const session = loadSession();
    if (session) {
      setMember(session);
      loadMemberState(session.email);
    }
    setReady(true);
  }, [loadMemberState]);

  const login = useCallback(
    async (email: string, password: string) => {
      const normalized = email.trim().toLowerCase();
      if (!normalized || !password) {
        return { ok: false, error: "Email and password are required." };
      }

      const accounts = loadAccounts();
      if (!accounts[normalized]) {
        return { ok: false, error: "No account found. Please sign up first." };
      }
      if (accounts[normalized] !== password) {
        return { ok: false, error: "Incorrect password." };
      }

      const session = { email: normalized };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setMember(session);
      loadMemberState(normalized);
      return { ok: true };
    },
    [loadMemberState],
  );

  const signup = useCallback(
    async (email: string, password: string) => {
      const normalized = email.trim().toLowerCase();
      if (!normalized || !password) {
        return { ok: false, error: "Email and password are required." };
      }
      if (password.length < 6) {
        return { ok: false, error: "Password must be at least 6 characters." };
      }

      const accounts = loadAccounts();
      if (accounts[normalized]) {
        return { ok: false, error: "An account with this email already exists. Please log in." };
      }

      accounts[normalized] = password;
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));

      const session = { email: normalized };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setMember(session);
      loadMemberState(normalized);
      return { ok: true };
    },
    [loadMemberState],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setMember(null);
    setOrders([]);
    setBookmarks([]);
    setReminders([]);
    setEcoStats({ carbonDivertedKg: 0, largeItemsRecycled: 0 });
  }, []);

  const addBookmark = useCallback(
    (point: RecyclingCollectionPoint, address: string) => {
      if (!member) return;
      const next = [
        ...bookmarks.filter((b) => b.cp_id !== point.cp_id),
        {
          cp_id: point.cp_id,
          address,
          district: point.district_id,
          wasteTypes: point.waste_type,
          savedAt: new Date().toISOString(),
        },
      ];
      setBookmarks(next);
      saveMemberData(BOOKMARKS_KEY, member.email, next);
    },
    [member, bookmarks],
  );

  const removeBookmark = useCallback(
    (cpId: string) => {
      if (!member) return;
      const next = bookmarks.filter((b) => b.cp_id !== cpId);
      setBookmarks(next);
      saveMemberData(BOOKMARKS_KEY, member.email, next);
    },
    [member, bookmarks],
  );

  const isBookmarked = useCallback(
    (cpId: string) => bookmarks.some((b) => b.cp_id === cpId),
    [bookmarks],
  );

  const addReminder = useCallback(
    (title: string, date: string, notes: string) => {
      if (!member) return;
      const next = [
        ...reminders,
        { id: crypto.randomUUID(), title, date, notes },
      ].sort((a, b) => a.date.localeCompare(b.date));
      setReminders(next);
      saveMemberData(REMINDERS_KEY, member.email, next);
    },
    [member, reminders],
  );

  const removeReminder = useCallback(
    (id: string) => {
      if (!member) return;
      const next = reminders.filter((r) => r.id !== id);
      setReminders(next);
      saveMemberData(REMINDERS_KEY, member.email, next);
    },
    [member, reminders],
  );

  const addOrder = useCallback(
    (order: Omit<MemberOrder, "id">) => {
      if (!member) return;
      const next = [
        { ...order, id: `ORD-${Date.now().toString().slice(-6)}` },
        ...orders,
      ];
      setOrders(next);
      setEcoStats(computeEcoStats(next));
      saveMemberData(ORDERS_KEY, member.email, next);
    },
    [member, orders],
  );

  return (
    <AuthContext.Provider
      value={{
        member,
        ready,
        login,
        signup,
        logout,
        orders,
        bookmarks,
        reminders,
        addBookmark,
        removeBookmark,
        isBookmarked,
        addReminder,
        removeReminder,
        addOrder,
        ecoStats,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
