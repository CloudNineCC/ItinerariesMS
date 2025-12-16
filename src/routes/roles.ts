import { Router, Request, Response } from 'express'
import { randomUUID } from 'node:crypto'
import { roleSchema } from '../validators.js'
import db from '../db.js'
import type { RowDataPacket, ResultSetHeader } from 'mysql2'

const router = Router({ mergeParams: true })

router.get('/', async (req: Request, res: Response) => {
  try {
    const itineraryId = req.params.id
    const [rows] = await db.query<RowDataPacket[]>(
      'SELECT * FROM itinerary_roles WHERE itinerary_id = ? ORDER BY added_at DESC',
      [itineraryId]
    )
    res.json(rows)
  } catch (error) {
    console.error('Error fetching roles:', error)
    res.status(500).json({ error: 'Failed to fetch roles' })
  }
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const itineraryId = req.params.id
    const parsed = roleSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() })
    }

    const id = parsed.data.id ?? randomUUID()
    const { user_id, role } = parsed.data

    await db.query<ResultSetHeader>(
      'INSERT INTO itinerary_roles (id, itinerary_id, user_id, role) VALUES (?, ?, ?, ?)',
      [id, itineraryId, user_id, role]
    )

    const [result] = await db.query<RowDataPacket[]>(
      'SELECT * FROM itinerary_roles WHERE id = ?',
      [id]
    )
    res.status(201).json(result[0])
  } catch (error) {
    console.error('Error creating role:', error)
    res.status(500).json({ error: 'Failed to create role' })
  }
})

router.delete('/:roleId', async (req: Request, res: Response) => {
  try {
    const [result] = await db.query<ResultSetHeader>(
      'DELETE FROM itinerary_roles WHERE id = ? AND itinerary_id = ?',
      [req.params.roleId, req.params.id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Role not found' })
    }

    res.status(204).send()
  } catch (error) {
    console.error('Error deleting role:', error)
    res.status(500).json({ error: 'Failed to delete role' })
  }
})

export default router
