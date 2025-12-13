<template>
  <div class="guide-content">
    <div class="mb-6">
      <h2 class="text-3xl font-bold text-gray-800 mb-2">Parent Guide</h2>
      <p class="text-gray-600">Everything you need to know about managing your family's learning journey.</p>
    </div>

    <!-- Dashboard Overview -->
    <div class="border border-gray-200 rounded-lg p-6 mb-8">
      <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <UIcon name="i-lucide-layout-dashboard" class="w-5 h-5 mr-2 text-blue-600" />
        Dashboard Overview
      </h3>
      <div class="space-y-4">
        <p class="text-gray-600">Your parent dashboard provides a central hub for managing your family's educational activities.</p>

        <div class="grid md:grid-cols-2 gap-4">
          <div class="bg-blue-50 rounded-lg p-4">
            <h4 class="font-medium text-gray-800 mb-2">Overview Tab</h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• View total number of students</li>
              <li>• See who's active today</li>
              <li>• Check pending order requests</li>
              <li>• Monitor pending tasks</li>
              <li>• Family learning statistics</li>
            </ul>
          </div>

          <div class="bg-green-50 rounded-lg p-4">
            <h4 class="font-medium text-gray-800 mb-2">Quick Actions</h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• Approve or decline orders</li>
              <li>• Create new tasks</li>
              <li>• Transfer credits</li>
              <li>• Add family members</li>
              <li>• View detailed reports</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Family Management -->
    <div class="border border-gray-200 rounded-lg p-6 mb-8">
      <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <UIcon name="i-lucide-users" class="w-5 h-5 mr-2 text-purple-600" />
        Family Management
      </h3>
      <div class="space-y-6">
        <div>
          <h4 class="font-medium text-gray-800 mb-3">Adding Children to Your Family</h4>
          <div class="bg-gray-50 rounded-lg p-4">
            <ol class="space-y-2 text-sm text-gray-600">
              <li class="flex items-start">
                <span class="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
                <div>Go to <strong>Dashboard → Family → Management</strong></div>
              </li>
              <li class="flex items-start">
                <span class="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
                <div>Click the <strong>"Add Family Member"</strong> button</div>
              </li>
              <li class="flex items-start">
                <span class="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
                <div>Enter your child's details (name, grade level, etc.)</div>
              </li>
              <li class="flex items-start">
                <span class="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">4</span>
                <div>Send them an invitation link</div>
              </li>
              <li class="flex items-start">
                <span class="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">5</span>
                <div>They'll create their student account and be linked to your family</div>
              </li>
            </ol>
          </div>
        </div>

        <div>
          <h4 class="font-medium text-gray-800 mb-3">Managing Multiple Children</h4>
          <div class="grid md:grid-cols-2 gap-4">
            <div class="bg-yellow-50 rounded-lg p-4">
              <h5 class="font-medium text-gray-800 mb-2">Individual Tracking</h5>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Separate credit balances</li>
                <li>• Individual learning progress</li>
                <li>• Personalized task assignments</li>
                <li>• Independent order requests</li>
              </ul>
            </div>

            <div class="bg-pink-50 rounded-lg p-4">
              <h5 class="font-medium text-gray-800 mb-2">Family Features</h5>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Bulk credit transfers</li>
                <li>• Family-wide tasks</li>
                <li>• Combined progress reports</li>
                <li>• Shared subscription benefits</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Credit Management -->
    <div class="border border-gray-200 rounded-lg p-6 mb-8">
      <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <UIcon name="i-lucide-coins" class="w-5 h-5 mr-2 text-green-600" />
        Credit Management
      </h3>
      <div class="space-y-6">
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 class="font-medium text-yellow-800 mb-2 flex items-center">
            <UIcon name="i-lucide-info" class="w-4 h-4 mr-2" />
            Important: Credit Pledge System
          </h4>
          <p class="text-sm text-yellow-700">
            This is a credit system which parents can pledge to distribute to their children.
            StudyWithEddy will not store money or request money transfers. Orders are sent to parents for completion.
          </p>
        </div>

        <div>
          <h4 class="font-medium text-gray-800 mb-3">How Credits Work ($1 = 100 credits)</h4>
          <div class="grid md:grid-cols-3 gap-4">
            <div class="bg-blue-50 rounded-lg p-4 text-center">
              <div class="text-2xl mb-2">💰</div>
              <h5 class="font-medium text-gray-800 mb-1">Pledge Credits</h5>
              <p class="text-xs text-gray-600">Set aside virtual credits for your children</p>
            </div>

            <div class="bg-green-50 rounded-lg p-4 text-center">
              <div class="text-2xl mb-2">🎯</div>
              <h5 class="font-medium text-gray-800 mb-1">Children Earn</h5>
              <p class="text-xs text-gray-600">Kids earn credits through learning activities</p>
            </div>

            <div class="bg-purple-50 rounded-lg p-4 text-center">
              <div class="text-2xl mb-2">🛍️</div>
              <h5 class="font-medium text-gray-800 mb-1">You Approve</h5>
              <p class="text-xs text-gray-600">Review and complete actual purchases</p>
            </div>
          </div>
        </div>

        <div>
          <h4 class="font-medium text-gray-800 mb-3">Managing Credits</h4>
          <div class="space-y-4">
            <div class="bg-gray-50 rounded-lg p-4">
              <h5 class="font-medium text-gray-800 mb-2">Top Up Credits</h5>
              <p class="text-sm text-gray-600 mb-3">Add virtual credits to your family account for distribution to children.</p>
              <ol class="text-sm text-gray-600 space-y-1">
                <li>1. Go to <strong>Dashboard → Credits</strong></li>
                <li>2. Click <strong>"Top Up Credits"</strong></li>
                <li>3. Enter the amount you want to pledge</li>
                <li>4. Confirm the pledge amount</li>
              </ol>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <h5 class="font-medium text-gray-800 mb-2">Transfer to Children</h5>
              <p class="text-sm text-gray-600 mb-3">Distribute credits from your balance to your children's accounts.</p>
              <ol class="text-sm text-gray-600 space-y-1">
                <li>1. Select the child from the transfer section</li>
                <li>2. Enter the amount to transfer</li>
                <li>3. Add an optional note (e.g., "Good work this week!")</li>
                <li>4. Confirm the transfer</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Management -->
    <div class="border border-gray-200 rounded-lg p-6 mb-8">
      <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <UIcon name="i-lucide-shopping-cart" class="w-5 h-5 mr-2 text-orange-600" />
        Order Approval Process
      </h3>
      <div class="space-y-4">
        <p class="text-gray-600">When your children make purchases using their credits, you'll receive order requests to approve.</p>

        <div class="bg-orange-50 rounded-lg p-4">
          <h4 class="font-medium text-gray-800 mb-3">Order Request Workflow</h4>
          <div class="space-y-3">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold text-sm">1</div>
              <div>
                <strong>Child submits order</strong> - They use credits to checkout items from the shop
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold text-sm">2</div>
              <div>
                <strong>You receive notification</strong> - Order appears in your pending requests
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold text-sm">3</div>
              <div>
                <strong>Review order details</strong> - Check items, quantities, and total cost
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold text-sm">4</div>
              <div>
                <strong>Approve or decline</strong> - Make the final decision on the purchase
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold text-sm">5</div>
              <div>
                <strong>Complete purchase</strong> - If approved, you handle the actual transaction
              </div>
            </div>
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-4">
          <div class="bg-green-50 rounded-lg p-4">
            <h5 class="font-medium text-green-800 mb-2">Approving Orders</h5>
            <ul class="text-sm text-green-700 space-y-1">
              <li>• Review each item carefully</li>
              <li>• Check delivery address</li>
              <li>• Confirm you're comfortable with the purchase</li>
              <li>• Complete payment through external vendor</li>
            </ul>
          </div>

          <div class="bg-red-50 rounded-lg p-4">
            <h5 class="font-medium text-red-800 mb-2">Declining Orders</h5>
            <ul class="text-sm text-red-700 space-y-1">
              <li>• Provide a reason for declining</li>
              <li>• Credits are returned to child</li>
              <li>• Consider discussing with your child</li>
              <li>• Set clear purchasing guidelines</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Task Management -->
    <div class="border border-gray-200 rounded-lg p-6 mb-8">
      <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <UIcon name="i-lucide-clipboard-list" class="w-5 h-5 mr-2 text-indigo-600" />
        Task Creation & Management
      </h3>
      <div class="space-y-6">
        <div>
          <h4 class="font-medium text-gray-800 mb-3">Creating Tasks for Children</h4>
          <div class="bg-indigo-50 rounded-lg p-4">
            <ol class="space-y-2 text-sm text-gray-600">
              <li class="flex items-start">
                <span class="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
                <div>Go to <strong>Dashboard → Family → Tasks</strong></div>
              </li>
              <li class="flex items-start">
                <span class="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
                <div>Click <strong>"Create New Task"</strong></div>
              </li>
              <li class="flex items-start">
                <span class="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
                <div>Fill in task details (name, description, credit reward)</div>
              </li>
              <li class="flex items-start">
                <span class="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">4</span>
                <div>Assign to specific children or make it available to all</div>
              </li>
              <li class="flex items-start">
                <span class="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">5</span>
                <div>Set due date (optional)</div>
              </li>
            </ol>
          </div>
        </div>

        <div class="grid md:grid-cols-3 gap-4">
          <div class="bg-gray-50 rounded-lg p-4">
            <h5 class="font-medium text-gray-800 mb-2">Task Types</h5>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• Household chores</li>
              <li>• Learning goals</li>
              <li>• Reading assignments</li>
              <li>• Exercise activities</li>
              <li>• Creative projects</li>
            </ul>
          </div>

          <div class="bg-gray-50 rounded-lg p-4">
            <h5 class="font-medium text-gray-800 mb-2">Task Scheduling</h5>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• <span class="text-blue-600">One-off</span> - Task occurs once</li>
              <li>• <span class="text-green-600">Daily</span> - Repeats every day</li>
              <li>• <span class="text-purple-600">Weekly</span> - Repeats every Sunday</li>
              <li>• <span class="text-orange-600">Monthly</span> - Repeats on 1st of month</li>
            </ul>
          </div>

          <div class="bg-gray-50 rounded-lg p-4">
            <h5 class="font-medium text-gray-800 mb-2">Credit Rewards</h5>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• Set appropriate rewards</li>
              <li>• Consider task difficulty</li>
              <li>• Match your credit budget</li>
              <li>• Motivate completion</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Monitoring Progress -->
    <div class="border border-gray-200 rounded-lg p-6 mb-8">
      <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <UIcon name="i-lucide-bar-chart-3" class="w-5 h-5 mr-2 text-teal-600" />
        Monitoring Learning Progress
      </h3>
      <div class="space-y-4">
        <p class="text-gray-600">Track your children's learning activities and progress through various dashboard features.</p>

        <div class="grid md:grid-cols-2 gap-4">
          <div class="bg-teal-50 rounded-lg p-4">
            <h4 class="font-medium text-gray-800 mb-2">Activity Overview</h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• Daily learning time</li>
              <li>• Subjects studied</li>
              <li>• Quiz completion rates</li>
              <li>• Credits earned</li>
              <li>• Task completion status</li>
            </ul>
          </div>

          <div class="bg-blue-50 rounded-lg p-4">
            <h4 class="font-medium text-gray-800 mb-2">Detailed Reports</h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• Weekly progress summaries</li>
              <li>• Subject-specific analytics</li>
              <li>• Learning streak tracking</li>
              <li>• Goal achievement metrics</li>
              <li>• Improvement trends</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Tips for Success -->
    <div class="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <UIcon name="i-lucide-lightbulb" class="w-5 h-5 mr-2 text-primary-600" />
        Tips for Success
      </h3>
      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <h4 class="font-medium text-gray-800 mb-2">Best Practices:</h4>
          <ul class="text-sm text-gray-600 space-y-1">
            <li>• Set clear expectations with your children</li>
            <li>• Review order requests promptly</li>
            <li>• Create meaningful, achievable tasks</li>
            <li>• Celebrate learning milestones</li>
            <li>• Use credits as positive reinforcement</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium text-gray-800 mb-2">Stay Engaged:</h4>
          <ul class="text-sm text-gray-600 space-y-1">
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
// Component logic if needed
</script>

<style scoped>
.guide-content {
  line-height: 1.6;
}
</style>
