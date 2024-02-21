import { SecurityForm } from "./security-form"
import SettingsLayout from "@/components/settings/settings-layout"

export default function SettingsAccountPage() {
  return (
    <SettingsLayout>
        <div className="space-y-6">
            <SecurityForm />
        </div>
    </SettingsLayout>
  )
}