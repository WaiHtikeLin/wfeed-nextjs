#!/bin/bash

# Setup script for RSS fetch cron job
# This script helps you set up the background job to run every 5 minutes

echo "🔧 RSS Reader - Background Job Setup"
echo "===================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the RSS Reader project root directory"
    exit 1
fi

# Install nodemon for development if not already installed
echo "📦 Installing nodemon for development..."
npm install --save-dev nodemon

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 How to run the background job:"
echo ""
echo "1. Manual run (one-time):"
echo "   npm run fetch-posts"
echo ""
echo "2. Development mode (runs every time you save):"
echo "   npm run fetch-posts:watch"
echo ""
echo "3. Test the API endpoint:"
echo "   curl http://localhost:3000/api/cron/fetch-posts"
echo ""
echo "4. Production cron job (add to your crontab):"
echo "   */5 * * * * cd /path/to/your/project && npm run fetch-posts"
echo ""
echo "📝 For production deployment:"
echo "   • Use a cron service like GitHub Actions, Vercel Cron, or server crontab"
echo "   • Call the API endpoint: GET /api/cron/fetch-posts"
echo "   • Set up monitoring to ensure the job runs successfully"
echo ""
