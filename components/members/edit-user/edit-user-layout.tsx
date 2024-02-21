import { Metadata } from "next"
import { SettingsLayoutProps } from "@/types/types"

export const metadata: Metadata = {
  title: "Forms",
  description: "Advanced form example using react-hook-form and Zod.",
}

export default function EditUserLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="flex w-full flex-col space-y-5">
      <div className="w-full flex-1">{children}</div>
    </div>
  )
}
