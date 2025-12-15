<template>
  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <!-- Header Toggle -->
    <button
      class="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      @click="toggleExpanded"
    >
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-info" class="text-blue-500" size="20" />
        <span class="font-medium text-gray-800">How Tasks Work</span>
      </div>
      <UIcon
        :name="isExpanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
        class="text-gray-400"
        size="20"
      />
    </button>

    <!-- Collapsible Content -->
    <div v-show="isExpanded" class="border-t border-gray-100 p-4 space-y-4">
      <!-- Parent Instructions -->
      <template v-if="isParent">
        <div class="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Tip:</strong> Tasks help motivate your children to learn by rewarding them with credits when they pass quizzes.
        </div>

        <div class="grid md:grid-cols-2 gap-4">
          <div class="rounded-xl bg-slate-50 p-4">
            <h4 class="font-medium text-slate-800 mb-3">How It Works</h4>
            <ul class="text-sm text-slate-600 space-y-2">
              <li>• You create tasks with specific subjects and chapters</li>
              <li>• Set credits to reward and required passing score</li>
              <li>• Your child completes quizzes on assigned chapters</li>
              <li>• Credits are awarded automatically when they pass</li>
            </ul>
          </div>

          <div class="rounded-xl bg-slate-50 p-4">
            <h4 class="font-medium text-slate-800 mb-3">Creating a Task</h4>
            <div class="space-y-2">
              <div class="flex items-start gap-2">
                <div class="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">1</div>
                <span class="text-sm text-slate-600">Select which child to assign</span>
              </div>
              <div class="flex items-start gap-2">
                <div class="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">2</div>
                <span class="text-sm text-slate-600">Choose a subject and chapters</span>
              </div>
              <div class="flex items-start gap-2">
                <div class="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">3</div>
                <span class="text-sm text-slate-600">Set credits per quiz (deducted from your balance)</span>
              </div>
              <div class="flex items-start gap-2">
                <div class="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">4</div>
                <span class="text-sm text-slate-600">Set required score to pass (0-100%)</span>
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-xl bg-slate-50 p-4">
          <h4 class="font-medium text-slate-800 mb-3">Task Statuses</h4>
          <div class="grid md:grid-cols-3 gap-3 text-sm">
            <div>
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-1">Open</span>
              <p class="text-slate-600">Active task, child can take quizzes</p>
            </div>
            <div>
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-1">Completed</span>
              <p class="text-slate-600">Child passed and earned credits</p>
            </div>
            <div>
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mb-1">Closed</span>
              <p class="text-slate-600">Task was manually closed by parent</p>
            </div>
          </div>
        </div>
      </template>

      <!-- Student Instructions -->
      <template v-else>
        <div class="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Tip:</strong> Complete quizzes on your assigned tasks to earn credits you can use in the shop!
        </div>

        <div class="grid md:grid-cols-2 gap-4">
          <div class="rounded-xl bg-slate-50 p-4">
            <h4 class="font-medium text-slate-800 mb-3">How It Works</h4>
            <ul class="text-sm text-slate-600 space-y-2">
              <li>• Your parent creates tasks with quiz assignments</li>
              <li>• Each task has chapters to study and a passing score</li>
              <li>• Go to Study tab and take quizzes on assigned chapters</li>
              <li>• When you pass with the required score, you earn credits!</li>
            </ul>
          </div>

          <div class="rounded-xl bg-slate-50 p-4">
            <h4 class="font-medium text-slate-800 mb-3">Completing a Task</h4>
            <div class="space-y-2">
              <div class="flex items-start gap-2">
                <div class="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">1</div>
                <span class="text-sm text-slate-600">Check your open tasks to see what's assigned</span>
              </div>
              <div class="flex items-start gap-2">
                <div class="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">2</div>
                <span class="text-sm text-slate-600">Go to the Study tab and select a chapter from your task</span>
              </div>
              <div class="flex items-start gap-2">
                <div class="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">3</div>
                <span class="text-sm text-slate-600">Take the quiz and try to reach the required score</span>
              </div>
              <div class="flex items-start gap-2">
                <div class="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">4</div>
                <span class="text-sm text-slate-600">Credits are added to your balance automatically!</span>
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-xl bg-slate-50 p-4">
          <h4 class="font-medium text-slate-800 mb-3">Task Statuses</h4>
          <div class="grid md:grid-cols-3 gap-3 text-sm">
            <div>
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-1">Open</span>
              <p class="text-slate-600">You can take quizzes to complete this task</p>
            </div>
            <div>
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-1">Completed</span>
              <p class="text-slate-600">You passed and earned your credits!</p>
            </div>
            <div>
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mb-1">Expired/Closed</span>
              <p class="text-slate-600">Task is no longer active</p>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

defineProps<{
  isParent: boolean;
}>();

const STORAGE_KEY = 'taskInstructionsExpanded';
const isExpanded = ref(false);

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
  localStorage.setItem(STORAGE_KEY, String(isExpanded.value));
};

onMounted(() => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) {
    isExpanded.value = stored === 'true';
  }
});
</script>
