#!/bin/bash

# Example: Test the API using cURL (generated from Postman)
# Make sure the API is running on http://localhost:5001

echo "=== eLearning Platform API Test ==="
echo ""

# 1. Health Check
echo "1. Testing Health Check..."
curl -s http://localhost:5001/health | python3 -m json.tool
echo ""

# 2. Register User
echo "2. Registering new user..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test'$(date +%s)'@example.com",
    "password": "password123",
    "role": "student"
  }')

echo "$REGISTER_RESPONSE" | python3 -m json.tool

# Extract token
TOKEN=$(echo "$REGISTER_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])" 2>/dev/null)

if [ -z "$TOKEN" ]; then
    echo "Error: Could not get token"
    exit 1
fi

echo ""
echo "Token: $TOKEN"
echo ""

# 3. Get Current User
echo "3. Getting current user info..."
curl -s http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

# 4. Get All Courses
echo "4. Getting all courses..."
curl -s http://localhost:5001/api/courses | python3 -m json.tool
echo ""

echo "=== Test Complete ==="
