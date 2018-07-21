import axios from '@/libs/api.request'

const getRequest = (url, params) => {
  return axios.request({
    method: 'get',
    url: url,
    params: params
  })
}

const postRequest = (url, params) => {
  return axios.request({
    method: 'post',
    url: url,
    data: params,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

const uploadFileRequest = (url, params) => {
  return axios.request({
    method: 'post',
    url: url,
    params: params
  })
}

export default {
  getRequest,
  postRequest,
  uploadFileRequest
}
