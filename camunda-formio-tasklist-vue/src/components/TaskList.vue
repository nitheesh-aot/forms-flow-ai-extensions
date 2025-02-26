<template>
  <b-container fluid>
    <div class="task-outer-container" v-if="isUserAllowed">
    <Header
      v-if="token && bpmApiUrl && maximize"
      :token="token"
      :bpmApiUrl="bpmApiUrl"
      :filterList="filterList"
      :perPage="perPage"
      :selectedfilterId="selectedfilterId"
      :payload="payload"
      :defaultTaskSortBy="taskSortBy"
      :defaultTaskSortOrder="taskSortOrder"
    />
    <b-row class="cft-service-task-list mt-1">
      <b-col
        xl="3"
        lg="3"
        md="12"
        :class="
          containerHeight ? `cft-height-h${containerHeight}` : 'cft-height'
        "
        v-if="maximize"
      >
        <LeftSider
          v-if="token && bpmApiUrl"
          :token="token"
          :formsflowaiApiUrl="formsflowaiApiUrl"
          :formIOApiUrl="formIOApiUrl"
          :bpmApiUrl="bpmApiUrl"
          :tasks="tasks"
          :perPage="perPage"
          :selectedfilterId="selectedfilterId"
          :payload="payload"
        />
      </b-col>
      <b-col
        v-if="getFormsFlowTaskId && task"
        :lg="maximize ? 9 : 12"
        md="12"
        :class="
          containerHeight ? `cft-height-h${containerHeight}` : 'cft-height'
        "
      >
        <div class="cft-service-task-details">
          <b-row>
            <ExpandContract />
            <span
              class="ml-0 cft-task-header task-header-title"
              v-b-tooltip.hover.top
              title="Task Name"
              >{{ task.name }}
            </span>
          </b-row>
          <br />
          <b-row class="ml-0">
            <span
              class="cft-task-name"
              v-b-tooltip.hover
              title="Process Name"
              >{{ task.taskProcess }}</span
            >
          </b-row>
          <br />
          <b-row class="ml-0">
            <span
              class="cft-application-id"
              v-b-tooltip.hover
              title="Application Id"
              >Application ID # {{ task.applicationId }}</span
            >
          </b-row>
          <div class="cft-actionable-container">
            <b-row class="cft-actionable">
              <b-col cols="2" class="align-self-center">
                <span v-if="task.followUp">
                  <i class="fa fa-calendar"></i>
                  {{ timedifference(task.followUp) }}
                  <i
                    class="fa fa-times-circle"
                    @click="removeFollowupDate"
                    id="removeFollow"
                  ></i>
                  <b-tooltip target="removeFollow" triggers="hover">
                    Click to remove <b>FollowUp Date</b>
                  </b-tooltip>
                </span>
                <span v-else>
                  <b-form-datepicker
                  size="sm"
                  v-model="task.followUp"
                  @input="updateFollowUpDate"
                  placeholder="Set Followup Date"
                  locale="en"
                  />
                </span>
              </b-col>
              <b-col cols="2" class="align-self-center">
                <span v-if="task.due">
                  <i class="fa fa-calendar"></i>
                  {{ timedifference(task.due) }}
                  <i
                    class="fa fa-times-circle"
                    @click="removeDueDate"
                    id="removeDueDate"
                  ></i>
                  <b-tooltip target="removeDueDate" triggers="hover">
                    Click to remove <b> Due Date</b>
                  </b-tooltip>
                </span>
                <span v-else>
                  <b-form-datepicker
                  size="sm"
                  v-model="task.due"
                  @input="updateDueDate"
                  placeholder="Set Due Date"
                  locale="en"
                  />
                </span>
              </b-col>
              <b-col cols="3" class="align-self-center">
                <div
                  id="groups"
                  v-b-modal.AddGroupModal
                  class="group-align word-break"
                >
                  <i class="fa fa-th mr-1"></i>
                  <span
                    class="cft-group-align cft-word-break"
                    v-if="groupListNames"
                  >
                    {{ String(groupListNames) }}
                  </span>
                  <span v-else>Add Groups</span>
                  <b-tooltip target="groups" triggers="hover">
                    <b>Groups</b>
                  </b-tooltip>
                </div>
                <b-modal id="AddGroupModal" ref="modal" :hide-footer="true">
                  <template #modal-header="{ close }">
                    <h5>MANAGE GROUPS</h5>
                    <b-button
                      size="sm"
                      variant="outline-danger"
                      @click="close()"
                    >
                      <h5>
                        Close
                        <i class="fa fa-times"></i>
                      </h5>
                    </b-button>
                  </template>
                  <div class="modal-text">
                    <i class="fa fa-exclamation-circle"></i>
                    You can add a group by typing a group ID into the input
                    field and afterwards clicking the button with the plus sign.
                    <b-row class="mt-3 mb-3">
                      <b-col>
                        <b-button
                          variant="primary"
                          @click="addGroup"
                          :disabled="!setGroup"
                        >
                          <span>Add a group</span>
                          <span>
                            <i class="ml-2 fa fa-plus"></i>
                          </span>
                        </b-button>
                      </b-col>
                      <b-col>
                        <b-form-input
                          type="text"
                          placeholder="Group ID"
                          v-model="setGroup"
                          v-on:keyup.enter="addGroup"
                        ></b-form-input>
                      </b-col>
                    </b-row>
                    <b-row>
                      <b-col v-if="groupList.length">
                        <ul v-for="g in groupList" :key="g.groupId">
                          <div class="mt-1">
                            <i
                              class="fa fa-times mr-2 click-element"
                              @click="deleteGroup(g.groupId)"
                            ></i>
                            <span>{{ g.groupId }}</span>
                          </div>
                        </ul>
                      </b-col>
                    </b-row>
                  </div>
                </b-modal>
              </b-col>
              <b-col class="align-self-center">
                <span v-if="task.assignee">
                  <div v-if="editAssignee" class="cft-user-edit">
                    <div class="cft-assignee-change-box">
                      <v-select
                        :label="selectSearchType"
                        :options="reviewerUsersList"
                        :filterable="false"
                        v-model="userSelected"
                        :placeholder="`Search by ${selectSearchType}`"
                        @search="onUserSearch"
                        class="assignee-align float-left"
                      />
                      <i
                        @click="onSetassignee"
                        class="
                          fa fa-check
                          cft-assignee-tickmark-icon cft-icon-border
                        "
                      ></i>
                      <i
                        @click="toggleassignee"
                        class="
                          fa fa-times
                          cft-assignee-cancel-icon cft-icon-border
                        "
                      ></i>
                      <b-dropdown
                        id="dropdown-right"
                        class="ml-3 cft-select-generic-search"
                        variant="primary"
                      >
                        <template #button-content>
                          <span
                            ><i class="fa fa-filter cft-assignee-filter-icon"
                          /></span>
                        </template>
                        <b-dd-item
                          v-for="(row, index) in UserSearchListLabel"
                          :key="row.id"
                          @click="
                            setSelectedUserSearchBy(row.searchType, index)
                          "
                          :active="index === activeUserSearchindex"
                        >
                          <span>{{ row.label }}</span>
                        </b-dd-item>
                      </b-dropdown>
                    </div>
                  </div>
                  <div v-else>
                    <span
                      id="setAssignee"
                      v-b-tooltip.hover
                      title="Click to change Assignee"
                    >
                      <i class="fa fa-user cft-person-fill" />
                      <span class="cft-user-span" @click="toggleassignee">
                        {{ task.assignee }}
                      </span>
                    </span>
                    <span
                      id="resetAssignee"
                      v-b-tooltip.hover
                      title="Reset Assignee"
                    >
                      <i class="fa fa-times ml-1" @click="onUnClaim" />
                    </span>
                  </div>
                </span>
                <span v-else>
                  <div
                    @click="onClaim"
                    v-b-tooltip.hover.left
                    title="Claim task"
                  >
                    <span id="claimAssignee">
                      <i class="fa fa-user" /> Claim
                    </span>
                  </div>
                </span>
              </b-col>
            </b-row>
            <div class="height-100">
              <b-tabs pills class="height-100" content-class="mt-3">
                <b-tab title="Form" active>
                  <div class="ml-4 mr-4 form-tab-conatiner">
                    <b-overlay
                      :show="task.assignee !== userName"
                      variant="light"
                      opacity="0.75"
                      spinner-type="none"
                      aria-busy="true"
                    >
                      <div v-if="task.assignee === userName">
                        <transition name="fade">
                          <FormEdit
                            :formioUrl="formioUrl"
                            @onformsubmit="onFormSubmitCallback"
                            @oncustomevent="oncustomEventCallback"
                          />
                        </transition>
                      </div>
                      <div v-else>
                        <FormView :formioUrl="formioUrl" />
                      </div>
                    </b-overlay>
                  </div>
                </b-tab>
                <b-tab title="History">
                  <TaskHistory
                    :taskHistoryList="taskHistoryList"
                    :applicationId="task.applicationId"
                  />
                </b-tab>
                <b-tab
                  class="cft-diagram-container"
                  id="diagramContainer"
                  title="Diagram"
                  @click="getDiagramDetails"
                >
                  <div class="diagram-full-screen" id="canvas"></div>
                </b-tab>
              </b-tabs>
            </div>
          </div>
        </div>
      </b-col>
      <b-col v-else>
        <b-row class="cft-not-selected mt-2 ml-1 row">
          <i
            class="fa fa-exclamation-circle-fill"
            variant="secondary"
            scale="1"
          ></i>
          <p>Select a task in the list.</p>
        </b-row>
      </b-col>
    </b-row>
  </div>
    <div v-else>
        <div class="alert alert-danger mt-4" role="alert">
          You don't have access. Contact your administrator.
        </div>
    </div>
  </b-container>
