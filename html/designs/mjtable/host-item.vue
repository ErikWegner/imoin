<template>
  <li>Host: {{ host.name }}</li>
</template>

<script>
export default {
  props: {
    host: {
      type: Object
    }
  }
}
</script>
