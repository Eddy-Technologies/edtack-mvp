import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useProfileStore = defineStore('profile', () => {
    const profile = ref("/parent");
    const childSelected = ref(0);
    const name = ref('sfxcode');  // name value, as you had it earlier

    function setProfile(type) {
       profile.value = type;
    }

    function setChild(childSelected) {
        childSelected.value = childSelected;
    }

    return { profile, name, childSelected, setProfile, setChild };
});
