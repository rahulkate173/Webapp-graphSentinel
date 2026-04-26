import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import AuthRouter from './routes/auth.routes.js'
import Uploaderouter from './routes/upload.routes.js'
import PricingRouter from './routes/pricing.routes.js'
import SARRouter from './routes/sar.routes.js'
import HistoryRouter from './routes/history.routes.js'
import DashboardRouter from './routes/dashboard.routes.js'

const app = express()

app.use(express.json())
app.use(morgan('dev'))
app.use(cookieParser())

app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174', 
        'http://localhost:4173',
        'https://graph-sentinal.vercel.app',
        'https://webapp-graph-sentinel.vercel.app'
    ],
    credentials: true
}))

app.use('/api/auth', AuthRouter)
app.use('/api/files', Uploaderouter)
app.use('/api/pricing', PricingRouter)
app.use('/api/sar', SARRouter)
app.use('/api/history', HistoryRouter)
app.use('/api/dashboard', DashboardRouter)

export default app