import { Router, Request, Response } from 'express'
import { randomUUID } from 'node:crypto'
import { itinerarySchema } from '../validators.js'
import db from '../db.js'
import type { RowDataPacket, ResultSetHeader } from 'mysql2'
import { publishItineraryEvent } from '../pubsub-client.js'
import { logActivity } from './activity.js'

const router = Router()

router.get('/', async (_req: Request, res: Response) => {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT id, name, owner_user_id, description, status, start_date, end_date,
       created_at, updated_at FROM itineraries ORDER BY created_at DESC`
    )
    res.json(rows)
  } catch (error) {
    console.error('Error fetching itineraries:', error)
    res.status(500).json({ error: 'Failed to fetch itineraries' })
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT id, name, owner_user_id, description, status, start_date, end_date,
       created_at, updated_at FROM itineraries WHERE id = ?`,
      [req.params.id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Itinerary not found' })
    }

    res.json(rows[0])
  } catch (error) {
    console.error('Error fetching itinerary:', error)
    res.status(500).json({ error: 'Failed to fetch itinerary' })
  }
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = itinerarySchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() })
    }

    const id = parsed.data.id ?? randomUUID()
    const { name, owner_user_id, description, status, start_date, end_date } = parsed.data

    await db.query<ResultSetHeader>(
      `INSERT INTO itineraries (id, name, owner_user_id, description, status, start_date, end_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, name, owner_user_id, description || null, status || 'DRAFT', start_date || null, end_date || null]
    )

    const [result] = await db.query<RowDataPacket[]>(
      'SELECT id, name, owner_user_id, description, status, start_date, end_date, created_at, updated_at FROM itineraries WHERE id = ?',
      [id]
    )

    await logActivity(id, owner_user_id, 'created', `Created itinerary: ${name}`)

    await publishItineraryEvent({
      event_type: 'itinerary_created',
      itinerary_id: id,
      owner_user_id: owner_user_id,
      name: name,
      timestamp: new Date().toISOString()
    })

    res.status(201).json(result[0])
  } catch (error) {
    console.error('Error creating itinerary:', error)
    res.status(500).json({ error: 'Failed to create itinerary' })
  }
})

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id

    const [existing] = await db.query<RowDataPacket[]>(
      'SELECT id FROM itineraries WHERE id = ?',
      [id]
    )
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Itinerary not found' })
    }

    const parsed = itinerarySchema.partial().safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() })
    }

    const updates: string[] = []
    const values: any[] = []

    if (parsed.data.name !== undefined) {
      updates.push('name = ?')
      values.push(parsed.data.name)
    }
    if (parsed.data.description !== undefined) {
      updates.push('description = ?')
      values.push(parsed.data.description)
    }
    if (parsed.data.status !== undefined) {
      updates.push('status = ?')
      values.push(parsed.data.status)
    }
    if (parsed.data.start_date !== undefined) {
      updates.push('start_date = ?')
      values.push(parsed.data.start_date)
    }
    if (parsed.data.end_date !== undefined) {
      updates.push('end_date = ?')
      values.push(parsed.data.end_date)
    }

    if (updates.length > 0) {
      values.push(id)
      const query = `UPDATE itineraries SET ${updates.join(', ')} WHERE id = ?`
      await db.query<ResultSetHeader>(query, values)
    }

    const [updated] = await db.query<RowDataPacket[]>(
      'SELECT id, name, owner_user_id, description, status, start_date, end_date, created_at, updated_at FROM itineraries WHERE id = ?',
      [id]
    )
    res.json(updated[0])
  } catch (error) {
    console.error('Error updating itinerary:', error)
    res.status(500).json({ error: 'Failed to update itinerary' })
  }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const [result] = await db.query<ResultSetHeader>(
      'DELETE FROM itineraries WHERE id = ?',
      [req.params.id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Itinerary not found' })
    }

    res.status(204).send()
  } catch (error) {
    console.error('Error deleting itinerary:', error)
    res.status(500).json({ error: 'Failed to delete itinerary' })
  }
})

export default router
