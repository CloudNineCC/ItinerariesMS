import { Router, Request, Response } from 'express'
import db from '../db.js'
import type { RowDataPacket } from 'mysql2'

const router = Router({ mergeParams: true })

// GET /itineraries/:id/activity
router.get('/', async (req: Request, res: Response) => {
  try {
    const itineraryId = req.params.id
    const [rows] = await db.query<RowDataPacket[]>(
      'SELECT * FROM itinerary_activity WHERE itinerary_id = ? ORDER BY created_at DESC LIMIT 50',
      [itineraryId]
    )
    res.json(rows)
  } catch (error) {
    console.error('Error fetching activity:', error)
    res.status(500).json({ error: 'Failed to fetch activity' })
  }
})

export default router
