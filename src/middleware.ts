export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/((?!api|auth|static|icons|favicon.ico|join|manifest.json|manifest.webmanifest|sw.js|workbox-.*.js).*)',
  ],
};