</template>
<script lang="ts">
import "font-awesome/scss/font-awesome.scss";
import "../styles/user-styles.css";
import "../styles/camundaFormIOTasklist.scss";
import {
  ALL_FILTER,
  CamundaRest,
  SEARCH_USERS_BY,
  SocketIOService,
  authenticateFormio, 
  findFilterKeyOfAllTask,
  getFormDetails,
  getISODateTime,
  getTaskFromList,
  getUserName,
  getformHistoryApi,
  isAllowedUser,
  reviewerGroup,
  sortByPriorityList
} from "../services";
import {
  Component, Mixins, Prop 
} from "vue-property-decorator";
import {
  CustomEventPayload, 
  FilterPayload, 
  FormRequestActionPayload, 
  FormRequestPayload, 
  GroupListPayload, 
  Payload, 
  SEARCH_OPTION_TYPE,
  TaskHistoryListPayload, 
  TaskListSortType,
  TaskPayload, 
  UserListObject,
  UserListPayload, 
  UserPayload,
  UserSearchListLabelPayload,
} from "../models";
import BpmnViewer from "bpmn-js";
import ExpandContract from "./addons/ExpandContract.vue";
import FormEdit from "./form/Edit.vue";
import FormView from "./form/View.vue";
import {
  Formio
} from 'vue-formio';
import Header from "./layout/Header.vue";
import LeftSider from "./layout/LeftSider.vue";
import TaskHistory from "../components/addons/TaskHistory.vue";
import TaskListMixin from "../mixins/TaskListMixin.vue";
import moment from "moment";
import {
  namespace 
} from "vuex-class";

