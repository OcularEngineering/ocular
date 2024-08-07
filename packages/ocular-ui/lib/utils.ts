import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to format a string of fomart (e.g google-drive) to a label such as Google Drive
export  function formatLabel(source: string) {
  return source
    .split('-')
    .map((word :string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}


export function formatBytes(
  bytes: number,
  opts: {
    decimals?: number
    sizeType?: "accurate" | "normal"
  } = {}
) {
  const { decimals = 0, sizeType = "normal" } = opts

  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const accurateSizes = ["Bytes", "KiB", "MiB", "GiB", "TiB"]
  if (bytes === 0) return "0 Byte"
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${
    sizeType === "accurate" ? accurateSizes[i] ?? "Bytest" : sizes[i] ?? "Bytes"
  }`
}

// Function to format a date string to a human-readable format

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatLink(url: string) {
  const prefix = "doc.link";
  if (url.startsWith(prefix)) {
    return url.substring(prefix.length);
  }
  return url;
}