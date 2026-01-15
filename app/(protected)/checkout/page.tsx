import { redirect } from 'next/navigation';

export default function CheckoutPage() {
  // Checkout functionality is disabled - redirect to inventory
  redirect('/inventory');
}
