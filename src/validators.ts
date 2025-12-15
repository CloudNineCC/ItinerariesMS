import { z } from 'zod'

export const itinerarySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  owner_user_id: z.string().min(1).max(100),
  description: z.string().max(2000).optional().nullable(),
  status: z.enum(['DRAFT', 'PLANNING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).default('DRAFT'),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
})

export const segmentSchema = z.object({
  id: z.string().uuid().optional(),
  city_id: z.string().uuid(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  lodging_class: z.enum(['HOSTEL', 'STANDARD', 'PREMIUM']),
  sequence_order: z.number().int().min(0).optional(),
  notes: z.string().max(1000).optional().nullable(),
})

export const roleSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().min(1).max(100),
  role: z.enum(['OWNER', 'VIEWER', 'EDITOR']),
})

export const commentSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().min(1).max(100).optional(),
  comment_text: z.string().min(1).max(2000),
})
