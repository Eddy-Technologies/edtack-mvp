<template>
  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <!-- Header Toggle -->
    <button
      class="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      @click="isExpanded = !isExpanded"
    >
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-info" class="text-blue-500" size="20" />
        <span class="font-medium text-gray-800">How Checkout Works</span>
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
          <strong>Tip:</strong> Use your earned credits to checkout - your parent will approve and complete the payment!
        </div>

        <div class="grid lg:grid-cols-2 gap-4">
          <div class="rounded-xl bg-slate-50 p-4">
            <h4 class="font-medium text-slate-800 mb-3">How It Works</h4>
            <ul class="text-sm text-slate-600 space-y-2">
              <li>• Review items in your cart</li>
              <li>• Choose "Pay with Credits" to use your balance</li>
              <li>• Your parent receives a notification</li>
              <li>• Once approved, your order is complete!</li>
            </ul>
          </div>

          <div class="rounded-xl bg-slate-50 p-4">
            <h4 class="font-medium text-slate-800 mb-3">Checkout Steps</h4>
            <div class="space-y-2">
              <div class="flex items-start gap-2">
                <div class="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">1</div>
                <span class="text-sm text-slate-600">Review your cart items and quantities</span>
              </div>
              <div class="flex items-start gap-2">
                <div class="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">2</div>
                <span class="text-sm text-slate-600">Select "Pay with Credits" as payment</span>
              </div>
              <div class="flex items-start gap-2">
                <div class="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">3</div>
                <span class="text-sm text-slate-600">Click "Request Parent Approval"</span>
              </div>
              <div class="flex items-start gap-2">
                <div class="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">4</div>
                <span class="text-sm text-slate-600">Wait for your parent to approve and pay</span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Parent Instructions -->
      <template v-else>
        <div class="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Tip:</strong> You can purchase items directly with your credit card via Stripe.
        </div>

        <div class="grid lg:grid-cols-2 gap-4">
          <div class="rounded-xl bg-slate-50 p-4">
            <h4 class="font-medium text-slate-800 mb-3">How It Works</h4>
            <ul class="text-sm text-slate-600 space-y-2">
              <li>• Review items in your cart</li>
              <li>• Click "Purchase Now" to checkout</li>
              <li>• Complete payment via Stripe</li>
              <li>• Your order is confirmed immediately</li>
            </ul>
          </div>

          <div class="rounded-xl bg-slate-50 p-4">
            <h4 class="font-medium text-slate-800 mb-3">Child Orders</h4>
            <ul class="text-sm text-slate-600 space-y-2">
              <li>• Your children can checkout using their credits</li>
              <li>• You'll receive order requests to approve</li>
              <li>• Review in Family &rarr; Order Requests</li>
              <li>• Approve to pay, or decline to refund credits</li>
            </ul>
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
