import axios from '@/libs/api.request'

export const login = ({ userName, password }) => {
  const data = {
    username: userName,
    password
  }
  return axios.request({
    url: '/sys/login',
    data,
    method: 'post'
  })
}

export const getUserInfo = (token) => {
  return axios.request({
    url: '/sys/user/info_iviewadmin',
    method: 'get'
  })
}

export const logout = (token) => {
  return axios.request({
    url: '/sys/logout',
    method: 'post'
  })
}
