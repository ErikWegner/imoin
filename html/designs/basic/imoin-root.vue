<template>
<div>
  <p>
    Basic Design!<br>
    <button v-on:click="counter += 1">Add 1</button>
  </p>
  <p>The button above has been clicked {{ counter }} times.</p>
</div>
</template>
<script>
export default {
 data() {
   return {
     counter: 0
   }
 } 
}
</script>
