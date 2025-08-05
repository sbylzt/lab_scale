<template>
    <teleport to="body">
      <div class="mask">
        <div class="dialog">
          <div class="header">{{ title }}</div>
          <div>
            <el-row>
              <el-form :inline="true" :model="filter" class="demo-form-inline" size="large">
                  <el-form-item label="Recipe 配方" style="width:25%">
                      <el-input v-model.number="filter.rez" placeholder="Number" clearable/>
                  </el-form-item>            
                  <el-form-item label="Name 名称" style="width:25%">
                    <el-input v-model.number="filter.name"  clearable/>
                  </el-form-item> 
                  <el-form-item label="Place 库位" style="width:25%">
                    <el-cascader :options="options.place" v-model="filter.place" clearable :show-all-levels="true" />
                  </el-form-item>
                  <el-form-item>
                    <el-button  type="success" @click="onsearch" size="large">Query 查询</el-button>  
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
  import { ref,reactive, onMounted } from "vue";
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

      const options=reactive({
        'place':[
            {
            value:'LA',
            label:'LA',
            children:[
                {value:'01',
                label:'01'},
                {value:'02',
                label:'02'},
                {value:'03',
                label:'03'},]},
                {
            value:'LB',
            label:'LB',
            children:[
                {value:'01',
                label:'01'},
                {value:'02',
                label:'02'},
                {value:'03',
                label:'03'},]},
                {
            value:'LC',
            label:'LC',
            children:[
                {value:'01',
                label:'01'},
                {value:'02',
                label:'02'},
                {value:'03',
                label:'03'},]},
                {
            value:'LD',
            label:'LD',
            children:[
                {value:'01',
                label:'01'},
                {value:'02',
                label:'02'},
                {value:'03',
                label:'03'},]},
                {
            value:'LE',
            label:'LE',
            children:[
                {value:'01',
                label:'01'},
                {value:'02',
                label:'02'},
                {value:'03',
                label:'03'},]},
                {
            value:'LF',
            label:'LF',
            children:[
                {value:'01',
                label:'01'},
                {value:'02',
                label:'02'},
                {value:'03',
                label:'03'},]},
                {
            value:'LG',
            label:'LG',
            children:[
                {value:'01',
                label:'01'},
                {value:'02',
                label:'02'},
                {value:'03',
                label:'03'},]},
                {
            value:'LH',
            label:'LH',
            children:[
                {value:'01',
                label:'01'},
                {value:'02',
                label:'02'},
                {value:'03',
                label:'03'},]},
                {
            value:'LI',
            label:'LI',
            children:[
                {value:'01',
                label:'01'},
                {value:'02',
                label:'02'},
                {value:'03',
                label:'03'},]},
                {
            value:'LJ',
            label:'LJ',
            children:[
                {value:'01',
                label:'01'},
                {value:'02',
                label:'02'},
                {value:'03',
                label:'03'},]},
                {
            value:'LK',
            label:'LK',
            children:[
                {value:'01',
                label:'01'},
                {value:'02',
                label:'02'},
                {value:'03',
                label:'03'},]},
                {
            value:'LL',
            label:'LL',
            children:[
                {value:'01',
                label:'01'},
                {value:'02',
                label:'02'},
                {value:'03',
                label:'03'},]},
                {
            value:'LM',
            label:'LM',
            children:[
                {value:'01',
                label:'01'},
                {value:'02',
                label:'02'},
                {value:'03',
                label:'03'},]},
                {
            value:'LN',
            label:'LN',
            children:[
                {value:'01',
                label:'01'},
                {value:'02',
                label:'02'},
                {value:'03',
                label:'03'},]},
        ],
      });

      let filter=reactive({
        rez:'%',
        name:'%',
        place:'%',
      });

      function loadData() {
        loading.value = true;
        httpHelper.post('/labbook/lab_stock', {'flag':'bookout','val':filter}, function (res) {
          data.table_data=res.data.data.data;
          loading.value = false;
        });
      }

      onMounted(()=>{
        loadData();
      })

      function onsearch(){
        data.isable=true;
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
      return { filter,data,loading,close, confirm, options,select_row,onsearch};
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