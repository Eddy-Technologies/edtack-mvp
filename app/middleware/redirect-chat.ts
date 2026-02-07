export default defineNuxtRouteMiddleware((to) => {
  if (to.path === '/') {
    return navigateTo('/chat/new', { replace: true });
  }
});
