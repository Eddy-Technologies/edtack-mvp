<template>
  <div class="space-y-6">
    <!-- Quick Start -->
    <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">Quick Start</h3>
      <p class="text-slate-600 mb-6">Get started in just 4 simple steps:</p>
      <div class="space-y-4">
        <div class="flex items-start gap-4">
          <div class="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-700 font-semibold text-sm flex-shrink-0">1</div>
          <div>
            <h4 class="font-medium text-slate-800">Create your account</h4>
            <p class="text-sm text-slate-600">Sign up with email or Google</p>
          </div>
        </div>
        <div class="flex items-start gap-4">
          <div class="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-700 font-semibold text-sm flex-shrink-0">2</div>
          <div>
            <h4 class="font-medium text-slate-800">Choose Parent or Student</h4>
            <p class="text-sm text-slate-600">Select your role during registration</p>
          </div>
        </div>
        <div class="flex items-start gap-4">
          <div class="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-700 font-semibold text-sm flex-shrink-0">3</div>
          <div>
            <h4 class="font-medium text-slate-800">Complete your profile</h4>
            <p class="text-sm text-slate-600">Add your name and accept terms</p>
          </div>
        </div>
        <div class="flex items-start gap-4">
          <div class="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-700 font-semibold text-sm flex-shrink-0">4</div>
          <div>
            <h4 class="font-medium text-slate-800">Start chatting with Eddy!</h4>
            <p class="text-sm text-slate-600">Begin your learning journey</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Account Creation -->
    <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">Account Creation</h3>
      <p class="text-slate-600 mb-6">You have two options to create your account:</p>
      <div class="grid lg:grid-cols-2 gap-6">
        <div class="rounded-xl bg-slate-50 p-5">
          <h4 class="font-medium text-slate-800 mb-3">Email Registration</h4>
          <ul class="text-sm text-slate-600 space-y-2">
            <li>• Enter your email address</li>
            <li>• Create a secure password</li>
            <li>• Verify your email</li>
            <li>• Complete profile setup</li>
          </ul>
        </div>
        <div class="rounded-xl bg-slate-50 p-5">
          <h4 class="font-medium text-slate-800 mb-3">Google Sign-Up</h4>
          <ul class="text-sm text-slate-600 space-y-2">
            <li>• Click "Continue with Google"</li>
            <li>• Select your Google account</li>
            <li>• Grant necessary permissions</li>
            <li>• Complete profile setup</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Choose Your Role -->
    <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">Choose Your Role</h3>
      <p class="text-slate-600 mb-6">Select whether you're signing up as a parent or student:</p>
      <div class="grid lg:grid-cols-2 gap-6">
        <div class="rounded-xl bg-slate-50 p-5">
          <h4 class="font-medium text-slate-800 mb-3">Parent Account</h4>
          <ul class="text-sm text-slate-600 space-y-2">
            <li>• Manage family members</li>
            <li>• Control credit distribution</li>
            <li>• Approve purchase orders</li>
            <li>• Create tasks for children</li>
            <li>• Monitor learning progress</li>
          </ul>
        </div>
        <div class="rounded-xl bg-slate-50 p-5">
          <h4 class="font-medium text-slate-800 mb-3">Student Account</h4>
          <ul class="text-sm text-slate-600 space-y-2">
            <li>• Chat with AI tutors</li>
            <li>• Choose learning characters</li>
            <li>• Take quizzes and earn credits</li>
            <li>• Shop for rewards</li>
            <li>• Complete assigned tasks</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Complete Your Profile -->
    <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">Complete Your Profile</h3>
      <p class="text-slate-600 mb-6">Fill in the required information to personalize your experience:</p>
      <div class="rounded-xl bg-slate-50 p-5">
        <h4 class="font-medium text-slate-800 mb-3">Required Information</h4>
        <ul class="text-sm text-slate-600 space-y-2">
          <li>• First and Last Name (if not from Google)</li>
          <li>• Accept Terms and Conditions</li>
          <li>• Student Level (for student accounts only)</li>
        </ul>
      </div>
    </div>

    <!-- Start Learning -->
    <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">Start Learning with Eddy</h3>
      <p class="text-slate-600 mb-6">Once your profile is complete, you'll be redirected to the chat interface.</p>
      <div class="grid lg:grid-cols-2 gap-6">
        <div>
          <h4 class="font-medium text-slate-800 mb-3">For Students</h4>
          <ul class="text-sm text-slate-600 space-y-2">
            <li>• Choose from different AI characters</li>
            <li>• Ask questions about any subject</li>
            <li>• Take interactive quizzes</li>
            <li>• Earn credits for learning</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium text-slate-800 mb-3">For Parents</h4>
          <ul class="text-sm text-slate-600 space-y-2">
            <li>• Access the parent dashboard</li>
            <li>• Add children to your family</li>
            <li>• Set up credit allowances</li>
            <li>• Monitor learning activities</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- What's Next -->
    <div class="rounded-2xl bg-slate-50 p-8 ring-1 ring-slate-100">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">What's Next?</h3>
      <div class="grid lg:grid-cols-2 gap-6">
        <div>
          <h4 class="font-medium text-slate-800 mb-3">Explore More Guides</h4>
          <ul class="text-sm text-slate-600 space-y-2">
            <li>• Parent Guide - Family management features</li>
            <li>• Student Guide - Learning and earning credits</li>
            <li>• Credits Guide - Understanding the reward system</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium text-slate-800 mb-3">Need Help?</h4>
          <ul class="text-sm text-slate-600 space-y-2">
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
</script>
