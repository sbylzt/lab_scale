<template>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <div v-if="data.islock" class="lock_mask">
    <div class="block"></div>
  <h1>Lab Mixing Recorder</h1>
  <h1>实验室密炼记录</h1>
  <h3>V1.1 Designer:ZLU</h3>
    <div class="password-container">
      <input class="pw" v-model="data.pw" placeholder="Password" type="password"/>
    </div>
    <div class="button-container">
      <button class="btn_pw" @click="data.unlock">Booking出入库</button>
      <button class="btn_pw" @click="data.goToScale">Scale称量</button>
    </div>
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
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  width: 100%;
  font-family: Arial, sans-serif;
}

#app {
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.lock_mask {
  background-color: darkorange;
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
}

.lock_mask h1 {
  margin: 10px 0;
  font-size: clamp(1.5rem, 4vw, 3rem);
  color: white;
}

.lock_mask h3 {
  margin: 10px 0 30px 0;
  font-size: clamp(1rem, 2.5vw, 1.5rem);
  color: white;
}

.password-container {
  width: 100%;
  max-width: 500px;
  margin-bottom: 20px;
}

.pw {
  width: 100%;
  height: 60px;
  padding: 15px;
  font-size: clamp(1rem, 2.5vw, 1.5rem);
  background-color: lightgrey;
  text-align: center;
  border: none;
  border-radius: 8px;
}

.button-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 500px;
  gap: 20px;
}

.btn_pw {
  width: 100%;
  height: 60px;
  background-color: lightgreen;
  border: none;
  border-radius: 8px;
  font-size: clamp(1rem, 2.5vw, 1.5rem);
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn_pw:hover {
  background-color: #90EE90;
}

.block {
  height: 50px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .lock_mask {
    padding: 10px;
  }
  
  .lock_mask h1 {
    font-size: 1.8rem;
  }
  
  .lock_mask h3 {
    font-size: 1.2rem;
  }
  
  .pw, .btn_pw {
    height: 50px;
    font-size: 1rem;
  }
  
  .button-container {
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .lock_mask {
    padding: 5px;
  }
  
  .lock_mask h1 {
    font-size: 1.5rem;
  }
  
  .lock_mask h3 {
    font-size: 1rem;
  }
  
  .pw, .btn_pw {
    height: 45px;
    font-size: 0.9rem;
  }
  
  .button-container {
    gap: 10px;
  }
}

@media (min-width: 1200px) {
  .lock_mask {
    max-width: 800px;
    margin: 0 auto;
  }
}
</style>
