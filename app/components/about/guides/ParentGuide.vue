<template>
  <div class="space-y-8">
    <!-- Header Section -->
    <div class="rounded-2xl bg-gradient-to-br from-secondary-50 to-white p-8 shadow-sm ring-1 ring-slate-100">
      <h2 class="text-2xl font-bold text-slate-800 mb-4">Parent Guide</h2>
      <p class="text-base text-slate-600 mb-6">
        Welcome to the Parent Guide! Here you'll learn how to manage your children's learning journey,
        assign tasks, transfer credits, and approve their shop orders. Use the quick links below to jump
        to any section.
      </p>

      <!-- Table of Contents with Quick Links -->
      <div class="rounded-xl bg-white p-6 shadow-sm">
        <div class="grid md:grid-cols-2 gap-3">
          <a
            href="#adding-children"
            class="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-50 hover:bg-secondary-50 hover:text-secondary-700 text-slate-700 transition-all group"
            @click.prevent="scrollToSection('adding-children')"
          >
            <UIcon name="i-lucide-user-plus" class="w-5 h-5 flex-shrink-0" />
            <span class="text-sm font-medium">Adding Children</span>
            <UIcon name="i-lucide-arrow-right" class="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
          <a
            href="#transferring-credits"
            class="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-50 hover:bg-secondary-50 hover:text-secondary-700 text-slate-700 transition-all group"
            @click.prevent="scrollToSection('transferring-credits')"
          >
            <UIcon name="i-lucide-coins" class="w-5 h-5 flex-shrink-0" />
            <span class="text-sm font-medium">Transferring Credits</span>
            <UIcon name="i-lucide-arrow-right" class="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
          <a
            href="#assigning-tasks"
            class="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-50 hover:bg-secondary-50 hover:text-secondary-700 text-slate-700 transition-all group"
            @click.prevent="scrollToSection('assigning-tasks')"
          >
            <UIcon name="i-lucide-clipboard-check" class="w-5 h-5 flex-shrink-0" />
            <span class="text-sm font-medium">Assigning Tasks & Review</span>
            <UIcon name="i-lucide-arrow-right" class="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
          <a
            href="#order-approval"
            class="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-50 hover:bg-secondary-50 hover:text-secondary-700 text-slate-700 transition-all group"
            @click.prevent="scrollToSection('order-approval')"
          >
            <UIcon name="i-lucide-shopping-cart" class="w-5 h-5 flex-shrink-0" />
            <span class="text-sm font-medium">Order Approval</span>
            <UIcon name="i-lucide-arrow-right" class="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>
      </div>
    </div>

    <!-- 1. Adding Children -->
    <div id="adding-children" class="scroll-mt-6 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100 space-y-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-semibold text-slate-800">1. Adding Children</h3>
        <NuxtLink
          to="/dashboard?tab=family&subtab=management"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-secondary-50 hover:bg-secondary-100 text-secondary-700 font-medium transition-all"
        >
          <UIcon name="i-lucide-external-link" class="w-4 h-4" />
          Open Management
        </NuxtLink>
      </div>

      <p class="text-base text-slate-600">
        Connect your children's student accounts to your parent account to manage their learning and approve orders.
      </p>

      <div class="rounded-xl bg-slate-50 p-5">
        <h4 class="text-base font-semibold text-slate-800 mb-3">Step-by-Step Process</h4>
        <div class="space-y-3">
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">1</div>
            <span class="text-sm text-slate-600">Child creates a student account at StudyWithEddy</span>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">2</div>
            <span class="text-sm text-slate-600">Go to Dashboard → Family → Management</span>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">3</div>
            <span class="text-sm text-slate-600">Click "Invite Member" and enter child's email address</span>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">4</div>
            <span class="text-sm text-slate-600">Child accepts the invitation from their account</span>
          </div>
        </div>
      </div>

      <!-- Screenshots -->
      <div class="space-y-4">
        <div>
          <h5 class="text-sm font-medium text-slate-700 mb-2">Family Management Tab</h5>
          <img src="/assets/guide-screenshots/parent-family-management-tab.png" alt="Family Management Tab" class="w-full rounded-lg shadow-md">
        </div>
        <div>
          <h5 class="text-sm font-medium text-slate-700 mb-2">Invite Family Member Modal</h5>
          <img src="/assets/guide-screenshots/parent-invite-family-modal.png" alt="Invite Family Member" class="w-full rounded-lg shadow-md">
        </div>
        <div>
          <h5 class="text-sm font-medium text-slate-700 mb-2">Pending Invitation</h5>
          <img src="/assets/guide-screenshots/parent-pending-invite-family-management-tab.png" alt="Pending Invitation" class="w-full rounded-lg shadow-md">
        </div>
      </div>
    </div>

    <!-- 2. Transferring Credits -->
    <div id="transferring-credits" class="scroll-mt-6 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100 space-y-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-semibold text-slate-800">2. Transferring Credits</h3>
        <NuxtLink
          to="/dashboard?tab=credits"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-secondary-50 hover:bg-secondary-100 text-secondary-700 font-medium transition-all"
        >
          <UIcon name="i-lucide-external-link" class="w-4 h-4" />
          Open Credits
        </NuxtLink>
      </div>

      <p class="text-base text-slate-600">
        Transfer credits to your children so they can use them to shop for items or as rewards for completing tasks.
      </p>

      <div class="rounded-xl bg-amber-50 p-4 text-sm text-amber-800 mb-4">
        <strong>Remember:</strong> We try to maintain a $1 to approximately 100 credits ratio. StudyWithEddy uses a pledge system - these are virtual credits,
        not real money transfers.
      </div>

      <!-- Credit Flow Visualization -->
      <div class="rounded-xl bg-slate-50 p-6">
        <h4 class="text-base font-semibold text-slate-800 mb-4">Credit Flow</h4>
        <div class="grid lg:grid-cols-3 gap-4">
          <div class="rounded-xl bg-white p-4 text-center shadow-sm">
            <div class="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <UIcon name="i-lucide-wallet" class="w-6 h-6 text-secondary-600" />
            </div>
            <h5 class="font-medium text-slate-800 mb-1">1. Pledge Credits</h5>
            <p class="text-sm text-slate-600">Set aside virtual credits for your children</p>
          </div>
          <div class="rounded-xl bg-white p-4 text-center shadow-sm">
            <div class="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <UIcon name="i-lucide-arrow-right-left" class="w-6 h-6 text-secondary-600" />
            </div>
            <h5 class="font-medium text-slate-800 mb-1">2. Transfer</h5>
            <p class="text-sm text-slate-600">Send credits to specific children</p>
          </div>
          <div class="rounded-xl bg-white p-4 text-center shadow-sm">
            <div class="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <UIcon name="i-lucide-shopping-bag" class="w-6 h-6 text-secondary-600" />
            </div>
            <h5 class="font-medium text-slate-800 mb-1">3. Children Use</h5>
            <p class="text-sm text-slate-600">Children shop and submit orders</p>
          </div>
        </div>
      </div>

      <!-- Transfer Steps -->
      <div class="rounded-xl bg-slate-50 p-5">
        <h4 class="text-base font-semibold text-slate-800 mb-3">Pledge Credits</h4>
        <div class="space-y-3 mb-3">
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">1</div>
            <span class="text-sm text-slate-600">Navigate to Dashboard → Credits</span>
          </div>
          <div class="flex items-start gap-3 mb-4">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">2</div>
            <span class="text-sm text-slate-600">Top up virtual credits</span>
          </div>
        </div>
        <h4 class="text-base font-semibold text-slate-800 mb-3">Transfer Credits</h4>
        <div class="space-y-3">
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">1</div>
            <span class="text-sm text-slate-600">Find the child you want to transfer credits to</span>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">2</div>
            <span class="text-sm text-slate-600">Click "Transfer Credits" and enter the amount</span>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">3</div>
            <span class="text-sm text-slate-600">Confirm the transfer - credits appear instantly in child's account</span>
          </div>
        </div>
      </div>

      <!-- Screenshot -->
      <img src="/assets/guide-screenshots/parent-credit-tab.png" alt="Credit Transfer Interface" class="w-full rounded-lg shadow-md">
    </div>

    <!-- 3. Assigning Tasks and Review -->
    <div id="assigning-tasks" class="scroll-mt-6 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100 space-y-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-semibold text-slate-800">3. Assigning Tasks & Review</h3>
        <NuxtLink
          to="/dashboard?tab=family&subtab=tasks"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-secondary-50 hover:bg-secondary-100 text-secondary-700 font-medium transition-all"
        >
          <UIcon name="i-lucide-external-link" class="w-4 h-4" />
          Open Tasks
        </NuxtLink>
      </div>

      <p class="text-base text-slate-600">
        Create quiz-based learning tasks for your children with credit rewards. Children earn credits automatically
        when they pass.
      </p>

      <!-- Task Flow -->
      <div class="rounded-xl bg-slate-50 p-6">
        <h4 class="text-base font-semibold text-slate-800 mb-4">Task Workflow</h4>
        <div class="space-y-4">
          <div class="flex gap-4">
            <div class="flex-shrink-0 w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
              <span class="text-secondary-700 font-semibold">1</span>
            </div>
            <div>
              <h5 class="font-medium text-slate-800 mb-1">Create Task</h5>
              <p class="text-sm text-slate-600">Select subject, chapters, passing score and credit reward amount</p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex-shrink-0 w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
              <span class="text-secondary-700 font-semibold">2</span>
            </div>
            <div>
              <h5 class="font-medium text-slate-800 mb-1">Assign to Children</h5>
              <p class="text-sm text-slate-600">Choose which children receive the task - appears in their Tasks tab</p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex-shrink-0 w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
              <span class="text-secondary-700 font-semibold">3</span>
            </div>
            <div>
              <h5 class="font-medium text-slate-800 mb-1">Children Complete</h5>
              <p class="text-sm text-slate-600">Children take the quiz and submit their answers</p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex-shrink-0 w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
              <span class="text-secondary-700 font-semibold">4</span>
            </div>
            <div>
              <h5 class="font-medium text-slate-800 mb-1">Auto-Reward</h5>
              <p class="text-sm text-slate-600">If passing score is met, credits are automatically transferred</p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex-shrink-0 w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
              <span class="text-secondary-700 font-semibold">5</span>
            </div>
            <div>
              <h5 class="font-medium text-slate-800 mb-1">Review Results</h5>
              <p class="text-sm text-slate-600">View completion status, scores, and provide feedback in your dashboard</p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex-shrink-0 w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
              <span class="text-secondary-700 font-semibold">6</span>
            </div>
            <div>
              <h5 class="font-medium text-slate-800 mb-1">Close Task</h5>
              <p class="text-sm text-slate-600">You may wish to close the task to stop the child from any new attempts and prevent further credit transfers.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-4">
        <div class="rounded-xl bg-slate-50 p-4">
          <h5 class="font-medium text-slate-800 mb-2">Task Setup</h5>
          <p class="text-sm text-slate-600">Customize subject, difficulty, question count, and reward amounts to match your child's learning level.</p>
        </div>
        <div class="rounded-xl bg-slate-50 p-4">
          <h5 class="font-medium text-slate-800 mb-2">Track Progress</h5>
          <p class="text-sm text-slate-600">Monitor completion rates and review detailed results to understand your child's strengths and areas for improvement.</p>
        </div>
      </div>

      <!-- Screenshots -->
      <div class="space-y-4">
        <div>
          <h5 class="text-sm font-medium text-slate-700 mb-2">Tasks Tab Overview</h5>
          <img src="/assets/guide-screenshots/parent-task-tab.png" alt="Tasks Tab" class="w-full rounded-lg shadow-md">
        </div>
        <div>
          <h5 class="text-sm font-medium text-slate-700 mb-2">Assign Task - Select Subject & Chapters</h5>
          <img src="/assets/guide-screenshots/parent-assign-task-modal-1.png" alt="Assign Task Step 1" class="w-full rounded-lg shadow-md">
        </div>
        <div>
          <h5 class="text-sm font-medium text-slate-700 mb-2">Assign Task - Set Rewards & Assign Students</h5>
          <img src="/assets/guide-screenshots/parent-assign-task-modal-2.png" alt="Assign Task Step 2" class="w-full rounded-lg shadow-md">
        </div>
        <div>
          <h5 class="text-sm font-medium text-slate-700 mb-2">Edit Task - to make changes to the task details</h5>
          <img src="/assets/guide-screenshots/parent-edit-task.png" alt="Edit Task" class="w-full rounded-lg shadow-md">
        </div>
        <div>
          <h5 class="text-sm font-medium text-slate-700 mb-2">Close Task - students will not be able to attempt task once close</h5>
          <img src="/assets/guide-screenshots/parents-close-task.png" alt="Close Task d" class="w-full rounded-lg shadow-md">
        </div>
      </div>
    </div>

    <!-- 4. Order Approval -->
    <div id="order-approval" class="scroll-mt-6 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100 space-y-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-semibold text-slate-800">4. Order Approval (Checking Out)</h3>
        <NuxtLink
          to="/dashboard?tab=family&subtab=order-requests"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-secondary-50 hover:bg-secondary-100 text-secondary-700 font-medium transition-all"
        >
          <UIcon name="i-lucide-external-link" class="w-4 h-4" />
          View Order Requests
        </NuxtLink>
      </div>

      <p class="text-base text-slate-600">
        Review and approve your children's shop orders. When approved, you complete the actual purchase through stripe.
      </p>

      <div class="rounded-xl bg-slate-50 p-5 mb-4">
        <h4 class="text-base font-semibold text-slate-800 mb-3">Order Approval Process</h4>
        <div class="space-y-3">
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">1</div>
            <span class="text-sm text-slate-600">Child browses shop and submits an order using their credits</span>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">2</div>
            <span class="text-sm text-slate-600">Order appears in Dashboard → Family → Order Requests</span>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">3</div>
            <span class="text-sm text-slate-600">Review order details and decide to approve or decline</span>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">4</div>
            <span class="text-sm text-slate-600">If approved, complete the actual purchase through stripe</span>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">5</div>
            <span class="text-sm text-slate-600">If declined, credits are refunded to students</span>
          </div>
        </div>
      </div>

      <!-- Screenshot -->
      <img src="/assets/guide-screenshots/parent-order-request-tab.png" alt="Order Approval Interface" class="w-full rounded-lg shadow-md">
    </div>
  </div>
</template>

<script setup lang="ts">
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};
</script>
