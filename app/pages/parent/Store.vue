<template>
  <div class="space-y-6 store-settings mt-6">
    <div
        v-for="setting in settings"
        :key="setting"
        class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-4 shadow-md md:max-w-[600px] max-w-[350px]"
    >
      <div class="flex items-center gap-4 flex-wrap">
        <!-- Setting Name -->
        <h2 class="text-lg font-semibold text-gray-800 dark:text-white min-w-[150px]">
          {{ setting }}
        </h2>

        <!-- All Toggle -->
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-700 dark:text-gray-300">All</span>
          <input
              type="checkbox"
              v-model="settingsState[setting].all"
              @change="toggleAll(setting)"
              class="toggle-checkbox"
          />
        </div>

        <!-- Children Toggles -->
        <div class="flex items-center gap-3 flex-wrap">
          <div
              v-for="child in children"
              :key="child"
              class="cursor-pointer"
              @click="toggleChild(setting, child)"
          >
            <span
                class="text-sm font-medium rounded px-8 py-1 transition"
                :class="settingsState[setting][child] ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white'"
            >
              {{ child }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="text-center mt-8">
      <ULink
          class="text-l md:text-l text-primary font-bold flex items-center justify-center gap-x-2 border-2 border-solid hover:border-primary hover:text-green-600 transition duration-300 ease-in-out w-34 h-16 px-6 py-3 rounded-lg p-2"
          @click="saveSettings"
      >
        Save Settings
      </ULink>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { ULink } from '#components'

const settings = ['Game Credits', 'Fast Food', 'Cash', 'Beverages']
const children = ['John', 'Jane', 'Alice']

const settingsState = reactive({})

settings.forEach(setting => {
  settingsState[setting] = {
    all: false,
    'John': false,
    'Jane': false,
    'Alice': false,
  }
})

const toggleAll = (setting) => {
  const newValue = settingsState[setting].all
  children.forEach(child => {
    settingsState[setting][child] = newValue
  })
}

const toggleChild = (setting, child) => {
  settingsState[setting][child] = !settingsState[setting][child]
}

const saveSettings = () => {
  console.log('Saved settings:', JSON.parse(JSON.stringify(settingsState)))
}
</script>

<style scoped>
.toggle-checkbox {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: #2563eb;
}
</style>
