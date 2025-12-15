export interface Itinerary {
  id: string
  name: string
  owner_user_id: string
  description?: string | null
  status: 'DRAFT' | 'PLANNING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  start_date?: Date | string | null
  end_date?: Date | string | null
  created_at?: Date | string
  updated_at?: Date | string
}

export interface ItinerarySegment {
  id: string
  itinerary_id: string
  city_id: string
  start_date: Date | string
  end_date: Date | string
  lodging_class: 'HOSTEL' | 'STANDARD' | 'PREMIUM'
  sequence_order: number
  notes?: string | null
  created_at?: Date | string
  updated_at?: Date | string
}

export interface ItineraryRole {
  id: string
  itinerary_id: string
  user_id: string
  role: 'OWNER' | 'VIEWER' | 'EDITOR'
  added_at?: Date | string
}

export interface ItineraryComment {
  id: string
  itinerary_id: string
  user_id: string
  comment_text: string
  created_at?: Date | string
}

export interface ItineraryActivity {
  id: string
  itinerary_id: string
  user_id: string
  action_type: string
  entity_type: string
  entity_id?: string | null
  action_details?: string | null
  created_at?: Date | string
}
