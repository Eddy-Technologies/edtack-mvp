<template>
  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <!-- Header Toggle -->
    <button
      class="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      @click="isExpanded = !isExpanded"
    >
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-info" class="text-blue-500" size="20" />
        <span class="font-medium text-gray-800">How Order Requests Work</span>
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
          <strong>Tip:</strong> Review and approve your children's shop orders here. You pay via Stripe when approving.
        </div>

        <div class="grid lg:grid-cols-2 gap-4">
          <div class="rounded-xl bg-slate-50 p-4">
            <h4 class="font-medium text-slate-800 mb-3">How It Works</h4>
            <ul class="text-sm text-slate-600 space-y-2">
              <li>• Children checkout using their credits</li>
              <li>• Orders appear here for your approval</li>
              <li>• Approve to pay via Stripe, or reject to refund credits</li>
              <li>• Track order status through delivery</li>
            </ul>
          </div>

          <div class="rounded-xl bg-slate-50 p-4">
            <h4 class="font-medium text-slate-800 mb-3">Approving Orders</h4>
            <div class="space-y-2">
              <div class="flex items-start gap-2">
                <div class="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">1</div>
                <span class="text-sm text-slate-600">Review the order items and total amount</span>
              </div>
              <div class="flex items-start gap-2">
                <div class="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">2</div>
                <span class="text-sm text-slate-600">Click "Approve & Pay" to proceed to Stripe</span>
              </div>
              <div class="flex items-start gap-2">
                <div class="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">3</div>
                <span class="text-sm text-slate-600">Or click "Reject" to decline and refund credits</span>
              </div>
              <div class="flex items-start gap-2">
                <div class="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">4</div>
                <span class="text-sm text-slate-600">Track approved orders in the status filter</span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Student Instructions -->
      <template v-else>
        <div class="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Tip:</strong> Track the status of your shop orders here. Your parent will approve and pay for them.
        </div>

        <div class="grid lg:grid-cols-2 gap-4">
          <div class="rounded-xl bg-slate-50 p-4">
            <h4 class="font-medium text-slate-800 mb-3">How It Works</h4>
            <ul class="text-sm text-slate-600 space-y-2">
              <li>• After checkout, your order awaits parent approval</li>
              <li>• Your parent reviews and decides to approve or reject</li>
              <li>• Once approved, your parent pays and it's confirmed</li>
              <li>• Track your order status until delivery</li>
            </ul>
          </div>

          <div class="rounded-xl bg-slate-50 p-4">
            <h4 class="font-medium text-slate-800 mb-3">Order Statuses</h4>
            <div class="space-y-2">
              <div class="flex items-start gap-2">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Awaiting</span>
                <span class="text-sm text-slate-600">Parent hasn't reviewed yet</span>
              </div>
              <div class="flex items-start gap-2">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Confirmed</span>
                <span class="text-sm text-slate-600">Parent approved and paid</span>
              </div>
              <div class="flex items-start gap-2">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>
                <span class="text-sm text-slate-600">Parent declined, credits refunded</span>
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
