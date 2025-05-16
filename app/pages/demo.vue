<template>
  <div class="flex justify-center items-center min-h-screen px-5 text-center overflow-hidden">
    <video
        class="w-full h-auto object-contain
             max-w-full max-h-[50vh]
             md:max-w-[80vw] md:max-h-[30vh]"
        autoplay
        muted
        loop
        playsinline
    >
      <source src="/../assets/eddy.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  </div>
</template>
