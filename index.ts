import express from 'express'

const app = express()
const port = 3000

import getRecommendations from './recommendations.ts'

app.get('/', (req: any, res: { send: (arg0: string) => void }) => {
  res.send('NOMI!')
})

app.get('/recommendations', (req: any, res: { json: (arg0: { id: number; title: string; type: string }[]) => void }) => {
  const recommendations = getRecommendations()
  res.json(recommendations)
})

app.listen(port, () => {
  console.log(`Nomi Backend listening on ${port}`)
})