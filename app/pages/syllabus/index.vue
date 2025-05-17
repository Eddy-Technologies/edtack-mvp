<template>
  <AppHeader />
  <div class="app beautiful-list-container">
    <div class="levels-grid">
      <section v-for="(topics, level) in syllabusData" :key="level" class="level-section">
        <h2 class="level-header">{{ level }}</h2>
        <ul class="topics-list bulleted">
          <li
            v-for="(topic, index) in topics"
            :key="index"
            class="topic-item"
            @mouseover="tooltipText = topic; tooltipVisible = true; tooltipPosition = getTooltipPosition($event)"
            @mouseleave="tooltipText = null; tooltipVisible = false"
          >
            {{ topic.split(':')[0] }}
          </li>
        </ul>
      </section>
    </div>

    <div
      v-if="tooltipVisible"
      class="tooltip"
      :style="{ top: tooltipPosition.y + 'px', left: tooltipPosition.x + 'px' }"
    >
      {{ tooltipText }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const syllabusData = {
  'Primary 1': [
    'Numbers 0-10: Counting, recognizing, and writing numbers.',
    'Basic Shapes: Identifying and drawing circles, squares, triangles, and rectangles.',
    'Simple Addition and Subtraction: Using objects or drawings to solve basic addition and subtraction problems within 10.',
    'Measurement (Length and Weight): Comparing lengths (longer, shorter) and weights (heavier, lighter) using direct comparison.',
    'Time: Sequencing daily events (morning, afternoon, evening).',
    'Data Handling: Sorting objects and creating simple pictographs.'
  ],
  'Primary 2': [
    'Numbers 0-100: Counting, reading, and writing numbers; place value (tens and ones).',
    'Addition and Subtraction within 100: Solving addition and subtraction problems (with and without regrouping).',
    'Multiplication and Division (Introduction): Understanding multiplication as repeated addition and division as sharing.',
    'Fractions: Recognizing and naming halves and quarters.',
    'Measurement (Length, Weight, Volume, and Temperature): Measuring length using standard units (cm, m), weight using grams, and volume using liters; reading temperatures on a Celsius scale.',
    'Time: Telling time to the hour and half-hour on analog clocks.',
    'Money: Identifying coins and notes; solving simple word problems involving money.',
    'Data Handling: Collecting and representing data using bar graphs and pie charts.'
  ],
  'Primary 3': [
    'Numbers 0-1000: Counting, reading, and writing numbers; place value (hundreds, tens, and ones).',
    'Addition and Subtraction within 1000: Solving addition and subtraction problems (with and without regrouping) involving three-digit numbers.',
    'Multiplication and Division: Mastering multiplication tables up to 10x10; solving multiplication and division problems with remainders.',
    'Fractions: Adding and subtracting fractions with the same denominator.',
    'Decimals: Introduction to decimals; representing decimals in tenths and hundredths.',
    'Measurement (Length, Weight, Volume, and Temperature): Measuring length using different units (km) and converting between units; weight using kilograms (kg) and volume using milliliters (ml).',
    'Time: Telling time to the nearest 5 minutes; solving word problems involving time.',
    'Geometry: Identifying and describing 2D shapes (pentagons, hexagons, octagons).',
    'Area and Perimeter: Introduction to area and perimeter concepts.',
    'Data Handling: Interpreting and creating bar graphs and line graphs.',
    'Simple algebraic equations and expressions.'
  ],
  'Primary 4': [
    'Numbers Up To 10,000: Place Value, Comparing, Ordering, Rounding.',
    'Factors and Multiples: Prime and Composite Numbers.',
    'Addition and Subtraction: Operations with Large Numbers.',
    'Multiplication: Multiplication of Large Numbers by Two-Digit Numbers.',
    'Division: Division by One-Digit and Two-Digit Divisors.',
    'Fractions: Equivalent Fractions, Mixed Numbers, Improper Fractions.',
    'Addition and Subtraction of Fractions: Unlike Denominators.',
    'Decimals: Decimals up to Three Decimal Places, Comparison, Rounding.',
    'Measurement: Conversion of Units (Length, Mass, Volume, Time).',
    'Area and Perimeter: Rectangles and Squares.',
    'Geometry: Angles, Properties of Squares, Rectangles, and Triangles.',
    'Data Handling: Interpretation of Data Tables and Pie Charts.',
    'Simple algebraic equations involving a unknown to solve.'
  ],
  'Primary 5': [
    'Whole Numbers: Place Value Up To 1,000,000, Comparison and Ordering, Rounding.',
    'Factors and Multiples: Tests For Divisibility.',
    'Fractions: Addition, Subtraction, Multiplication, and Division of Fractions.',
    'Decimals: Decimals, Percentage, Ratio, and Proportion.',
    'Measurement: Time, Volume, Area of Triangle.',
    'Average.',
    'Geometry: Properties of Cubes and Cuboids, Volume of Cube and Cuboid.',
    'Angles and Triangles.',
    'Perimeter and Area: Composite Figures.',
    'Data Handling: Interpretation of Line Graphs and Tables.',
    'Algebra: Solving Simple Equations with One Unknown.',
    'Word Problems based on all of the above topics.'
  ],
  'Primary 6': [
    'Whole Numbers: Review of Place Value, Comparison, and Ordering of Large Numbers.',
    'Integers.',
    'Fractions, Decimals, Percentages: Advanced operations and problem-solving.',
    'Ratio and Proportion: Applications in Real Life Scenarios.',
    'Rate.',
    'Geometry: Angle, Properties of Parallelograms, Rhombuses, and Trapezoids.',
    'Circles.',
    'Volume of Cube, Cuboid and Triangle.',
    'Data Handling: Interpretation and Construction of Pie Charts.',
    'Algebra: Simplifying Algebraic Expressions, Solving Equations with one or two variables.',
    'Word Problems based on all of the above topics.'
  ]
};

const tooltipText = ref(null);
const tooltipVisible = ref(false);
const tooltipPosition = ref({ x: 0, y: 0 });

const getTooltipPosition = (event) => {
  const x = event.clientX + 10;
  const y = event.clientY + 10;
  return { x, y };
};
</script>

<style lang="scss" scoped>
.beautiful-list-container {
  padding: 30px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: var(--background-primary);
  color: var(--text-primary);
  min-height: 100vh;
}

.levels-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* Create 3 equal columns */
  gap: 20px; /* Spacing between the level sections */
}

