"use client";

import Link from "next/link";
import { useCookies } from "@/context/CookieContext";
import { useLanguage } from "@/context/LanguageContext";
import { COMPANY } from "@/lib/product";

export function Footer() {
  const { openSettings } = useCookies();
  const { t } = useLanguage();

  const links = [
    { href: "/", label: t.footer.recyclingPoints },
    { href: "/terms", label: t.footer.terms },
    { href: "/privacy", label: t.footer.privacy },
    { href: "/cookies", label: t.footer.cookies },
  ];

  return (
    <footer className="footer-brand border-t border-slate-200/80 text-slate-700">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="logo-brand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/favicon.png" alt="" width={32} height={32} decoding="async" />
              </span>
              <p className="font-display text-xl font-semibold text-slate-900">Collectiv</p>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{t.footer.tagline}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-cyan-foreground">
              {t.footer.links}
            </p>
            <ul className="mt-4 space-y-2">
              {links.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-600 transition hover:text-brand-cyan-dark"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={openSettings}
                  className="text-sm text-slate-600 transition hover:text-brand-cyan-dark"
                >
                  {t.footer.cookiePreferences}
                </button>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-cyan-foreground">
              {t.footer.contact}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>{COMPANY.name}</li>
              <li>{COMPANY.address}</li>
              <li>
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="link-brand font-medium transition"
                >
                  {COMPANY.email}
                </a>
              </li>
              <li>{COMPANY.phone}</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-slate-200 pt-8 text-xs text-slate-500 sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {COMPANY.name}. {t.common.allRights}
          </p>
          <p>{t.footer.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
