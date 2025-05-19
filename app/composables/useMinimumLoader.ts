import { ref } from 'vue';

export function useMinimumLoader(minDuration = 1000) {
    const isLoading = ref(true);

    /**
     * Wrap an async function or Promise to ensure loading lasts at least `minDuration`.
     * @param task A Promise or async function.
     */
    async function loadWithMinimum(task: Promise<any>) {
        const start = Date.now();
        await task;
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, minDuration - elapsed);

        setTimeout(() => {
            isLoading.value = false;
        }, remaining);
    }

    return {
        isLoading,
        loadWithMinimum
    };
}
