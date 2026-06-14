"use client";

import { Camera, CheckCircle2, ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

const MAX_PHOTOS = 3;

export function PhotoQuoteSection() {
  const { locale, t } = useLanguage();
  const fileRef = useRef<HTMLInputElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [phone, setPhone] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const incoming = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const combined = [...photos, ...incoming].slice(0, MAX_PHOTOS);
    setPhotos(combined);
    previews.forEach((p) => URL.revokeObjectURL(p));
    setPreviews(combined.map((f) => URL.createObjectURL(f)));
    setError(null);
  }

  function removePhoto(index: number) {
    URL.revokeObjectURL(previews[index]);
    setPhotos((p) => p.filter((_, i) => i !== index));
    setPreviews((p) => p.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!phone.trim()) {
      setError(t.booking.photoQuote.phoneRequired);
      return;
    }
    if (photos.length === 0) {
      setError(t.booking.photoQuote.photosRequired);
      return;
    }

    setSubmitting(true);
    const fd = new FormData();
    fd.append("phone", phone.trim());
    fd.append("locale", locale);
    photos.forEach((file, i) => fd.append(`photo${i}`, file));

    try {
      const res = await fetch("/api/photo-quote", { method: "POST", body: fd });
      const json = (await res.json()) as { ok?: boolean; quoteId?: string; message?: string; error?: string };
      if (!res.ok) {
        setError(json.error ?? t.booking.photoQuote.failed);
      } else {
        setDone(json.message ?? t.booking.photoQuote.success);
        setPhotos([]);
        setPreviews([]);
        setPhone("");
      }
    } catch {
      setError(t.booking.photoQuote.failed);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="animate-scale-in rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
        <p className="mt-3 font-semibold text-emerald-900">{t.booking.photoQuote.successTitle}</p>
        <p className="mt-2 text-sm text-emerald-800">{done}</p>
        <button
          type="button"
          onClick={() => {
            setDone(null);
            setExpanded(false);
          }}
          className="mt-4 text-sm font-semibold text-emerald-700 underline"
        >
          {t.booking.photoQuote.sendAnother}
        </button>
      </div>
    );
  }

  if (!expanded) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
            <Camera className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-900">{t.booking.photoQuote.title}</h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600">
            {t.booking.photoQuote.desc}
          </p>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-200 transition hover:scale-[1.02] hover:bg-emerald-700"
          >
            <Camera className="h-5 w-5" />
            {t.booking.photoQuote.cta}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="animate-fade-in-up rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{t.booking.photoQuote.formTitle}</h2>
          <p className="mt-1 text-sm text-slate-600">{t.booking.photoQuote.formDesc}</p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label={t.common.back}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-6">
        <label className="text-sm font-medium text-slate-700">{t.booking.phone}</label>
        <input
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t.booking.phonePlaceholder}
          className="input-brand mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm"
        />
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium text-slate-700">
          {t.booking.photoQuote.uploadLabel} ({photos.length}/{MAX_PHOTOS})
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="mt-3 flex flex-wrap gap-3">
          {previews.map((src, i) => (
            <div key={src} className="relative h-24 w-24 overflow-hidden rounded-xl border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100"
            >
              <ImagePlus className="h-6 w-6" />
              <span className="text-xs font-semibold">{t.booking.photoQuote.addPhoto}</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-4 text-base font-bold text-white shadow-md shadow-emerald-100 transition hover:bg-emerald-700 disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            {t.booking.photoQuote.submitting}
          </>
        ) : (
          <>
            <Camera className="h-5 w-5" />
            {t.booking.photoQuote.submit}
          </>
        )}
      </button>
    </form>
  );
}
