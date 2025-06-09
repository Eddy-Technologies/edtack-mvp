<template>
  <div class="space-y-6">
    <!-- Summary Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-xl shadow-sm border">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <div class="text-2xl font-bold text-gray-900">{{ analytics.totalStudyHours }}h</div>
            <div class="text-sm text-gray-600">Total Study Time</div>
            <div class="text-xs text-green-600">+{{ analytics.studyHoursIncrease }}% this week</div>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-sm border">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <div class="text-2xl font-bold text-gray-900">{{ analytics.averageGrade }}%</div>
            <div class="text-sm text-gray-600">Average Grade</div>
            <div class="text-xs text-green-600">+{{ analytics.gradeImprovement }}% improvement</div>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-sm border">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <div class="text-2xl font-bold text-gray-900">{{ analytics.questionsAnswered }}</div>
            <div class="text-sm text-gray-600">Questions Answered</div>
            <div class="text-xs text-blue-600">{{ analytics.accuracyRate }}% accuracy</div>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-sm border">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <div class="text-2xl font-bold text-gray-900">{{ analytics.streak }}</div>
            <div class="text-sm text-gray-600">Day Streak</div>
            <div class="text-xs text-orange-600">{{ analytics.streakType }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Study Time Chart -->
      <div class="bg-white p-6 rounded-xl shadow-sm border">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Daily Study Time</h3>
          <select v-model="studyTimeRange" class="text-sm border border-gray-300 rounded-lg px-3 py-1">
            <option value="7">Last 7 days</option>
            <option value="14">Last 14 days</option>
            <option value="30">Last 30 days</option>
          </select>
        </div>
        <div ref="studyTimeChart" class="h-64"></div>
      </div>

      <!-- Grade Distribution Chart -->
      <div class="bg-white p-6 rounded-xl shadow-sm border">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Subject Performance</h3>
        <div ref="gradeChart" class="h-64"></div>
      </div>
    </div>

    <!-- Activity Timeline and Subject Breakdown -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recent Activity -->
      <div class="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div class="space-y-4">
          <div v-for="activity in recentActivities" :key="activity.id" class="flex items-start space-x-3">
            <div class="flex-shrink-0">
              <div :class="[
                'w-8 h-8 rounded-full flex items-center justify-center text-white text-sm',
                activity.type === 'quiz' ? 'bg-blue-500' :
                activity.type === 'homework' ? 'bg-green-500' :
                activity.type === 'notes' ? 'bg-purple-500' : 'bg-gray-500'
              ]">
                {{ activity.type === 'quiz' ? 'Q' : activity.type === 'homework' ? 'H' : 'N' }}
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-gray-900">{{ activity.title }}</p>
                <p class="text-xs text-gray-500">{{ activity.time }}</p>
              </div>
              <p class="text-sm text-gray-600">{{ activity.description }}</p>
              <div v-if="activity.score" class="flex items-center mt-1">
                <span class="text-xs text-gray-500">Score: </span>
                <span :class="[
                  'text-xs font-medium ml-1',
                  activity.score >= 80 ? 'text-green-600' :
                  activity.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                ]">{{ activity.score }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Subject Breakdown -->
      <div class="bg-white p-6 rounded-xl shadow-sm border">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Weekly Focus</h3>
        <div class="space-y-3">
          <div v-for="subject in subjectBreakdown" :key="subject.name" class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-700">{{ subject.name }}</span>
              <span class="text-sm text-gray-600">{{ subject.hours }}h</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                :class="`h-2 rounded-full ${subject.color}`"
                :style="{ width: `${(subject.hours / maxSubjectHours) * 100}%` }"
              ></div>
            </div>
            <div class="flex justify-between text-xs text-gray-500">
              <span>{{ subject.topics }} topics</span>
              <span>{{ subject.performance }}% avg</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Learning Goals and Achievements -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Learning Goals -->
      <div class="bg-white p-6 rounded-xl shadow-sm border">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Learning Goals</h3>
          <button class="text-sm text-blue-600 hover:text-blue-700">View All</button>
        </div>
        <div class="space-y-4">
          <div v-for="goal in learningGoals" :key="goal.id" class="border rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-medium text-gray-900">{{ goal.title }}</h4>
              <span class="text-sm text-gray-500">{{ goal.dueDate }}</span>
            </div>
            <p class="text-sm text-gray-600 mb-3">{{ goal.description }}</p>
            <div class="flex items-center justify-between">
              <div class="flex-1 mr-4">
                <div class="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{{ goal.progress }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="h-2 bg-blue-600 rounded-full transition-all duration-300"
                    :style="{ width: `${goal.progress}%` }"
                  ></div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium text-green-600">+{{ goal.credits }}</div>
                <div class="text-xs text-gray-500">credits</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Achievements -->
      <div class="bg-white p-6 rounded-xl shadow-sm border">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Recent Achievements</h3>
          <button class="text-sm text-blue-600 hover:text-blue-700">View All</button>
        </div>
        <div class="space-y-4">
          <div v-for="achievement in recentAchievements" :key="achievement.id" class="flex items-center space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <span class="text-white text-lg">🏆</span>
              </div>
            </div>
            <div class="flex-1">
              <h4 class="font-medium text-gray-900">{{ achievement.title }}</h4>
              <p class="text-sm text-gray-600">{{ achievement.description }}</p>
              <div class="flex items-center justify-between mt-2">
                <span class="text-xs text-gray-500">{{ achievement.earnedDate }}</span>
                <span class="text-sm font-medium text-green-600">+{{ achievement.credits }} credits</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import * as echarts from 'echarts';

