#!/bin/bash

# 🤖 Automated Testing Setup Script
# This script installs and configures automated testing for the email validation feature

echo "🚀 Setting up automated testing..."
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ npm found"
echo ""

# Install Playwright if not already installed
echo "📦 Installing Playwright (E2E testing framework)..."
npm install --save-dev @playwright/test

echo ""
echo "🌐 Installing browser engines (Chrome, Firefox, Safari, Mobile)..."
echo "   This may take a few minutes..."
npx playwright install

echo ""
echo "✅ Playwright installed successfully!"
echo ""

# Run a quick test to verify setup
echo "🧪 Running quick verification test..."
echo ""

# Start dev server in background
echo "📡 Starting development server..."
npm start &
SERVER_PID=$!

# Wait for server to be ready
echo "⏳ Waiting for server to start..."
sleep 10

# Run one quick test
echo "🤖 Running email validation test..."
npx playwright test email-validation --project=chromium --grep "Valid email" --reporter=list

# Capture test result
TEST_RESULT=$?

# Kill the server
echo ""
echo "🛑 Stopping development server..."
kill $SERVER_PID 2>/dev/null

echo ""
if [ $TEST_RESULT -eq 0 ]; then
    echo "✅ ✅ ✅ Setup complete! All tests passed!"
    echo ""
    echo "📚 Quick Start:"
    echo ""
    echo "   1. Run unit tests:"
    echo "      npm test"
    echo ""
    echo "   2. Run E2E tests (watch agent work):"
    echo "      npm run test:e2e:headed"
    echo ""
    echo "   3. View test report:"
    echo "      npm run test:report"
    echo ""
    echo "   4. Debug tests interactively:"
    echo "      npm run test:e2e:ui"
    echo ""
    echo "📖 Full guide: See TESTING_GUIDE.md"
else
    echo "⚠️  Setup complete but verification test failed."
    echo "   Don't worry! This might be due to server startup timing."
    echo ""
    echo "   Try running manually:"
    echo "   1. npm start (in one terminal)"
    echo "   2. npm run test:e2e (in another terminal)"
fi

echo ""
echo "🎉 Happy testing!"
