//axios.js 
import axios from "axios";

// 1.创建axios实例
const axiosInit = axios.create({
  // 设置超时时间
  time:2000
})

// 2.请求拦截器
axiosInit.interceptors.request.use((config) => {
  //在发送之前做点什么
  return config
}, (error) => {
  //对请求错误做点什么
  return error
})

// 3.相应拦截器
axiosInit.interceptors.response.use((response) => {
  return response
})

// 4.导出
export default () => axiosInit
