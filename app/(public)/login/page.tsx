import dynamic from 'next/dynamic';

export const dynamic = 'force-dynamic';

const LoginClient = dynamic(() => import('./LoginClient'), { ssr: false });

export default function LoginPage() {
  return <LoginClient />;
}
