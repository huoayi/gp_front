<template>
  <ul v-if="show" class="base-bg">
    <li v-for="i in 10" :key="i"></li>
  </ul>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ show?: boolean }>(), { show: true });
</script>

<style lang="less" scoped>
ul.base-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, #170e1d, #0d0d0e);
  overflow: hidden;
  z-index: -1;

  li {
    position: absolute;
    display: block;
    width: 1.25rem;
    height: 1.25rem;
    background: rgba(255, 255, 255, 0.2);
    animation: animate 25s linear infinite;
    bottom: -9.375rem;

    &:nth-child(1) {
      left: 25%;
      width: 5rem;
      height: 5rem;
      animation-delay: 0s;
    }

    &:nth-child(2) {
      left: 10%;
      width: 1.25rem;
      height: 1.25rem;
      animation-delay: 2s;
      animation-duration: 12s;
    }

    &:nth-child(3) {
      left: 70%;
      width: 1.25rem;
      height: 1.25rem;
      animation-delay: 4s;
    }

    &:nth-child(4) {
      left: 40%;
      width: 3.75rem;
      height: 3.75rem;
      animation-delay: 0s;
      animation-duration: 18s;
    }

    &:nth-child(5) {
      left: 65%;
      width: 1.25rem;
      height: 1.25rem;
      animation-delay: 0s;
    }

    &:nth-child(6) {
      left: 75%;
      width: 6.875rem;
      height: 6.875rem;
      animation-delay: 3s;
    }

    &:nth-child(7) {
      left: 35%;
      width: 9.375rem;
      height: 9.375rem;
      animation-delay: 7s;
    }

    &:nth-child(8) {
      left: 50%;
      width: 1.5625rem;
      height: 1.5625rem;
      animation-delay: 15s;
      animation-duration: 45s;
    }

    &:nth-child(9) {
      left: 20%;
      width: 0.9375rem;
      height: 0.9375rem;
      animation-delay: 2s;
      animation-duration: 35s;
    }

    &:nth-child(10) {
      left: 85%;
      width: 9.375rem;
      height: 9.375rem;
      animation-delay: 0s;
      animation-duration: 11s;
    }

    @keyframes animate {
      0% {
        transform: translateY(0) rotate(0deg);
        opacity: 1;
        border-radius: 0;
      }

      100% {
        transform: translateY(-62.5rem) rotate(720deg);
        opacity: 0;
        border-radius: 50%;
      }
    }
  }
}

ul.base-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, #170e1d, #0d0d0e);
  overflow: hidden;
  z-index: -1;

  li {
    position: absolute;
    display: block;
    width: 1.25rem;
    height: 1.25rem;
    background: rgba(255, 255, 255, 0.2);
    animation: animate 25s linear infinite;
    bottom: -9.375rem;

    &:nth-child(1) {
      left: 25%;
      width: 5rem;
      height: 5rem;
      animation-delay: 0s;
    }

    &:nth-child(2) {
      left: 10%;
      width: 1.25rem;
      height: 1.25rem;
      animation-delay: 2s;
      animation-duration: 12s;
    }

    &:nth-child(3) {
      left: 70%;
      width: 1.25rem;
      height: 1.25rem;
      animation-delay: 4s;
    }

    &:nth-child(4) {
      left: 40%;
      width: 3.75rem;
      height: 3.75rem;
      animation-delay: 0s;
      animation-duration: 18s;
    }

    &:nth-child(5) {
      left: 65%;
      width: 1.25rem;
      height: 1.25rem;
      animation-delay: 0s;
    }

    &:nth-child(6) {
      left: 75%;
      width: 6.875rem;
      height: 6.875rem;
      animation-delay: 3s;
    }

    &:nth-child(7) {
      left: 35%;
      width: 9.375rem;
      height: 9.375rem;
      animation-delay: 7s;
    }

    &:nth-child(8) {
      left: 50%;
      width: 1.5625rem;
      height: 1.5625rem;
      animation-delay: 15s;
      animation-duration: 45s;
    }

    &:nth-child(9) {
      left: 20%;
      width: 0.9375rem;
      height: 0.9375rem;
      animation-delay: 2s;
      animation-duration: 35s;
    }

    &:nth-child(10) {
      left: 85%;
      width: 9.375rem;
      height: 9.375rem;
      animation-delay: 0s;
      animation-duration: 11s;
    }

    @keyframes animate {
      0% {
        transform: translateY(0) rotate(0deg);
        opacity: 1;
        border-radius: 0;
      }

      100% {
        transform: translateY(-62.5rem) rotate(720deg);
        opacity: 0;
        border-radius: 50%;
      }
    }
  }
}
</style>
