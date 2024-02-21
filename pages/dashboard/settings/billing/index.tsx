import { BillingForm } from "./billing-form"
import SettingsLayout from "@/components/settings/settings-layout"

export default function SettingsBillingPage() {
  return (
    <SettingsLayout>
        <div className="space-y-6">
        <BillingForm />
        </div>
    </SettingsLayout>
  )
}
