<script setup lang='ts'>
const config = useRuntimeConfig();
const { menu } = useNavigationMenu();

const collapsed = useState<boolean>('collapsed');
const isOnMobile = useState<boolean>('isOnMobile');

function onResize() {
 if (window.innerWidth <= 980) {
 collapsed.value = true;
 isOnMobile.value = true;
 } else {
 collapsed.value = false;
 isOnMobile.value = false;
 }
}

function onToggleCollapse() {
}

function onItemClick() {
}

onMounted(() => {
 onResize();
 window.addEventListener('resize', onResize);
});
</script>

<template>
 <div>
 <sidebar-menu
 v-model:collapsed="collapsed"
 link-component-name="nuxt-sidebar-link"
 :menu="menu"
 :show-one-child="true"
 width="180px"
 width-collapsed="50px"
 @update:collapsed="onToggleCollapse"
 @item-click="onItemClick"
 >
 <template #header>
 <img class="m-2 w-40" src="../../assets/a.png">
 </template>
 <template #footer>
 <div class="m-2 text-center text-xs text-color-[var(--primary-color)]">
 <span class="font-medium ml-2">Super Workshop - {{ config.public['APP_VERSION'] }} - {{ new Date().toDateString() }}</span>
 </div>
 </template>
 </sidebar-menu>
 <div
 v-if="isOnMobile && !collapsed"
 class="fixed w-full h-full top-0 left-0 bg-white opacity-50 z-[900]"
 @click="collapsed = true"
 />
 </div>
</template>

<style lang="scss">
.v-sidebar-menu {
 --vsm-primary-color: theme('colors.primary.DEFAULT');
 --vsm-base-bg: theme('colors.background.100');
 --vsm-item-color: theme('colors.primary.900');
 --vsm-item-active-color: theme('colors.primary.500');
 --vsm-item-active-bg: theme('colors.background.300');
 --vsm-icon-color: theme('colors.primary.700');
 --vsm-item-hover-bg: theme('colors.background.200');
 // You can add other variables here as needed, for example:
 // --vsm-title-color: theme('colors.secondary');
 // --vsm-toggle-btn-color: theme('colors.accent');
 // --vsm-dropdown-bg: theme('colors.background.50');
}
</style>
