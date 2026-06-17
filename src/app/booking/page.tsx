"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  MapPin,
  MapPinned,
  User,
  Weight,
} from "lucide-react";
import { CollectionDatePicker } from "@/components/booking/CollectionDatePicker";
import { PhotoQuoteSection } from "@/components/booking/PhotoQuoteSection";
import { PricingBreakdown } from "@/components/booking/PricingBreakdown";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  calculateBookingCharge,
  formatHkd,
  MATERIAL_IDS,
  MATERIAL_RATES_PER_KG,
  type MaterialId,
  type RemoteAreaId,
  REMOTE_AREA_SURCHARGES,
} from "@/lib/booking/pricing";
import { validateBookingForm, type BookingFieldErrors } from "@/lib/booking/validation";
import { formatMessage } from "@/lib/i18n";

const REMOTE_AREA_IDS = Object.keys(REMOTE_AREA_SURCHARGES) as RemoteAreaId[];

export default function BookingPage() {
  const { t } = useLanguage();
  const { member } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<BookingFieldErrors>({});
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    district: "",
    address: "",
    date: "",
    materialType: "plastics" as MaterialId,
    estimatedWeight: 5,
    walkUp: false,
    floors: 1,
    bagCount: 1,
    remoteArea: "none" as RemoteAreaId,
  });

  const pricingInput = useMemo(
    () => ({
      materialType: formData.materialType,
      weightKg: formData.estimatedWeight,
      walkUp: formData.walkUp,
      floors: formData.floors,
      bagCount: formData.bagCount,
      remoteArea: formData.remoteArea,
    }),
    [formData],
  );

  const pricing = useMemo(() => calculateBookingCharge(pricingInput), [pricingInput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { valid, fieldErrors: errors } = validateBookingForm(formData, t.booking.validation);
    setFieldErrors(errors);
    if (!valid) return;
    setSubmitted(true);
  };

  const fieldErrorClass = (key: keyof BookingFieldErrors) =>
    fieldErrors[key] ? "border-red-300 ring-1 ring-red-200" : "";

  const clearError = (key: keyof BookingFieldErrors) => {
    if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="animate-scale-in w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-slate-900">{t.booking.confirmed}</h2>
          <p className="mb-6 text-slate-600">
            {formatMessage(t.booking.confirmedBody, {
              name: formData.name,
              phone: formData.phone,
              date: formData.date,
            })}
          </p>
          <div className="mb-6 space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-4 text-left text-sm">
            <p className="text-slate-500">
              {t.booking.estWeight}{" "}
              <span className="font-medium text-slate-800">{formData.estimatedWeight} kg</span>
            </p>
            <p className="text-slate-500">
              {t.booking.estTotalCharge}{" "}
              <span className="font-bold text-brand-orange-dark">
                HK$ {formatHkd(pricing.totalCharge)}
              </span>
            </p>
          </div>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/" className="btn-primary inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm">
              <ArrowLeft className="h-4 w-4" /> {t.booking.backHome}
            </Link>
            {member && (
              <Link
                href="/account"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-brand-cyan hover:bg-brand-cyan-muted/50 hover:text-brand-cyan-foreground"
              >
                <User className="h-4 w-4" /> {t.booking.backToAccount}
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-medium text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" /> {t.booking.back}
        </Link>

        <PhotoQuoteSection />

        <div className="animate-fade-in-up overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="gradient-mesh border-b border-slate-100 p-6 sm:p-10">
            <h1 className="text-3xl font-extrabold text-slate-900">{t.booking.title}</h1>
            <p className="mt-2 text-slate-600">{t.booking.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-10">
            {Object.keys(fieldErrors).length > 0 && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
                {t.booking.validation.fixErrors}
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  {t.booking.fullName}
                </label>
                <input
                  type="text"
                  className={`input-brand w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm ${fieldErrorClass("name")}`}
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    clearError("name");
                  }}
                  placeholder={t.booking.namePlaceholder}
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  {t.booking.phone}
                </label>
                <input
                  type="tel"
                  className={`input-brand w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm ${fieldErrorClass("phone")}`}
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    clearError("phone");
                  }}
                  placeholder={t.booking.phonePlaceholder}
                />
                {fieldErrors.phone && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                {t.booking.region}
              </label>
              <select
                className={`input-brand w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm ${fieldErrorClass("district")}`}
                value={formData.district}
                onChange={(e) => {
                  setFormData({ ...formData, district: e.target.value });
                  clearError("district");
                }}
              >
                <option value="">{t.booking.selectRegion}</option>
                {t.booking.regions.map((dist, idx) => (
                  <option key={idx} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
              {fieldErrors.district && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.district}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                {t.booking.address}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <textarea
                  rows={2}
                  className={`input-brand w-full resize-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm ${fieldErrorClass("address")}`}
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value });
                    clearError("address");
                  }}
                  placeholder={t.booking.addressPlaceholder}
                />
              </div>
              {fieldErrors.address && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.address}</p>
              )}
            </div>

            <div>
              <CollectionDatePicker
                value={formData.date}
                onChange={(date) => {
                  setFormData({ ...formData, date });
                  clearError("date");
                }}
              />
              {fieldErrors.date && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.date}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                {t.booking.material}
              </label>
              <select
                className="input-brand w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm"
                value={formData.materialType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    materialType: e.target.value as MaterialId,
                  })
                }
              >
                {MATERIAL_IDS.map((id) => (
                  <option key={id} value={id}>
                    {t.booking.materials[id]} (HK$ {MATERIAL_RATES_PER_KG[id]}
                    {t.booking.perKg})
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <div className="mb-2 flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                  <Weight className="h-4 w-4 text-slate-500" /> {t.booking.weight}
                </label>
                <span className="text-lg font-bold text-slate-900">
                  {formData.estimatedWeight} kg
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="100"
                className="h-2 w-full cursor-pointer rounded-lg bg-slate-200 accent-brand-cyan-dark"
                value={formData.estimatedWeight}
                onChange={(e) =>
                  setFormData({ ...formData, estimatedWeight: parseInt(e.target.value, 10) })
                }
              />
              <div className="mt-1 flex justify-between text-xs text-slate-400">
                <span>{t.booking.minWeight}</span>
                <span>{t.booking.maxWeight}</span>
              </div>
            </div>

            {/* Walk-up (Tong Lau) surcharge */}
            <fieldset className="rounded-2xl border border-slate-200 bg-white p-5">
              <legend className="flex items-center gap-2 px-1 text-sm font-bold text-slate-800">
                <Building2 className="h-4 w-4 text-violet-600" />
                {t.booking.walkUpTitle}
              </legend>
              <p className="mt-1 text-xs text-slate-500">{t.booking.walkUpDesc}</p>
              <label className="mt-3 flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={formData.walkUp}
                  onChange={(e) => setFormData({ ...formData, walkUp: e.target.checked })}
                  className="mt-0.5 accent-violet-600"
                />
                <span className="text-sm text-slate-700">{t.booking.walkUpToggle}</span>
              </label>
              {formData.walkUp && (
                <div className="animate-fade-in mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      {t.booking.floors}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={40}
                      className={`input-brand w-full rounded-lg border border-slate-200 px-3 py-2 text-sm ${fieldErrorClass("floors")}`}
                      value={formData.floors}
                      onChange={(e) => {
                        setFormData({ ...formData, floors: parseInt(e.target.value, 10) || 1 });
                        clearError("floors");
                      }}
                    />
                    {fieldErrors.floors && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.floors}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      {t.booking.bagCount}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      className={`input-brand w-full rounded-lg border border-slate-200 px-3 py-2 text-sm ${fieldErrorClass("bagCount")}`}
                      value={formData.bagCount}
                      onChange={(e) => {
                        setFormData({ ...formData, bagCount: parseInt(e.target.value, 10) || 1 });
                        clearError("bagCount");
                      }}
                    />
                    {fieldErrors.bagCount && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.bagCount}</p>
                    )}
                  </div>
                  <p className="sm:col-span-2 text-xs text-violet-700">{t.booking.walkUpRateNote}</p>
                </div>
              )}
            </fieldset>

            {/* Remote area surcharge */}
            <fieldset className="rounded-2xl border border-slate-200 bg-white p-5">
              <legend className="flex items-center gap-2 px-1 text-sm font-bold text-slate-800">
                <MapPinned className="h-4 w-4 text-amber-600" />
                {t.booking.remoteAreaTitle}
              </legend>
              <p className="mt-1 text-xs text-slate-500">{t.booking.remoteAreaDesc}</p>
              <select
                className="input-brand mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm"
                value={formData.remoteArea}
                onChange={(e) =>
                  setFormData({ ...formData, remoteArea: e.target.value as RemoteAreaId })
                }
              >
                {REMOTE_AREA_IDS.map((id) => (
                  <option key={id} value={id}>
                    {t.booking.remoteAreas[id]}
                  </option>
                ))}
              </select>
            </fieldset>

            <PricingBreakdown input={pricingInput} />

            <button type="submit" className="btn-primary w-full rounded-xl py-4 text-lg">
              {t.booking.submit}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
