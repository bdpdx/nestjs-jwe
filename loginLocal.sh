#!/bin/bash

USER="admin@example.com"
PASSWORD="admin123"
HOST="localhost"
PORT=3000

# Step 1: Login and get token
echo "Logging in as $USER..."
ACCESS_TOKEN=$(curl -s -X POST http://$HOST:$PORT/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$USER\", \"password\": \"$PASSWORD\"}" \
    | jq -r '.accessToken')

if [ "$ACCESS_TOKEN" == "null" ] || [ -z "$ACCESS_TOKEN" ]; then
    echo "Login failed or no accessToken returned"
    exit 1
fi

echo "Got access token:"
echo "$ACCESS_TOKEN"

# Step 2: Call /test using the token
echo "Calling /test endpoint"
curl -s http://$HOST:$PORT/test \
    -H "Authorization: Bearer $ACCESS_TOKEN"
echo
