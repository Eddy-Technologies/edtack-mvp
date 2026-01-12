<template>
  <div class="space-y-6">
    <!-- Dashboard Overview -->
    <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">Dashboard Overview</h3>
      <p class="text-slate-600 mb-6">Your parent dashboard provides a central hub for managing your family's educational activities.</p>
      <div class="grid lg:grid-cols-2 gap-6">
        <div class="rounded-xl bg-slate-50 p-5">
          <h4 class="font-medium text-slate-800 mb-3">Overview Tab</h4>
          <ul class="text-sm text-slate-600 space-y-2">
            <li>• View total number of students</li>
            <li>• See who's active today</li>
            <li>• Check pending order requests</li>
            <li>• Monitor pending tasks</li>
            <li>• Family learning statistics</li>
          </ul>
        </div>
        <div class="rounded-xl bg-slate-50 p-5">
          <h4 class="font-medium text-slate-800 mb-3">Quick Actions</h4>
          <ul class="text-sm text-slate-600 space-y-2">
            <li>• Approve or decline orders</li>
            <li>• Create new tasks</li>
            <li>• Transfer credits</li>
            <li>• Add family members</li>
            <li>• View detailed reports</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Family Management -->
    <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">Family Management</h3>
      <div class="space-y-6">
        <div>
          <h4 class="font-medium text-slate-800 mb-4">Adding Children to Your Family</h4>
          <div class="rounded-xl bg-slate-50 p-5">
            <div class="space-y-3">
              <div v-for="(step, index) in familySteps" :key="index" class="flex items-start gap-3">
                <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">{{ index + 1 }}</div>
                <span class="text-sm text-slate-600">{{ step }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="grid lg:grid-cols-2 gap-6">
          <div class="rounded-xl bg-slate-50 p-5">
            <h5 class="font-medium text-slate-800 mb-3">Individual Tracking</h5>
            <ul class="text-sm text-slate-600 space-y-2">
              <li>• Separate credit balances</li>
              <li>• Individual learning progress</li>
              <li>• Personalized task assignments</li>
              <li>• Independent order requests</li>
            </ul>
          </div>
          <div class="rounded-xl bg-slate-50 p-5">
            <h5 class="font-medium text-slate-800 mb-3">Family Features</h5>
            <ul class="text-sm text-slate-600 space-y-2">
              <li>• Credit transfers to children</li>
              <li>• Combined progress reports</li>
              <li>• Centralized order management</li>
              <li>• Unified family dashboard</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Credit Management -->
    <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">Credit Management</h3>

      <div class="space-y-6">
        <div class="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Important:</strong> This is a credit pledge system. StudyWithEddy does not store money or request money transfers. Orders are sent to parents for completion.
        </div>

        <div>
          <h4 class="font-medium text-slate-800 mb-4">How Credits Work ($1 = 100 credits)</h4>
          <div class="grid lg:grid-cols-3 gap-4">
            <div class="rounded-xl bg-slate-50 p-5">
              <h5 class="font-medium text-slate-800 mb-2">1. Pledge Credits</h5>
              <p class="text-sm text-slate-600">Set aside virtual credits for your children</p>
            </div>
            <div class="rounded-xl bg-slate-50 p-5">
              <h5 class="font-medium text-slate-800 mb-2">2. Children Earn</h5>
              <p class="text-sm text-slate-600">Kids earn credits through learning activities</p>
            </div>
            <div class="rounded-xl bg-slate-50 p-5">
              <h5 class="font-medium text-slate-800 mb-2">3. You Approve</h5>
              <p class="text-sm text-slate-600">Review and complete actual purchases</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Management -->
    <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">Order Approval Process</h3>
      <p class="text-slate-600 mb-6">When your children make purchases using their credits, you'll receive order requests to approve.</p>

      <div class="rounded-xl bg-slate-50 p-5 mb-6">
        <h4 class="font-medium text-slate-800 mb-4">Order Request Workflow</h4>
        <div class="space-y-3">
          <div v-for="(step, index) in orderSteps" :key="index" class="flex items-start gap-3">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">{{ index + 1 }}</div>
            <span class="text-sm text-slate-600">{{ step }}</span>
          </div>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <div class="rounded-xl bg-slate-50 p-5">
          <h5 class="font-medium text-slate-800 mb-3">Approving Orders</h5>
          <ul class="text-sm text-slate-600 space-y-2">
            <li>• Review each item carefully</li>
            <li>• Check delivery address</li>
            <li>• Confirm you're comfortable with the purchase</li>
            <li>• Complete payment through external vendor</li>
          </ul>
        </div>
        <div class="rounded-xl bg-slate-50 p-5">
          <h5 class="font-medium text-slate-800 mb-3">Declining Orders</h5>
          <ul class="text-sm text-slate-600 space-y-2">
            <li>• Click reject to decline the order</li>
            <li>• Credits are returned to child automatically</li>
            <li>• Consider discussing with your child</li>
            <li>• Set clear purchasing guidelines</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Task Management -->
    <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">Task Creation & Management</h3>
      <div class="grid lg:grid-cols-3 gap-4">
        <div class="rounded-xl bg-slate-50 p-5">
          <h5 class="font-medium text-slate-800 mb-3">Quiz Tasks</h5>
          <ul class="text-sm text-slate-600 space-y-2">
            <li>• Assign quiz-based learning tasks</li>
            <li>• Select subject and chapters</li>
            <li>• Set required passing score</li>
            <li>• Choose credit reward amount</li>
            <li>• Credits awarded automatically on pass</li>
          </ul>
        </div>
        <div class="rounded-xl bg-slate-50 p-5">
          <h5 class="font-medium text-slate-800 mb-3">Task Assignment</h5>
          <ul class="text-sm text-slate-600 space-y-2">
            <li>• Assign to individual children</li>
            <li>• One-off task completion</li>
            <li>• Track completion status</li>
            <li>• Close tasks when needed</li>
          </ul>
        </div>
        <div class="rounded-xl bg-slate-50 p-5">
          <h5 class="font-medium text-slate-800 mb-3">Credit Rewards</h5>
          <ul class="text-sm text-slate-600 space-y-2">
            <li>• Set credits per quiz chapter</li>
            <li>• Consider task difficulty</li>
            <li>• Match your credit budget</li>
            <li>• Motivate completion</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Tips for Success -->
    <div class="rounded-2xl bg-slate-50 p-8 ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">Tips for Success</h3>
      <div class="grid lg:grid-cols-2 gap-6">
        <div>
          <h4 class="font-medium text-slate-800 mb-3">Best Practices</h4>
          <ul class="text-sm text-slate-600 space-y-2">
            <li>• Set clear expectations with your children</li>
            <li>• Review order requests promptly</li>
            <li>• Create meaningful, achievable tasks</li>
            <li>• Celebrate learning milestones</li>
            <li>• Use credits as positive reinforcement</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium text-slate-800 mb-3">Stay Engaged</h4>
          <ul class="text-sm text-slate-600 space-y-2">
            <li>• Check the dashboard regularly</li>
            <li>• Discuss learning progress with children</li>
            <li>• Adjust credit allowances as needed</li>
            <li>• Provide feedback on completed tasks</li>
            <li>• Encourage consistent learning habits</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const familySteps = [
  'Have your child create a student account first',
  'Go to Dashboard → Family → Management',
  'Click the "Add Family Member" button',
  'Enter your child\'s email address',
  'They\'ll receive an invitation to join your family'
];

const orderSteps = [
  'Child submits order - They use credits to checkout items from the shop',
  'Check your dashboard - Order appears in Family → Order Requests',
  'Review order details - Check items, quantities, and total cost',
  'Approve or decline - Make the final decision on the purchase',
  'Complete purchase - If approved, you handle the actual transaction'
];
</script>
