#!/bin/bash

USER="admin@example.com"
PASSWORD="admin123"
API_KEY=$(<.ignored/firebase-api-key)
PORT=3000
HOST="localhost"

# Step 1: Login to Firebase
echo "Logging in to Firebase..."
RESPONSE=$(curl -s -X POST "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=$API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$USER\", \"password\":\"$PASSWORD\", \"returnSecureToken\":true}")

ID_TOKEN=$(echo "$RESPONSE" | jq -r '.idToken')

if [ -z "$ID_TOKEN" ] || [ "$ID_TOKEN" == "null" ]; then
    echo "Failed to retrieve Firebase ID token"
    echo "$RESPONSE"
    exit 1
fi

echo "Firebase ID token retrieved."

# Step 2: Call NestJS /auth/login to get JWE token
echo "Requesting JWE token..."
RESPONSE=$(curl -s -X POST http://$HOST:$PORT/auth/login \
  -H "Authorization: Bearer $ID_TOKEN" \
  -H "Content-Type: application/json")
  
ACCESS_TOKEN=$(echo "$RESPONSE" | jq -r '.accessToken')
REFRESH_TOKEN=$(echo "$RESPONSE" | jq -r '.refreshToken')

if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" == "null" ]; then
    echo "Failed to retrieve JWE token"
    exit 1
else
	echo "JWE access token is $ACCESS_TOKEN"
	echo "JWT refresh token is $REFRESH_TOKEN"
fi

echo "JWE token received."

# Step 3: Call /test using JWE token
echo "Calling /test with JWE..."
curl -s http://$HOST:$PORT/test \
  -H "Authorization: Bearer $ACCESS_TOKEN"

echo
