<template>
  <div v-if="data.islock" class="lock_mask">
    <div class="block"></div>
  <h1>Lab Mixing Recorder</h1>
  <h1>实验室密炼记录</h1>
  <h3>V1.0 designer:ZLU</h3>
    <div><input class="pw" v-model="data.pw" placeholder="Password" type="password"/></div>
    <button class="btn_pw" @click="data.unlock">Booking出入库</button>
    <button class="btn_pw" @click="data.goToScale">Scale称量</button>
  </div>

  <div id="app" @click="data.isdo">
    <router-view v-if="!data.islock"></router-view>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router'; // 确保正确导入 vue-router
import booking from './components/booking.vue';

export default {
  name: 'App',
  components: { booking },
  setup() {
    const router = useRouter(); // 确保 router 正常使用
    let data = reactive({
      islock: true,
      isscale: false,
      pw: '88556000',
      lock: () => { data.islock = true; data.pw = ''; },
      unlock: () => {
        if (data.pw == '88556000') {
          data.islock = false;
          router.push('/'); // 确保路径与路由配置一致
        } else {
          alert('Wrong Password');
        }
      },
      goToScale:() => {
        if (data.pw == '88556000') {
          data.islock = false;
          data.isscale = true;
          router.push('/scale'); // 确保路径与路由配置一致
        } else {
          alert('Wrong Password');
        }
      },
      isdo: () => {
        data.islock = false;
        data.pw = '';
      }
    });

    return { data };  // 只返回data，移除goToScale
  },
};
</script>
<style>
#app{
  height: 99%;
  position: absolute;
  width: 99%;
}
.pw{
  width: 500px;
  height: 100px;
  margin: 50px;
  background-color: lightgrey;
  text-align: center;

}
.btn_pw{
  width: 500px;
  height: 100px;
  background-color:lightgreen;
  margin: 50px;
}
.block{
  height: 100px;
}
.lock_mask{
  background-color: darkorange;
}
</style>
