<template>
  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <!-- Header Toggle -->
    <button
      class="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      @click="isExpanded = !isExpanded"
    >
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-info" class="text-blue-500" size="20" />
        <span class="font-medium text-gray-800">How Shopping Works</span>
      </div>
      <UIcon
        :name="isExpanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
        class="text-gray-400"
        size="20"
      />
    </button>

    <!-- Collapsible Content -->
    <div v-show="isExpanded" class="border-t border-gray-100 p-4 space-y-4">
      <!-- Student Instructions -->
      <template v-if="!isParent">
        <div class="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Tip:</strong> Use your credits to shop - your parent will approve and pay for your order!
        </div>

        <div class="grid md:grid-cols-2 gap-4">
          <div class="rounded-xl bg-slate-50 p-4">
            <h4 class="font-medium text-slate-800 mb-3">How It Works</h4>
            <ul class="text-sm text-slate-600 space-y-2">
              <li>• Browse products and add items to your cart</li>
              <li>• Checkout using your credit balance</li>
              <li>• Your parent receives the order for approval</li>
              <li>• Once approved, your item is on its way!</li>
            </ul>
          </div>

          <div class="rounded-xl bg-slate-50 p-4">
            <h4 class="font-medium text-slate-800 mb-3">How to Purchase</h4>
            <div class="space-y-2">
              <div class="flex items-start gap-2">
                <div class="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">1</div>
                <span class="text-sm text-slate-600">Browse and add items to your cart</span>
              </div>
              <div class="flex items-start gap-2">
                <div class="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">2</div>
                <span class="text-sm text-slate-600">Click the cart icon to review your items</span>
              </div>
              <div class="flex items-start gap-2">
                <div class="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">3</div>
                <span class="text-sm text-slate-600">Checkout using your credits</span>
              </div>
              <div class="flex items-start gap-2">
                <div class="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">4</div>
                <span class="text-sm text-slate-600">Wait for your parent to approve</span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Parent Instructions -->
      <template v-else>
        <div class="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Tip:</strong> Your children can shop using their credits - you approve orders and pay securely via Stripe.
        </div>

        <div class="grid md:grid-cols-2 gap-4">
          <div class="rounded-xl bg-slate-50 p-4">
            <h4 class="font-medium text-slate-800 mb-3">How It Works</h4>
            <ul class="text-sm text-slate-600 space-y-2">
              <li>• Children browse and add items using credits</li>
              <li>• Orders are sent to you for approval</li>
              <li>• Review orders in Family &rarr; Order Requests</li>
              <li>• Approve to pay via Stripe, or decline to refund credits</li>
            </ul>
          </div>

          <div class="rounded-xl bg-slate-50 p-4">
            <h4 class="font-medium text-slate-800 mb-3">Approving Orders</h4>
            <div class="space-y-2">
              <div class="flex items-start gap-2">
                <div class="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">1</div>
                <span class="text-sm text-slate-600">Go to Family &rarr; Order Requests</span>
              </div>
              <div class="flex items-start gap-2">
                <div class="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">2</div>
                <span class="text-sm text-slate-600">Review pending orders from your children</span>
              </div>
              <div class="flex items-start gap-2">
                <div class="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">3</div>
                <span class="text-sm text-slate-600">Approve to proceed to Stripe payment</span>
              </div>
              <div class="flex items-start gap-2">
                <div class="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">4</div>
                <span class="text-sm text-slate-600">Complete payment to fulfill the order</span>
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
