<template>
  <div class="guide-content">
    <div class="mb-6">
      <h2 class="text-3xl font-bold text-gray-800 mb-2">Getting Started with StudyWithEddy</h2>
      <p class="text-gray-600">Welcome! Let's get you set up and ready to start learning.</p>
    </div>

    <!-- Quick Start Steps -->
    <div class="bg-secondary-50 rounded-lg p-6 mb-8">
      <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <UIcon name="i-lucide-zap" class="w-5 h-5 mr-2 text-secondary-600" />
        Quick Start (2 minutes)
      </h3>
      <div class="grid md:grid-cols-2 gap-4">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center text-secondary-700 font-bold text-sm">1</div>
          <span class="text-gray-700">Create your account</span>
        </div>
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center text-secondary-700 font-bold text-sm">2</div>
          <span class="text-gray-700">Choose Parent or Student</span>
        </div>
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center text-secondary-700 font-bold text-sm">3</div>
          <span class="text-gray-700">Complete your profile</span>
        </div>
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center text-secondary-700 font-bold text-sm">4</div>
          <span class="text-gray-700">Start chatting with Eddy!</span>
        </div>
      </div>
    </div>

    <!-- Detailed Steps -->
    <div class="space-y-8">
      <!-- Step 1: Account Creation -->
      <div class="border border-gray-200 rounded-lg p-6">
        <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm mr-3">1</div>
          Account Creation
        </h3>
        <div class="space-y-4">
          <p class="text-gray-600">You have two options to create your account:</p>
          
          <div class="grid md:grid-cols-2 gap-4">
            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="font-medium text-gray-800 mb-2 flex items-center">
                <UIcon name="i-lucide-mail" class="w-4 h-4 mr-2 text-blue-600" />
                Email Registration
              </h4>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Enter your email address</li>
                <li>• Create a secure password</li>
                <li>• Verify your email</li>
                <li>• Complete profile setup</li>
              </ul>
            </div>
            
            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="font-medium text-gray-800 mb-2 flex items-center">
                <UIcon name="i-lucide-chrome" class="w-4 h-4 mr-2 text-red-600" />
                Google Sign-Up
              </h4>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Click "Continue with Google"</li>
                <li>• Select your Google account</li>
                <li>• Grant necessary permissions</li>
                <li>• Complete profile setup</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: User Type Selection -->
      <div class="border border-gray-200 rounded-lg p-6">
        <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm mr-3">2</div>
          Choose Your Role
        </h3>
        <div class="space-y-4">
          <p class="text-gray-600">Select whether you're signing up as a parent or student:</p>
          
          <div class="grid md:grid-cols-2 gap-4">
            <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 class="font-medium text-gray-800 mb-2 flex items-center">
                <span class="text-lg mr-2">👨‍👩‍👧‍👦</span>
                Parent Account
              </h4>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Manage family members</li>
                <li>• Control credit distribution</li>
                <li>• Approve purchase orders</li>
                <li>• Create tasks for children</li>
                <li>• Monitor learning progress</li>
              </ul>
            </div>
            
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 class="font-medium text-gray-800 mb-2 flex items-center">
                <span class="text-lg mr-2">🎓</span>
                Student Account
              </h4>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Chat with AI tutors</li>
                <li>• Choose learning characters</li>
                <li>• Take quizzes and earn credits</li>
                <li>• Shop for rewards</li>
                <li>• Complete assigned tasks</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: Profile Setup -->
      <div class="border border-gray-200 rounded-lg p-6">
        <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-700 font-bold text-sm mr-3">3</div>
          Complete Your Profile
        </h3>
        <div class="space-y-4">
          <p class="text-gray-600">Fill in the required information to personalize your experience:</p>
          
          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="font-medium text-gray-800 mb-3">Required Information:</h4>
            <ul class="space-y-2 text-sm text-gray-600">
              <li class="flex items-center">
                <UIcon name="i-lucide-user" class="w-4 h-4 mr-2 text-gray-500" />
                First and Last Name (if not from Google)
              </li>
              <li class="flex items-center">
                <UIcon name="i-lucide-check-square" class="w-4 h-4 mr-2 text-gray-500" />
                Accept Terms and Conditions
              </li>
              <li class="flex items-center" v-if="true">
                <UIcon name="i-lucide-graduation-cap" class="w-4 h-4 mr-2 text-gray-500" />
                Student Level (for student accounts only)
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Step 4: First Interaction -->
      <div class="border border-gray-200 rounded-lg p-6">
        <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-sm mr-3">4</div>
          Start Learning with Eddy
        </h3>
        <div class="space-y-4">
          <p class="text-gray-600">Once your profile is complete, you'll be redirected to the chat interface where you can:</p>
          
          <div class="grid md:grid-cols-2 gap-4">
            <div class="space-y-3">
              <h4 class="font-medium text-gray-800">For Students:</h4>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Choose from different AI characters</li>
                <li>• Ask questions about any subject</li>
                <li>• Take interactive quizzes</li>
                <li>• Earn credits for learning</li>
              </ul>
            </div>
            
            <div class="space-y-3">
              <h4 class="font-medium text-gray-800">For Parents:</h4>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Access the parent dashboard</li>
                <li>• Add children to your family</li>
                <li>• Set up credit allowances</li>
                <li>• Monitor learning activities</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Next Steps -->
    <div class="bg-gradient-to-r from-secondary-50 to-primary-50 rounded-lg p-6 mt-8">
      <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <UIcon name="i-lucide-arrow-right" class="w-5 h-5 mr-2 text-secondary-600" />
        What's Next?
      </h3>
      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <h4 class="font-medium text-gray-800 mb-2">Explore More Guides:</h4>
          <ul class="text-sm text-gray-600 space-y-1">
            <li>• Parent Guide - Family management features</li>
            <li>• Student Guide - Learning and earning credits</li>
            <li>• Credits Guide - Understanding the reward system</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium text-gray-800 mb-2">Need Help?</h4>
          <ul class="text-sm text-gray-600 space-y-1">
            <li>• Check our FAQ section</li>
            <li>• Contact support at eddytech.ai@gmail.com</li>
            <li>• Submit feedback through our feedback form</li>
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