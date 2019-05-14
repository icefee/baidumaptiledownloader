<template>
  <div id="app">
    <app-header/>
    <router-view class="view"></router-view>
  </div>
</template>

<script>
import AppHeader from '@/components/units/appheader'

export default {
  components: { AppHeader }
}
</script>

<style>
* {
  padding: 0;
  margin: 0;
  outline: 0;
  box-sizing: border-box;
  text-rendering: optimizeLegibility;
}

html, body {
  height: 100%;
  font-family: microsoft yahei, helvetica, simhei,simsun, sans-serif;
}

input {
  outline: 0;
}

#app {
  position: relative;
  height: 100%;
  background: #001529;
  color: #ccc;
  border: 1px solid #555;
}

.view {
  position: absolute;
  width: 100%;
  height: calc(100% - 40px);
  top: 40px;
  left: 0;
}

.fade-enter-active, .fade-leave-active {
	transition: opacity .3s;
}
.fade-enter, .fade-leave-to {
	opacity: 0;
}
</style>
