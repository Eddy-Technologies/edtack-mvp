<template>
  <div class="guide-content">
    <div class="mb-6">
      <h2 class="text-3xl font-bold text-gray-800 mb-2">Family Features Guide</h2>
      <p class="text-gray-600">Learn how to set up and manage your family account, connect multiple children, and coordinate learning activities.</p>
    </div>

    <!-- Family Account Overview -->
    <div class="border border-gray-200 rounded-lg p-6 mb-8">
      <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <UIcon name="i-lucide-home" class="w-5 h-5 mr-2 text-blue-600" />
        Family Account Overview
      </h3>
      <div class="space-y-4">
        <p class="text-gray-600">StudyWithEddy's family system allows parents to manage multiple children's learning activities from one central account.</p>

        <div class="grid md:grid-cols-3 gap-4">
          <div class="bg-blue-50 rounded-lg p-4 text-center">
            <div class="text-2xl mb-2">👨‍👩‍👧‍👦</div>
            <h4 class="font-medium text-gray-800 mb-1">Multi-Child Support</h4>
            <p class="text-xs text-gray-600">Manage multiple children from one parent account</p>
          </div>

          <div class="bg-green-50 rounded-lg p-4 text-center">
            <div class="text-2xl mb-2">📊</div>
            <h4 class="font-medium text-gray-800 mb-1">Unified Dashboard</h4>
            <p class="text-xs text-gray-600">View all family activities in one place</p>
          </div>

          <div class="bg-purple-50 rounded-lg p-4 text-center">
            <div class="text-2xl mb-2">💳</div>
            <h4 class="font-medium text-gray-800 mb-1">Shared Subscription</h4>
            <p class="text-xs text-gray-600">One subscription covers the entire family</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Setting Up Family Account -->
    <div class="border border-gray-200 rounded-lg p-6 mb-8">
      <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <UIcon name="i-lucide-settings" class="w-5 h-5 mr-2 text-green-600" />
        Setting Up Your Family Account
      </h3>
      <div class="space-y-6">
        <div>
          <h4 class="font-medium text-gray-800 mb-3">Initial Setup Steps</h4>
          <div class="bg-green-50 rounded-lg p-4">
            <ol class="space-y-3 text-sm text-gray-600">
              <li class="flex items-start">
                <span class="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
                <div>
                  <strong>Create Parent Account:</strong> Register as a parent during the onboarding process
                </div>
              </li>
              <li class="flex items-start">
                <span class="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
                <div>
                  <strong>Complete Profile:</strong> Fill in your information and family details
                </div>
              </li>
              <li class="flex items-start">
                <span class="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
                <div>
                  <strong>Set Up Subscription:</strong> Choose your family plan and payment method
                </div>
              </li>
              <li class="flex items-start">
                <span class="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">4</span>
                <div>
                  <strong>Add Children:</strong> Create accounts for each child in your family
                </div>
              </li>
              <li class="flex items-start">
                <span class="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">5</span>
                <div>
                  <strong>Configure Settings:</strong> Set up credit allowances and learning preferences
                </div>
              </li>
            </ol>
          </div>
        </div>

        <div>
          <h4 class="font-medium text-gray-800 mb-3">Family Account Benefits</h4>
          <div class="grid md:grid-cols-2 gap-4">
            <div class="bg-gray-50 rounded-lg p-4">
              <h5 class="font-medium text-gray-800 mb-2">Centralized Management</h5>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Single dashboard for all children</li>
                <li>• Unified subscription and billing</li>
                <li>• Consolidated progress reports</li>
                <li>• Shared family credit pool</li>
              </ul>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <h5 class="font-medium text-gray-800 mb-2">Individual Tracking</h5>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Separate learning profiles</li>
                <li>• Individual credit balances</li>
                <li>• Personal task assignments</li>
                <li>• Custom learning goals</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Adding & Managing Children -->
    <div class="border border-gray-200 rounded-lg p-6 mb-8">
      <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <UIcon name="i-lucide-user-plus" class="w-5 h-5 mr-2 text-purple-600" />
        Adding & Managing Children
      </h3>
      <div class="space-y-6">
        <div>
          <h4 class="font-medium text-gray-800 mb-3">Adding a New Child</h4>
          <div class="bg-purple-50 rounded-lg p-4">
            <ol class="space-y-2 text-sm text-gray-600">
              <li class="flex items-start">
                <span class="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
                <div>Go to <strong>Dashboard → Family → Management</strong></div>
              </li>
              <li class="flex items-start">
                <span class="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
                <div>Click <strong>"Add Family Member"</strong> button</div>
              </li>
              <li class="flex items-start">
                <span class="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
                <div>Fill in child's information (name, age, grade level)</div>
              </li>
              <li class="flex items-start">
                <span class="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">4</span>
                <div>Set initial learning preferences and restrictions</div>
              </li>
              <li class="flex items-start">
                <span class="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">5</span>
                <div>Generate invitation link or create account directly</div>
              </li>
              <li class="flex items-start">
                <span class="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">6</span>
                <div>Child uses invitation to complete their student profile</div>
              </li>
            </ol>
          </div>
        </div>

        <div>
          <h4 class="font-medium text-gray-800 mb-3">Child Account Options</h4>
          <div class="grid md:grid-cols-2 gap-4">
            <div class="bg-yellow-50 rounded-lg p-4">
              <h5 class="font-medium text-gray-800 mb-2 flex items-center">
                <UIcon name="i-lucide-link" class="w-4 h-4 mr-2 text-yellow-600" />
                Invitation Method
              </h5>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Generate unique invitation link</li>
                <li>• Child creates their own login credentials</li>
                <li>• Complete student onboarding process</li>
                <li>• Account automatically linked to family</li>
              </ul>
              <div class="mt-2 p-2 bg-yellow-100 rounded">
                <p class="text-xs text-yellow-700">💡 Best for older children who can manage their own accounts</p>
              </div>
            </div>

            <div class="bg-blue-50 rounded-lg p-4">
              <h5 class="font-medium text-gray-800 mb-2 flex items-center">
                <UIcon name="i-lucide-user-cog" class="w-4 h-4 mr-2 text-blue-600" />
                Direct Creation
              </h5>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Parent creates account directly</li>
                <li>• Set temporary password for child</li>
                <li>• Child can update credentials later</li>
                <li>• Immediate access to learning platform</li>
              </ul>
              <div class="mt-2 p-2 bg-blue-100 rounded">
                <p class="text-xs text-blue-700">💡 Best for younger children who need more guidance</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 class="font-medium text-gray-800 mb-3">Managing Multiple Children</h4>
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="text-center">
                <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <UIcon name="i-lucide-user" class="w-6 h-6 text-indigo-600" />
                </div>
                <h6 class="font-medium text-gray-800 text-sm mb-1">Individual Profiles</h6>
                <p class="text-xs text-gray-600">Each child has their own learning profile and progress tracking</p>
              </div>

              <div class="text-center">
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <UIcon name="i-lucide-coins" class="w-6 h-6 text-green-600" />
                </div>
                <h6 class="font-medium text-gray-800 text-sm mb-1">Separate Credits</h6>
                <p class="text-xs text-gray-600">Individual credit balances and earning tracking</p>
              </div>

              <div class="text-center">
                <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <UIcon name="i-lucide-clipboard-list" class="w-6 h-6 text-orange-600" />
                </div>
                <h6 class="font-medium text-gray-800 text-sm mb-1">Custom Tasks</h6>
                <p class="text-xs text-gray-600">Assign different tasks to different children</p>
              </div>

              <div class="text-center">
                <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <UIcon name="i-lucide-settings" class="w-6 h-6 text-purple-600" />
                </div>
                <h6 class="font-medium text-gray-800 text-sm mb-1">Individual Settings</h6>
                <p class="text-xs text-gray-600">Customize learning preferences for each child</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Family Dashboard Features -->
    <div class="border border-gray-200 rounded-lg p-6 mb-8">
      <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <UIcon name="i-lucide-layout-dashboard" class="w-5 h-5 mr-2 text-teal-600" />
        Family Dashboard Features
      </h3>
      <div class="space-y-6">
        <div>
          <h4 class="font-medium text-gray-800 mb-3">Overview Tab</h4>
          <div class="bg-teal-50 rounded-lg p-4">
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <h5 class="font-medium text-gray-800 mb-2">Family Statistics</h5>
                <ul class="text-sm text-gray-600 space-y-1">
                  <li>• Total number of children</li>
                  <li>• Children active today</li>
                  <li>• Combined learning hours</li>
                  <li>• Total credits earned</li>
                  <li>• Completed tasks this week</li>
                </ul>
              </div>

              <div>
                <h5 class="font-medium text-gray-800 mb-2">Quick Actions</h5>
                <ul class="text-sm text-gray-600 space-y-1">
                  <li>• View pending order requests</li>
                  <li>• Check incomplete tasks</li>
                  <li>• Review recent activities</li>
                  <li>• Access individual child profiles</li>
                  <li>• Approve/decline orders quickly</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 class="font-medium text-gray-800 mb-3">Family Management Tabs</h4>
          <div class="space-y-4">
            <div class="bg-gray-50 rounded-lg p-4">
              <h5 class="font-medium text-gray-800 mb-2 flex items-center">
                <UIcon name="i-lucide-users" class="w-4 h-4 mr-2 text-gray-600" />
                Management Tab
              </h5>
              <div class="grid md:grid-cols-3 gap-3">
                <div>
                  <h6 class="text-sm font-medium text-gray-700 mb-1">Add Members</h6>
                  <p class="text-xs text-gray-600">Invite new children to join the family account</p>
                </div>
                <div>
                  <h6 class="text-sm font-medium text-gray-700 mb-1">Edit Profiles</h6>
                  <p class="text-xs text-gray-600">Update children's information and preferences</p>
                </div>
                <div>
                  <h6 class="text-sm font-medium text-gray-700 mb-1">Remove Members</h6>
                  <p class="text-xs text-gray-600">Safely remove children from the family account</p>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <h5 class="font-medium text-gray-800 mb-2 flex items-center">
                <UIcon name="i-lucide-shopping-cart" class="w-4 h-4 mr-2 text-gray-600" />
                Order Requests Tab
              </h5>
              <div class="grid md:grid-cols-3 gap-3">
                <div>
                  <h6 class="text-sm font-medium text-gray-700 mb-1">Pending Orders</h6>
                  <p class="text-xs text-gray-600">Review and approve children's purchase requests</p>
                </div>
                <div>
                  <h6 class="text-sm font-medium text-gray-700 mb-1">Order History</h6>
                  <p class="text-xs text-gray-600">View past approved and declined orders</p>
                </div>
                <div>
                  <h6 class="text-sm font-medium text-gray-700 mb-1">Bulk Actions</h6>
                  <p class="text-xs text-gray-600">Approve or decline multiple orders at once</p>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <h5 class="font-medium text-gray-800 mb-2 flex items-center">
                <UIcon name="i-lucide-clipboard-list" class="w-4 h-4 mr-2 text-gray-600" />
                Tasks Tab
              </h5>
              <div class="grid md:grid-cols-3 gap-3">
                <div>
                  <h6 class="text-sm font-medium text-gray-700 mb-1">Create Tasks</h6>
                  <p class="text-xs text-gray-600">Assign new tasks to individual children or all</p>
                </div>
                <div>
                  <h6 class="text-sm font-medium text-gray-700 mb-1">Track Progress</h6>
                  <p class="text-xs text-gray-600">Monitor task completion and approve submissions</p>
                </div>
                <div>
                  <h6 class="text-sm font-medium text-gray-700 mb-1">Manage Templates</h6>
                  <p class="text-xs text-gray-600">Create recurring tasks and task templates</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Task Management -->
    <div class="border border-gray-200 rounded-lg p-6 mb-8">
      <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <UIcon name="i-lucide-check-square" class="w-5 h-5 mr-2 text-indigo-600" />
        Family Task Management
      </h3>
      <div class="space-y-6">
        <div>
          <h4 class="font-medium text-gray-800 mb-3">Creating Family Tasks</h4>
          <div class="grid md:grid-cols-2 gap-4">
            <div class="bg-indigo-50 rounded-lg p-4">
              <h5 class="font-medium text-gray-800 mb-2">Individual Tasks</h5>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Assign to specific children</li>
                <li>• Customize difficulty and rewards</li>
                <li>• Set personal deadlines</li>
                <li>• Track individual completion</li>
              </ul>
              <div class="mt-2 p-2 bg-indigo-100 rounded">
                <p class="text-xs text-indigo-700">Example: "Sarah, complete math homework for 15 credits"</p>
              </div>
            </div>

            <div class="bg-purple-50 rounded-lg p-4">
              <h5 class="font-medium text-gray-800 mb-2">Family-Wide Tasks</h5>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Available to all children</li>
                <li>• Shared completion goals</li>
                <li>• Collaborative projects</li>
                <li>• Family challenges</li>
              </ul>
              <div class="mt-2 p-2 bg-purple-100 rounded">
                <p class="text-xs text-purple-700">Example: "Everyone help clean the house for 20 credits each"</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 class="font-medium text-gray-800 mb-3">Task Categories & Examples</h4>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="bg-gray-50 rounded-lg p-4">
              <h5 class="font-medium text-gray-800 mb-2 flex items-center">
                <UIcon name="i-lucide-home" class="w-4 h-4 mr-2 text-gray-600" />
                Household Chores
              </h5>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Clean bedroom</li>
                <li>• Help with dishes</li>
                <li>• Organize toys</li>
                <li>• Feed pets</li>
                <li>• Water plants</li>
              </ul>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <h5 class="font-medium text-gray-800 mb-2 flex items-center">
                <UIcon name="i-lucide-book" class="w-4 h-4 mr-2 text-gray-600" />
                Learning Goals
              </h5>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Read for 30 minutes</li>
                <li>• Complete homework</li>
                <li>• Practice instrument</li>
                <li>• Study vocabulary</li>
                <li>• Write in journal</li>
              </ul>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <h5 class="font-medium text-gray-800 mb-2 flex items-center">
                <UIcon name="i-lucide-heart" class="w-4 h-4 mr-2 text-gray-600" />
                Personal Development
              </h5>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Exercise for 20 minutes</li>
                <li>• Practice kindness</li>
                <li>• Help a sibling</li>
                <li>• Try something new</li>
                <li>• Share feelings</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h4 class="font-medium text-gray-800 mb-3">Task Approval Process</h4>
          <div class="bg-yellow-50 rounded-lg p-4">
            <div class="space-y-3">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-700 font-bold text-sm">1</div>
                <div>
                  <strong>Child completes task</strong> - Marks task as done and submits proof if required
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-700 font-bold text-sm">2</div>
                <div>
                  <strong>Parent receives notification</strong> - Task appears in pending approvals
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-700 font-bold text-sm">3</div>
                <div>
                  <strong>Review and verify</strong> - Check if task was completed satisfactorily
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-700 font-bold text-sm">4</div>
                <div>
                  <strong>Approve or request revision</strong> - Award credits or ask for improvements
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Management -->
    <div class="border border-gray-200 rounded-lg p-6 mb-8">
      <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <UIcon name="i-lucide-package" class="w-5 h-5 mr-2 text-orange-600" />
        Family Order Management
      </h3>
      <div class="space-y-4">
        <p class="text-gray-600">Manage purchase requests from all children in one centralized location.</p>

        <div class="grid md:grid-cols-2 gap-4">
          <div class="bg-orange-50 rounded-lg p-4">
            <h4 class="font-medium text-gray-800 mb-2">Order Dashboard Features</h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• View all pending orders from all children</li>
              <li>• Sort by child, date, or total amount</li>
              <li>• Filter by order status or item type</li>
              <li>• Bulk approve/decline similar orders</li>
              <li>• Set spending limits per child</li>
            </ul>
          </div>

          <div class="bg-blue-50 rounded-lg p-4">
            <h4 class="font-medium text-gray-800 mb-2">Decision Making Tools</h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• View detailed item descriptions</li>
              <li>• Check child's recent order history</li>
              <li>• See credit earning activity</li>
              <li>• Add notes for declined orders</li>
              <li>• Set reminders for future purchases</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Family Analytics -->
    <div class="border border-gray-200 rounded-lg p-6 mb-8">
      <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <UIcon name="i-lucide-bar-chart-3" class="w-5 h-5 mr-2 text-pink-600" />
        Family Learning Analytics
      </h3>
      <div class="space-y-4">
        <p class="text-gray-600">Track your family's collective learning progress and individual achievements.</p>

        <div class="grid md:grid-cols-3 gap-4">
          <div class="bg-pink-50 rounded-lg p-4">
            <h4 class="font-medium text-gray-800 mb-2">Learning Metrics</h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• Total study hours per child</li>
              <li>• Subject preferences and progress</li>
              <li>• Quiz performance trends</li>
              <li>• Learning streak tracking</li>
              <li>• Improvement areas identification</li>
            </ul>
          </div>

          <div class="bg-green-50 rounded-lg p-4">
            <h4 class="font-medium text-gray-800 mb-2">Activity Tracking</h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• Daily and weekly engagement</li>
              <li>• Most active learning times</li>
              <li>• Favorite AI characters</li>
              <li>• Completed vs. assigned tasks</li>
              <li>• Family learning goals progress</li>
            </ul>
          </div>

          <div class="bg-blue-50 rounded-lg p-4">
            <h4 class="font-medium text-gray-800 mb-2">Credit Analytics</h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• Credit earning patterns</li>
              <li>• Spending behavior analysis</li>
              <li>• Task completion rates</li>
              <li>• Credit allocation efficiency</li>
              <li>• Savings vs. spending trends</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Best Practices -->
    <div class="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <UIcon name="i-lucide-thumbs-up" class="w-5 h-5 mr-2 text-primary-600" />
        Family Management Best Practices
      </h3>
      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <h4 class="font-medium text-gray-800 mb-3">Setting Up for Success</h4>
          <ul class="text-sm text-gray-600 space-y-2">
            <li class="flex items-start">
              <UIcon name="i-lucide-target" class="w-4 h-4 mr-2 text-primary-600 mt-0.5" />
              <div>Establish clear family learning goals and expectations</div>
            </li>
            <li class="flex items-start">
              <UIcon name="i-lucide-users" class="w-4 h-4 mr-2 text-primary-600 mt-0.5" />
              <div>Include children in creating family rules and credit policies</div>
            </li>
            <li class="flex items-start">
              <UIcon name="i-lucide-calendar" class="w-4 h-4 mr-2 text-primary-600 mt-0.5" />
              <div>Schedule regular family check-ins about progress</div>
            </li>
            <li class="flex items-start">
              <UIcon name="i-lucide-balance-scale" class="w-4 h-4 mr-2 text-primary-600 mt-0.5" />
              <div>Balance individual achievements with family collaboration</div>
            </li>
          </ul>
        </div>

        <div>
          <h4 class="font-medium text-gray-800 mb-3">Maintaining Engagement</h4>
          <ul class="text-sm text-gray-600 space-y-2">
            <li class="flex items-start">
              <UIcon name="i-lucide-gift" class="w-4 h-4 mr-2 text-secondary-600 mt-0.5" />
              <div>Celebrate both individual and family milestones</div>
            </li>
            <li class="flex items-start">
              <UIcon name="i-lucide-message-circle" class="w-4 h-4 mr-2 text-secondary-600 mt-0.5" />
              <div>Encourage children to share their learning discoveries</div>
            </li>
            <li class="flex items-start">
              <UIcon name="i-lucide-adjust" class="w-4 h-4 mr-2 text-secondary-600 mt-0.5" />
              <div>Adapt tasks and challenges as children grow</div>
            </li>
            <li class="flex items-start">
              <UIcon name="i-lucide-heart" class="w-4 h-4 mr-2 text-secondary-600 mt-0.5" />
              <div>Focus on effort and improvement, not just results</div>
            </li>
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
