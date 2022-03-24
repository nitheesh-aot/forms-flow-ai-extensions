<template>
  <button
    @click="clickMaxi"
    class="btn btn-secondary expand-btn"
    :class="{expanded: !maximize}"
  >
    <font-awesome-icon
      v-if="maximize"
      icon="fa-chevron-left"
      data-bs-toggle="tooltip"
      title="Click to expand the form"
    />
    <font-awesome-icon
      v-if="maximize"
      icon="fa-chevron-right"
      data-bs-toggle="tooltip"
      title="Click to see the task list"
    />
  </button>
</template>

<script lang="ts">
import {
  Component, Mixins
} from "vue-property-decorator";
import TaskListMixin from "../../mixins/TaskListMixin.vue";

@Component({
})
export default class ExpandContract extends Mixins(TaskListMixin) {
  clickMaxi() {
    this.maximize = !this.maximize;
    this.$root.$emit("call-managerScreen", {
      maxi: this.maximize
    });
  }
}
</script>

<style lang="scss" scoped>
.expand-btn {
  position: absolute;
  margin-top: 12px;
  z-index: 9;
  margin-left: -20px;
  border-radius: 50rem;
  min-height: 32px;
  i {
    margin-right: 1px;
  }
  &.expanded {
    margin-left: -18px;
    i {
      margin-left: 2px;
      margin-right: 0;
    }
  }
}
</style>
