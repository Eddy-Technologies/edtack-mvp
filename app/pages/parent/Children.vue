<template>
  <div class="main-container">
    <!-- Sidebar Section -->
    <div class="sidebar">
      <button
          class="sidebar-btn"
          :class="{ active: selectedTab === 'analytics' }"
          @click="selectTab('analytics')"
      >
        Analytics
      </button>
      <button
          class="sidebar-btn"
          :class="{ active: selectedTab === 'account-settings' }"
          @click="selectTab('account-settings')"
      >
        Account Settings
      </button>
    </div>

    <!-- Content Area -->
    <div class="content-area">
      <div class="profile-container">
        <!-- Parent Section -->
        <div class="parent-section">
          <h2 class="section-title text-primary">Profile</h2>
          <div
              class="parent-box"
              @click="selectChild(0)"
          >
            <img :src="parent[0].avatar" alt="Avatar" class="avatar" />
            <p class="text-primary font-bold">{{ parent[0].name }}</p>
          </div>
        </div>

        <!-- Children Section -->
        <div class="children-section">
          <h2 class="section-title text-primary">Children</h2>
          <div class="children-list">
            <div
                v-for="(child, index) in children"
                :key="index"
                class="child-item"
                @click="selectChild(index)"
            >
              <div class="child-box">
                <img :src="child.avatar" alt="Avatar" class="avatar" />
                <p class="text-primary font-bold">{{ child.name }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Content (Analytics or Account Settings) -->
      <div class="tab-content">
        <div v-if="selectedTab === 'analytics'">
          <h3 class="tab-title text-primary font-bold">Analytics</h3>
          <div class="chart-container" v-if="selectedChild !== null">
            <div ref="chartContainer" class="chart"></div>
          </div>
        </div>
        <div v-if="selectedTab === 'account-settings'">
          <h3 class="tab-title text-primary font-bold">Account Settings</h3>
          <Fund />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';
import Fund from "~/pages/parent/Fund.vue";

export default {
  components: { Fund },
  setup() {
    const parent = ref([
      { name: "Me", avatar: "https://randomuser.me/api/portraits/men/3.jpg", data: [5, 10, 15, 20, 25] }
    ]);
    const children = ref([
      { name: "John", avatar: "https://randomuser.me/api/portraits/men/1.jpg", data: [5, 10, 15, 20, 25] },
      { name: "Jane", avatar: "https://randomuser.me/api/portraits/women/1.jpg", data: [10, 15, 20, 25, 30] },
      { name: "Alice", avatar: "https://randomuser.me/api/portraits/women/2.jpg", data: [15, 10, 5, 10, 15] },
    ]);
    const selectedChild = ref(0);
    const selectedTab = ref('analytics'); // To keep track of the selected tab
    const chartContainer = ref(null);

    let chartInstance = null;

    const selectChild = (index) => {
      selectedChild.value = index;
    };

    const selectTab = (tab) => {
      selectedTab.value = tab;
    };

    const renderChart = () => {
      if (!chartContainer.value) return;

      if (chartInstance) {
        chartInstance.dispose();
      }

      chartInstance = echarts.init(chartContainer.value);

      const selectedData = selectedChild.value !== null ?
          (selectedChild.value === 0 ? parent.value[0].data : children.value[selectedChild.value].data) : [];

      const option = {
        title: {
          text: selectedChild.value === 0 ? `My Deposit` : `${children.value[selectedChild.value].name}'s Deposit`,
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
            itemStyle: {
              color: 'rgb(75, 192, 192)',
            },
          },
        ],
      };

      chartInstance.setOption(option);
    };

    watch(selectedChild, (newValue) => {
      renderChart();
    });

    onMounted(() => {
      renderChart();
    });

    return { parent, children, selectedChild, selectChild, selectedTab, selectTab, chartContainer };
  },
};
</script>

<style scoped>
/* Main Layout */
.main-container {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 250px;
  padding: 20px;
  border-right: 2px solid #ccc;
  position: fixed;
  top: 0;
  bottom: 0;
  margin-top: 60px;
}

.sidebar-btn {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  text-align: left;
  border: 1px solid #ccc;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.sidebar-btn:hover {
  background-color: #e2e2e2;
}

.sidebar-btn.active {
  background-color: #14dfbd;
}

/* Content Area */
.content-area {
  margin-left: 250px;
  padding: 20px;
  flex-grow: 1;
}

.profile-container {
  display: flex;
  margin-top: 30px;
  gap: 50px;
}

.section-title {
  font-size: 1.5em;
  font-weight: bold;
  margin-bottom: 5px;
}

.parent-section, .children-section {
  margin-bottom: 10px;
}

.parent-box, .child-box {
  cursor: pointer;
  width: 100px;
  padding: 10px;
  border: 2px solid #ccc;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.children-list {
  display: flex;
  gap: 15px;
}

.child-item {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
}

/* Tab Content */
.tab-content {
  margin-top: 20px;
  padding: 20px;
  border-top: 1px solid #ccc;
}

.tab-title {
  font-size: 1.5em;
  font-weight: bold;
  margin-bottom: 5px;
}

.chart-container {
  width: 100%;
  height: 300px;
  margin-top: 10px;
}

.chart {
  width: 100%;
  height: 100%;
}

/* Responsive Design */
@media screen and (max-width: 1024px) {
  .main-container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    position: relative;
    border-right: none;
  }

  .content-area {
    margin-left: 0;
  }

  .sidebar-btn {
    width: auto;
  }
}

@media screen and (max-width: 768px) {
  .profile-container {
    flex-direction: column;
    gap: 30px;
  }

  .avatar {
    width: 50px;
    height: 50px;
  }

  .section-title {
    font-size: 1.2em;
  }

  .chart-container {
    width: 90%;
    height: 250px;
  }
}
</style>
