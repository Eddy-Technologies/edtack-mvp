<template>
  <div class="space-y-6">
    <!-- Family Features -->
    <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">Family Features</h3>
      <p class="text-slate-600 mb-4">
        Manage multiple children from one parent account with unified dashboard and individual tracking.
      </p>

      <div class="grid lg:grid-cols-3 gap-4">
        <div class="rounded-xl bg-slate-50 p-4 text-center">
          <h4 class="font-medium text-slate-800 mb-1">
            Multi-Child
          </h4>
          <p class="text-sm text-slate-600">
            Manage all children in one place
          </p>
        </div>
        <div class="rounded-xl bg-slate-50 p-4 text-center">
          <h4 class="font-medium text-slate-800 mb-1">
            Individual Profiles
          </h4>
          <p class="text-sm text-slate-600">
            Separate balances & progress
          </p>
        </div>
        <div class="rounded-xl bg-slate-50 p-4 text-center">
          <h4 class="font-medium text-slate-800 mb-1">
            Unified View
          </h4>
          <p class="text-sm text-slate-600">
            See all activities together
          </p>
        </div>
      </div>
    </div>

    <!-- Setup Steps -->
    <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">
        Setting Up
      </h3>

      <div class="rounded-xl bg-slate-50 p-5">
        <div class="space-y-3">
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">
              1
            </div>
            <span class="text-sm text-slate-600">Create parent account</span>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">
              2
            </div>
            <span class="text-sm text-slate-600">Children create their student accounts</span>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">
              3
            </div>
            <span class="text-sm text-slate-600">Invite children via Dashboard → Family → Management</span>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">
              4
            </div>
            <span class="text-sm text-slate-600">Children accept invitations</span>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">
              5
            </div>
            <span class="text-sm text-slate-600">Manage all children from your dashboard</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Dashboard Navigation -->
    <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">
        Family Dashboard
      </h3>
      <p class="text-slate-600 mb-4">
        Access all family features from Dashboard → Family:
      </p>

      <div class="grid lg:grid-cols-2 gap-4">
        <div class="rounded-xl bg-slate-50 p-4">
          <h5 class="font-medium text-slate-800 mb-2">
            Overview Tab
          </h5>
          <p class="text-sm text-slate-600">
            Family statistics, active students, pending orders and tasks
          </p>
        </div>
        <div class="rounded-xl bg-slate-50 p-4">
          <h5 class="font-medium text-slate-800 mb-2">
            Management Tab
          </h5>
          <p class="text-sm text-slate-600">
            Add/remove children, view profiles, transfer credits
          </p>
        </div>
        <div class="rounded-xl bg-slate-50 p-4">
          <h5 class="font-medium text-slate-800 mb-2">
            Orders Tab
          </h5>
          <p class="text-sm text-slate-600">
            Review and approve/decline children's order requests
          </p>
        </div>
        <div class="rounded-xl bg-slate-50 p-4">
          <h5 class="font-medium text-slate-800 mb-2">
            Tasks Tab
          </h5>
          <p class="text-sm text-slate-600">
            Create and manage quiz-based learning tasks
          </p>
        </div>
      </div>
    </div>

    <!-- Quick Tips -->
    <div class="rounded-2xl bg-slate-50 p-8 ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">
        Tips
      </h3>
      <ul class="text-sm text-slate-600 space-y-2">
        <li>• Set clear expectations with each child about credit earning and spending</li>
        <li>• Check the dashboard regularly to stay involved in their learning</li>
        <li>• Create personalized tasks based on each child's needs and skill level</li>
        <li>• Celebrate learning milestones to maintain motivation</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
