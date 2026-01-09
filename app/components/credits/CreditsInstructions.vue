<template>
  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <!-- Header Toggle -->
    <button
      class="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      @click="isExpanded = !isExpanded"
    >
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-info" class="text-blue-500" size="20" />
        <span class="font-medium text-gray-800">How Credits Work</span>
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
          <strong>Tip:</strong> Credits are a pledge system - you set aside points to reward your children for learning.
        </div>

        <div class="grid md:grid-cols-2 gap-4">
          <div class="rounded-xl bg-slate-50 p-4">
            <h4 class="font-medium text-slate-800 mb-3">How It Works</h4>
            <ul class="text-sm text-slate-600 space-y-2">
              <li>• Top up credits to your balance ($1 = 100 credits)</li>
              <li>• Transfer credits to your children as rewards</li>
              <li>• Children earn credits by completing quiz tasks</li>
              <li>• When children shop, you approve and pay via Stripe</li>
            </ul>
          </div>

          <div class="rounded-xl bg-slate-50 p-4">
            <h4 class="font-medium text-slate-800 mb-3">Managing Credits</h4>
            <div class="space-y-2">
              <div class="flex items-start gap-2">
                <div class="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">1</div>
                <span class="text-sm text-slate-600">Top up credits to add to your balance</span>
              </div>
              <div class="flex items-start gap-2">
                <div class="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">2</div>
                <span class="text-sm text-slate-600">Transfer credits to family members</span>
              </div>
              <div class="flex items-start gap-2">
                <div class="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">3</div>
                <span class="text-sm text-slate-600">Create tasks to reward quiz completion</span>
              </div>
              <div class="flex items-start gap-2">
                <div class="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">4</div>
                <span class="text-sm text-slate-600">View transaction history below</span>
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-xl bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
          <strong>Note:</strong> StudyWithEddy does not store real money. Credits are a pledge system - you pay via Stripe only when approving your child's shop orders.
        </div>
      </template>

      <!-- Student Instructions -->
      <template v-else>
        <div class="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Tip:</strong> Earn credits by completing quiz tasks, then spend them in the shop!
        </div>

        <div class="grid md:grid-cols-2 gap-4">
          <div class="rounded-xl bg-slate-50 p-4">
            <h4 class="font-medium text-slate-800 mb-3">How It Works</h4>
            <ul class="text-sm text-slate-600 space-y-2">
              <li>• Complete quiz tasks to earn credits</li>
              <li>• Your parent can also transfer credits to you</li>
              <li>• Use credits to shop for items you want</li>
              <li>• Your parent approves and pays for your orders</li>
            </ul>
          </div>

          <div class="rounded-xl bg-slate-50 p-4">
            <h4 class="font-medium text-slate-800 mb-3">Earning Credits</h4>
            <div class="space-y-2">
              <div class="flex items-start gap-2">
                <div class="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">1</div>
                <span class="text-sm text-slate-600">Check your tasks for quiz assignments</span>
              </div>
              <div class="flex items-start gap-2">
                <div class="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">2</div>
                <span class="text-sm text-slate-600">Go to Study and complete quizzes</span>
              </div>
              <div class="flex items-start gap-2">
                <div class="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">3</div>
                <span class="text-sm text-slate-600">Pass with the required score to earn credits</span>
              </div>
              <div class="flex items-start gap-2">
                <div class="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">4</div>
                <span class="text-sm text-slate-600">Credits are added to your balance automatically!</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  isParent: boolean;
}>();

const isExpanded = ref(false);
</script>
