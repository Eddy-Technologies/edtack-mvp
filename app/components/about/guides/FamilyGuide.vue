<template>
  <div class="space-y-6">
    <!-- Family Account Overview -->
    <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">Family Account Overview</h3>
      <p class="text-slate-600 mb-6">StudyWithEddy's family system allows parents to manage multiple children's learning activities from one central account.</p>
      <div class="grid lg:grid-cols-3 gap-4">
        <div class="rounded-xl bg-slate-50 p-5">
          <h4 class="font-medium text-slate-800 mb-2">Multi-Child Support</h4>
          <p class="text-sm text-slate-600">Manage multiple children from one parent account</p>
        </div>
        <div class="rounded-xl bg-slate-50 p-5">
          <h4 class="font-medium text-slate-800 mb-2">Unified Dashboard</h4>
          <p class="text-sm text-slate-600">View all family activities in one place</p>
        </div>
        <div class="rounded-xl bg-slate-50 p-5">
          <h4 class="font-medium text-slate-800 mb-2">Credit Transfers</h4>
          <p class="text-sm text-slate-600">Transfer credits to your children easily</p>
        </div>
      </div>
    </div>

    <!-- Setting Up Family Account -->
    <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">Setting Up Your Family Account</h3>
      <div class="space-y-6">
        <div class="rounded-xl bg-slate-50 p-5">
          <h4 class="font-medium text-slate-800 mb-4">Initial Setup Steps</h4>
          <div class="space-y-3">
            <div v-for="(step, index) in setupSteps" :key="index" class="flex items-start gap-3">
              <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">{{ index + 1 }}</div>
              <span class="text-sm text-slate-600">{{ step }}</span>
            </div>
          </div>
        </div>

        <div class="grid lg:grid-cols-2 gap-6">
          <div class="rounded-xl bg-slate-50 p-5">
            <h5 class="font-medium text-slate-800 mb-3">Centralized Management</h5>
            <ul class="text-sm text-slate-600 space-y-2">
              <li>• Single dashboard for all children</li>
              <li>• Consolidated progress reports</li>
              <li>• Centralized order management</li>
              <li>• Credit transfers to children</li>
            </ul>
          </div>
          <div class="rounded-xl bg-slate-50 p-5">
            <h5 class="font-medium text-slate-800 mb-3">Individual Tracking</h5>
            <ul class="text-sm text-slate-600 space-y-2">
              <li>• Separate learning profiles</li>
              <li>• Individual credit balances</li>
              <li>• Personal task assignments</li>
              <li>• Custom learning goals</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Adding & Managing Children -->
    <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">Adding & Managing Children</h3>
      <div class="space-y-6">
        <div class="rounded-xl bg-slate-50 p-5">
          <h4 class="font-medium text-slate-800 mb-4">Adding a New Child</h4>
          <div class="space-y-3">
            <div v-for="(step, index) in addChildSteps" :key="index" class="flex items-start gap-3">
              <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">{{ index + 1 }}</div>
              <span class="text-sm text-slate-600">{{ step }}</span>
            </div>
          </div>
        </div>

        <div class="rounded-xl bg-slate-50 p-5">
          <h5 class="font-medium text-slate-800 mb-3">Email Invitation</h5>
          <ul class="text-sm text-slate-600 space-y-2">
            <li>• Child creates their own student account first</li>
            <li>• Parent sends invitation using child's email</li>
            <li>• Child accepts invitation to join family</li>
            <li>• Account automatically linked to family</li>
          </ul>
          <p class="text-xs text-slate-500 mt-3">Note: Children must have an existing account to receive invitations</p>
        </div>
      </div>
    </div>

    <!-- Family Dashboard Features -->
    <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">Family Dashboard Features</h3>
      <div class="space-y-6">
        <div class="grid lg:grid-cols-2 gap-6">
          <div class="rounded-xl bg-slate-50 p-5">
            <h5 class="font-medium text-slate-800 mb-3">Family Statistics</h5>
            <ul class="text-sm text-slate-600 space-y-2">
              <li>• Total number of children</li>
              <li>• Children active today</li>
              <li>• Combined learning hours</li>
              <li>• Total credits earned</li>
            </ul>
          </div>
          <div class="rounded-xl bg-slate-50 p-5">
            <h5 class="font-medium text-slate-800 mb-3">Quick Actions</h5>
            <ul class="text-sm text-slate-600 space-y-2">
              <li>• View pending order requests</li>
              <li>• Check incomplete tasks</li>
              <li>• Review recent activities</li>
              <li>• Access individual child profiles</li>
            </ul>
          </div>
        </div>

        <div class="grid lg:grid-cols-3 gap-4">
          <div class="rounded-xl bg-slate-50 p-5">
            <h5 class="font-medium text-slate-800 mb-2">Management Tab</h5>
            <p class="text-sm text-slate-600">Add members, edit profiles, remove members</p>
          </div>
          <div class="rounded-xl bg-slate-50 p-5">
            <h5 class="font-medium text-slate-800 mb-2">Order Requests</h5>
            <p class="text-sm text-slate-600">Pending orders, order history, bulk actions</p>
          </div>
          <div class="rounded-xl bg-slate-50 p-5">
            <h5 class="font-medium text-slate-800 mb-2">Tasks Tab</h5>
            <p class="text-sm text-slate-600">Create tasks, track progress, approve completions</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Task Management -->
    <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">Family Task Management</h3>
      <div class="rounded-xl bg-slate-50 p-5 mb-6">
        <h5 class="font-medium text-slate-800 mb-3">Quiz-Based Tasks</h5>
        <div class="grid lg:grid-cols-2 gap-4">
          <ul class="text-sm text-slate-600 space-y-2">
            <li>• Assign quiz tasks to individual children</li>
            <li>• Select subject and chapters</li>
            <li>• Set required passing score</li>
            <li>• Choose credit reward amount</li>
          </ul>
          <ul class="text-sm text-slate-600 space-y-2">
            <li>• Track completion status</li>
            <li>• Credits awarded automatically on pass</li>
            <li>• View quiz scores and attempts</li>
            <li>• Close tasks when needed</li>
          </ul>
        </div>
      </div>

      <div class="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
        <strong>Note:</strong> Tasks are assigned to individual children. Each child completes their own quiz and earns credits when they meet the passing score requirement.
      </div>
    </div>

    <!-- Best Practices -->
    <div class="rounded-2xl bg-slate-50 p-8 ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">Family Management Best Practices</h3>
      <div class="grid lg:grid-cols-2 gap-6">
        <div>
          <h4 class="font-medium text-slate-800 mb-3">Setting Up for Success</h4>
          <ul class="text-sm text-slate-600 space-y-2">
            <li>• Establish clear family learning goals</li>
            <li>• Include children in creating family rules</li>
            <li>• Schedule regular family check-ins about progress</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium text-slate-800 mb-3">Maintaining Engagement</h4>
          <ul class="text-sm text-slate-600 space-y-2">
            <li>• Celebrate both individual and family milestones</li>
            <li>• Encourage children to share their learning</li>
            <li>• Focus on effort and improvement, not just results</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const setupSteps = [
  'Create Parent Account: Register as a parent during the onboarding process',
  'Complete Profile: Fill in your information',
  'Add Children: Invite children who have created their own student accounts',
  'Transfer Credits: Send credits to your children',
  'Create Tasks: Assign quiz tasks for children to earn more credits'
];

const addChildSteps = [
  'Have your child create a student account first',
  'Go to Dashboard → Family → Management',
  'Click "Add Family Member" button',
  'Enter your child\'s email address',
  'Child receives and accepts the invitation',
  'Child is now linked to your family'
];
</script>
