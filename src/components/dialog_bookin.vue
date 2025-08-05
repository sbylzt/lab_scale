<template>
    <div class="mask">
      <div class="dialog">
        <div class="header">{{ title }}</div>

        <div class="content">
          <div v-if="loading" class="loading">加载中...</div>
          <el-table v-else highlight-current-row :data="data.table_data" stripe
            style="font-size:16px"
            :row-style="{height:'60px'}"
            :header-cell-style="{'text-align':'center'}"
            :cell-style="{padding:'2px','text-align':'center'}"
            @current-change="select_row">

            <el-table-column prop="billno" label="Bill 单号" width="100" />
            <el-table-column prop="recipe" label="ID 配方" width="160" />
            <el-table-column prop="name" label="Name 名称"  />
            <el-table-column prop="status" label="Status 状态" width="110"/>
            <el-table-column prop="creator" label="Creator 发起人" width="130" />
            <el-table-column prop="batch_set" label="Batch Set 目标车数"  width="100"/>
            <el-table-column prop="batch_now" label="Batch Now 目前车数"  width="100"/>
          </el-table>
        </div>
        <div class="footer">
          <button @click="close">取消C</button>
          <button @click="confirm" :disabled="data.isable">确定OK</button>
        </div>
      </div>
    </div>
  </template>
   
  <script>
  /* 
    使用teleport移动至设置元素所在位置
  */
  import { ref, reactive, onMounted } from "vue";
  import httpHelper from '../api/httpHelper';
  export default {
    name:'dialog_bookin',
    props:["title"],  
    emits: ["confirm","close"],
    setup(props, { emit }) {
      let data = reactive({
        table_data: [],
        info: {},
        isable: true,
      });
      let loading = ref(true);

      function loadData() {
        loading.value = true;
        httpHelper.post('/labbook/lab_stock', { 'flag': 'bookin' }, function (res) {
          data.table_data = res.data.data.data;
          loading.value = false;
        });
      }

      function select_row(val) {
        data.info = val;
        data.isable = false;
      }
   
      function close() {
        emit("close");
      }
      function confirm() {
        emit("confirm", data.info);
      }

      onMounted(() => {
        loadData();
      });

      return { data, loading, loadData, close, confirm, select_row };
    },
  };
  </script>
   
  <style scoped>
  .mask {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 99;
  }
  .dialog {
    width: 1000px;
    height:fit-content;
    background-color: #fff;
    border-radius: 10px;
    padding: 20px;
  }
   
  .header {
    text-align: center;
    font-size: 23px;
    font-weight: bold;
  }
   
  .content {
    max-height: 300px;
    overflow: auto;
    margin: 20px 0;
  }
   
  .footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 50px;
  }
   
  .footer > button {
    margin-left: 10px;
    width: 80px;
    height: 30px;
  }

  .loading {
    text-align: center;
    font-size: 18px;
    color: #999;
    padding: 20px;
  }
  </style>