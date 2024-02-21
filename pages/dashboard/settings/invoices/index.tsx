import { InvoicesForm } from "./invoices-form"
import SettingsLayout from "@/components/settings/settings-layout"

export default function SettingsInvoicesPage() {
  return (
    <SettingsLayout>
        <div className="space-y-6">
        <InvoicesForm />
        </div>
    </SettingsLayout>
  )
}
