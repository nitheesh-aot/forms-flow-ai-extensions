import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import App from "./App.vue";
import {
  BootstrapVue
} from "bootstrap-vue";
import Vue from "vue";
import router from "./router";
import store from "./store/index";

Vue.config.productionTip = false;

Vue.use(BootstrapVue);

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
