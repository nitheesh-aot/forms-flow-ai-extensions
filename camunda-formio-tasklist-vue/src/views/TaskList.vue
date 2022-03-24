<template>
  <div class="task-demo">
      <CamundaTasklist
      class="ctf-task-list px-3"
      :bpmApiUrl="configs.BPM_URL"
      :token="configs.token"
      :formIO="configs.FORMIO_CONFIG"
      :formsflowaiUrl="configs.FORM_FLOW_URL"
      :formsflowaiApiUrl="configs.FORM_FLOW_API_URL"
      :formIOJwtSecret="configs.FORMIO_JWT_SECRET"
      :getTaskId="getTaskId"
      :disableComponents="{
        filterList: true,
        filterTask: false,
        form: false,
        sort: true,
      }"
      v-if="isServiceFLowEnabled"
    />
    <div class="no-content" v-else>You shouldnot be here !!!</div>
  </div>
</template>

<script lang="ts">
import {
  Component, Prop, Vue 
} from "vue-property-decorator";
import CamundaTasklist from "@/components/TaskList.vue";

@Component({
  components: {
    CamundaTasklist,
  },
})

export default class TaskList extends Vue {
  
  @Prop() private getTaskId!: string;
  public configs = {
    token: "Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJvbmNQZTJJV3JYQUY1cnVBOE8zRlBKeXVxcWh6LTJNcXNsTmFVa2lsdU93In0.eyJleHAiOjE2NDc5NzEwOTUsImlhdCI6MTY0Nzk3MDk3NSwiYXV0aF90aW1lIjoxNjQ3OTcwOTc1LCJqdGkiOiIyMzczZDY4Ny0yOTk0LTQ4NDgtYmZiNC00ZDIxZjIyMThkN2YiLCJpc3MiOiJodHRwczovL2lkbS1kZXYtdGFmdC5hcHBzLnNpbHZlci5kZXZvcHMuZ292LmJjLmNhL2F1dGgvcmVhbG1zL3RhZnQiLCJhdWQiOlsiY2FtdW5kYS1yZXN0LWFwaSIsImZvcm1zLWZsb3ctd2ViIiwiY2l0aXplbi1zZXJ2aWNlIiwicmV0YWlsZXItc2VydmljZSIsInRyYW5zYWN0aW9uLXNlcnZpY2UiLCJmb3Jtcy1mbG93LWJwbSIsImJyb2tlciIsImFjY291bnQiLCJhZGp1ZGljYXRpb24tc2VydmljZSJdLCJzdWIiOiJjYjQzNjg3Ny00ZGY0LTRlMjUtYjk1YS1lMzc2NWRlNmM0ZmQiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJ0YWZ0LXdlYiIsInNlc3Npb25fc3RhdGUiOiJjYjc0ODljNy01MWE0LTQ5NGItYjg4NC1hY2VmNWNmMGY4OWQiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHBzOi8vd2ViLWRldi10YWZ0LmFwcHMuc2lsdmVyLmRldm9wcy5nb3YuYmMuY2EiLCJodHRwOi8vbG9jYWxob3N0OjgwODAiLCJodHRwczovL2Zvcm1zZmxvdy1kZXYtdGFmdC5hcHBzLnNpbHZlci5kZXZvcHMuZ292LmJjLmNhIiwiaHR0cDovLzEwLjAuMC4xNzA6ODA4MCJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJhcHAtYWRtaW4iLCJ1bWFfYXV0aG9yaXphdGlvbiIsImRlZmF1bHQtcm9sZXMtdGFmdCJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImNpdGl6ZW4tc2VydmljZSI6eyJyb2xlcyI6WyJjaXRpemVuLWFkbWluIl19LCJmb3Jtcy1mbG93LXdlYiI6eyJyb2xlcyI6WyJmb3Jtc2Zsb3ctY2xpZW50IiwiZm9ybXNmbG93LXJldmlld2VyIl19LCJyZXRhaWxlci1zZXJ2aWNlIjp7InJvbGVzIjpbInJldGFpbGVyLWFkbWluIl19LCJ0cmFuc2FjdGlvbi1zZXJ2aWNlIjp7InJvbGVzIjpbInRyYW5zYWN0aW9uLWFkbWluIl19LCJmb3Jtcy1mbG93LWJwbSI6eyJyb2xlcyI6WyJmb3Jtcy1mbG93LWJwbS1hZG1pbiJdfSwiYnJva2VyIjp7InJvbGVzIjpbInJlYWQtdG9rZW4iXX0sImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfSwiYWRqdWRpY2F0aW9uLXNlcnZpY2UiOnsicm9sZXMiOlsiYWRqdWRpY2F0aW9uLWFkbWluIl19fSwic2NvcGUiOiJvcGVuaWQgZW1haWwgcHJvZmlsZSIsImlkZW50aXR5X3Byb3ZpZGVyIjoiaWRpciIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwicm9sZSI6WyJmb3Jtc2Zsb3ctY2xpZW50IiwiZm9ybXNmbG93LXJldmlld2VyIl0sIm5hbWUiOiJOaXRoZWVzaCBHYW5lc2giLCJncm91cHMiOlsiL2NhbXVuZGEtYWRtaW4iLCIvZm9ybXNmbG93L2Zvcm1zZmxvdy1jbGllbnQiLCIvZm9ybXNmbG93L2Zvcm1zZmxvdy1yZXZpZXdlciJdLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJuZ2FuZXNoQGlkaXIiLCJnaXZlbl9uYW1lIjoiTml0aGVlc2giLCJmYW1pbHlfbmFtZSI6IkdhbmVzaCIsImVtYWlsIjoibml0aGVlc2guZ2FuZXNoQGFvdC10ZWNobm9sb2dpZXMuY29tIn0.QXIMwYdxNnGqRbz0v4uydLPE0_XnFZgeEC82AO9CDKdOnW744yBz-eCCBOw7SU1uW8tOG3ZG_qGYnViMOSg35fl91ZB2MVQiU1D2Aeh3JbJZyaWncHk3fAJT1YN7UugPDgODycg7RwC26l4Lw0pFFXBrAlM-PDY-cTOTilWooUbXnHDdiOY0l1hEdhktsDLodDD6F_MjL6qmeewNe-FJzMjH5LxF6nqmCR0mcpJSKDXpSIaHEPJ0gDlfTsFTxOquHBBXo9jQaFawsm1nnZFh0_tQYLz3Udu81qrf2Ox0jDVwwNfqQsA616Iy920CtMH_G5noDEPlADDEYrcAXfP_JA",
    BPM_URL: 'https://bpm-dev-taft.apps.silver.devops.gov.bc.ca/camunda',
    FORMIO_CONFIG: {
      apiUrl: 'https://formio-dev-taft.apps.silver.devops.gov.bc.ca',
      resourceId: '61327a0911753a973291684c',
      reviewerId: '61327a0911753a362591684e',
      reviewer: '61327a0911753a362591684e',
      userRoles: '61327a0911753a15b291684,61327a0911753a362591684e,61327a0911753a66d291684b,61327a0911753a973291684,61327a0911753a5b7f91684d',
    },
    FORM_FLOW_API_URL: 'https://formsflow-web-api-dev-taft.apps.silver.devops.gov.bc.ca',
    FORM_FLOW_URL: 'https://formsflow-dev-taft.apps.silver.devops.gov.bc.ca',
    FORMIO_JWT_SECRET: 'gxTVTc3c2QP5xWCc',
  };

  public isServiceFLowEnabled = true;
  mounted () {
    this.isServiceFLowEnabled = true;
  }
}
</script>

<style scoped>
.no-content {
  display: flex;
  justify-content: center;
  font-size: 18px;
}
.task-demo {
  background: #ddd;
  height: 100vh;
}
.ctf-task-list {
  height: calc(100vh - 48px);
  overflow: auto;
}
</style>
