<template>
  <div class="space-y-8">
    <!-- Header Section -->
    <div class="rounded-2xl bg-gradient-to-br from-primary-50 to-white p-8 shadow-sm ring-1 ring-slate-100">
      <h2 class="text-2xl font-bold text-slate-800 mb-4">Student Guide</h2>
      <p class="text-base text-slate-600 mb-6">
        Welcome to StudyWithEddy! This guide will help you learn how to chat with your AI tutor, complete learning
        tasks, earn credits, and shop for rewards. Let's get started!
      </p>

      <!-- Table of Contents with Quick Links -->
      <div class="rounded-xl bg-white p-6 shadow-sm mb-6">
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          <a
            href="#chat"
            class="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-50 hover:bg-primary-50 hover:text-primary-700 text-slate-700 transition-all group"
          >
            <UIcon name="i-lucide-message-circle" class="w-5 h-5 flex-shrink-0" />
            <span class="text-sm font-medium">Chat</span>
            <UIcon name="i-lucide-arrow-right" class="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
          <a
            href="#study-tab"
            class="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-50 hover:bg-primary-50 hover:text-primary-700 text-slate-700 transition-all group"
          >
            <UIcon name="i-lucide-book-open" class="w-5 h-5 flex-shrink-0" />
            <span class="text-sm font-medium">Study Tab</span>
            <UIcon name="i-lucide-arrow-right" class="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
          <a
            href="#task-tab"
            class="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-50 hover:bg-primary-50 hover:text-primary-700 text-slate-700 transition-all group"
          >
            <UIcon name="i-lucide-clipboard-check" class="w-5 h-5 flex-shrink-0" />
            <span class="text-sm font-medium">Task Tab</span>
            <UIcon name="i-lucide-arrow-right" class="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
          <a
            href="#shop-tabs"
            class="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-50 hover:bg-primary-50 hover:text-primary-700 text-slate-700 transition-all group"
          >
            <UIcon name="i-lucide-shopping-bag" class="w-5 h-5 flex-shrink-0" />
            <span class="text-sm font-medium">Shop Tabs</span>
            <UIcon name="i-lucide-arrow-right" class="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
          <a
            href="#credits"
            class="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-50 hover:bg-primary-50 hover:text-primary-700 text-slate-700 transition-all group"
          >
            <UIcon name="i-lucide-coins" class="w-5 h-5 flex-shrink-0" />
            <span class="text-sm font-medium">Credits</span>
            <UIcon name="i-lucide-arrow-right" class="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>
      </div>
    </div>

    <!-- 1. Chat -->
    <div id="chat" class="scroll-mt-6 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100 space-y-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-semibold text-slate-800">1. Chat with Your AI Tutor</h3>
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-700 font-medium transition-all"
        >
          <UIcon name="i-lucide-external-link" class="w-4 h-4" />
          Open Chat
        </NuxtLink>
      </div>

      <p class="text-base text-slate-600">
        Your AI tutor is here to help you learn! Chat naturally, ask questions, and get instant explanations.
      </p>

      <!-- Character Selection -->
      <div class="rounded-xl bg-slate-50 p-6">
        <h4 class="text-base font-semibold text-slate-800 mb-3">Choose Your AI Tutor</h4>
        <p class="text-sm text-slate-600 mb-4">
          Select from different AI personalities - Eddy, Pooh, Snorlax, or Einstein. Each has a unique teaching style!
        </p>

        <!-- Screenshot Placeholder -->
        <div class="rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 p-8 flex flex-col items-center justify-center">
          <UIcon name="i-lucide-image" class="w-12 h-12 text-slate-400 mb-3" />
          <p class="text-sm text-slate-500 font-medium">Screenshot Placeholder: AI Tutor Selection</p>
        </div>
      </div>

      <!-- Chat Features -->
      <div class="rounded-xl bg-slate-50 p-6">
        <h4 class="text-base font-semibold text-slate-800 mb-3">Chat Features</h4>
        <div class="space-y-3">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <UIcon name="i-lucide-type" class="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <h5 class="font-medium text-slate-800 mb-1">Type Your Questions</h5>
              <p class="text-sm text-slate-600">Ask anything! Math problems, science questions, writing help, or request practice quizzes.</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <UIcon name="i-lucide-sparkles" class="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <h5 class="font-medium text-slate-800 mb-1">Auto-Complete Pills</h5>
              <p class="text-sm text-slate-600">Use quick suggestions that appear as you type to speed up your learning.</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <UIcon name="i-lucide-message-square" class="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <h5 class="font-medium text-slate-800 mb-1">Instant Feedback</h5>
              <p class="text-sm text-slate-600">Get immediate explanations, step-by-step solutions, and helpful hints.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Screenshot Placeholder -->
      <div class="rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 p-8 flex flex-col items-center justify-center">
        <UIcon name="i-lucide-image" class="w-12 h-12 text-slate-400 mb-3" />
        <p class="text-sm text-slate-500 font-medium">Screenshot Placeholder: Chat Interface</p>
      </div>
    </div>

    <!-- 2. Study Tab -->
    <div id="study-tab" class="scroll-mt-6 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100 space-y-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-semibold text-slate-800">2. Study Tab</h3>
        <NuxtLink
          to="/dashboard?tab=study"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-secondary-50 hover:bg-secondary-100 text-secondary-700 font-medium transition-all"
        >
          <UIcon name="i-lucide-external-link" class="w-4 h-4" />
          Go to Study
        </NuxtLink>
      </div>

      <p class="text-base text-slate-600">
        Access structured lessons and curriculum across multiple subjects. Learn at your own pace with organized content.
      </p>

      <!-- Lessons & Curriculum -->
      <div class="rounded-xl bg-slate-50 p-6">
        <h4 class="text-base font-semibold text-slate-800 mb-4">Lessons & Curriculum</h4>
        <div class="grid lg:grid-cols-2 gap-4">
          <div class="rounded-lg bg-white p-4 shadow-sm">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-lucide-book-open" class="w-5 h-5 text-secondary-600" />
              <h5 class="font-medium text-slate-800">Browse Subjects</h5>
            </div>
            <p class="text-sm text-slate-600">Choose from Mathematics, Science, English, History, Geography, Literature, Physics, and Chemistry.</p>
          </div>
          <div class="rounded-lg bg-white p-4 shadow-sm">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-lucide-layers" class="w-5 h-5 text-secondary-600" />
              <h5 class="font-medium text-slate-800">Chapter-by-Chapter</h5>
            </div>
            <p class="text-sm text-slate-600">Work through organized chapters with clear learning objectives and explanations.</p>
          </div>
        </div>
      </div>

      <!-- Quizzes & Tests -->
      <div class="rounded-xl bg-slate-50 p-6">
        <h4 class="text-base font-semibold text-slate-800 mb-4">Quizzes & Test Taking</h4>
        <div class="space-y-3">
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">1</div>
            <span class="text-sm text-slate-600">Select a subject and chapter to practice</span>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">2</div>
            <span class="text-sm text-slate-600">Take interactive quizzes to test your understanding</span>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">3</div>
            <span class="text-sm text-slate-600">Get immediate scoring and detailed explanations for each answer</span>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">4</div>
            <span class="text-sm text-slate-600">Track your progress and see which areas need more practice</span>
          </div>
        </div>
      </div>

      <!-- Screenshot Placeholder -->
      <div class="rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 p-8 flex flex-col items-center justify-center">
        <UIcon name="i-lucide-image" class="w-12 h-12 text-slate-400 mb-3" />
        <p class="text-sm text-slate-500 font-medium">Screenshot Placeholder: Study Tab Interface</p>
      </div>
    </div>

    <!-- 3. Task Tab -->
    <div id="task-tab" class="scroll-mt-6 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100 space-y-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-semibold text-slate-800">3. Task Tab</h3>
        <NuxtLink
          to="/dashboard?tab=tasks"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-secondary-50 hover:bg-secondary-100 text-secondary-700 font-medium transition-all"
        >
          <UIcon name="i-lucide-external-link" class="w-4 h-4" />
          View Tasks
        </NuxtLink>
      </div>

      <p class="text-base text-slate-600">
        Complete tasks assigned by your parent to earn credits! Each task comes with clear requirements and reward amounts.
      </p>

      <div class="rounded-xl bg-amber-50 p-4 text-sm text-amber-800 mb-4">
        <strong>Tip:</strong> Score 70% or higher to automatically earn the credit reward!
      </div>

      <!-- Task Workflow -->
      <div class="rounded-xl bg-slate-50 p-6">
        <h4 class="text-base font-semibold text-slate-800 mb-4">Completing Tasks</h4>
        <div class="space-y-4">
          <div class="flex gap-4">
            <div class="flex-shrink-0 w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
              <span class="text-secondary-700 font-semibold">1</span>
            </div>
            <div>
              <h5 class="font-medium text-slate-800 mb-1">View Assigned Tasks</h5>
              <p class="text-sm text-slate-600">Check your Tasks tab to see what your parent has assigned</p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex-shrink-0 w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
              <span class="text-secondary-700 font-semibold">2</span>
            </div>
            <div>
              <h5 class="font-medium text-slate-800 mb-1">Read Instructions</h5>
              <p class="text-sm text-slate-600">Each task shows the subject, chapters, and how many credits you can earn</p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex-shrink-0 w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
              <span class="text-secondary-700 font-semibold">3</span>
            </div>
            <div>
              <h5 class="font-medium text-slate-800 mb-1">Take the Quiz</h5>
              <p class="text-sm text-slate-600">Click "Start Task" to begin the quiz and answer all questions</p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex-shrink-0 w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
              <span class="text-secondary-700 font-semibold">4</span>
            </div>
            <div>
              <h5 class="font-medium text-slate-800 mb-1">Earn Credits!</h5>
              <p class="text-sm text-slate-600">If you pass, credits are added to your balance automatically</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Screenshot Placeholder -->
      <div class="rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 p-8 flex flex-col items-center justify-center">
        <UIcon name="i-lucide-image" class="w-12 h-12 text-slate-400 mb-3" />
        <p class="text-sm text-slate-500 font-medium">Screenshot Placeholder: Task Tab Interface</p>
      </div>
    </div>

    <!-- 4. Shop Tabs -->
    <div id="shop-tabs" class="scroll-mt-6 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100 space-y-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-semibold text-slate-800">4. Shop Tabs</h3>
        <NuxtLink
          to="/dashboard?tab=shop"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-secondary-50 hover:bg-secondary-100 text-secondary-700 font-medium transition-all"
        >
          <UIcon name="i-lucide-external-link" class="w-4 h-4" />
          Browse Shop
        </NuxtLink>
      </div>

      <p class="text-base text-slate-600">
        Use your earned credits to shop for real rewards! Browse products, manage your wishlist, and track your orders.
      </p>

      <!-- Products -->
      <div class="rounded-xl bg-slate-50 p-6">
        <div class="flex items-center gap-2 mb-3">
          <UIcon name="i-lucide-shopping-bag" class="w-5 h-5 text-secondary-600" />
          <h4 class="text-base font-semibold text-slate-800">Browse Products</h4>
        </div>
        <p class="text-sm text-slate-600 mb-4">
          Explore items from various categories - toys, games, books, electronics, and more. Each item shows its credit cost.
        </p>

        <!-- Screenshot Placeholder -->
        <div class="rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 p-6 flex flex-col items-center justify-center">
          <UIcon name="i-lucide-image" class="w-10 h-10 text-slate-400 mb-2" />
          <p class="text-xs text-slate-500 font-medium">Screenshot Placeholder: Shop Browse</p>
        </div>
      </div>

      <!-- Cart & Wishlist -->
      <div class="grid lg:grid-cols-2 gap-4">
        <div class="rounded-xl bg-slate-50 p-6">
          <div class="flex items-center gap-2 mb-3">
            <UIcon name="i-lucide-shopping-cart" class="w-5 h-5 text-secondary-600" />
            <h4 class="text-base font-semibold text-slate-800">Cart</h4>
          </div>
          <p class="text-sm text-slate-600 mb-4">
            Add items to your cart and review before submitting for parent approval.
          </p>

          <!-- Screenshot Placeholder -->
          <div class="rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 p-4 flex flex-col items-center justify-center">
            <UIcon name="i-lucide-image" class="w-8 h-8 text-slate-400 mb-2" />
            <p class="text-xs text-slate-500 font-medium">Screenshot: Cart</p>
          </div>
        </div>

        <div class="rounded-xl bg-slate-50 p-6">
          <div class="flex items-center gap-2 mb-3">
            <UIcon name="i-lucide-heart" class="w-5 h-5 text-secondary-600" />
            <h4 class="text-base font-semibold text-slate-800">Wishlist</h4>
          </div>
          <p class="text-sm text-slate-600 mb-4">
            Save items you're interested in for later when you have enough credits.
          </p>

          <!-- Screenshot Placeholder -->
          <div class="rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 p-4 flex flex-col items-center justify-center">
            <UIcon name="i-lucide-image" class="w-8 h-8 text-slate-400 mb-2" />
            <p class="text-xs text-slate-500 font-medium">Screenshot: Wishlist</p>
          </div>
        </div>
      </div>

      <!-- Checkout Process -->
      <div class="rounded-xl bg-slate-50 p-6">
        <div class="flex items-center gap-2 mb-3">
          <UIcon name="i-lucide-credit-card" class="w-5 h-5 text-secondary-600" />
          <h4 class="text-base font-semibold text-slate-800">Checkout</h4>
        </div>
        <p class="text-sm text-slate-600 mb-4">
          Submit your order for parent approval. Your credits are held until the order is approved or declined.
        </p>

        <div class="space-y-3">
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">1</div>
            <span class="text-sm text-slate-600">Review your cart and total credits needed</span>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">2</div>
            <span class="text-sm text-slate-600">Click "Submit Order" - credits are temporarily held</span>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">3</div>
            <span class="text-sm text-slate-600">Wait for parent approval</span>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold flex-shrink-0 mt-0.5">4</div>
            <span class="text-sm text-slate-600">Track your order status in Orders tab</span>
          </div>
        </div>

        <!-- Screenshot Placeholder -->
        <div class="mt-4 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 p-6 flex flex-col items-center justify-center">
          <UIcon name="i-lucide-image" class="w-10 h-10 text-slate-400 mb-2" />
          <p class="text-xs text-slate-500 font-medium">Screenshot Placeholder: Checkout</p>
        </div>
      </div>

      <!-- Orders Tracking -->
      <div class="rounded-xl bg-slate-50 p-6">
        <div class="flex items-center gap-2 mb-3">
          <UIcon name="i-lucide-package" class="w-5 h-5 text-secondary-600" />
          <h4 class="text-base font-semibold text-slate-800">Track Orders</h4>
          <NuxtLink
            to="/dashboard?tab=orders"
            class="ml-auto text-sm text-secondary-600 hover:text-secondary-700 font-medium"
          >
            View Orders →
          </NuxtLink>
        </div>
        <p class="text-sm text-slate-600">
          Check the status of your submitted orders - pending, approved, or declined. Declined orders return credits automatically.
        </p>

        <!-- Screenshot Placeholder -->
        <div class="mt-4 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 p-6 flex flex-col items-center justify-center">
          <UIcon name="i-lucide-image" class="w-10 h-10 text-slate-400 mb-2" />
          <p class="text-xs text-slate-500 font-medium">Screenshot Placeholder: Orders</p>
        </div>
      </div>
    </div>

    <!-- 5. Credits -->
    <div id="credits" class="scroll-mt-6 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100 space-y-4">
      <h3 class="text-xl font-semibold text-slate-800 mb-4">5. Credits</h3>

      <p class="text-base text-slate-600">
        Credits are your reward currency! Earn them through learning and use them to shop for real items.
      </p>

      <div class="rounded-xl bg-amber-50 p-4 text-sm text-amber-800 mb-4">
        <strong>Conversion:</strong> 100 credits = $1 value. Credits are virtual - your parent pledges real purchases when they approve orders.
      </div>

      <!-- Viewing Balance -->
      <div class="rounded-xl bg-slate-50 p-6">
        <h4 class="text-base font-semibold text-slate-800 mb-3">View Your Balance</h4>
        <p class="text-sm text-slate-600 mb-4">
          Check your credit balance anytime in the top navigation bar or on your dashboard. See available credits and pending credits from submitted orders.
        </p>

        <!-- Screenshot Placeholder -->
        <div class="rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 p-8 flex flex-col items-center justify-center">
          <UIcon name="i-lucide-image" class="w-12 h-12 text-slate-400 mb-3" />
          <p class="text-sm text-slate-500 font-medium">Screenshot Placeholder: Credit Balance Display</p>
        </div>
      </div>

      <!-- How to Earn -->
      <div class="rounded-xl bg-slate-50 p-6">
        <h4 class="text-base font-semibold text-slate-800 mb-4">How to Earn Credits</h4>
        <div class="grid lg:grid-cols-2 gap-4">
          <div class="rounded-lg bg-white p-4 shadow-sm">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
                <UIcon name="i-lucide-clipboard-check" class="w-4 h-4 text-secondary-600" />
              </div>
              <h5 class="font-medium text-slate-800">Complete Tasks</h5>
            </div>
            <p class="text-sm text-slate-600">Finish parent-assigned tasks and score 70% or higher to automatically earn credits.</p>
          </div>
          <div class="rounded-lg bg-white p-4 shadow-sm">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
                <UIcon name="i-lucide-arrow-down-to-line" class="w-4 h-4 text-secondary-600" />
              </div>
              <h5 class="font-medium text-slate-800">Parent Transfers</h5>
            </div>
            <p class="text-sm text-slate-600">Your parent can transfer credits directly to your account as rewards or allowance.</p>
          </div>
        </div>
      </div>

      <!-- Credit Tips -->
      <div class="rounded-xl bg-slate-50 p-4">
        <h5 class="font-medium text-slate-800 mb-2">💡 Credit Tips</h5>
        <ul class="space-y-2 text-sm text-slate-600">
          <li class="flex items-start gap-2">
            <span class="text-secondary-600">•</span>
            <span>Save up credits for bigger rewards instead of spending right away</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-secondary-600">•</span>
            <span>Complete more tasks to earn more credits faster</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-secondary-600">•</span>
            <span>Use your wishlist to plan what you want to save for</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
