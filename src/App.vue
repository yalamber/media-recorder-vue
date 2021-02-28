<template>
  <div>
    <Responder label="Respond" />
  </div>
</template>

<script>
import Responder from "./components/Responder.vue";

export default {
  name: "App",
  components: {
    Responder,
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.ar-icon {
  fill: #747474;
  border-radius: 50%;
  border: 1px solid #05cbcd;
  background-color: #fff;
  padding: 5px;
  cursor: pointer;
  transition: 0.2s;
}
.ar-icon:hover {
  fill: #505050;
}
.ar-icon--no-border {
  border: 0;
  border-radius: 0;
  padding: 0;
}
.ar-icon--rec {
  fill: white;
  background-color: #ff6b64;
  border-color: transparent;
}
.ar-icon--pulse {
  animation: ripple 0.5s linear infinite;
}
@keyframes ripple {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.1), 0 0 0 1px rgba(255, 0, 0, 0.1), 0 0 0 5px rgba(255, 0, 0, 0.1);
 }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.1), 0 0 0 10px rgba(255, 0, 0, 0.1), 0 0 0 20px rgba(255, 0, 0, 0);
 }
}
.ar-icon__xs {
  width: 18px;
  height: 18px;
  line-height: 18px;
}
.ar-icon__sm {
  width: 30px;
  height: 30px;
  line-height: 30px;
}
.ar-icon__lg {
  width: 45px;
  height: 45px;
  line-height: 45px;
  box-shadow: 0 2px 5px 1px rgba(158, 158, 158, 0.5);
}

</style>
