import { NotificationsForm } from "./notifications-form"
import SettingsLayout from "@/components/settings/settings-layout"

export default function SettingsNotificationsPage() {
  return (
    <SettingsLayout>
        <div className="space-y-6">
            <NotificationsForm />
        </div>
    </SettingsLayout>
  )
}
