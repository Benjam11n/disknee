import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/lib/constants/routes';
import { logger } from '@/lib/logger';
import { Toaster } from '@/components/ui/sonner';

export default async function CallLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session?.user) {
    logger.info(
      {
        ip: headersList.get('x-forwarded-for') || 'unknown',
      },
      'Unauthorized access attempt to call page, redirecting to login'
    );
    redirect(ROUTES.LOGIN);
  }

  logger.info(
    {
      userId: session.user.id,
      email: session.user.email,
    },
    'User accessing call page'
  );

  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