import serviceFlowModule from "../store/modules/serviceFlow-module";
import vSelect from "vue-select";

const StoreServiceFlowModule = namespace("serviceFlowModule");

@Component({
  components: {
    TaskHistory,
    Header,
    LeftSider,
    vSelect,
    ExpandContract,
    BpmnViewer,
    FormEdit,
    FormView,
  },
})
export default class Tasklist extends Mixins(TaskListMixin) {
  @Prop() private getTaskId!: string;
  @Prop() private containerHeight!: string;
  @Prop({
    default: "created",
  })
  public taskSortBy!: string;
  @Prop({
    default: "desc",
  })
  public taskSortOrder!: string;

  @StoreServiceFlowModule.Getter("getFormsFlowTaskCurrentPage")
  private getFormsFlowTaskCurrentPage: any;
  @StoreServiceFlowModule.Getter("getFormsFlowTaskId")
  private getFormsFlowTaskId: any;
  @StoreServiceFlowModule.Getter("getFormsFlowactiveIndex")
  private getFormsFlowactiveIndex: any;

  @StoreServiceFlowModule.Mutation("setFormsFlowTaskCurrentPage")
  public setFormsFlowTaskCurrentPage: any;
  @StoreServiceFlowModule.Mutation("setFormsFlowTaskId")
  public setFormsFlowTaskId: any;
  @StoreServiceFlowModule.Mutation("setFormsFlowactiveIndex")
  public setFormsFlowactiveIndex: any;
  @StoreServiceFlowModule.Mutation("setFormsFlowTaskLength")
  public setFormsFlowTaskLength: any;

