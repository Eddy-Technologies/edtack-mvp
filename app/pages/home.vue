<template>
  <div class="app">
    <div class="image-container">
      <img :src="background" class="item-image" alt="home">
      <div class="link-container">
        <!-- Left half: Transparent ULink -->
        <ULink
            class="text-2xl md:text-3xl text-primary font-bold flex items-center justify-center gap-x-2 border-2 border-transparent hover:border-primary hover:bg-primary hover:text-blue-600 transition duration-300 ease-in-out px-6 py-3 rounded-lg left-link"
            to="/parent"
        >
          Are you a parent?
        </ULink>

        <!-- Right half: Transparent ULink -->
        <ULink
            class="text-2xl md:text-3xl text-primary font-bold flex items-center justify-center gap-x-2 border-2 border-transparent hover:border-primary hover:bg-primary hover:text-yellow-300 transition duration-300 ease-in-out px-6 py-3 rounded-lg right-link"
            to="/child"
        >
          Are you a child?
        </ULink>
      </div>
    </div>
  </div>
</template>

<script>
import home from "../../assets/home.png";

export default {
  setup() {
    const background = home;

    return { background };
  }
};
</script>

<style lang="scss" scoped>
.app {
  position: relative;
  width: 100%;
  height: 100vh; /* Ensure the app takes full screen height */
}

.image-container {
  position: relative;
  width: 100%;
  height: 100%; /* Ensure the image container takes up full height of the app */
}

.item-image {
  width: 100%;  /* Make sure the image takes full width */
  height: 100%; /* Make sure the image takes full height */
  object-fit: cover; /* Ensure the image fully covers the container */
}

.link-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  z-index: 10;
}

/* Left half: */
.left-link {
  width: 50%; /* Left half takes up 50% */
  display: flex;
  justify-content: flex-start;
  visibility: visible;
  position: relative;
}

/* Right half: */
.right-link {
  width: 50%; /* Right half takes up 50% */
  display: flex;
  justify-content: flex-end;
  visibility: visible;
  position: relative;
}

/* Darken the left side when hovering over the right half */
.left-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0); /* No dark overlay initially */
  transition: background-color 0.3s ease-in-out;
  z-index: -1; /* Ensure it stays behind the link text */
}

.right-link::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 50%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0); /* No dark overlay initially */
  transition: background-color 0.3s ease-in-out;
  z-index: -1; /* Ensure it stays behind the link text */
}

/* When hovering the left half, darken the right half of the image */
.image-container:hover .left-link::before {
  background-color: rgba(0, 0, 0, 0.4); /* Darken the right half */
}

/* When hovering the right half, darken the left half of the image */
.image-container:hover .right-link::before {
  background-color: rgba(0, 0, 0, 0.4); /* Darken the left half */
}

.image-container:hover .left-link {
  visibility: visible;
}

.image-container:hover .right-link {
  visibility: visible;
}
</style>
