import { redirect } from 'next/navigation';

// Redirect to low-stock settings
export default function SettingsPage() {
  redirect('/settings/low-stock');
}
