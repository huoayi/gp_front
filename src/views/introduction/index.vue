<template>
  <iframe :src="pdf" height="100%vh;" width="100%vw"></iframe>
</template>
<script lang="ts" setup>
import pdf from '@/assets/pdf/cephalon.pdf';
</script>
