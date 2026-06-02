import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PATHS  = ['/profile', '/my-reviews', '/dashboard', '/products/new'];
const MOD_PATHS        = ['/moderation'];
const ADMIN_PATHS      = ['/admin'];
const AUTH_ONLY_PATHS  = ['/login', '/register'];

// Paths that need no auth check at all — skip Supabase call entirely
const PUBLIC_PATHS     = ['/', '/products', '/about'];

function needsAuthCheck(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return false;
  // Public product pages (but not /products/[slug]) handled by the app itself
  // Only intercept protected/auth-gated routes
  return (
    AUTH_ONLY_PATHS.some((p) => pathname.startsWith(p)) ||
    PROTECTED_PATHS.some((p) => pathname.startsWith(p)) ||
    MOD_PATHS.some((p) => pathname.startsWith(p)) ||
    ADMIN_PATHS.some((p) => pathname.startsWith(p))
  );
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip auth check entirely for routes that don't need it
  if (!needsAuthCheck(pathname)) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Redirect authenticated users away from login/register
  if (user && AUTH_ONLY_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect unauthenticated users away from protected pages
  if (!user && PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Role-gated paths
  const needsRoleCheck =
    MOD_PATHS.some((p) => pathname.startsWith(p)) ||
    ADMIN_PATHS.some((p) => pathname.startsWith(p));

  if (needsRoleCheck) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url));

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role as string;

    if (ADMIN_PATHS.some((p) => pathname.startsWith(p)) && role !== 'admin') {
      return NextResponse.redirect(new URL('/products', request.url));
    }
    if (MOD_PATHS.some((p) => pathname.startsWith(p)) && !['moderator', 'admin'].includes(role)) {
      return NextResponse.redirect(new URL('/products', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
