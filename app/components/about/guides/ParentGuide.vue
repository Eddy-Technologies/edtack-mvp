<template>
  <div class="space-y-6">
    <!-- Dashboard Overview -->
    <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">Your Dashboard</h3>
      <p class="text-slate-600 mb-4">Access Dashboard → Family to manage your children, approve orders, create tasks, and transfer credits.</p>
    </div>

    <!-- Adding Children -->
    <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">Adding Children</h3>
      <div class="rounded-xl bg-slate-50 p-5">
        <div class="space-y-3">
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">1</div>
            <span class="text-sm text-slate-600">Child creates student account</span>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">2</div>
            <span class="text-sm text-slate-600">Go to Dashboard → Family → Management</span>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">3</div>
            <span class="text-sm text-slate-600">Click "Add Family Member" and enter child's email</span>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">4</div>
            <span class="text-sm text-slate-600">Child accepts invitation</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Credit System -->
    <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">Credit System ($1 = 100 credits)</h3>

      <div class="rounded-xl bg-amber-50 p-4 text-sm text-amber-800 mb-4">
        <strong>Pledge System:</strong> StudyWithEddy doesn't handle money. You pledge virtual credits and complete real purchases directly with vendors.
      </div>

      <div class="grid lg:grid-cols-3 gap-4">
        <div class="rounded-xl bg-slate-50 p-4 text-center">
          <h5 class="font-medium text-slate-800 mb-1">Pledge</h5>
          <p class="text-sm text-slate-600">Set aside virtual credits</p>
        </div>
        <div class="rounded-xl bg-slate-50 p-4 text-center">
          <h5 class="font-medium text-slate-800 mb-1">Earn</h5>
          <p class="text-sm text-slate-600">Children earn via tasks</p>
        </div>
        <div class="rounded-xl bg-slate-50 p-4 text-center">
          <h5 class="font-medium text-slate-800 mb-1">Approve</h5>
          <p class="text-sm text-slate-600">Review & complete purchases</p>
        </div>
      </div>
    </div>

    <!-- Order Approval -->
    <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">Order Approval</h3>

      <div class="rounded-xl bg-slate-50 p-5 mb-4">
        <div class="space-y-3">
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">1</div>
            <span class="text-sm text-slate-600">Child submits order using credits</span>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">2</div>
            <span class="text-sm text-slate-600">Order appears in Family → Order Requests</span>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">3</div>
            <span class="text-sm text-slate-600">Review and approve/decline</span>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">4</div>
            <span class="text-sm text-slate-600">If approved, complete real purchase with vendor</span>
          </div>
        </div>
      </div>

      <p class="text-sm text-slate-600">Declined orders return credits to child automatically.</p>
    </div>

    <!-- Task Creation -->
    <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">Creating Tasks</h3>
      <p class="text-slate-600 mb-4">Assign quiz-based tasks with credit rewards. Children earn credits automatically when they pass (70%+ score).</p>

      <div class="grid lg:grid-cols-2 gap-4">
        <div class="rounded-xl bg-slate-50 p-4">
          <h5 class="font-medium text-slate-800 mb-2">Setup</h5>
          <p class="text-sm text-slate-600">Select subject, chapters, passing score, and credit reward amount.</p>
        </div>
        <div class="rounded-xl bg-slate-50 p-4">
          <h5 class="font-medium text-slate-800 mb-2">Assignment</h5>
          <p class="text-sm text-slate-600">Assign to specific children and track completion status in dashboard.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
