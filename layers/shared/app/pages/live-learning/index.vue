<script setup lang="ts">
useHead({
  title: 'Live Learning - Coming Soon',
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="max-w-2xl mx-auto px-4 text-center">
      <div class="mb-8">
        <div class="inline-block p-4 bg-blue-600 rounded-full mb-6">
          <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Live Learning</h1>
        <p class="text-xl text-gray-600 mb-2">Coming Soon</p>
        <p class="text-gray-500">
          Get ready for interactive live sessions with expert mentors. Real-time learning, Q&A, and hands-on workshops.
        </p>
      </div>

      <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">What to Expect</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div class="flex items-start">
            <div class="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8.618v6.764a1 1 0 00.553.894l2 1A1 1 0 0018 16.382V7.618a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
            </div>
            <div>
              <h3 class="font-medium text-gray-900">Live Video Sessions</h3>
              <p class="text-sm text-gray-500">Interactive real-time learning</p>
            </div>
          </div>
          <div class="flex items-start">
            <div class="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 class="font-medium text-gray-900">Q&A Sessions</h3>
              <p class="text-sm text-gray-500">Get your questions answered</p>
            </div>
          </div>
          <div class="flex items-start">
            <div class="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 class="font-medium text-gray-900">Hands-on Workshops</h3>
              <p class="text-sm text-gray-500">Practice with expert guidance</p>
            </div>
          </div>
          <div class="flex items-start">
            <div class="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div>
              <h3 class="font-medium text-gray-900">Expert Mentors</h3>
              <p class="text-sm text-gray-500">Learn from industry professionals</p>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-blue-600 text-white rounded-lg p-6">
        <h3 class="text-lg font-semibold mb-2">Stay Updated</h3>
        <p class="text-blue-100 mb-4">
          Be the first to know when Live Learning launches. Subscribe to our newsletter for updates.
        </p>
        <button class="bg-white text-blue-600 font-semibold py-2 px-6 rounded hover:bg-blue-50 transition-colors">
          Notify Me
        </button>
      </div>
    </div>
  </div>
</template>
