import { Router, Request, Response } from 'express'
import { randomUUID } from 'node:crypto'
import { commentSchema } from '../validators.js'
import db from '../db.js'
import type { RowDataPacket, ResultSetHeader } from 'mysql2'
import { logActivity } from './activity.js'

const router = Router({ mergeParams: true })

router.get('/', async (req: Request, res: Response) => {
  try {
    const itineraryId = req.params.id
    const [rows] = await db.query<RowDataPacket[]>(
      'SELECT * FROM itinerary_comments WHERE itinerary_id = ? ORDER BY created_at DESC',
      [itineraryId]
    )
    res.json(rows)
  } catch (error) {
    console.error('Error fetching comments:', error)
    res.status(500).json({ error: 'Failed to fetch comments' })
  }
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const itineraryId = req.params.id
    const parsed = commentSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() })
    }

    const id = parsed.data.id ?? randomUUID()
    const user_id = parsed.data.user_id || 'anonymous'
    const { comment_text } = parsed.data

    await db.query<ResultSetHeader>(
      'INSERT INTO itinerary_comments (id, itinerary_id, user_id, text) VALUES (?, ?, ?, ?)',
      [id, itineraryId, user_id, comment_text]
    )

    const [result] = await db.query<RowDataPacket[]>(
      'SELECT * FROM itinerary_comments WHERE id = ?',
      [id]
    )

    await logActivity(itineraryId, user_id, 'comment_added', `Added comment`)

    res.status(201).json(result[0])
  } catch (error) {
    console.error('Error creating comment:', error)
    res.status(500).json({ error: 'Failed to create comment' })
  }
})

router.delete('/:commentId', async (req: Request, res: Response) => {
  try {
    const [result] = await db.query<ResultSetHeader>(
      'DELETE FROM itinerary_comments WHERE id = ? AND itinerary_id = ?',
      [req.params.commentId, req.params.id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Comment not found' })
    }

    res.status(204).send()
  } catch (error) {
    console.error('Error deleting comment:', error)
    res.status(500).json({ error: 'Failed to delete comment' })
  }
})

export default router
