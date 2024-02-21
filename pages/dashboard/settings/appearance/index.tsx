import { AppearanceForm } from "./appearance-form"
import SettingsLayout from "@/components/settings/settings-layout"

export default function SettingsAppearancePage() {
  return (
    <SettingsLayout>
      <div className="space-y-6">
        <AppearanceForm />
      </div>
    </SettingsLayout>
  )
}
