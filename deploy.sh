#!/bin/bash

set -e

PROJECT_ID="cloudnine-475221"
REGION="us-central1"
SERVICE_NAME="itineraries-ms"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "Deploying ${SERVICE_NAME} to Cloud Run..."

# Build Docker image
echo "Building Docker image..."
docker build -t ${IMAGE_NAME}:latest .

# Push to Google Container Registry
echo "Pushing image to GCR..."
docker push ${IMAGE_NAME}:latest

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME}:latest \
  --platform managed \
  --region ${REGION} \
  --project ${PROJECT_ID} \
  --allow-unauthenticated \
  --add-cloudsql-instances cloudnine-475221:us-central1:itineraries-db \
  --set-env-vars "DB_HOST=/cloudsql/cloudnine-475221:us-central1:itineraries-db" \
  --set-env-vars "DB_USER=itineraries_user" \
  --set-env-vars "DB_NAME=itineraries_db" \
  --set-secrets "DB_PASSWORD=itineraries-db-password:latest" \
  --port 8080 \
  --max-instances 10 \
  --min-instances 0

echo "✓ ${SERVICE_NAME} deployed successfully!"
gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)'