  private tasks: TaskPayload[] = [];
  private fulltasks: TaskPayload[] = [];
  private formId: string = "";
  private submissionId: string = "";
  private formioUrl: string = "";
  private task: TaskPayload = {
  };
  private setGroup = null;
  private userSelected: UserListPayload = {
  };
  public perPage: number = 10;
  private filterList: FilterPayload[] = [];
  private editAssignee: boolean = false;
  private groupList: GroupListPayload[] = [];
  private groupListNames?: string[] = [];
  private groupListItems: string[] = [];
  private userEmail: string = "external";
  private selectedfilterId: string = "";
  private xmlData!: string;
  private payload: Payload = {
    sorting: [] as TaskListSortType[],
    firstResult: 0,
    maxResults: this.perPage,
  };
  private taskHistoryList: TaskHistoryListPayload[] = [];
  private reviewerUsersList: UserListPayload[] = [];
  private selectSearchType: string = "lastName";
  private taskIdValue: string = "";
  private taskId2: string = "";
  // private taskIdWebsocket: string = "";
  private activeUserSearchindex = 1;
  private UserSearchListLabel: UserSearchListLabelPayload[] = SEARCH_USERS_BY;
  private isUserAllowed: boolean = false
  
  checkforTaskID () {
    if (this.getTaskId) {
      this.taskIdValue = this.getTaskId;
    }
    if (!this.getTaskId) {
      const routeparams = this.$route?.query?.taskId;
      if (typeof routeparams === "string" && this.$route.query.taskId) {
        this.taskIdValue = routeparams;
      }
    }
    this.userName = getUserName();
  }

  timedifference(date: Date) {
    return moment(date).fromNow();
  }

  async toggleassignee () {
    this.editAssignee = !this.editAssignee;
    const reviewerList = await CamundaRest.getUsersByMemberGroups(
      this.token,
      this.bpmApiUrl,
      reviewerGroup
    );
    if (reviewerList) {
      this.reviewerUsersList = [];
      reviewerList.data.forEach((user: UserPayload) => {
        this.reviewerUsersList.push(UserListObject(user));
      });
    }
  }

  setSelectedUserSearchBy (searchby: string, index: number) {
    this.selectSearchType = searchby;
    this.activeUserSearchindex = index;
  }

  async onFormSubmitCallback (actionType = "") {
    if (this.task.id !== null) {
      await this.onBPMTaskFormSubmit(this.task.id!, actionType);
      await this.reloadTasks();
    }
  }

  async addGroup () {
    await CamundaRest.createTaskGroupByID(
      this.token,
      this.task.id!,
      this.bpmApiUrl,
      {
        userId: null,
        groupId: this.setGroup,
        type: "candidate",
      }
    ).then(async () => {
      await this.getGroupDetails();
      await this.reloadCurrentTask();
      this.setGroup = null;
    });
  }

  async getGroupDetails () {
    const grouplist = await CamundaRest.getTaskGroupByID(
      this.token,
      this.task.id!,
      this.bpmApiUrl
    );
    this.groupList = grouplist.data;
    this.groupListItems = [];
    this.groupListNames = undefined;
    for (const group of grouplist.data) {
      this.groupListItems.push(group.groupId);
    }
    if (this.groupListItems.length) {
      this.groupListNames = this.groupListItems;
    }
  }

