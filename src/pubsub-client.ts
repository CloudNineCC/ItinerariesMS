import { PubSub } from '@google-cloud/pubsub'

const pubsub = new PubSub()
const TOPIC_NAME = process.env.PUBSUB_TOPIC || 'itinerary-events'

export async function publishItineraryEvent(eventData: {
  event_type: string
  itinerary_id: string
  owner_user_id: string
  name: string
  timestamp: string
}) {
  try {
    const topic = pubsub.topic(TOPIC_NAME)
    const messageBuffer = Buffer.from(JSON.stringify(eventData))
    
    await topic.publishMessage({
      data: messageBuffer
    })
    
    console.log(`Published event to ${TOPIC_NAME}:`, eventData)
  } catch (error) {
    // Log error but don't fail the request
    console.error('Failed to publish Pub/Sub event:', error)
  }
}

