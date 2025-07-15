<template>
  <div class="relative w-full min-h-screen bg-white overflow-auto">
    <!-- Main Content -->
    <div class="relative z-10 px-4 sm:px-8 pb-8">
      <!-- Character Carousel -->
      <div class="mb-32">
        <h3 class="text-gray-800 text-xl sm:text-2xl font-semibold mb-6 text-center">
          Choose Your Learning Buddy
        </h3>
        <CharacterCarousel v-model="selectedAvatar" :go-to-chat-on-click="true" />
      </div>

      <!-- Scroll Arrow Button -->
      <div class="flex justify-center mb-8">
        <button
          class="text-gray-500 hover:text-gray-700 transition-all duration-300 animate-bounce"
          aria-label="Scroll to Browse All Characters"
          @click="scrollToCharacters"
        >
          <svg
            class="w-6 h-6 sm:w-8 sm:h-8"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <!-- Character Grid -->
      <div ref="browseCharacters" class="mb-12">
        <h3 class="text-gray-800 text-xl sm:text-2xl font-semibold mb-6 text-center">
          Browse All Characters
        </h3>
        <div class="max-w-4xl mx-auto">
          <!-- 3x3 Grid for first 9 characters -->
          <div class="grid grid-cols-3 gap-4 sm:gap-6 mb-6">
            <div
              v-for="(avatar, index) in allAvatars.slice(0, 9)"
              :key="index"
              class="group cursor-pointer"
              @click="goToChat(avatar)"
            >
              <div
                class="relative h-[280px] w-[280px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-3 sm:p-4 text-center hover:from-gray-200 hover:to-gray-300 transition-all duration-300 group-hover:scale-105 shadow-sm hover:shadow-md"
              >
                <div class="relative mb-3">
                  <img
                    :src="avatar.image"
                    :alt="avatar.name"
                    class="sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto rounded-full object-cover border-2 border-gray-300 group-hover:border-gray-400 transition-all duration-300"
                    style="width: 180px; height: 200px"
                  >
                </div>
                <h5 class="text-gray-800 text-xs sm:text-sm md:text-base font-semibold mb-1">
                  {{ avatar.name }}
                </h5>
                <p class="text-gray-600 text-xs sm:text-sm">{{ avatar.type }}</p>
              </div>
            </div>
          </div>

          <!-- Expandable grid for remaining characters -->
          <div
            v-if="showAllCharacters && allAvatars.length > 9"
            class="grid grid-cols-3 gap-4 sm:gap-6 mb-6"
          >
            <div
              v-for="(avatar, index) in allAvatars.slice(9)"
              :key="index + 9"
              class="group cursor-pointer"
              @click="goToChat(avatar)"
            >
              <div
                class="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-3 sm:p-4 text-center hover:from-gray-200 hover:to-gray-300 transition-all duration-300 group-hover:scale-105 shadow-sm hover:shadow-md"
              >
                <div class="relative mb-3">
                  <img
                    :src="avatar.image"
                    :alt="avatar.name"
                    class="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto rounded-full object-cover border-2 border-gray-300 group-hover:border-gray-400 transition-all duration-300"
                  >
                </div>
                <h5 class="text-gray-800 text-xs sm:text-sm md:text-base font-semibold mb-1">
                  {{ avatar.name }}
                </h5>
                <p class="text-gray-600 text-xs sm:text-sm">{{ avatar.type }}</p>
              </div>
            </div>
          </div>

          <!-- Show More/Show Less Button -->
          <div v-if="allAvatars.length > 9" class="text-center">
            <Button
              :variant="'secondary'"
              :text="showAllCharacters ? 'Show Less Characters' : 'Show More Characters'"
              @click="showAllCharacters = !showAllCharacters"
            />
          </div>
        </div>
      </div>

      <!-- Demo Chat Section -->
      <!--
      <div class="mb-12">
        <h3 class="text-gray-800 text-xl sm:text-2xl font-semibold mb-6 text-center">
          Try Our AI Tutor
        </h3>
        <div class="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <div class="grid md:grid-cols-2 gap-0">
             Character Display (Left)
            <div
              class="bg-gradient-to-br from-primary-50 to-primary-100 p-8 flex flex-col items-center justify-center min-h-[400px]"
            >
              <div class="text-center">
                <img
                  :src="demoCharacter.image"
                  :alt="demoCharacter.name"
                  class="w-32 h-32 mx-auto rounded-full object-cover border-4 border-white shadow-lg mb-4"
                />
                <h4 class="text-xl font-bold text-gray-800 mb-2">{{ demoCharacter.name }}</h4>
                <p class="text-gray-600 mb-4">{{ demoCharacter.type }}</p>
                <div class="bg-white rounded-lg p-4 shadow-sm max-w-sm">
                  <p class="text-gray-700 text-sm leading-relaxed">
                    {{ currentDemoMessage }}
                  </p>
                </div>
              </div>
            </div>

            Chat Interface (Right)
            <div class="bg-white p-6 flex flex-col min-h-[400px]">
              <div class="flex-1 overflow-y-auto mb-4 space-y-3">
                <div
                  v-for="(message, index) in demoMessages"
                  :key="index"
                  class="flex"
                  :class="message.isUser ? 'justify-end' : 'justify-start'"
                >
                  <div
                    class="max-w-[80%] px-4 py-2 rounded-lg"
                    :class="
                      message.isUser
                        ? 'bg-primary-500 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    "
                  >
                    {{ message.text }}
                  </div>
                </div>
                <div v-if="isTyping" class="flex justify-start">
                  <div class="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg rounded-bl-none">
                    <div class="flex space-x-1">
                      <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div
                        class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style="animation-delay: 0.1s"
                      />
                      <div
                        class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style="animation-delay: 0.2s"
                      />
                    </div>
                  </div>
                </div>
              </div>

               Input Area
              <div class="border-t pt-4">
                <div class="flex gap-3">
                  <input
                    v-model="demoInput"
                    type="text"
                    placeholder="Ask me anything about math, science, history..."
                    class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    @keypress.enter="sendDemoMessage"
                  />
                  <button
                    class="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200 disabled:opacity-50"
                    :disabled="!demoInput.trim() || isTyping"
                    @click="sendDemoMessage"
                  >
                    Send
                  </button>
                </div>
                <div class="mt-3 flex flex-wrap gap-2">
                  <button
                    v-for="suggestion in demoSuggestions"
                    :key="suggestion"
                    class="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors duration-200"
                    @click="sendSuggestion(suggestion)"
                  >
                    {{ suggestion }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      -->

      <!-- Information Tabs Section -->
      <div class="mb-12">
        <div class="max-w-6xl mx-auto">
          <!-- Tab Navigation -->
          <div class="flex flex-wrap justify-center border-b border-gray-200 mb-8">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              class="px-6 py-3 text-sm font-medium transition-colors duration-200 border-b-2"
              :class="
                activeTab === tab.id
                  ? 'text-primary-600 border-primary-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
              "
              @click="activeTab = tab.id"
            >
              {{ tab.name }}
            </button>
          </div>

          <!-- Tab Content -->
          <div class="bg-white rounded-lg shadow-sm p-8">
            <!-- About Tab -->
            <div v-if="activeTab === 'about'" class="space-y-8">
              <div class="text-center">
                <h3 class="text-2xl font-bold text-gray-800 mb-4">About Eddy</h3>
                <p class="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
                  Our mission is to inspire children through rewards, engagement and targeted
                  learning and allow parents to take charge of their children's education.
                </p>
              </div>

              <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- What is Eddy Card -->
                <div
                  class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div class="text-center mb-4">
                    <div
                      class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3"
                    >
                      <svg
                        class="w-6 h-6 text-primary-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                    </div>
                    <h4 class="text-lg font-semibold text-gray-800 mb-3">What is Eddy?</h4>
                  </div>
                  <p class="text-gray-600 text-center">
                    An AI-powered educational platform featuring customized Large Language Models
                    designed specifically for education. Our AI tutors provide personalized learning
                    experiences for children.
                  </p>
                </div>

                <!-- Key Features Card -->
                <div
                  class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div class="text-center mb-4">
                    <div
                      class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3"
                    >
                      <svg
                        class="w-6 h-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                        />
                      </svg>
                    </div>
                    <h4 class="text-lg font-semibold text-gray-800 mb-3">Key Features</h4>
                  </div>
                  <ul class="text-gray-600 space-y-2">
                    <li>• Curriculum-aware content</li>
                    <li>• Adaptive difficulty</li>
                    <li>• Smart feedback system</li>
                    <li>• Multiple AI personalities</li>
                    <li>• Child-safe AI filters</li>
                  </ul>
                </div>

                <!-- Subjects Card -->
                <div
                  class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div class="text-center mb-4">
                    <div
                      class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3"
                    >
                      <svg
                        class="w-6 h-6 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                    <h4 class="text-lg font-semibold text-gray-800 mb-3">Subjects Covered</h4>
                  </div>
                  <div class="grid grid-cols-2 gap-1 text-sm text-gray-600">
                    <div>• Mathematics</div>
                    <div>• Science</div>
                    <div>• English</div>
                    <div>• History</div>
                    <div>• Art</div>
                    <div>• Music</div>
                    <div>• PE</div>
                    <div>• Technology</div>
                  </div>
                </div>

                <!-- AI Characters Card -->
                <div
                  class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200 md:col-span-2 lg:col-span-3"
                >
                  <div class="text-center mb-4">
                    <div
                      class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3"
                    >
                      <svg
                        class="w-6 h-6 text-yellow-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <h4 class="text-lg font-semibold text-gray-800 mb-3">AI Characters</h4>
                  </div>
                  <p class="text-gray-600 text-center max-w-2xl mx-auto">
                    Choose from multiple AI tutors including Alex the Explorer, Luna the Scholar,
                    Sam the Scientist, and more - each with unique personalities to match your
                    child's learning style.
                  </p>
                </div>
              </div>
            </div>

            <!-- FAQ Tab -->
            <div v-if="activeTab === 'faq'" class="space-y-6">
              <h3 class="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h3>

              <div class="space-y-4">
                <div
                  v-for="(faq, index) in faqs"
                  :key="index"
                  class="border border-gray-200 rounded-lg"
                >
                  <button
                    class="w-full text-left p-4 flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
                    @click="toggleFaq(index)"
                  >
                    <span class="font-medium text-gray-800">{{ faq.question }}</span>
                    <svg
                      class="w-5 h-5 text-gray-500 transition-transform duration-200"
                      :class="openFaqs.includes(index) ? 'rotate-180' : ''"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <div
                    v-if="openFaqs.includes(index)"
                    class="p-4 pt-0 text-gray-600 leading-relaxed"
                  >
                    {{ faq.answer }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Subscription Tab -->
            <div v-if="activeTab === 'subscription'" class="space-y-8">
              <div class="text-center">
                <h3 class="text-2xl font-bold text-gray-900 mb-4">Choose Your Plan</h3>
                <p class="text-gray-600">
                  Select the perfect plan for your child's educational journey
                </p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <!-- Free Plan -->
                <div
                  class="border-2 border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors cursor-pointer"
                  @click="selectPlan('free')"
                >
                  <div class="text-center">
                    <h3 class="text-2xl font-bold text-gray-900 mb-2">Free Plan</h3>
                    <div class="text-4xl font-bold text-gray-900 mb-4">
                      $0<span class="text-lg text-gray-500">/month</span>
                    </div>
                    <p class="text-gray-600 mb-6">
                      Perfect for getting started with basic features
                    </p>
                  </div>

                  <div class="space-y-4 mb-6">
                    <div class="flex items-center space-x-3">
                      <svg
                        class="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span class="text-gray-700">50 AI queries per month</span>
                    </div>
                    <div class="flex items-center space-x-3">
                      <svg
                        class="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span class="text-gray-700">Basic study tools</span>
                    </div>
                    <div class="flex items-center space-x-3">
                      <svg
                        class="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span class="text-gray-700">Limited practice questions</span>
                    </div>
                    <div class="flex items-center space-x-3">
                      <svg
                        class="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span class="text-gray-700">Community support</span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    text="Get Started Free"
                    class="w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium transition-colors"
                    @click="goToChat"
                  />
                </div>

                <!-- Premium Plan -->
                <div
                  class="border-2 border-primary-500 rounded-lg p-6 hover:border-primary-600 transition-colors relative bg-primary-50/30 cursor-pointer"
                  @click="selectPlan('premium')"
                >
                  <div class="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span
                      class="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium"
                    >Most Popular</span>
                  </div>

                  <div class="text-center">
                    <h3 class="text-2xl font-bold text-gray-900 mb-2">Premium Plan</h3>
                    <div class="text-4xl font-bold text-primary-600 mb-4">
                      $25<span class="text-lg text-gray-500">/month</span>
                    </div>
                    <p class="text-gray-600 mb-6">Unlock unlimited learning potential</p>
                  </div>

                  <div class="space-y-4 mb-6">
                    <div class="flex items-center space-x-3">
                      <svg
                        class="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span class="text-gray-700">Unlimited AI queries</span>
                    </div>
                    <div class="flex items-center space-x-3">
                      <svg
                        class="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span class="text-gray-700">Advanced study tools</span>
                    </div>
                    <div class="flex items-center space-x-3">
                      <svg
                        class="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span class="text-gray-700">Unlimited practice questions</span>
                    </div>
                    <div class="flex items-center space-x-3">
                      <svg
                        class="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span class="text-gray-700">Priority support</span>
                    </div>
                    <div class="flex items-center space-x-3">
                      <svg
                        class="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span class="text-gray-700">Detailed progress tracking</span>
                    </div>
                    <div class="flex items-center space-x-3">
                      <svg
                        class="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span class="text-gray-700">Offline access</span>
                    </div>
                  </div>

                  <button
                    class="w-full py-3 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                  >
                    Start Premium Trial
                  </button>
                </div>
              </div>

              <div class="bg-gray-50 rounded-lg p-6 mt-8 max-w-4xl mx-auto">
                <h4 class="font-semibold text-gray-800 mb-3 text-center">
                  Family-Friendly Features
                </h4>
                <div class="grid md:grid-cols-2 gap-4 text-gray-600">
                  <div class="flex items-center space-x-2">
                    <svg class="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span>Individual subscriptions per child</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <svg class="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span>Comprehensive parental controls</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <svg class="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span>Easy payment method management</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <svg class="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span>Detailed billing history and invoices</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Team Tab -->
            <div v-if="activeTab === 'team'" class="space-y-6">
              <h3 class="text-2xl font-bold text-gray-800 mb-6">Our Team</h3>

              <div class="bg-primary-50 rounded-lg p-8 mb-8">
                <h4 class="text-xl font-semibold text-gray-800 mb-4">The Founders</h4>
                <p class="text-gray-700 leading-relaxed mb-4">
                  We are a team of like-minded individuals that believe in using artificial
                  intelligence to provide education for all. We met each other at the National
                  University of Singapore (NUS).
                </p>
                <p class="text-gray-600">
                  Thank you for your support and please let us know what features you would like to
                  see on our platform.
                </p>
              </div>

              <div class="grid md:grid-cols-2 gap-8">
                <div class="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 class="text-lg font-semibold text-gray-800 mb-4">Our Mission</h4>
                  <p class="text-gray-600 leading-relaxed">
                    To inspire children through rewards, engagement and targeted learning while
                    empowering parents to take charge of their children's education using
                    cutting-edge AI technology.
                  </p>
                </div>

                <div class="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 class="text-lg font-semibold text-gray-800 mb-4">Technology Stack</h4>
                  <ul class="text-gray-600 space-y-2">
                    <li>• Vue.js & Nuxt 3 Framework</li>
                    <li>• Supabase Backend</li>
                    <li>• Google AI Studio Integration</li>
                    <li>• Cloudflare Deployment</li>
                    <li>• Advanced Analytics</li>
                  </ul>
                </div>
              </div>

              <div class="bg-gray-50 rounded-lg p-6 text-center">
                <h4 class="text-lg font-semibold text-gray-800 mb-3">Get in Touch</h4>
                <p class="text-gray-600 mb-4">We'd love your feedback and suggestions!</p>
                <Button variant="primary" text="Send Feedback" @click="router.push('/feedback')" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import girlAvatar from '../../../assets/girl.png';
import { characters } from '../../types/characters.types.js';
import Button from '~/components/common/Button.vue';
import CharacterCarousel from '~/components/CharacterCarousel.vue';
import { useRouter } from '#vue-router';

const router = useRouter();
const selectedAvatar = ref(null);
const showAllCharacters = ref(false);

// Demo chat functionality
const demoInput = ref('');
const isTyping = ref(false);
const demoMessages = ref([
  { text: 'Hi! I\'m Luna, your AI tutor. What would you like to learn today?', isUser: false },
]);

const demoCharacter = ref({
  id: 2,
  name: 'Luna',
  image: girlAvatar,
  type: 'AI Scholar',
});

const currentDemoMessage = ref('Hi there! I\'m here to help you learn. Ask me anything!');

const demoSuggestions = ref([
  'Explain photosynthesis',
  'Help with algebra',
  'World War 2 facts',
  'How do volcanoes work?',
]);

const demoResponses = {
  'photosynthesis':
    'Photosynthesis is how plants make food using sunlight, water, and carbon dioxide. The chloroplasts in plant cells capture light energy and convert it into chemical energy!',
  'algebra':
    'Algebra is like solving puzzles with numbers and letters! The key is to isolate the variable by doing the same operation to both sides of the equation. What specific algebra topic would you like help with?',
  'world war 2':
    'World War 2 lasted from 1939-1945 and involved many countries. It ended when Germany surrendered in May 1945 and Japan surrendered in August 1945 after the atomic bombs.',
  'volcanoes':
    'Volcanoes form when molten rock (magma) from deep inside Earth rises to the surface. The pressure builds up until it erupts, creating mountains of hardened lava and ash!',
  'default':
    'That\'s a great question! I can help you understand complex topics by breaking them down into simple, easy-to-understand explanations. What specific area would you like to explore?',
};

const allAvatars = ref(characters);

const browseCharacters = ref(null);

const scrollToCharacters = () => {
  if (browseCharacters.value) {
    browseCharacters.value.scrollIntoView({ behavior: 'smooth' });
  }
};

const selectAvatar = (avatar, index) => {
  selectedAvatar.value = avatar;
  console.log('Selected avatar:', avatar);
};

const goToChat = (avatar) => {
  selectedAvatar.value = avatar;
  router.push('/chat');
};

const sendDemoMessage = () => {
  if (!demoInput.value.trim() || isTyping.value) return;

  const userMessage = demoInput.value.trim();
  demoMessages.value.push({ text: userMessage, isUser: true });
  demoInput.value = '';

  // Show typing indicator
  isTyping.value = true;
  currentDemoMessage.value = 'Thinking...';

  // Simulate AI response after delay
  setTimeout(() => {
    const response = getResponse(userMessage);
    demoMessages.value.push({ text: response, isUser: false });
    currentDemoMessage.value = response;
    isTyping.value = false;
  }, 1500);
};

const sendSuggestion = (suggestion) => {
  demoInput.value = suggestion;
  sendDemoMessage();
};

const getResponse = (input) => {
  const lowerInput = input.toLowerCase();

  if (lowerInput.includes('photosynthesis')) return demoResponses.photosynthesis;
  if (lowerInput.includes('algebra') || lowerInput.includes('math')) return demoResponses.algebra;
  if (lowerInput.includes('world war') || lowerInput.includes('ww2'))
    return demoResponses['world war 2'];
  if (lowerInput.includes('volcano')) return demoResponses.volcanoes;

  return demoResponses.default;
};

// Tabs functionality
const activeTab = ref('about');
const openFaqs = ref([]);

const tabs = ref([
  { id: 'about', name: 'About' },
  { id: 'faq', name: 'FAQ' },
  { id: 'subscription', name: 'Subscription' },
  { id: 'team', name: 'Team' },
]);

const faqs = ref([
  {
    question: 'What is Eddy and how does it work?',
    answer:
      'Eddy is an AI-powered educational platform featuring customized Large Language Models designed specifically for education. Our AI tutors provide personalized learning experiences, adapt to your child\'s learning pace, and offer curriculum-aligned content across multiple subjects.',
  },
  {
    question: 'What subjects does Eddy cover?',
    answer:
      'Eddy covers Mathematics, Science, English, History, Art, Music, Physical Education, and Technology. Our content is aligned with primary school curricula and adapts to different grade levels.',
  },
  {
    question: 'How do the AI characters work?',
    answer:
      'Choose from multiple AI tutors including Alex the Explorer, Luna the Scholar, Sam the Scientist, and more. Each character has a unique personality and teaching style to match your child\'s preferences and learning style.',
  },
  {
    question: 'Is Eddy safe for children?',
    answer:
      'Yes! Eddy is built with child safety as a priority. Our AI includes bias filters, content safety measures, and is designed specifically for young learners. We also provide comprehensive parental controls.',
  },
  {
    question: 'How does the credit system work?',
    answer:
      'Students earn credits by completing quizzes and challenges. Credits can be used in our shop system for educational materials and rewards, encouraging continued learning and engagement.',
  },
  {
    question: 'Can parents track their child\'s progress?',
    answer:
      'Absolutely! Our parent dashboard provides detailed progress tracking, study hours, completion rates, and comprehensive analytics to help you monitor your child\'s learning journey.',
  },
  {
    question: 'What devices can I use Eddy on?',
    answer:
      'Eddy is a web-based platform that works on any device with an internet connection. Our responsive design ensures a great experience on computers, tablets, and smartphones.',
  },
  {
    question: 'Do you offer family accounts?',
    answer:
      'Yes! We support multi-child family accounts with individual tracking for each child, separate subscriptions per child, and comprehensive family management features.',
  },
]);

const toggleFaq = (index) => {
  if (openFaqs.value.includes(index)) {
    openFaqs.value = openFaqs.value.filter((i) => i !== index);
  } else {
    openFaqs.value.push(index);
  }
};

const selectPlan = (planType) => {
  if (planType === 'premium') {
    router.push('/checkout');
  } else {
    router.push('/dashboard');
  }
};
</script>

<style scoped></style>
