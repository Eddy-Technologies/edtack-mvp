export default defineEventHandler(async (event) => {
  // Clear the HttpOnly cookie by setting its expiry to a past date
  setCookie(event, 'app_user_jwt', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0, // Set maxAge to 0 to immediately expire the cookie
    path: '/',
    sameSite: 'lax',
  });

  return { message: 'App user logged out successfully.' };
});
