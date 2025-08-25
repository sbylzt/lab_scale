<template>
  <el-container @click="resetTimer" @mousemove="resetTimer" @keypress="resetTimer">
    <el-aside  width="150px">
      <el-row><button  class="btn1" @click="display.open_dia_bookin">Book In 入库</button></el-row>
      <el-row><button class="btn2" @click="display.open_dia_bookout">Book Out 出库</button></el-row>      
    </el-aside>
    <el-main >
      <sub_bookin v-if="display.sub_bookin" :recipe_info="recipe_info" @close="display.close_sub_bookin"/>
      <sub_bookout v-if="display.sub_bookout" :recipe_info="recipe_info" @close="display.close_sub_bookout"/>
      <dialog_bookin v-if="display.dia_bookin" @confirm="display.confirm_dia_bookin" @close="display.close_dia_bookin" title="Book In"></dialog_bookin>
      <dialog_bookout v-if="display.dia_bookout" @confirm="display.confirm_dia_bookout" @close="display.close_dia_bookout" title="Book Out"></dialog_bookout>
    </el-main>
  </el-container>
  </template>
  
  <script>
  import { ref,reactive,onMounted,onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import dialog_bookin from "./dialog_bookin.vue";
  import dialog_bookout from "./dialog_bookout.vue";
  import sub_bookin from "./sub_bookin.vue";
  import sub_bookout from "./sub_bookout.vue";


  export default{
    name:'booking',
    components:{dialog_bookin,dialog_bookout,sub_bookin,sub_bookout},
    emits:['lock'],
    setup(props,context){
      let recipe_info=ref(null);
      let timer = null;
      const TIMEOUT = 600000; // 10分钟
      const router = useRouter();

      // 重置定时器
      const resetTimer = () => {
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(() => {
          router.push('/'); // 直接跳回首页
          // console.log('Auto locked after 10 minutes');
        }, TIMEOUT);
      };

      onMounted(() => {
        resetTimer(); // 页面加载时启动定时器
      });

      onUnmounted(() => {
        if (timer) {
          clearTimeout(timer); // 清理定时器
        }
      });

      const display=reactive({
        dia_bookin:false,
        dia_bookout:false,
        sub_bookin:false,
        sub_bookout:false,

        open_dia_bookin:()=>{
          display.dia_bookin=true;
          display.sub_bookout=false;
          display.sub_bookin=false;        
        },
        // close_dia_bookin:()=>{display.dia_bookin=false;},
        confirm_dia_bookin:(val)=>{
          recipe_info.value=val;
          display.dia_bookin=false;
          display.dia_bookout=false;
          display.sub_bookout=false;
          display.sub_bookin=true;
        },
        open_dia_bookout:()=>{
          display.dia_bookout=true;
          display.sub_bookout=false;
          display.sub_bookin=false;  
        },
        close_dia_bookout:()=>{display.dia_bookout=false;},
        close_dia_bookin:()=>{display.dia_bookin=false;},
        confirm_dia_bookout:(val)=>{
          recipe_info.value=val;
          display.dia_bookin=false;
          display.dia_bookout=false;
          display.sub_bookin=false;
          display.sub_bookout=true;
        },
        open_sub_bookin:()=>{display.sub_bookin=true;},
        close_sub_bookin:()=>{display.sub_bookin=false;},
        open_sub_bookout:()=>{display.sub_bookout=true;},
        close_sub_bookout:()=>{display.sub_bookout=false;},
      });

      return {display,recipe_info,resetTimer,onMounted}
    },
  }
  </script>
  <style>
  .el-container{
    border: 2px solid #eee;
    height: 100%;
  }
  .el-aside{
    background-color: darkgrey;
  }
  .el-row{
    height: 50%;
    padding: 10px;
  }
  .btn1{
    font-size: larger;
    width: 100%;
    height:100%;
    background-color: lightgreen;
    /* margin: 5px; */
  }
  .btn2{
    font-size: larger;
    background-color:orange;
    height: 100%;
    width: 100%;
    /* margin: 5px; */
  }
  .class1{
    padding: 10px;
  }
  </style>