.level-section {
  padding: 20px;
  background-color: var(--background-secondary);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.level-header {
  color: var(--text-header);
  margin-top: 0;
  margin-bottom: 15px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 8px;
  font-size: 1.4em; /* Slightly smaller header for grid layout */
  font-weight: 500;
  text-align: center; /* Center the level header */
}

.topics-list {
  list-style: none;
  padding: 0;

  &.bulleted {
    padding-left: 20px;
  }
}

.topic-item {
  color: var(--topic-text);
  padding: 6px 0; /* Adjust vertical padding for list in grid */
  cursor: pointer;
  transition: color 0.2s ease-in-out, transform 0.1s ease-in-out;
  position: relative;
  list-style-type: disc;
  margin-bottom: 4px; /* Adjust spacing between items in grid */
  font-size: 0.9em; /* Slightly smaller font for list items in grid */

  &::marker {
    color: var(--topic-accent);
    font-size: 0.8em;
  }

  &:hover {
    color: var(--topic-text-hover);
    transform: translateX(5px);
  }
}

.tooltip {
  position: fixed;
  background-color: var(--tooltip-background);
  color: var(--tooltip-text);
  padding: 10px 15px;
  border-radius: 5px;
  font-size: 0.9em;
  z-index: 1000;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s ease-in-out;

  &.visible {
    opacity: 1;
  }
}
</style>
