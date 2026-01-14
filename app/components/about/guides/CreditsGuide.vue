<template>
  <div class="space-y-6">
    <!-- What Are Credits -->
    <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">What Are Credits?</h3>
      <p class="text-slate-600 mb-4">
        Credits are virtual points students earn through learning. Use them to "purchase" items from the shop with parental approval.
      </p>

      <div class="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
        <strong>Important:</strong> Credits are not real money. Parents pledge virtual credits and approve actual purchases.
      </div>
    </div>

    <!-- Student View -->
    <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">Student Credit Balance</h3>
      <p class="text-slate-600 mb-4">Check your balance and track your earnings in the About page.</p>
      <img src="/assets/guide-screenshots/student-credit-balance.png" alt="Student Credit Balance" class="w-full rounded-lg shadow-md">
    </div>

    <!-- How to Earn -->
    <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">How to Earn Credits</h3>

      <div class="grid lg:grid-cols-2 gap-6 mb-6">
        <div class="rounded-xl bg-slate-50 p-5">
          <h4 class="font-medium text-slate-800 mb-2">Parent-Assigned Tasks</h4>
          <p class="text-sm text-slate-600">Complete quiz tasks and meet the 70% passing score. Credits awarded automatically.</p>
        </div>
        <div class="rounded-xl bg-slate-50 p-5">
          <h4 class="font-medium text-slate-800 mb-2">Parent Transfers</h4>
          <p class="text-sm text-slate-600">Parents can directly transfer credits to your account.</p>
        </div>
      </div>

      <div class="rounded-xl bg-slate-50 p-5">
        <h4 class="font-medium text-slate-800 mb-3 text-center">Example Rewards</h4>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="text-center">
            <div class="text-lg font-semibold text-slate-800">+5</div>
            <div class="text-xs text-slate-600">Basic quiz</div>
          </div>
          <div class="text-center">
            <div class="text-lg font-semibold text-slate-800">+10</div>
            <div class="text-xs text-slate-600">Vocabulary</div>
          </div>
          <div class="text-center">
            <div class="text-lg font-semibold text-slate-800">+15</div>
            <div class="text-xs text-slate-600">Comprehension</div>
          </div>
          <div class="text-center">
            <div class="text-lg font-semibold text-slate-800">+25</div>
            <div class="text-xs text-slate-600">Task</div>
          </div>
        </div>
      </div>
    </div>

    <!-- How Shopping Works -->
    <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">How Credit Shopping Works</h3>

      <div class="rounded-xl bg-slate-50 p-5 mb-6">
        <div class="space-y-3">
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">1</div>
            <span class="text-sm text-slate-600">Student browses shop and "purchases" with credits</span>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">2</div>
            <span class="text-sm text-slate-600">Order request appears in parent dashboard</span>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">3</div>
            <span class="text-sm text-slate-600">Parent reviews and approves/declines order</span>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">4</div>
            <span class="text-sm text-slate-600">If approved, parent completes real purchase with vendor</span>
          </div>
        </div>
      </div>

      <div class="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
        <strong>Pledge System:</strong> No money is transferred to StudyWithEddy. Parents pledge virtual credits and handle real purchases directly.
      </div>
    </div>

    <!-- FAQ -->
    <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">Common Questions</h3>
      <div class="space-y-3">
        <div class="rounded-xl bg-slate-50 p-4">
          <h5 class="font-medium text-slate-800 mb-1">What if an order is declined?</h5>
          <p class="text-sm text-slate-600">Credits return to your account for other purchases.</p>
        </div>
        <div class="rounded-xl bg-slate-50 p-4">
          <h5 class="font-medium text-slate-800 mb-1">Do credits expire?</h5>
          <p class="text-sm text-slate-600">No, credits remain available while your account is active.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
