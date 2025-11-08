const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('NOMI!')
})

app.listen(port, () => {
  console.log(`Nomi Backend listening on ${port}`)
})