  async deleteGroup (groupid: string) {
    await CamundaRest.deleteTaskGroupByID(
      this.token,
      this.task.id!,
      this.bpmApiUrl,
      {
        groupId: groupid,
        type: "candidate",
      }
    ).then(async () => {
      await this.getGroupDetails();
      await this.reloadCurrentTask();
    });
  }

  async onBPMTaskFormSubmit (taskId: string, actionType: string) {
    let formRequestFormat: FormRequestPayload = {
      variables: {
        formUrl: {
          value: this.formioUrl,
        },
        applicationId: {
          value: this.task.applicationId!,
        },
      },
    };
    if (actionType !== "") {
      const newformRequestFormat: FormRequestActionPayload = Object.assign(
        formRequestFormat.variables,
        {
          action: {
            value: actionType,
          },
        }
      );
      formRequestFormat = {
        variables: newformRequestFormat,
      };
    }

    await CamundaRest.formTaskSubmit(
      this.token,
      taskId,
      formRequestFormat,
      this.bpmApiUrl
    );
  }

  async getBPMTaskDetail (taskId: string) {
    const [taskResult, applicationIdResult] = await Promise.all([
      CamundaRest.getTaskById(this.token, taskId, this.bpmApiUrl),
      CamundaRest.getVariablesByTaskId(this.token, taskId, this.bpmApiUrl),
    ]);
    
    const processResult = await CamundaRest.getProcessDefinitionById(
      this.token,
      taskResult.data.processDefinitionId,
      this.bpmApiUrl
    );
    this.task = taskResult.data;
    this.task.taskProcess = processResult.data.name;
    this.task.applicationId = applicationIdResult.data.applicationId.value;
    await this.getGroupDetails();
  }

  async getTaskFormIODetails (taskId: string) {
    const formResult = await CamundaRest.getVariablesByTaskId(
      this.token,
      taskId,
      this.bpmApiUrl
    );

    if (formResult.data.formUrl?.value) {
      const formUrlPattern = formResult.data.formUrl?.value;
      const {
        formioUrl, formId, submissionId 
      } = getFormDetails(
        formUrlPattern,
        this.formIOApiUrl
      );

      this.formioUrl = formioUrl;
      this.submissionId = submissionId;
      this.formId = formId;
    }
  }

  async getTaskHistoryDetails () {
    this.taskHistoryList = [];

    if (this.task?.applicationId) {
      const applicationHistoryList = await getformHistoryApi(
        this.formsflowaiApiUrl,
        this.task.applicationId,
        this.token
      );
      this.taskHistoryList = applicationHistoryList.applications;
    }
  }

  async getTaskProcessDiagramDetails(processDefinitionId: string) {
    const getProcessResult = await CamundaRest.getProcessDiagramXML(
      this.token,
      processDefinitionId,
      this.bpmApiUrl
    );  
    const processInstanceId = this.task.processInstanceId || '';
    const getActivity = await CamundaRest.getProcessActivity(
      this.token,
      processInstanceId,
      this.bpmApiUrl
    );
    this.xmlData = getProcessResult.data.bpmn20Xml;
    const activityList = getActivity.data.childActivityInstances;
    const div = document.getElementById("canvas");
    if (div) {
      div.innerHTML = "";
    }
    const viewer = new BpmnViewer({
      container: "#canvas",
    });
    await viewer.importXML(this.xmlData);
    viewer.get("canvas").zoom("fit-viewport");
    for(let i: number=0; i<activityList.length; i++){
      viewer.get("canvas").addMarker({
        'id':activityList[i].activityId
      },'highlight');
    }
     
  }

  async getDiagramDetails() {
    await this.getTaskProcessDiagramDetails(this.task.processDefinitionId!);
  }

  oncustomEventCallback = async (customEvent: CustomEventPayload) => {
    switch (customEvent.type) {
    case "reloadTasks":
      await this.reloadTasks();
      break;
    case "reloadCurrentTask":
      await this.reloadCurrentTask();
      break;
    case "actionComplete":
      this.onFormSubmitCallback(customEvent.actionType);
      break;
    default:
      // this call is for formio
      this.$root.$emit(customEvent.type, {
        customEvent
      });
      break;
    }
  };

