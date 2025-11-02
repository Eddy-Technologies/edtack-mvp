export default defineNuxtRouteMiddleware((to) => {
  if (to.path === '/') {
    return navigateTo('/chat/eddy/new', { replace: true });
  }
});
