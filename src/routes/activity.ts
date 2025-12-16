import { Router, Request, Response } from 'express'
import { randomUUID } from 'node:crypto'
import db from '../db.js'
import type { RowDataPacket, ResultSetHeader } from 'mysql2'

const router = Router({ mergeParams: true })

export async function logActivity(
  itineraryId: string,
  userId: string,
  action: string,
  details?: string
) {
  try {
    const id = randomUUID()
    await db.query<ResultSetHeader>(
      'INSERT INTO itinerary_activity (id, itinerary_id, user_id, action, details) VALUES (?, ?, ?, ?, ?)',
      [id, itineraryId, userId, action, details || null]
    )
  } catch (error) {
    console.error('Error logging activity:', error)
  }
}

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
