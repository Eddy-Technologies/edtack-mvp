<template>
  <div class="container">
    <div class="children-list">
      <div
          class="child-item"
          v-for="(child, index) in children"
          :key="index"
          @click="selectChild(index)"
      >
        <img :src="child.avatar" alt="Avatar" class="avatar" />
        <p>{{ child.name }}</p>
      </div>
    </div>

    <div class="chart-container" v-if="selectedChild !== null">
      <h3>{{ children[selectedChild].name }}'s Data</h3>
      <div ref="chartContainer" class="chart"></div>
    </div>
    <Fund />
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';
import Fund from "~/pages/parent/Fund.vue";

export default {
  components: {Fund},
  setup() {
    const children = ref([
      { name: "Me", avatar: "https://randomuser.me/api/portraits/men/3.jpg", data: [5, 10, 15, 20, 25] },
      { name: "John", avatar: "https://randomuser.me/api/portraits/men/1.jpg", data: [5, 10, 15, 20, 25] },
      { name: "Jane", avatar: "https://randomuser.me/api/portraits/women/1.jpg", data: [10, 15, 20, 25, 30] },
      { name: "Alice", avatar: "https://randomuser.me/api/portraits/women/2.jpg", data: [15, 10, 5, 10, 15] },
    ]);

    const selectedChild = ref(0);  // Automatically set the first child as selected when the page is loaded
    const chartContainer = ref(null); // Create a ref for the chart container

    let chartInstance = null;

    const selectChild = (index) => {
      selectedChild.value = index;
    };

    const renderChart = () => {
      // Make sure the chart container is available
      if (!chartContainer.value) return;

      if (chartInstance) {
        chartInstance.dispose();  // Dispose the previous chart instance if any
      }

      // Initialize the chart
      chartInstance = echarts.init(chartContainer.value);

      const selectedData = children.value[selectedChild.value].data;

      const option = {
        title: {
          text: `${children.value[selectedChild.value].name}'s Data`,
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

      // Set the chart options
      chartInstance.setOption(option);
    };

    watch(selectedChild, (newValue) => {
      if (newValue !== null) {
        renderChart();
      }
    });

    onMounted(() => {
      // Initialize the chart with the first child selected when the component is mounted
      renderChart();
    });

    return { children, selectedChild, selectChild, chartContainer };
  }
};
</script>

<style scoped>
.container {
  display: flex;
  justify-content: space-between;
  padding: 20px;
}

.children-list {
  width: 200px;
}

.child-item {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.chart-container {
  width: 60%;
}

.chart {
  width: 100%;
  height: 400px;
}
</style>
