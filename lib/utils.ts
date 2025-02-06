import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatPhoneNumber = (phone: string) => {
  const digits = phone.replace(/\D/g, ""); // Remove all non-numeric characters
  if (digits.length <= 3) {
    return digits;
  } else if (digits.length <= 6) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  } else {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }
};

export function encodeUrl(
  path: string,
  type: "error" | "success",
  message: string,
) {
  return `${path}?${type}=${encodeURIComponent(message)}`
}
