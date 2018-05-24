<template>
  <div class="error">
    <img src="/icons/icon-64.png" alt="icinga logo">
    <br>
    <p class="errormessage">
      {{ message }}
    </p>
  </div>
</template>

<script>
export default {
  props: {
    message: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
.error {
  text-align:center;
}

.errormessage {
    max-height: 100px;
    overflow-y: auto;
    white-space: pre;
}
</style>
