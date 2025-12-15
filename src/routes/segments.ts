import { Router, Request, Response } from 'express'
import { randomUUID } from 'node:crypto'
import { segmentSchema } from '../validators.js'
import db from '../db.js'
import type { RowDataPacket, ResultSetHeader } from 'mysql2'

const router = Router({ mergeParams: true })

// GET /itineraries/:id/segments
router.get('/', async (req: Request, res: Response) => {
  try {
    const itineraryId = req.params.id
    const [rows] = await db.query<RowDataPacket[]>(
      'SELECT * FROM itinerary_segments WHERE itinerary_id = ? ORDER BY sequence_order',
      [itineraryId]
    )
    res.json(rows)
  } catch (error) {
    console.error('Error fetching segments:', error)
    res.status(500).json({ error: 'Failed to fetch segments' })
  }
})

// POST /itineraries/:id/segments
router.post('/', async (req: Request, res: Response) => {
  try {
    const itineraryId = req.params.id
    const parsed = segmentSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() })
    }

    const id = parsed.data.id ?? randomUUID()
    let { city_id, start_date, end_date, lodging_class, sequence_order, notes } = parsed.data

    if (sequence_order === undefined) {
      const [maxRow] = await db.query<RowDataPacket[]>(
        'SELECT COALESCE(MAX(sequence_order), -1) as max_order FROM itinerary_segments WHERE itinerary_id = ?',
        [itineraryId]
      )
      sequence_order = (maxRow[0].max_order as number) + 1
    }

    await db.query<ResultSetHeader>(
      'INSERT INTO itinerary_segments (id, itinerary_id, city_id, start_date, end_date, lodging_class, sequence_order, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, itineraryId, city_id, start_date, end_date, lodging_class, sequence_order, notes || null]
    )

    const [result] = await db.query<RowDataPacket[]>(
      'SELECT * FROM itinerary_segments WHERE id = ?',
      [id]
    )
    res.status(201).json(result[0])
  } catch (error) {
    console.error('Error creating segment:', error)
    res.status(500).json({ error: 'Failed to create segment' })
  }
})

// DELETE /itineraries/:id/segments/:segmentId
router.delete('/:segmentId', async (req: Request, res: Response) => {
  try {
    const [result] = await db.query<ResultSetHeader>(
      'DELETE FROM itinerary_segments WHERE id = ? AND itinerary_id = ?',
      [req.params.segmentId, req.params.id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Segment not found' })
    }

    res.status(204).send()
  } catch (error) {
    console.error('Error deleting segment:', error)
    res.status(500).json({ error: 'Failed to delete segment' })
  }
})

export default router
