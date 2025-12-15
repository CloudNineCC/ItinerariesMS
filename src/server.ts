import 'dotenv/config'
import app from './app.js'

const port = process.env.PORT ? Number(process.env.PORT) : 8080
const host = process.env.HOST || '0.0.0.0'

app.listen(port, host, () => {
  console.log(`ms-itineraries listening on http://${host}:${port}`)
})
