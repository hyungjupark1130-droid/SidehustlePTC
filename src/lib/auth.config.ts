import type { NextAuthConfig } from 'next-auth';

// Edge-compatible auth config — no native modules, no Prisma.
// Used by middleware.ts. Full config with credentials is in auth.ts.
export const authConfig = {
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoginPage = nextUrl.pathname === '/admin/login';
      if (isLoginPage) return true;
      const isAdminArea = nextUrl.pathname.startsWith('/admin');
      if (isAdminArea) return !!auth?.user;
      return true;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.sub;
        (session.user as any).role = (token as any).role;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
