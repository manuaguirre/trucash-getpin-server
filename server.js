const axios = require('axios')
const express = require('express')
const qs = require('qs');
const parseString = require('xml2js').parseString
const cors = require('cors')

const app = express()
app.use(cors({
  origin: '*'
}))

const port = process.env.PORT || 3000
require("dotenv").config();

app.get('/', (req, res) => {
  return res.send({status: 'running'})
})

app.get('/getpin', async (req, res) => {
  const token = req.query.token

  if ( !token ) {
    return res.status(400).send({error: 'missing token'})
  }
  
  const data = await makeCall('GetPIN', 'post', {token: token})
  const data2 = data.substring(data.indexOf('\n')+1)
  let json;

  parseString(data2, (err, result) => {
    if (err) {
      throw err
    }
    json = result
  })

  let pin = json.ArrayOfString.string[1]
  pin = pin.split(',')[2]

  return res.send({pin: pin})
})

async function makeCall (action, method='get', data) {
  const config = {
    method: method,
    url: process.env.URL + action,
  };

  config.data = qs.stringify({
    'corrId': process.env.CORRID,
    'userid': process.env.USERID,
    'password': process.env.PASSWORD,
    ...data
  })
  try {
    const response = await axios(config)
    const data = response.data
    
    return data
  } catch (err) {
    console.log('received error')
    console.error(err)
    return "got err"
  }

}

app.listen(port, () => {
  console.info('App mode: ' + process.env.NODE_ENV)
  console.info(`App is running on port ${port}`)
})

