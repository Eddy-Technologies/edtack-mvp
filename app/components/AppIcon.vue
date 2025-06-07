<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    width="100"
    height="100"
  >
    <!-- Mortarboard Top (Rhombus Shape) -->
    <polygon
      points="50,25 10,45 50,65 90,45"
      fill=""
      fill-opacity="0"
      stroke="#14b8a6"
      stroke-width="3"
    />

    <!-- Headband -->
    <polygon
      points="30,55 27,65 50,75 73,65 70,55 50,65"
      fill="teal"
      stroke="#14b8a6"
      stroke-width="1"
    />

    <!-- Line from center of top left quadrant -->
    <line
      x1="30"
      y1="35"
      x2="50"
      y2="45"
      stroke="#14b8a6"
      stroke-width="3"
    />
    <!-- Tassel -->
    <line
      x1="90"
      y1="45"
      x2="90"
      y2="60"
      stroke="#14b8a6"
      stroke-width="2"
    />
    <circle
      cx="88"
      cy="60"
      r="3"
      fill="#14b8a6"
    />
  </svg>
</template>
