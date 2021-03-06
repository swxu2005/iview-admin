import env from './env'

const DEV_URL = process.env.DEV_URL ? process.env.DEV_URL : 'http://localhost:8080/renren-admin/'
const PRO_URL = 'https://produce.com'

export default env === 'development' ? DEV_URL : PRO_URL
