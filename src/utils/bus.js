import Vue from "vue";
const bus = new Vue();
Vue.prototype.$eventBus = bus;
export default bus;
