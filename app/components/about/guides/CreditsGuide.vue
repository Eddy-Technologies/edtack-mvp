<template>
  <div class="guide-content">
    <div class="mb-6">
      <h2 class="text-3xl font-bold text-gray-800 mb-2">Credits & Rewards System</h2>
      <p class="text-gray-600">Understanding how StudyWithEddy's credit system works to reward learning and motivate achievement.</p>
    </div>

    <!-- What Are Credits -->
    <div class="border border-gray-200 rounded-lg p-6 mb-8">
      <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <UIcon name="i-lucide-help-circle" class="w-5 h-5 mr-2 text-blue-600" />
        What Are Credits?
      </h3>
      <div class="space-y-4">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 class="font-medium text-blue-800 mb-2 flex items-center">
            <UIcon name="i-lucide-lightbulb" class="w-4 h-4 mr-2" />
            Credits Explained
          </h4>
          <p class="text-sm text-blue-700 mb-3">
            Credits are virtual points that students earn through learning activities. Think of them as "learning currency" 
            that can be exchanged for real rewards with parental approval.
          </p>
          <div class="bg-blue-100 rounded p-3">
            <p class="text-xs text-blue-600 font-medium">
              🎯 Key Point: Credits are not real money. Parents pledge virtual credits and approve actual purchases when students want to "spend" them.
            </p>
          </div>
        </div>

        <div class="grid md:grid-cols-3 gap-4">
          <div class="bg-green-50 rounded-lg p-4 text-center">
            <div class="text-2xl mb-2">🎓</div>
            <h4 class="font-medium text-gray-800 mb-1">Learn & Earn</h4>
            <p class="text-xs text-gray-600">Students complete educational activities to earn credits</p>
          </div>
          
          <div class="bg-purple-50 rounded-lg p-4 text-center">
            <div class="text-2xl mb-2">💰</div>
            <h4 class="font-medium text-gray-800 mb-1">Virtual Currency</h4>
            <p class="text-xs text-gray-600">Credits represent value without being real money</p>
          </div>
          
          <div class="bg-orange-50 rounded-lg p-4 text-center">
            <div class="text-2xl mb-2">🎁</div>
            <h4 class="font-medium text-gray-800 mb-1">Real Rewards</h4>
            <p class="text-xs text-gray-600">Credits can be exchanged for actual items with parent approval</p>
          </div>
        </div>
      </div>
    </div>

    <!-- How Students Earn Credits -->
    <div class="border border-gray-200 rounded-lg p-6 mb-8">
      <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <UIcon name="i-lucide-trending-up" class="w-5 h-5 mr-2 text-green-600" />
        How Students Earn Credits
      </h3>
      <div class="space-y-6">
        <div class="grid md:grid-cols-2 gap-6">
          <div class="bg-green-50 rounded-lg p-4">
            <h4 class="font-medium text-gray-800 mb-3 flex items-center">
              <UIcon name="i-lucide-brain" class="w-4 h-4 mr-2 text-green-600" />
              Interactive Quizzes
            </h4>
            <div class="space-y-3">
              <p class="text-sm text-gray-600">The primary way to earn credits through learning activities.</p>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Ask AI tutors for subject-specific quizzes</li>
                <li>• Answer questions correctly to earn credits</li>
                <li>• More difficult questions = more credits</li>
                <li>• Complete quiz series for bonus credits</li>
              </ul>
              <div class="bg-green-100 rounded p-2">
                <p class="text-xs text-green-700">💡 Tip: Regular quiz-taking builds learning streaks for extra rewards!</p>
              </div>
            </div>
          </div>
          
          <div class="bg-blue-50 rounded-lg p-4">
            <h4 class="font-medium text-gray-800 mb-3 flex items-center">
              <UIcon name="i-lucide-clipboard-check" class="w-4 h-4 mr-2 text-blue-600" />
              Assigned Tasks
            </h4>
            <div class="space-y-3">
              <p class="text-sm text-gray-600">Complete tasks assigned by parents for credit rewards.</p>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Household chores and responsibilities</li>
                <li>• Reading assignments and book reports</li>
                <li>• Creative projects and presentations</li>
                <li>• Physical activities and exercise goals</li>
              </ul>
              <div class="bg-blue-100 rounded p-2">
                <p class="text-xs text-blue-700">💡 Tip: Higher priority tasks usually offer more credits!</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 class="font-medium text-gray-800 mb-3">Credit Earning Examples</h4>
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="text-center">
                <div class="text-lg font-bold text-green-600">+5 credits</div>
                <div class="text-xs text-gray-600">Basic math quiz (5 questions)</div>
              </div>
              
              <div class="text-center">
                <div class="text-lg font-bold text-green-600">+10 credits</div>
                <div class="text-xs text-gray-600">Science vocabulary test (10 questions)</div>
              </div>
              
              <div class="text-center">
                <div class="text-lg font-bold text-green-600">+15 credits</div>
                <div class="text-xs text-gray-600">Reading comprehension quiz</div>
              </div>
              
              <div class="text-center">
                <div class="text-lg font-bold text-green-600">+25 credits</div>
                <div class="text-xs text-gray-600">Complete household task</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Parent Credit Management -->
    <div class="border border-gray-200 rounded-lg p-6 mb-8">
      <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <UIcon name="i-lucide-users" class="w-5 h-5 mr-2 text-purple-600" />
        Parent Credit Management
      </h3>
      <div class="space-y-6">
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 class="font-medium text-yellow-800 mb-2 flex items-center">
            <UIcon name="i-lucide-info" class="w-4 h-4 mr-2" />
            Important: Credit Pledge System
          </h4>
          <p class="text-sm text-yellow-700 mb-2">
            StudyWithEddy operates on a "credit pledge" system where parents commit virtual credits to their family account. 
            This is NOT a payment to StudyWithEddy - it's a promise to fulfill purchases that children request using their earned credits.
          </p>
          <ul class="text-xs text-yellow-600 space-y-1">
            <li>• No money is transferred to StudyWithEddy</li>
            <li>• Parents maintain full control over actual purchases</li>
            <li>• All transactions are between parents and external vendors</li>
            <li>• Credits are reset if family leaves the platform</li>
          </ul>
        </div>

        <div>
          <h4 class="font-medium text-gray-800 mb-3">Parent Responsibilities</h4>
          <div class="grid md:grid-cols-2 gap-4">
            <div class="bg-purple-50 rounded-lg p-4">
              <h5 class="font-medium text-gray-800 mb-2">Credit Distribution</h5>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Top up family credit balance</li>
                <li>• Transfer credits to children's accounts</li>
                <li>• Set appropriate credit allowances</li>
                <li>• Monitor credit spending patterns</li>
              </ul>
            </div>
            
            <div class="bg-pink-50 rounded-lg p-4">
              <h5 class="font-medium text-gray-800 mb-2">Purchase Approval</h5>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Review children's order requests</li>
                <li>• Approve or decline purchases</li>
                <li>• Complete actual transactions</li>
                <li>• Manage delivery arrangements</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h4 class="font-medium text-gray-800 mb-3">Credit Transfer Process</h4>
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="space-y-3">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-sm">1</div>
                <div>
                  <strong>Parent pledges credits</strong> - Add virtual credits to family balance
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-sm">2</div>
                <div>
                  <strong>Transfer to children</strong> - Distribute credits to individual student accounts
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-sm">3</div>
                <div>
                  <strong>Students earn more</strong> - Children earn additional credits through learning
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-sm">4</div>
                <div>
                  <strong>Credits accumulate</strong> - Students build up credit balance for purchases
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Shopping & Order Process -->
    <div class="border border-gray-200 rounded-lg p-6 mb-8">
      <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <UIcon name="i-lucide-shopping-cart" class="w-5 h-5 mr-2 text-orange-600" />
        Shopping & Order Process
      </h3>
      <div class="space-y-6">
        <div>
          <h4 class="font-medium text-gray-800 mb-3">How Credit Shopping Works</h4>
          <div class="bg-orange-50 rounded-lg p-4">
            <div class="space-y-3">
              <div class="flex items-start space-x-3">
                <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold text-sm">1</div>
                <div>
                  <strong>Browse Shop</strong> - Students explore available products and see credit prices
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold text-sm">2</div>
                <div>
                  <strong>Add to Cart</strong> - Select items and quantities within credit budget
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold text-sm">3</div>
                <div>
                  <strong>Credit Checkout</strong> - "Purchase" using earned credits (no real money involved)
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold text-sm">4</div>
                <div>
                  <strong>Parent Notification</strong> - Order request sent to parent for approval
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold text-sm">5</div>
                <div>
                  <strong>Approval Decision</strong> - Parent reviews and approves/declines the order
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold text-sm">6</div>
                <div>
                  <strong>Real Purchase</strong> - If approved, parent completes actual transaction with vendor
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-4">
          <div class="bg-green-50 rounded-lg p-4">
            <h5 class="font-medium text-green-800 mb-2">For Students</h5>
            <ul class="text-sm text-green-700 space-y-1">
              <li>• Check credit balance before shopping</li>
              <li>• Compare prices and choose wisely</li>
              <li>• Use wishlist to save items for later</li>
              <li>• Understand that parent approval is required</li>
              <li>• Be patient during the approval process</li>
            </ul>
          </div>
          
          <div class="bg-blue-50 rounded-lg p-4">
            <h5 class="font-medium text-blue-800 mb-2">For Parents</h5>
            <ul class="text-sm text-blue-700 space-y-1">
              <li>• Review order details carefully</li>
              <li>• Consider appropriateness of items</li>
              <li>• Check your budget for actual purchase</li>
              <li>• Communicate decisions clearly to children</li>
              <li>• Use declined orders as teaching moments</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Credit History & Tracking -->
    <div class="border border-gray-200 rounded-lg p-6 mb-8">
      <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <UIcon name="i-lucide-history" class="w-5 h-5 mr-2 text-teal-600" />
        Credit History & Tracking
      </h3>
      <div class="space-y-4">
        <p class="text-gray-600">Both students and parents can track credit activities through the dashboard.</p>
        
        <div class="grid md:grid-cols-2 gap-4">
          <div class="bg-teal-50 rounded-lg p-4">
            <h4 class="font-medium text-gray-800 mb-2">Student View</h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• Current credit balance</li>
              <li>• Recent earnings from quizzes and tasks</li>
              <li>• Pending and completed orders</li>
              <li>• Learning streaks and achievements</li>
              <li>• Credit spending history</li>
            </ul>
          </div>
          
          <div class="bg-blue-50 rounded-lg p-4">
            <h4 class="font-medium text-gray-800 mb-2">Parent View</h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• Family credit balance and distribution</li>
              <li>• Each child's earning and spending patterns</li>
              <li>• Order approval history</li>
              <li>• Task completion and credit rewards</li>
              <li>• Transfer history and pledged amounts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Best Practices -->
    <div class="border border-gray-200 rounded-lg p-6 mb-8">
      <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <UIcon name="i-lucide-award" class="w-5 h-5 mr-2 text-amber-600" />
        Best Practices for Credit Management
      </h3>
      <div class="space-y-6">
        <div class="grid md:grid-cols-2 gap-6">
          <div class="bg-amber-50 rounded-lg p-4">
            <h4 class="font-medium text-gray-800 mb-3">For Families</h4>
            <ul class="text-sm text-gray-600 space-y-2">
              <li class="flex items-start">
                <UIcon name="i-lucide-target" class="w-4 h-4 mr-2 text-amber-600 mt-0.5" />
                <div>Set clear expectations about credit earning and spending</div>
              </li>
              <li class="flex items-start">
                <UIcon name="i-lucide-calendar" class="w-4 h-4 mr-2 text-amber-600 mt-0.5" />
                <div>Establish regular check-ins about progress and goals</div>
              </li>
              <li class="flex items-start">
                <UIcon name="i-lucide-heart" class="w-4 h-4 mr-2 text-amber-600 mt-0.5" />
                <div>Use credits to reinforce positive learning behaviors</div>
              </li>
              <li class="flex items-start">
                <UIcon name="i-lucide-balance-scale" class="w-4 h-4 mr-2 text-amber-600 mt-0.5" />
                <div>Balance credit rewards with intrinsic motivation</div>
              </li>
            </ul>
          </div>
          
          <div class="bg-green-50 rounded-lg p-4">
            <h4 class="font-medium text-gray-800 mb-3">For Students</h4>
            <ul class="text-sm text-gray-600 space-y-2">
              <li class="flex items-start">
                <UIcon name="i-lucide-brain" class="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                <div>Focus on learning first, credits will follow naturally</div>
              </li>
              <li class="flex items-start">
                <UIcon name="i-lucide-piggy-bank" class="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                <div>Save credits for meaningful purchases rather than impulse buying</div>
              </li>
              <li class="flex items-start">
                <UIcon name="i-lucide-trending-up" class="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                <div>Set learning goals and celebrate credit milestones</div>
              </li>
              <li class="flex items-start">
                <UIcon name="i-lucide-users" class="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                <div>Communicate openly with parents about desired purchases</div>
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h4 class="font-medium text-gray-800 mb-3">Common Questions Answered</h4>
          <div class="space-y-3">
            <div class="bg-gray-50 rounded-lg p-3">
              <h5 class="font-medium text-gray-800 text-sm mb-1">What happens if parents decline an order?</h5>
              <p class="text-xs text-gray-600">Credits are returned to the student's account, and they can use them for different purchases or save for later.</p>
            </div>
            
            <div class="bg-gray-50 rounded-lg p-3">
              <h5 class="font-medium text-gray-800 text-sm mb-1">Can credits be transferred between children?</h5>
              <p class="text-xs text-gray-600">No, each child maintains their own credit balance. Parents can transfer from their account to any child, but not between siblings directly.</p>
            </div>
            
            <div class="bg-gray-50 rounded-lg p-3">
              <h5 class="font-medium text-gray-800 text-sm mb-1">Do credits expire?</h5>
              <p class="text-xs text-gray-600">Credits don't expire as long as the family maintains an active account. However, they are reset if the family leaves the platform.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Safety & Security -->
    <div class="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <UIcon name="i-lucide-shield-check" class="w-5 h-5 mr-2 text-red-600" />
        Safety & Security Notes
      </h3>
      <div class="space-y-3">
        <div class="bg-red-100 rounded p-3">
          <h4 class="font-medium text-red-800 mb-2">Financial Safety</h4>
          <ul class="text-sm text-red-700 space-y-1">
            <li>• StudyWithEddy never handles real money or payment information</li>
            <li>• All actual purchases are made directly by parents with external vendors</li>
            <li>• No credit card or banking details are stored by our platform</li>
            <li>• Parents maintain complete control over all real financial transactions</li>
          </ul>
        </div>
        
        <div class="grid md:grid-cols-2 gap-3">
          <div class="bg-orange-100 rounded p-3">
            <h5 class="font-medium text-orange-800 mb-1">Contact Support</h5>
            <p class="text-xs text-orange-700">Questions about credits? Email us at eddytech.ai@gmail.com</p>
          </div>
          
          <div class="bg-yellow-100 rounded p-3">
            <h5 class="font-medium text-yellow-800 mb-1">Privacy Protection</h5>
            <p class="text-xs text-yellow-700">All credit activities are private to your family account only</p>
          </div>
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