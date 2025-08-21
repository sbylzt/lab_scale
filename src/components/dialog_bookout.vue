<template>
    <teleport to="body">
      <div class="mask">
        <div class="dialog">
          <div class="header">{{ title }}</div>
          <div>
            <el-row>
              <el-form :inline="true" :model="filter" class="demo-form-inline" size="large" style="display: flex; align-items: center; gap: 10px; flex-wrap: nowrap;">
                  <el-form-item label="Recipe 配方" style="margin-bottom: 0; flex: 1; min-width: 120px;">
                      <el-input v-model="filter.rez" placeholder="Number" clearable/>
                  </el-form-item>            
                  <el-form-item label="Name 名称" style="margin-bottom: 0; flex: 1; min-width: 120px;">
                    <el-input v-model="filter.name" clearable/>
                  </el-form-item> 
                  <el-form-item label="Place 库位" style="margin-bottom: 0; flex: 1; min-width: 150px;">
                    <el-cascader 
                      :options="options.place" 
                      v-model="selectedPlace" 
                      clearable 
                      :show-all-levels="true" 
                      style="width: 100%;"
                      @change="handlePlaceChange"
                    />
                  </el-form-item>
                  <el-form-item style="margin-bottom: 0;">
                    <el-button type="success" @click="onsearch" size="large">Query 查询</el-button>  
                  </el-form-item>                  
              </el-form>
          
          </el-row>
          </div>
          <div class="content">
            <div v-if="loading" class="loading">加载中...</div>
            <el-table v-else highlight-current-row :data="data.table_data" stripe
              style="font-size:16px"
              :row-style="{height:'60px'}"
              :header-cell-style="{'text-align':'center'}"
              :cell-style="{padding:'2px','text-align':'center'}"
              @current-change="select_row">

              <el-table-column prop="Recipe" label="Recipe 配方" width="180" />
              <el-table-column prop="Name" label="Name 名称" width="180" />
              <el-table-column prop="QTY" label="QTY 重量" width="180"/>
              <el-table-column prop="Place" label="Place 库位"  />
            </el-table>
          </div>
          <div class="footer">
            <button @click="close">取消</button>
            <button @click="confirm" :disabled="data.isable">确定</button>
          </div>
        </div>
      </div>
    </teleport>
  </template>
   
  <script>
  /* 
    使用teleport移动至设置元素所在位置
  */
  import { ref, reactive, onMounted, nextTick } from "vue";
  import httpHelper from '../api/httpHelper';
  export default {
    name:'dialog_bookout',
    props:["title"],  
    emits: ["confirm","close"],
    setup(props, { emit }) {
      let data=reactive({
        table_data:[],
        info:{},
        isable:true,
      });

      let loading = ref(true);
      let pageSize = ref(20);
      let currentPage = ref(1);
      let total = ref(0);
      let allDataCache = ref([]);

      const options = reactive({
        'place': Array.from({ length: 14 }, (_, i) => {
          const letter = String.fromCharCode(65 + i); // A, B, C, ..., N
          return {
            value: `L${letter}`,
            label: `L${letter}`,
            children: [
              { value: '01', label: '01' },
              { value: '02', label: '02' },
              { value: '03', label: '03' }
            ]
          };
        })
      });

      let filter=reactive({
        rez:'%',
        name:'%',
        place:'%',
      });
      let selectedPlace = ref([]);

      function loadData() {
        loading.value = true;
        
        // 使用延迟加载，避免阻塞UI
        nextTick(() => {
          httpHelper.post('/labbook/lab_stock', {'flag':'bookout','val':filter}, function (res) {
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

      function loadMoreData() {
        if (data.table_data.length >= total.value) return;
        
        currentPage.value++;
        const startIndex = (currentPage.value - 1) * pageSize.value;
        const endIndex = startIndex + pageSize.value;
        
        // 追加数据而不是替换
        const newData = allDataCache.value.slice(startIndex, endIndex);
        data.table_data.push(...newData);
      }

      onMounted(()=>{
        // 延迟加载数据，让对话框先渲染
        setTimeout(() => {
          loadData();
        }, 100);
      })

      function handlePlaceChange(value) {
        // 将数组转换为无斜杠的字符串，例如：["LA", "01"] -> "LA01"
        filter.place = value.length > 0 ? value.join('') : '%';
      }

      function onsearch(){
        data.isable=true;
        currentPage.value = 1; // 重置页码
        loadData();
      }

      function select_row(val){
        data.info=val;
        if(val){data.isable=false;}
      }

      function close() {
        emit("close");
      }
      function confirm() {
        emit("confirm",data.info);
      }
      return { filter,data,loading,close, confirm, options,select_row,onsearch,loadMoreData,pageSize,currentPage,total,selectedPlace,handlePlaceChange};
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