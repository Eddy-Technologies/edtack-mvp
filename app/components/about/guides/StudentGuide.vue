<template>
  <div class="guide-content">
    <div class="mb-6">
      <h2 class="text-3xl font-bold text-gray-800 mb-2">Student Guide</h2>
      <p class="text-gray-600">Learn how to make the most of your AI-powered learning journey with StudyWithEddy.</p>
    </div>

    <!-- Meet Your AI Tutors -->
    <div class="border border-gray-200 rounded-lg p-6 mb-8">
      <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <UIcon name="i-lucide-bot" class="w-5 h-5 mr-2 text-purple-600" />
        Meet Your AI Tutors
      </h3>
      <div class="space-y-4">
        <p class="text-gray-600">StudyWithEddy features multiple AI characters, each with unique personalities to match your learning style.</p>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="bg-blue-50 rounded-lg p-4 text-center">
            <div class="text-2xl mb-2">🧙‍♂️</div>
            <h4 class="font-medium text-gray-800 mb-1">Eddy (Default)</h4>
            <p class="text-xs text-gray-600">Friendly and encouraging, great for all subjects</p>
          </div>

          <div class="bg-green-50 rounded-lg p-4 text-center">
            <div class="text-2xl mb-2">🌟</div>
            <h4 class="font-medium text-gray-800 mb-1">Alex the Explorer</h4>
            <p class="text-xs text-gray-600">Adventurous spirit, loves science and discovery</p>
          </div>

          <div class="bg-purple-50 rounded-lg p-4 text-center">
            <div class="text-2xl mb-2">📚</div>
            <h4 class="font-medium text-gray-800 mb-1">Luna the Scholar</h4>
            <p class="text-xs text-gray-600">Patient and thorough, perfect for deep learning</p>
          </div>

          <div class="bg-orange-50 rounded-lg p-4 text-center">
            <div class="text-2xl mb-2">🔬</div>
            <h4 class="font-medium text-gray-800 mb-1">Sam the Scientist</h4>
            <p class="text-xs text-gray-600">Curious and analytical, loves experiments</p>
          </div>

          <div class="bg-pink-50 rounded-lg p-4 text-center">
            <div class="text-2xl mb-2">🎨</div>
            <h4 class="font-medium text-gray-800 mb-1">Creative Characters</h4>
            <p class="text-xs text-gray-600">And many more personalities to discover!</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Interface -->
    <div class="border border-gray-200 rounded-lg p-6 mb-8">
      <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <UIcon name="i-lucide-message-circle" class="w-5 h-5 mr-2 text-blue-600" />
        Using the Chat Interface
      </h3>
      <div class="space-y-6">
        <div>
          <h4 class="font-medium text-gray-800 mb-3">Starting a Conversation</h4>
          <div class="bg-blue-50 rounded-lg p-4">
            <ol class="space-y-2 text-sm text-gray-600">
              <li class="flex items-start">
                <span class="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
                <div>Choose your AI character by clicking <strong>"Choose a Character"</strong></div>
              </li>
              <li class="flex items-start">
                <span class="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
                <div>Type your question or topic in the chat input</div>
              </li>
              <li class="flex items-start">
                <span class="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
                <div>Press Enter or click Send to start learning!</div>
              </li>
            </ol>
          </div>
        </div>

        <div>
          <h4 class="font-medium text-gray-800 mb-3">What You Can Ask</h4>
          <div class="grid md:grid-cols-2 gap-4">
            <div class="bg-gray-50 rounded-lg p-4">
              <h5 class="font-medium text-gray-800 mb-2">Subject Questions</h5>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• "Help me with math fractions"</li>
                <li>• "Explain photosynthesis"</li>
                <li>• "What's a metaphor in English?"</li>
                <li>• "Tell me about ancient Egypt"</li>
              </ul>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <h5 class="font-medium text-gray-800 mb-2">Learning Activities</h5>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• "Give me a quiz on multiplication"</li>
                <li>• "Test my spelling skills"</li>
                <li>• "Practice science vocabulary"</li>
                <li>• "Challenge me with history facts"</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h4 class="font-medium text-gray-800 mb-3">Chat Features</h4>
          <div class="bg-gray-50 rounded-lg p-4">
            <ul class="space-y-2 text-sm text-gray-600">
              <li class="flex items-center">
                <UIcon name="i-lucide-sidebar" class="w-4 h-4 mr-2 text-gray-500" />
                <strong>Sidebar Navigation:</strong> Access previous conversations and threads
              </li>
              <li class="flex items-center">
                <UIcon name="i-lucide-refresh-cw" class="w-4 h-4 mr-2 text-gray-500" />
                <strong>New Chat:</strong> Start fresh conversations for different topics
              </li>
              <li class="flex items-center">
                <UIcon name="i-lucide-user" class="w-4 h-4 mr-2 text-gray-500" />
                <strong>Profile Menu:</strong> Access dashboard and settings from top-right
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Earning Credits -->
    <div class="border border-gray-200 rounded-lg p-6 mb-8">
      <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <UIcon name="i-lucide-coins" class="w-5 h-5 mr-2 text-green-600" />
        Earning Credits Through Learning
      </h3>
      <div class="space-y-6">
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 class="font-medium text-green-800 mb-2 flex items-center">
            <UIcon name="i-lucide-gift" class="w-4 h-4 mr-2" />
            What Are Credits?
          </h4>
          <p class="text-sm text-green-700">
            Credits are virtual rewards you earn by completing learning activities. You can use them to "purchase" items from the shop,
            which your parents will then review and potentially buy for you in real life!
          </p>
        </div>

        <div>
          <h4 class="font-medium text-gray-800 mb-3">How to Earn Credits</h4>
          <div class="grid md:grid-cols-2 gap-4">
            <div class="bg-blue-50 rounded-lg p-4">
              <h5 class="font-medium text-gray-800 mb-2 flex items-center">
                <UIcon name="i-lucide-brain" class="w-4 h-4 mr-2 text-blue-600" />
                Interactive Quizzes
              </h5>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Ask for quizzes in any subject</li>
                <li>• Answer questions correctly</li>
                <li>• Complete the full quiz</li>
                <li>• Earn credits based on performance</li>
              </ul>
            </div>

            <div class="bg-purple-50 rounded-lg p-4">
              <h5 class="font-medium text-gray-800 mb-2 flex items-center">
                <UIcon name="i-lucide-clipboard-check" class="w-4 h-4 mr-2 text-purple-600" />
                Assigned Tasks
              </h5>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Complete tasks from parents</li>
                <li>• Submit proof of completion</li>
                <li>• Get parent approval</li>
                <li>• Receive credit rewards</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h4 class="font-medium text-gray-800 mb-3">Quiz Tips for Maximum Credits</h4>
          <div class="bg-yellow-50 rounded-lg p-4">
            <ul class="space-y-2 text-sm text-gray-600">
              <li class="flex items-start">
                <UIcon name="i-lucide-target" class="w-4 h-4 mr-2 text-yellow-600 mt-0.5" />
                <div><strong>Take your time:</strong> Think carefully before answering</div>
              </li>
              <li class="flex items-start">
                <UIcon name="i-lucide-book-open" class="w-4 h-4 mr-2 text-yellow-600 mt-0.5" />
                <div><strong>Ask for help:</strong> If stuck, ask your AI tutor to explain the concept</div>
              </li>
              <li class="flex items-start">
                <UIcon name="i-lucide-repeat" class="w-4 h-4 mr-2 text-yellow-600 mt-0.5" />
                <div><strong>Practice regularly:</strong> Daily learning sessions earn more credits</div>
              </li>
              <li class="flex items-start">
                <UIcon name="i-lucide-zap" class="w-4 h-4 mr-2 text-yellow-600 mt-0.5" />
                <div><strong>Try different subjects:</strong> Explore various topics to maximize learning</div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Shopping & Rewards -->
    <div class="border border-gray-200 rounded-lg p-6 mb-8">
      <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <UIcon name="i-lucide-shopping-bag" class="w-5 h-5 mr-2 text-pink-600" />
        Shopping & Wishlist
      </h3>
      <div class="space-y-6">
        <div>
          <h4 class="font-medium text-gray-800 mb-3">Accessing the Shop</h4>
          <div class="bg-pink-50 rounded-lg p-4">
            <ol class="space-y-2 text-sm text-gray-600">
              <li class="flex items-start">
                <span class="w-6 h-6 bg-pink-100 text-pink-700 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
                <div>Click on your profile avatar in the top-right corner</div>
              </li>
              <li class="flex items-start">
                <span class="w-6 h-6 bg-pink-100 text-pink-700 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
                <div>Select <strong>"Dashboard"</strong> from the dropdown menu</div>
              </li>
              <li class="flex items-start">
                <span class="w-6 h-6 bg-pink-100 text-pink-700 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
                <div>Navigate to the <strong>"Shop"</strong> tab in the sidebar</div>
              </li>
              <li class="flex items-start">
                <span class="w-6 h-6 bg-pink-100 text-pink-700 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">4</span>
                <div>Browse products and add items to your cart or wishlist</div>
              </li>
            </ol>
          </div>
        </div>

        <div>
          <h4 class="font-medium text-gray-800 mb-3">Shop Features</h4>
          <div class="grid md:grid-cols-3 gap-4">
            <div class="bg-gray-50 rounded-lg p-4">
              <h5 class="font-medium text-gray-800 mb-2 flex items-center">
                <UIcon name="i-lucide-shopping-cart" class="w-4 h-4 mr-2 text-gray-600" />
                Shopping Cart
              </h5>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Add items you want to buy</li>
                <li>• Adjust quantities</li>
                <li>• See total credit cost</li>
                <li>• Submit order request</li>
              </ul>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <h5 class="font-medium text-gray-800 mb-2 flex items-center">
                <UIcon name="i-lucide-heart" class="w-4 h-4 mr-2 text-gray-600" />
                Wishlist
              </h5>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Save items for later</li>
                <li>• Share with parents</li>
                <li>• Move to cart when ready</li>
                <li>• Track favorite items</li>
              </ul>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <h5 class="font-medium text-gray-800 mb-2 flex items-center">
                <UIcon name="i-lucide-package" class="w-4 h-4 mr-2 text-gray-600" />
                Order Tracking
              </h5>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• View submitted orders</li>
                <li>• Check approval status</li>
                <li>• See order history</li>
                <li>• Track deliveries</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h4 class="font-medium text-gray-800 mb-3">Order Process</h4>
          <div class="bg-orange-50 rounded-lg p-4">
            <div class="space-y-3">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold text-sm">1</div>
                <div>
                  <strong>Add to Cart</strong> - Select items and quantities you want
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold text-sm">2</div>
                <div>
                  <strong>Checkout</strong> - Use your credits to "purchase" items
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold text-sm">3</div>
                <div>
                  <strong>Parent Review</strong> - Your parent gets notified to approve the order
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold text-sm">4</div>
                <div>
                  <strong>Real Purchase</strong> - If approved, parent makes the actual purchase
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold text-sm">5</div>
                <div>
                  <strong>Delivery</strong> - Item gets delivered to your address!
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Completing Tasks -->
    <div class="border border-gray-200 rounded-lg p-6 mb-8">
      <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <UIcon name="i-lucide-check-circle" class="w-5 h-5 mr-2 text-indigo-600" />
        Completing Assigned Tasks
      </h3>
      <div class="space-y-4">
        <p class="text-gray-600">Your parents may assign you tasks that you can complete to earn extra credits.</p>

        <div>
          <h4 class="font-medium text-gray-800 mb-3">Finding Your Tasks</h4>
          <div class="bg-indigo-50 rounded-lg p-4">
            <ul class="space-y-2 text-sm text-gray-600">
              <li class="flex items-center">
                <UIcon name="i-lucide-bell" class="w-4 h-4 mr-2 text-indigo-600" />
                Check notifications for new task assignments
              </li>
              <li class="flex items-center">
                <UIcon name="i-lucide-layout-dashboard" class="w-4 h-4 mr-2 text-indigo-600" />
                View tasks in your student dashboard overview
              </li>
              <li class="flex items-center">
                <UIcon name="i-lucide-list" class="w-4 h-4 mr-2 text-indigo-600" />
                Access detailed task list in the dashboard
              </li>
            </ul>
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-4">
          <div class="bg-gray-50 rounded-lg p-4">
            <h5 class="font-medium text-gray-800 mb-2">Task Types</h5>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• Household chores</li>
              <li>• Reading assignments</li>
              <li>• Exercise activities</li>
              <li>• Creative projects</li>
              <li>• Learning goals</li>
            </ul>
          </div>

          <div class="bg-gray-50 rounded-lg p-4">
            <h5 class="font-medium text-gray-800 mb-2">Completion Steps</h5>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• Read task description carefully</li>
              <li>• Complete the required activity</li>
              <li>• Submit proof if needed</li>
              <li>• Wait for parent approval</li>
              <li>• Receive credit reward!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Learning Subjects -->
    <div class="border border-gray-200 rounded-lg p-6 mb-8">
      <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <UIcon name="i-lucide-book-open" class="w-5 h-5 mr-2 text-teal-600" />
        Subjects You Can Learn
      </h3>
      <div class="space-y-4">
        <p class="text-gray-600">StudyWithEddy covers all major school subjects and adapts to your grade level.</p>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-blue-50 rounded-lg p-4 text-center">
            <div class="text-2xl mb-2">🔢</div>
            <h4 class="font-medium text-gray-800 mb-1">Mathematics</h4>
            <p class="text-xs text-gray-600">Arithmetic, algebra, geometry, and more</p>
          </div>

          <div class="bg-green-50 rounded-lg p-4 text-center">
            <div class="text-2xl mb-2">🔬</div>
            <h4 class="font-medium text-gray-800 mb-1">Science</h4>
            <p class="text-xs text-gray-600">Biology, chemistry, physics, earth science</p>
          </div>

          <div class="bg-red-50 rounded-lg p-4 text-center">
            <div class="text-2xl mb-2">📚</div>
            <h4 class="font-medium text-gray-800 mb-1">English</h4>
            <p class="text-xs text-gray-600">Reading, writing, grammar, literature</p>
          </div>

          <div class="bg-yellow-50 rounded-lg p-4 text-center">
            <div class="text-2xl mb-2">🏛️</div>
            <h4 class="font-medium text-gray-800 mb-1">History</h4>
            <p class="text-xs text-gray-600">World history, local history, timelines</p>
          </div>

          <div class="bg-purple-50 rounded-lg p-4 text-center">
            <div class="text-2xl mb-2">🎨</div>
            <h4 class="font-medium text-gray-800 mb-1">Art</h4>
            <p class="text-xs text-gray-600">Drawing, painting, art history, creativity</p>
          </div>

          <div class="bg-pink-50 rounded-lg p-4 text-center">
            <div class="text-2xl mb-2">🎵</div>
            <h4 class="font-medium text-gray-800 mb-1">Music</h4>
            <p class="text-xs text-gray-600">Theory, instruments, composers, rhythm</p>
          </div>

          <div class="bg-orange-50 rounded-lg p-4 text-center">
            <div class="text-2xl mb-2">⚽</div>
            <h4 class="font-medium text-gray-800 mb-1">Physical Education</h4>
            <p class="text-xs text-gray-600">Sports, fitness, health, teamwork</p>
          </div>

          <div class="bg-gray-50 rounded-lg p-4 text-center">
            <div class="text-2xl mb-2">💻</div>
            <h4 class="font-medium text-gray-800 mb-1">Technology</h4>
            <p class="text-xs text-gray-600">Computers, coding basics, digital literacy</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tips for Success -->
    <div class="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <UIcon name="i-lucide-star" class="w-5 h-5 mr-2 text-primary-600" />
        Tips for Learning Success
      </h3>
      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <h4 class="font-medium text-gray-800 mb-2">Make Learning Fun:</h4>
          <ul class="text-sm text-gray-600 space-y-1">
            <li>• Try different AI characters for variety</li>
            <li>• Ask for games and interactive activities</li>
            <li>• Set learning goals and celebrate achievements</li>
            <li>• Share cool facts with friends and family</li>
            <li>• Use credits as motivation to keep learning</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium text-gray-800 mb-2">Study Smart:</h4>
          <ul class="text-sm text-gray-600 space-y-1">
            <li>• Take breaks between learning sessions</li>
            <li>• Ask questions when you don't understand</li>
            <li>• Practice regularly rather than cramming</li>
            <li>• Connect new learning to things you know</li>
            <li>• Keep track of your progress and credits</li>
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
