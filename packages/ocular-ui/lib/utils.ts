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