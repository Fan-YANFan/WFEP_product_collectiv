import type { MaterialId, RemoteAreaId } from "./pricing";

export type BookingFormData = {
  name: string;
  phone: string;
  district: string;
  address: string;
  date: string;
  materialType: MaterialId;
  estimatedWeight: number;
  walkUp: boolean;
  floors: number;
  bagCount: number;
  remoteArea: RemoteAreaId;
};

export type BookingFieldErrors = Partial<Record<keyof BookingFormData | "form", string>>;

const PHONE_RE = /^[\d\s+\-()]{8,}$/;

export function validateBookingForm(
  data: BookingFormData,
  errors: Record<string, string>,
): { valid: boolean; fieldErrors: BookingFieldErrors } {
  const fieldErrors: BookingFieldErrors = {};

  if (!data.name.trim()) fieldErrors.name = errors.nameRequired;
  if (!data.phone.trim()) fieldErrors.phone = errors.phoneRequired;
  else if (!PHONE_RE.test(data.phone.trim())) fieldErrors.phone = errors.phoneInvalid;
  if (!data.district) fieldErrors.district = errors.districtRequired;
  if (!data.address.trim()) fieldErrors.address = errors.addressRequired;
  if (!data.date) fieldErrors.date = errors.dateRequired;
  if (!data.materialType) fieldErrors.materialType = errors.materialRequired;
  if (!data.estimatedWeight || data.estimatedWeight < 2) fieldErrors.estimatedWeight = errors.weightRequired;
  if (data.walkUp) {
    if (!data.floors || data.floors < 1) fieldErrors.floors = errors.floorsRequired;
    if (!data.bagCount || data.bagCount < 1) fieldErrors.bagCount = errors.bagsRequired;
  }

  return { valid: Object.keys(fieldErrors).length === 0, fieldErrors };
}
