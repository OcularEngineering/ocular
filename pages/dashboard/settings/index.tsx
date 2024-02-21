import { ProfileForm } from "./profile-form"
import SettingsLayout from "@/components/settings/settings-layout"

export default function SettingsProfilePage() {
  return (
    <SettingsLayout>
        <div className="space-y-10">
            <ProfileForm />
        </div>
    </SettingsLayout>
  )
}
