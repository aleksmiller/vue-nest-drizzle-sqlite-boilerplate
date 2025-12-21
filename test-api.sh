#!/bin/bash

# Test Backend API Endpoints
# Make sure the server is running: cd server && npm run start:dev

BASE_URL="http://localhost:3000"
COOKIE_JAR="cookies.txt"

echo "🧪 Testing Backend API Endpoints"
echo "=================================="
echo ""

# Clean up cookie jar
rm -f "$COOKIE_JAR"

# Test 1: Register a new user
echo "1️⃣ Testing POST /api/auth/register"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser'$(date +%s)'","email":"test'$(date +%s)'@example.com","password":"testpass123"}' \
  -c "$COOKIE_JAR" \
  -w "\nHTTP_CODE:%{http_code}")

echo "$REGISTER_RESPONSE" | grep -v "HTTP_CODE"
HTTP_CODE=$(echo "$REGISTER_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)

if [ "$HTTP_CODE" = "201" ]; then
  echo "✅ Registration successful"
else
  echo "❌ Registration failed (HTTP $HTTP_CODE)"
fi
echo ""

# Test 2: Login
echo "2️⃣ Testing POST /api/auth/login"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test'$(date +%s)'@example.com","password":"testpass123"}' \
  -c "$COOKIE_JAR" \
  -w "\nHTTP_CODE:%{http_code}")

echo "$LOGIN_RESPONSE" | grep -v "HTTP_CODE"
HTTP_CODE=$(echo "$LOGIN_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Login successful"
else
  echo "❌ Login failed (HTTP $HTTP_CODE)"
  echo "Note: Using a fresh email since we just registered"
fi
echo ""

# Test 3: Get Profile (requires auth)
echo "3️⃣ Testing GET /api/user/profile"
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/api/user/profile" \
  -b "$COOKIE_JAR" \
  -w "\nHTTP_CODE:%{http_code}")

echo "$PROFILE_RESPONSE" | grep -v "HTTP_CODE" | head -5
HTTP_CODE=$(echo "$PROFILE_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Get profile successful"
else
  echo "❌ Get profile failed (HTTP $HTTP_CODE)"
fi
echo ""

# Test 4: Update Profile (requires auth)
echo "4️⃣ Testing PUT /api/user/profile"
UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/user/profile" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","bio":"This is a test bio"}' \
  -b "$COOKIE_JAR" \
  -w "\nHTTP_CODE:%{http_code}")

echo "$UPDATE_RESPONSE" | grep -v "HTTP_CODE"
HTTP_CODE=$(echo "$UPDATE_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Update profile successful"
else
  echo "❌ Update profile failed (HTTP $HTTP_CODE)"
fi
echo ""

# Test 5: Sign Out
echo "5️⃣ Testing POST /api/auth/sign-out"
SIGNOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/sign-out" \
  -b "$COOKIE_JAR" \
  -w "\nHTTP_CODE:%{http_code}")

echo "$SIGNOUT_RESPONSE" | grep -v "HTTP_CODE"
HTTP_CODE=$(echo "$SIGNOUT_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Sign out successful"
else
  echo "❌ Sign out failed (HTTP $HTTP_CODE)"
fi
echo ""

# Clean up
rm -f "$COOKIE_JAR"

echo "=================================="
echo "✅ API Testing Complete"

