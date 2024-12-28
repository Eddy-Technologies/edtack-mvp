<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-t from-primary-500/20">
    <AppHeader />

    <main class="flex-grow flex flex-col justify-center items-center relative">
      <div class="w-full max-w-3xl px-4 sm:px-6 lg:px-8 text-center py-12">
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6">
          <span class="text-primary">EdAI Demo</span>
          <br />
        </h1>
      </div>

      <div class="w-full px-1 sm:absolute inset-x-0 bottom-0">
        <UContainer
          class="flex justify-center sm:justify-between items-end min-h-20 sm:h-auto relative"
        >
          <h1 class="mb-5">
            Generate Challenge
          </h1>

          <form class="mb-5" @submit.prevent="fetchAnswer">
            <!-- Dropdown for Level -->
            <div class="form-group">
              <label for="level">Select Level</label>
              <select id="level" v-model="selectedLevel" class="form-control">
                <option value="" disabled>
                  Select Level
                </option>
                <option v-for="level in levels" :key="level" :value="level">
                  {{ level }}
                </option>
              </select>
              <select id="innerLevel" v-model="selectedInnerLevel" class="form-control">
                <option value="" disabled>
                  Select Level
                </option>
                <option v-for="innerLevel in filteredInnerLevels" :key="innerLevel" :value="innerLevel">
                  {{ innerLevel }}
                </option>
              </select>
            </div>

            <!-- Dropdown for Subject -->
            <div class="form-group">
              <label for="subject">Select Subject</label>
              <select id="subject" v-model="selectedSubject" class="form-control">
                <option value="" disabled>
                  Select Subject
                </option>
                <option v-for="subject in filteredSubjects" :key="subject" :value="subject">
                  {{ subject }}
                </option>
              </select>
            </div>

            <!-- Number of Questions -->
            <div class="form-group">
              <label for="numberInput">Enter the desired number of questions</label>
              <input
                  id="numberInput"
                  v-model="numberInput"
                  type="number"
                  class="form-control"
                  min="1"
                  placeholder="Enter a number"
              >
            </div>

            <button type="submit" :disabled="!selectedLevel || !selectedSubject || !numberInput || isLoading">
              {{ isLoading ? 'Asking Gemini...' : 'Ask' }}
            </button>
          </form>

          <div v-if="quiz" class="mb-10">
            <QuizPage :quiz="quiz" />
          </div>
        </UContainer>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script>
import QuizPage from '~/components/challenge/QuizPage.vue'
import { useGetGenerativeModelGP } from '~/composables/useGetGenerativeModelGP.js'

export default {
  components: { QuizPage },
  data() {
    return {
      quiz: null, // Holds the answer
      isLoading: false, // For managing loading state
      selectedLevel: '', // User-selected level
      selectedInnerLvl: null, // inner levels of education
      selectedSubject: '', // User-selected subject
      numberInput: null, // User-inputted number
      levels: ['Primary', 'Secondary', 'Junior College'], // Available levels
      primaryLvls: [1, 2, 3, 4, 5, 6],
      secondaryLvls: [1, 2, 3, 4],
      jcLvls: [1, 2],
      subjects: ['Math', 'Science', 'English', 'History', 'Geography'], // Available subjects
      primarySubjects: ['Math', 'Science', 'English'], // Available subjects
      secondarySubjects: ['E Math', 'A Math', 'Physics', 'Chemistry', 'Biology', 'Combined Physics', 'Combined Chemistry', 'Combined Biology', 'English', 'History', 'Geography', 'Social Studies', 'Combined History', 'Combined Geography', 'Combined Social Studies'], // Available subjects
      jcSubjects: ['H1 Math', 'H2 Math', 'H1 Physics', 'H2 Physics', 'H1 Chemistry', 'H2 Chemistry', 'H1 Biology', 'H2 Biology', 'H1 General Paper', 'H1 History', 'H2 History', 'H1 Geography', 'H2 Geography', 'H1 Economics', 'H2 Economics'], // Available subjects
      format: ` using this JSON schema:
                QuizQuestion = {'id': string, 'title': string, 'options': Array, 'correctAnswer': string}
                Return: Array<QuizQuestion>`,
    }
  },
  computed: {
    filteredInnerLevels() {
      switch (this.selectedLevel) {
        case 'Primary':
          return this.primaryLvls
        case 'Secondary':
          return this.secondaryLvls
        case 'Junior College':
          return this.jcLvls
        default:
          return []
      }
    },
    filteredSubjects() {
      switch (this.selectedLevel) {
        case 'Primary':
          return this.primarySubjects
        case 'Secondary':
          return this.secondarySubjects
        case 'Junior College':
          return this.jcSubjects
        default:
          return []
      }
    },
  },
  methods: {
    // Function to create a detailed prompt based on user input
    createPrompt(numberInput, selectedLevel, selectedInnerLvl, selectedSubject) {
      return `You are an expert teacher skilled in producing detailed, authentic, and correct student examination questions.
        For the Singapore syllabus, how would you create ${numberInput} MCQ questions of 5 options without the alphabet index of about ${selectedLevel} ${selectedInnerLvl} ${selectedSubject}, with varying difficulties.
        Make it so there are matching options such as "statement 1, 2, 3 are true" or "all of the above are true" type of questions and give detailed steps on how to
        achieve the correct solution. Give the correct answer option in full.`
    },

    // Function to fetch the answer from the generative model
    async fetchAnswer() {
      this.isLoading = true // Set loading state to true
      this.quiz = '' // Clear any previous quiz

      const prompt = this.createPrompt(this.numberInput, this.selectedLevel, this.selectedInnerLvl, this.selectedSubject) // Generate the prompt

      try {
        // Await the result from the generative model API
        this.quiz = await useGetGenerativeModelGP(prompt)
      }
      catch (error) {
        console.error('Error fetching quiz:', error)
        this.quiz = 'An error occurred while generating the quiz.'
      }
      finally {
        this.isLoading = false // Set loading state to false after fetching
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.mb-5 {
  margin-bottom: 5rem;
}
.mb-10 {
  margin-bottom: 10rem;
}
</style>

