import axios from 'axios'

const axiosInit = axios.create()
const baseURL = 'http://192.168.200.3:5000' //后台路径（这是一个开源的段子接口）
const httpHelper = {}
// 封装get方法（post类似）
httpHelper.get = (apiUrl, params, succCallback, errCallback) => {
  let headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  }
  let httpUrl = baseURL + apiUrl
  axiosInit.get(httpUrl, params).then(
    (res) => {
      if (succCallback) {
        succCallback(res)
      } else {
        console.log(res)
      }
    },
    (err) => {
      // alert(httpUrl)
      if (errCallback) {
        errCallback(err)
      }
    }
  )
},
httpHelper.post = (apiUrl,params,succCallback, errCallback) => {
  let headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  }
  let httpUrl = baseURL + apiUrl
  console.log(httpUrl)
  axiosInit.post(httpUrl,{data:params}).then(
    (res) => {
      if (succCallback) {
        succCallback(res)
      } else {
        console.log(res)
      }
    },
    (err) => {
      // alert(httpUrl)
      if (errCallback) {
        errCallback(err)
      }
    }
  )
}

export default httpHelper