  async reloadTasks () {
    this.setFormsFlowTaskId("");
    await this.fetchPaginatedTaskList(
      this.selectedfilterId,
      this.payload,
      (this.getFormsFlowTaskCurrentPage - 1) * this.perPage,
      this.perPage
    );
  }

  async reloadCurrentTask () {
    await this.getBPMTaskDetail(this.task.id!);
    await this.fetchPaginatedTaskList(
      this.selectedfilterId,
      this.payload,
      (this.getFormsFlowTaskCurrentPage - 1) * this.perPage,
      this.perPage
    );
  }

  async reloadLHSTaskList () {
    await this.fetchPaginatedTaskList(
      this.selectedfilterId,
      this.payload,
      (this.getFormsFlowTaskCurrentPage - 1) * this.perPage,
      this.perPage,
    );
  }

  async onClaim () {
    await CamundaRest.claim(
      this.token,
      this.task.id!,
      {
        userId: this.userName,
      },
      this.bpmApiUrl
    );
    if (!SocketIOService.isConnected()) {
      await this.getBPMTaskDetail(this.getFormsFlowTaskId);
      await this.reloadLHSTaskList();
    }
  }

  async onUnClaim () {
    await CamundaRest.unclaim(this.token, this.task.id!, this.bpmApiUrl);

    if (!SocketIOService.isConnected()) {
      await this.getBPMTaskDetail(this.getFormsFlowTaskId);
      await this.reloadLHSTaskList();
    }
  }

  async onSetassignee () {
    await CamundaRest.setassignee(
      this.token,
      this.task.id!,
      {
        userId: this.userSelected?.code,
      },
      this.bpmApiUrl
    );
    await this.toggleassignee(); 
    if (!SocketIOService.isConnected()) {
      await this.getBPMTaskDetail(this.getFormsFlowTaskId);
      await this.reloadLHSTaskList();
    }
  }

  async fetchFullTaskList (filterId: string, requestData: Payload) {
    const taskList = await CamundaRest.filterTaskList(
      this.token,
      filterId,
      requestData,
      this.bpmApiUrl
    );
    this.fulltasks = taskList.data;
  }

  async fetchPaginatedTaskList (
    filterId: string,
    requestData: object,
    first: number,
    max: number,
    taskIdToRemove?: string
  ) {
    this.selectedfilterId = filterId;
    const paginatedTaskResults = await CamundaRest.filterTaskListPagination(
      this.token,
      filterId,
      requestData,
      first,
      max,
      this.bpmApiUrl
    );
    const responseData = paginatedTaskResults.data;
    const _embedded = responseData._embedded; // data._embedded.task is where the task list is.
    this.tasks = _embedded.task;
    this.setFormsFlowTaskLength(responseData.count);

    if(taskIdToRemove){
      //if the list has the task with taskIdToRemove remove that task and decrement
      if(this.tasks.find((task: TaskPayload)=>task.id===taskIdToRemove)){
        this.tasks=_embedded.task.filter((task: TaskPayload)=>task.id!==taskIdToRemove);
        this.setFormsFlowTaskLength(responseData.count--); // Count has to be decreased since one task id is removed.
      }
    }
  }

  async onUserSearch (search: string, loading: any) {
    if (search.length) {
      loading(true);
      this.reviewerUsersList = [];
    }

    if (this.selectSearchType === SEARCH_OPTION_TYPE.FIRST_NAME) {
      const firstNameUserList = await CamundaRest.getUsersByFirstNameGroups(
        this.token,
        this.bpmApiUrl,
        search,
        reviewerGroup
      );
      this.reviewerUsersList = [];
      firstNameUserList.data.map((user: UserPayload) => {
        this.reviewerUsersList.push(UserListObject(user));
      });
      loading(false);
    }

    if (this.selectSearchType === SEARCH_OPTION_TYPE.LAST_NAME) {
      const lastNameUserList = await CamundaRest.getUsersByLastNameGroups(
        this.token,
        this.bpmApiUrl,
        search,
        reviewerGroup
      );
      this.reviewerUsersList = [];
      lastNameUserList.data.map((user: UserPayload) => {
        this.reviewerUsersList.push(UserListObject(user));
      });
      loading(false);
    }

    if (this.selectSearchType === SEARCH_OPTION_TYPE.EMAIL) {
      const emailUserList = await CamundaRest.getUsersByEmailGroups(
        this.token,
        this.bpmApiUrl,
        search,
        reviewerGroup
      );
      this.reviewerUsersList = [];
      emailUserList.data.map((user: UserPayload) => {
        this.reviewerUsersList.push(UserListObject(user));
      });
      loading(false);
    }
    loading(false);
  }

