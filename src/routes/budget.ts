import { Router, Request, Response } from 'express'
import db from '../db.js'
import type { RowDataPacket } from 'mysql2'

const router = Router({ mergeParams: true })

// GET /itineraries/:id/budget
router.get('/', async (req: Request, res: Response) => {
  try {
    const itineraryId = req.params.id
    const [segments] = await db.query<RowDataPacket[]>(
      'SELECT city_id, start_date, end_date, lodging_class FROM itinerary_segments WHERE itinerary_id = ? ORDER BY sequence_order',
      [itineraryId]
    )

    if (segments.length === 0) {
      return res.json({ total_usd: 0, segments: [], message: 'No segments in itinerary' })
    }

    const PRICING_MS_URL = process.env.PRICING_MS_URL || 'http://localhost:3002'
    
    res.json({
      message: 'Budget calculation requires PricingMS integration',
      pricing_ms_url: PRICING_MS_URL,
      segments: segments.map(s => ({
        city_id: s.city_id,
        start_date: s.start_date,
        end_date: s.end_date,
        lodging_class: s.lodging_class
      }))
    })
  } catch (error) {
    console.error('Error calculating budget:', error)
    res.status(500).json({ error: 'Failed to calculate budget' })
  }
})

export default router
