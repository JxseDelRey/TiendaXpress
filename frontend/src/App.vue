<template>
  <div class="font-sans text-gray-800 dark:text-gray-200 antialiased bg-white dark:bg-gray-900 transition-colors min-h-screen">
    <RouterView />
    <ChatbotWidget />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import ChatbotWidget from './components/ChatbotWidget.vue'
</script>