  async updateTaskDatedetails (taskId: string, task: TaskPayload) {
    await CamundaRest.updateTasksByID(this.token, taskId, this.bpmApiUrl, task);
    if (!SocketIOService.isConnected()) {
      await this.reloadCurrentTask();
    }
  }

  async updateFollowUpDate () {
    const referenceobject = this.task;
    try {
      if (this.task?.followUp !== null) {
        referenceobject.followUp = getISODateTime(this.task?.followUp);
        await this.updateTaskDatedetails(this.task.id!, referenceobject);
      }
    } catch {
      console.warn("Follow date error"); // eslint-disable-line no-console
    }
  }

  async updateDueDate () {
    const referenceobject = this.task;
    try {
      if (this.task?.due !== null) {
        referenceobject["due"] = getISODateTime(this.task?.due);
        await this.updateTaskDatedetails(this.task.id!, referenceobject);
      }
    } catch {
      console.warn("Due date error"); // eslint-disable-line no-console
    }
  }

  async removeDueDate () {
    const referenceobject = this.task;
    try {
      referenceobject["due"] = null;
      await this.updateTaskDatedetails(this.task.id!, referenceobject);
    } catch {
      console.warn("Due date error"); // eslint-disable-line no-console
    }
  }

  async removeFollowupDate () {
    const referenceobject = this.task;
    try {
      referenceobject["followUp"] = null;
      await this.updateTaskDatedetails(this.task.id!, referenceobject);
    } catch {
      console.warn("Follow up date error"); // eslint-disable-line no-console
    }
  }

  async fetchTaskDetails (taskId: string) {
    await Promise.all([
      this.getBPMTaskDetail(taskId),
      this.getTaskFormIODetails(taskId),
    ]);
    /*await is not used for this promise, as if a user doesn't want to wait for
     the history and process diagram to load */
    Promise.all([
      this.getTaskHistoryDetails(),
      this.getTaskProcessDiagramDetails(this.task.processDefinitionId!),
    ]);
  }

  async findTaskIdDetailsFromURLrouter (
    taskId: string,
    fulltasks: TaskPayload[]
  ) {
    this.task = getTaskFromList(fulltasks, taskId)!;
    this.setFormsFlowTaskId(this.taskIdValue);
    const pos = fulltasks
      .map(function (e: TaskPayload) {
        return e.id;
      })
      .indexOf(this.taskIdValue);
    this.setFormsFlowactiveIndex(pos % this.perPage);
    this.setFormsFlowTaskCurrentPage(Math.floor(pos / this.perPage) + 1);
    this.$root.$emit("update-pagination-currentpage", {
      page: this.getFormsFlowTaskCurrentPage,
    });
  }

