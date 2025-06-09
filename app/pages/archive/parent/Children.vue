<template>
  <div class="flex flex-col md:flex-row h-full">
    <!-- Desktop Sidebar -->
    <div class="hidden md:flex flex-col w-64 p-4 border-r border-gray-200">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="w-full text-left p-2 mb-2 rounded"
        :class="{ 'bg-primary text-white': selectedTab === tab.key }"
        @click="selectTab(tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Mobile Tab Bar -->
    <div class="flex md:hidden justify-around border-b border-gray-300 mb-4 px-2 pt-2">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="pb-2 text-sm font-medium"
        :class="
          selectedTab === tab.key ? 'border-b-2 border-primary text-primary' : 'text-gray-600'
        "
        @click="selectTab(tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Content Area -->
    <div class="flex-1 p-4">
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Parent Section -->
        <div>
          <h2 class="text-xl font-bold text-primary mb-2">Profile</h2>
          <div
            class="min-w-[160px] cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center"
            @click="selectChild(0)"
          >
            <img :src="parent[0].avatar" alt="Avatar" class="w-16 h-16 rounded-full mb-2" />
            <p class="text-primary font-bold">{{ parent[0].name }}</p>
            <p class="text-primary font-bold">Total: ${{ parentCredit }}</p>
          </div>
        </div>

        <!-- Children Section with Carousel -->
        <div class="w-full">
          <h2 class="text-xl font-bold text-primary mb-2">Children</h2>
          <div class="flex overflow-x-auto space-x-4 pb-2">
            <div
              v-for="(child, index) in children"
              :key="index"
              class="min-w-[160px] flex-shrink-0 border-2 rounded-xl p-4 text-center cursor-pointer"
              @click="selectChild(index)"
            >
              <img :src="child.avatar" alt="Avatar" class="w-16 h-16 rounded-full mx-auto mb-2" />
              <p class="text-primary font-bold">{{ child.name }}</p>
              <p class="text-primary font-bold">Allocated: ${{ childCredit[index] }}</p>
              <p class="text-primary font-bold">Earned: ${{ childEarnedCredit[index] }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="mt-8">
        <div v-if="selectedTab === 'analytics'">
          <h3 class="text-xl font-bold text-primary mb-4">Analytics</h3>
          <div v-if="selectedChild !== null" class="w-full h-72">
            <div ref="chartContainer" class="w-full h-full" />
          </div>
        </div>
        <div v-if="selectedTab === 'account-settings'">
          <h3 class="text-xl font-bold text-primary mb-4">Account Settings</h3>
          <Fund />
        </div>
        <div v-if="selectedTab === 'store-settings'">
          <h3 class="text-xl font-bold text-primary mb-4">Store Settings</h3>
          <Store />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';
import Fund from '~/pages/archive/parent/Fund.vue';
import { useCreditStore } from '~/stores/credit';
import Store from '~/pages/archive/parent/Store.vue';

export default {
  components: { Store, Fund },
  setup() {
    const parent = ref([
      {
        name: 'Me',
        avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
        data: [5, 10, 15, 20, 25],
      },
    ]);
    const children = ref([
      {
        name: 'John',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
        data: [5, 10, 15, 20, 25],
      },
      {
        name: 'Jane',
        avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
        data: [10, 15, 20, 25, 30],
      },
      {
        name: 'Alice',
        avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
        data: [15, 10, 5, 10, 15],
      },
    ]);
    const selectedChild = ref(0);
    const selectedTab = ref('analytics');
    const chartContainer = ref(null);
    let chartInstance = null;

    const creditStore = useCreditStore();
    const parentCredit = ref(creditStore.parentCredits);
    const childCredit = ref(creditStore.childCredits);
    const childEarnedCredit = ref(creditStore.childEarnedCredits);

    const tabs = [
      { key: 'analytics', label: 'Analytics' },
      { key: 'account-settings', label: 'Account Settings' },
      { key: 'store-settings', label: 'Store Settings' },
    ];

    watch(
      () => creditStore.parentCredits,
      (newVal) => (parentCredit.value = newVal)
    );
    watch(
      () => creditStore.childCredits,
      (newVal) => (childCredit.value = newVal)
    );

    const selectChild = (index) => (selectedChild.value = index);
    const selectTab = (tab) => (selectedTab.value = tab);

    const renderChart = () => {
      if (!chartContainer.value) return;
      if (chartInstance) chartInstance.dispose();

      chartInstance = echarts.init(chartContainer.value);
      const selectedData =
        selectedChild.value === 0 ? parent.value[0].data : children.value[selectedChild.value].data;

      chartInstance.setOption({
        title: {
          text:
            selectedChild.value === 0
              ? `My Deposit`
              : `${children.value[selectedChild.value].name}'s Deposit`,
        },
        tooltip: {},
        xAxis: {
          type: 'category',
          data: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            data: selectedData,
            type: 'line',
            smooth: true,
            itemStyle: { color: 'rgb(75, 192, 192)' },
          },
        ],
      });
    };

    watch(selectedChild, () => renderChart());
    onMounted(() => renderChart());

    return {
      parent,
      children,
      selectedChild,
      selectChild,
      selectedTab,
      selectTab,
      chartContainer,
      parentCredit,
      childCredit,
      childEarnedCredit,
      tabs,
    };
  },
};
</script>
