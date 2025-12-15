import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import itinerariesRouter from './routes/itineraries.js'
import segmentsRouter from './routes/segments.js'
import rolesRouter from './routes/roles.js'
import commentsRouter from './routes/comments.js'
import activityRouter from './routes/activity.js'
import budgetRouter from './routes/budget.js'

const app = express()
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ms-itineraries' })
})

app.use('/itineraries', itinerariesRouter)
app.use('/itineraries/:id/segments', segmentsRouter)
app.use('/itineraries/:id/roles', rolesRouter)
app.use('/itineraries/:id/comments', commentsRouter)
app.use('/itineraries/:id/activity', activityRouter)
app.use('/itineraries/:id/budget', budgetRouter)

app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' })
})

export default app