interface ChildAnalytics {
  totalStudyHours: number;
  studyHoursIncrease: number;
  averageGrade: number;
  gradeImprovement: number;
  questionsAnswered: number;
  accuracyRate: number;
  streak: number;
  streakType: string;
}

interface Props {
  childId: string;
  analytics: ChildAnalytics;
}

const props = defineProps<Props>();

// Chart refs
const studyTimeChart = ref<HTMLElement>();
const gradeChart = ref<HTMLElement>();

// Chart instances
let studyTimeChartInstance: echarts.ECharts;
let gradeChartInstance: echarts.ECharts;

// Data
const studyTimeRange = ref(7);

const recentActivities = ref([
  {
    id: 1,
    type: 'quiz',
    title: 'Math Quiz: Algebra',
    description: 'Completed 15 questions on linear equations',
    score: 87,
    time: '2 hours ago'
  },
  {
    id: 2,
    type: 'homework',
    title: 'Science Assignment',
    description: 'Submitted report on photosynthesis',
    score: 92,
    time: '1 day ago'
  },
  {
    id: 3,
    type: 'notes',
    title: 'History Notes',
    description: 'Created notes on World War II',
    score: null,
    time: '2 days ago'
  },
  {
    id: 4,
    type: 'quiz',
    title: 'English Vocabulary',
    description: 'Completed vocabulary assessment',
    score: 76,
    time: '3 days ago'
  }
]);

const subjectBreakdown = ref([
  { name: 'Mathematics', hours: 8.5, topics: 12, performance: 87, color: 'bg-blue-500' },
  { name: 'Science', hours: 6.2, topics: 8, performance: 92, color: 'bg-green-500' },
  { name: 'English', hours: 4.8, topics: 6, performance: 78, color: 'bg-purple-500' },
  { name: 'History', hours: 3.1, topics: 4, performance: 84, color: 'bg-orange-500' }
]);

const maxSubjectHours = computed(() => Math.max(...subjectBreakdown.value.map(s => s.hours)));

const learningGoals = ref([
  {
    id: 1,
    title: 'Master Quadratic Equations',
    description: 'Complete all exercises in Chapter 5',
    progress: 75,
    dueDate: 'Dec 15',
    credits: 50
  },
  {
    id: 2,
    title: 'Science Project',
    description: 'Research and present on renewable energy',
    progress: 40,
    dueDate: 'Dec 20',
    credits: 75
  },
  {
    id: 3,
    title: 'Reading Challenge',
    description: 'Read 3 books this month',
    progress: 67,
    dueDate: 'Dec 31',
    credits: 30
  }
]);

const recentAchievements = ref([
  {
    id: 1,
    title: 'Math Whiz',
    description: 'Scored 90%+ on 5 consecutive math quizzes',
    earnedDate: '2 days ago',
    credits: 100
  },
  {
    id: 2,
    title: 'Study Streak',
    description: 'Studied for 7 consecutive days',
    earnedDate: '1 week ago',
    credits: 50
  },
  {
    id: 3,
    title: 'Quick Learner',
    description: 'Completed lesson in under 30 minutes',
    earnedDate: '1 week ago',
    credits: 25
  }
]);

// Chart data generators
const generateStudyTimeData = (days: number) => {
  const data = [];
  const categories = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    categories.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    data.push(Math.floor(Math.random() * 8) + 1); // 1-8 hours
  }
  return { categories, data };
};

const subjectPerformanceData = {
  categories: ['Math', 'Science', 'English', 'History', 'Art'],
  data: [87, 92, 78, 84, 90]
};

// Chart initialization
const initStudyTimeChart = () => {
  if (!studyTimeChart.value) return;
  
  studyTimeChartInstance = echarts.init(studyTimeChart.value);
  updateStudyTimeChart();
};

const initGradeChart = () => {
  if (!gradeChart.value) return;
  
  gradeChartInstance = echarts.init(gradeChart.value);
  
  const option = {
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: subjectPerformanceData.categories,
      axisLabel: {
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: {
        formatter: '{value}%',
        fontSize: 12
      }
    },
    series: [{
      data: subjectPerformanceData.data,
      type: 'bar',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#60A5FA' },
          { offset: 1, color: '#3B82F6' }
        ])
      },
      barWidth: '60%'
    }],
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}%'
    }
  };
  
  gradeChartInstance.setOption(option);
};

const updateStudyTimeChart = () => {
  if (!studyTimeChartInstance) return;
  
  const { categories, data } = generateStudyTimeData(studyTimeRange.value);
  
  const option = {
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: {
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 10,
      axisLabel: {
        formatter: '{value}h',
        fontSize: 12
      }
    },
    series: [{
      data: data,
      type: 'line',
      smooth: true,
      itemStyle: {
        color: '#10B981'
      },
      lineStyle: {
        color: '#10B981',
        width: 3
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
          { offset: 1, color: 'rgba(16, 185, 129, 0.05)' }
        ])
      }
    }],
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c} hours'
    }
  };
  
  studyTimeChartInstance.setOption(option);
};

// Watchers
watch(studyTimeRange, () => {
  updateStudyTimeChart();
});

// Lifecycle
onMounted(() => {
  setTimeout(() => {
    initStudyTimeChart();
    initGradeChart();
  }, 100);
  
  // Handle window resize
  window.addEventListener('resize', () => {
    studyTimeChartInstance?.resize();
    gradeChartInstance?.resize();
  });
});
</script>