<template>
 <div class="min-h-screen bg-background flex items-center justify-center px-4">
 <div class="bg-white/80 shadow-xl rounded-lg p-6 w-full max-w-xl">
 <h1 class="text-2xl font-bold mb-4 text-center font-serif">We’d love your feedback!</h1>
 <form
 action="https://formspree.io/f/xgvkdgwj"
 method="POST"
 class="flex flex-col gap-4"
 >
 <input
 type="text"
 name="name"
 placeholder="Your Name"
 required
 class="p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
 />
 <input
 type="email"
 name="email"
 placeholder="Your Email"
 required
 class="p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
 />
 <textarea
 name="message"
 placeholder="Your Feedback"
 rows="5"
 required
 class="p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
 ></textarea>

 <!-- ✅ Button aligned to right -->
 <div class="flex justify-end">
 <button
 type="submit"
 class="w-[220px] py-2 rounded-lg border-2 border-black font-bold cursor-pointer bg-white text-black hover:bg-gray-200 text-base sm:text-lg md:text-xl transition-colors duration-300"
 >
 Submit Feedback
 </button>
 </div>
 </form>
 </div>
 </div>
</template>
