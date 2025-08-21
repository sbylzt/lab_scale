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
  import { ref, reactive, onMounted, nextTick } from "vue";
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
      let pageSize = ref(20);
      let currentPage = ref(1);
      let total = ref(0);

      function loadData() {
        loading.value = true;
        
        // 使用延迟加载，避免阻塞UI
        nextTick(() => {
          httpHelper.post('/labbook/lab_stock', { 'flag': 'bookin' }, function (res) {
            if (res.data && res.data.data && res.data.data.data) {
              allDataCache.value = res.data.data.data;
              total.value = allDataCache.value.length;
              
              // 模拟分页加载，只加载当前页数据
              const startIndex = (currentPage.value - 1) * pageSize.value;
              const endIndex = startIndex + pageSize.value;
              data.table_data = allDataCache.value.slice(startIndex, endIndex);
              
              // 延迟100ms后隐藏加载状态，让UI有时间渲染
              setTimeout(() => {
                loading.value = false;
              }, 100);
            } else {
              data.table_data = [];
              allDataCache.value = [];
              total.value = 0;
              loading.value = false;
            }
          }).catch(() => {
            loading.value = false;
            data.table_data = [];
          });
        });
      }

      let allDataCache = ref([]);

      function loadMoreData() {
        if (data.table_data.length >= total.value) return;
        
        currentPage.value++;
        const startIndex = (currentPage.value - 1) * pageSize.value;
        const endIndex = startIndex + pageSize.value;
        
        // 追加数据而不是替换
        const newData = allDataCache.value.slice(startIndex, endIndex);
        data.table_data.push(...newData);
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
        // 延迟加载数据，让对话框先渲染
        setTimeout(() => {
          loadData();
        }, 100);
      });

      return { data, loading, loadData, close, confirm, select_row, loadMoreData };
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