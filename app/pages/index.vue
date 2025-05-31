<template>
 <div class="flex flex-col min-h-screen">
 <main class="flex-grow flex justify-center relative w-full h-full">
 <AppContainer />
 </main>
 </div>
</template>

<script>
import { useCreditStore } from '~/stores/credit'; // Import your store
import { useProfileStore } from '~/stores/profile';

export default {
 setup() {
 const credits = ref(0);
 const creditStore = useCreditStore();
 const profileStore = useProfileStore();
 const isParent = profileStore.profile === '/parent';
 onMounted(() => {
 credits.value = isParent ? creditStore.parentCredits : creditStore.childCredits[0];
 });

 return {
 credits
 };
 }
};
</script>
