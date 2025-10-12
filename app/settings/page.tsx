import PushSubscribe from '@/components/push-subscribe'
import ContentWrapper from '@/components/ui/content-wrapper'
import SectionHeader from '@/components/ui/section-header'

export const metadata = {
  title: 'Settings',
  description: 'User settings and preferences',
}

export default function SettingsPage() {
  return (
    <ContentWrapper>
      <SectionHeader title={"Settings"} subtitle={"Manage your account and preferences"} />

      <section className="bg-white shadow rounded p-6">
        <h2 className="text-lg font-semibold mb-2">Notifications</h2>
        <p className="text-sm text-gray-600 mb-4">Enable browser notifications to receive alerts when sources you follow publish new posts.</p>
        <PushSubscribe />
      </section>
    </ContentWrapper>
  )
}
