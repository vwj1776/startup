#!/bin/bash
set -e

EMAIL="test_$(date +%s)@example.com"

echo "Creating user $EMAIL..."
curl -s -X POST http://localhost:3000/api/auth/create \
  -H "Content-Type: application/json" \
  -c cookie.txt \
  -d "{\"email\": \"$EMAIL\", \"password\": \"password123\"}"

echo "Logging in..."
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -b cookie.txt \
  -d "{\"email\": \"$EMAIL\", \"password\": \"password123\"}"

echo "Adding story..."
curl -s -X POST http://localhost:3000/api/story \
  -H "Content-Type: application/json" \
  -b cookie.txt \
  -d '{"title": "Automated Test Story", "content": "Hello world!"}'

echo "Getting stories..."
curl -s -X GET http://localhost:3000/api/stories -b cookie.txt

echo "Adding comment..."
curl -s -X POST http://localhost:3000/api/comment \
  -H "Content-Type: application/json" \
  -b cookie.txt \
  -d '{"comment": "Great job!"}'

echo "Getting comments..."
curl -s -X GET http://localhost:3000/api/comments -b cookie.txt

echo "Logging out..."
curl -s -X DELETE http://localhost:3000/api/auth/logout -b cookie.txt

echo "Trying unauthorized access (should fail)..."
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/stories | grep 401

echo "✅ All tests passed!"
