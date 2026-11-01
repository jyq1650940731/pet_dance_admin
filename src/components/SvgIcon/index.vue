<template>
  <svg :style="{ width: width, height: height }">
    <use :xlink:href="prefix + name" :fill="color"></use>
  </svg>
</template>
<script setup>
defineProps({
  prefix: {
    type: String,
    default: "#icon-",
  },
  name: {
    type: String,
    required: true,
  },
  color: String,
  width: {
    type: String,
    default: "30",
  },
  height: {
    type: String,
    default: "30",
  },
});
</script>
<style scoped></style>
