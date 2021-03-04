<template>
  <div id="app">
    <Responder label="Respond" />
  </div>
</template>

<script>
import Responder from './components/Responder.vue'

export default {
  name: 'App',
  components: {
    Responder
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
}
</style>