  async mounted () {
    Formio.setBaseUrl(this.formIOApiUrl);
    Formio.setProjectUrl(this.formIOApiUrl);
    this.isUserAllowed = isAllowedUser(this.formIOReviewer, this.formIOUserRoles);
    this.setFormsFlowTaskCurrentPage(1);
    this.setFormsFlowTaskId("");
    this.setFormsFlowactiveIndex(NaN);
    this.$root.$on("call-fetchTaskDetails", async (para: any) => {
      this.editAssignee = false;
      this.setFormsFlowTaskId(para.selectedTaskId);
      await this.fetchTaskDetails(this.getFormsFlowTaskId);
    });

    this.$root.$on("call-fetchPaginatedTaskList", async (para: any) => {
      this.selectedfilterId = para.filterId;
      this.payload = para.requestData;
      await this.fetchPaginatedTaskList(
        para.filterId,
        para.requestData,
        para.firstResult,
        para.maxResults
      );
    });

    this.$root.$on("call-managerScreen", (para: any) => {
      this.maximize = para.maxi;
    });

    this.checkProps();
    this.checkforTaskID();
    authenticateFormio(
      this.formIOResourceId,
      this.formIOReviewerId,
      this.formIOReviewer,
      this.userEmail,
      this.formIOUserRoles,
      this.formIOJwtSecret
    );
    const filterListResult = await CamundaRest.filterList(
      this.token,
      this.bpmApiUrl
    );
    this.filterList = sortByPriorityList(filterListResult.data);
    this.selectedfilterId = findFilterKeyOfAllTask(this.filterList, ALL_FILTER);
    await this.reloadLHSTaskList();

    if (SocketIOService.isConnected()) {
      SocketIOService.disconnect();
    }

    SocketIOService.connect(
      this.webSocketEncryptkey,
      (refreshedTaskId: string, eventName: string, error: string) => {
        // this.taskIdWebsocket = refreshedTaskId;
        if (error) {
          this.$bvToast.toast(
            `WebSocket is not connected which will cause
            some inconsistency. System is trying to reconnect,
            if you see this message for more than 10sec,
            please refresh the page and try`,
            {
              title: "Websocket Alert",
              autoHideDelay: 10000,
              variant: "warning",
              solid: true,
            }
          );
        }

        if (eventName === "complete") {
          this.fetchPaginatedTaskList(
            this.selectedfilterId,
            this.payload,
            (this.getFormsFlowTaskCurrentPage - 1) * this.perPage,
            this.perPage,
            refreshedTaskId
          );

          if (this.getFormsFlowTaskId && refreshedTaskId === this.getFormsFlowTaskId)
          {
            this.setFormsFlowTaskId("");
          }
        }
        else {
          if (this.selectedfilterId) {
          /* in case of update event update TaskList if the updated taskId is in
          the current paginated taskList for the user only refresh */
            if(eventName === "update") {
              if(getTaskFromList(this.tasks, refreshedTaskId)) {
                this.reloadLHSTaskList();
              }
            }

            // In case of a new task is being created
            else if (eventName === "create") {
              this.reloadLHSTaskList();
              this.$root.$emit("call-pagination");
            }
            else {
              this.reloadLHSTaskList();
            }
          }
        
          if (this.getFormsFlowTaskId && refreshedTaskId === this.getFormsFlowTaskId)
          {
            //condition to remove the form input when a user is typing in the form by task refresh
            if (this.task.assignee === this.userName) {
              this.getBPMTaskDetail(this.task.id!);
            } 
            // If task is not being claimed, then reload the full task details
            else {
              this.fetchTaskDetails(this.getFormsFlowTaskId);
            }
          }
        }
      }
    );

    //We used two variables - taskId2 and taskIdValue because the router value from gettaskId
    // is always constant,so after calling the required task details from router to use other
    // tasks in list we need to set taskId2 value as ''
    if (this.taskId2 !== this.taskIdValue) {
      this.taskId2 = this.taskIdValue;
    } else {
      this.taskId2 = "";
    }
    if (this.taskId2 !== "") {
      await this.fetchFullTaskList(this.selectedfilterId, this.payload);
      await this.findTaskIdDetailsFromURLrouter(this.taskId2, this.fulltasks);
      await this.fetchTaskDetails(this.taskId2);
      this.taskId2 = "";
    }
  }

  beforeDestroy () {
    SocketIOService.disconnect();
    this.$root.$off("call-fetchTaskDetails");
    this.$root.$off("call-fetchPaginatedTaskList");
    this.$root.$off("call-managerScreen");
    if (this.$store.hasModule("serviceFlowModule")) {
      this.$store.unregisterModule("serviceFlowModule");
    }
    localStorage.removeItem("authToken");
    localStorage.removeItem("UserDetails");
  }
  beforeCreate () {
    localStorage.removeItem("authToken");
    localStorage.removeItem("UserDetails");
    if (!this.$store.hasModule("serviceFlowModule")) {
      this.$store.registerModule("serviceFlowModule", serviceFlowModule);
    }
  }
}
</script>
