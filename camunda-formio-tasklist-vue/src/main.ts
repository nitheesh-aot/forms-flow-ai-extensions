import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap-vue/dist/bootstrap-vue.css";
import 'bootstrap';
import App from "./App.vue";
import {
  FontAwesomeIcon
} from '@fortawesome/vue-fontawesome';
import Vue from "vue";
import library from "./font-awesome";
import router from "./router";
import store from "./store/index";

/* add font awesome icon component */
Vue.component('font-awesome-icon', FontAwesomeIcon);
library.add();

Vue.config.productionTip = false;


new Vue({
  router,
  store,
  render: (h: any) => h(App),
}).$mount("#app");
