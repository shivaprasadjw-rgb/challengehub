#!/bin/bash

# Sports India Events - Vercel Deployment Script
# This script prepares the project for deployment on Vercel

echo "🏆 Sports India Events - Production Deployment Package"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Create deployment package
echo "📦 Creating deployment package..."

# Create a clean deployment directory
DEPLOY_DIR="sports-india-events-deployment"
rm -rf $DEPLOY_DIR
mkdir $DEPLOY_DIR

# Copy essential files
echo "📋 Copying essential files..."
cp -r app $DEPLOY_DIR/
cp -r components $DEPLOY_DIR/
cp -r lib $DEPLOY_DIR/
cp -r prisma $DEPLOY_DIR/
cp -r public $DEPLOY_DIR/
cp -r types $DEPLOY_DIR/

# Copy configuration files
cp package.json $DEPLOY_DIR/
cp package-lock.json $DEPLOY_DIR/
cp next.config.js $DEPLOY_DIR/
cp tailwind.config.js $DEPLOY_DIR/
cp tsconfig.json $DEPLOY_DIR/
cp postcss.config.js $DEPLOY_DIR/
cp vercel.json $DEPLOY_DIR/

# Copy documentation
cp README.md $DEPLOY_DIR/
cp DEPLOYMENT.md $DEPLOY_DIR/

# Copy git configuration
cp .gitignore $DEPLOY_DIR/

# Create .env.example
cat > $DEPLOY_DIR/.env.example << 'EOF'
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/sports_india"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Google Maps API (for venue maps)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# Optional: Email service (for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Optional: File upload (for player photos)
UPLOAD_SECRET="your-upload-secret"
EOF

# Create deployment instructions
cat > $DEPLOY_DIR/DEPLOYMENT_INSTRUCTIONS.md << 'EOF'
# 🚀 Quick Deployment Instructions

## 1. GitHub Setup
```bash
# Create a new repository on GitHub
# Clone this package to your local machine
git clone https://github.com/your-username/sports-india-events.git
cd sports-india-events

# Install dependencies
npm install

# Test locally
npm run dev
```

## 2. Vercel Deployment
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_SECRET`: A random secret key
   - `NEXTAUTH_URL`: Your Vercel domain
5. Deploy!

## 3. Database Setup
After deployment, run:
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

## 4. Verify Deployment
- Check health endpoint: `https://your-domain.vercel.app/api/health`
- Test API: `https://your-domain.vercel.app/api/hello`
- Visit homepage: `https://your-domain.vercel.app`

## Repository Size: ✅ Under 25MB
This package is optimized for Vercel deployment with minimal size.
EOF

# Create a simple deployment test script
cat > $DEPLOY_DIR/test-deployment.sh << 'EOF'
#!/bin/bash

echo "🧪 Testing deployment..."

# Test if Next.js is properly configured
if [ -f "package.json" ] && grep -q "next" package.json; then
    echo "✅ Next.js configuration found"
else
    echo "❌ Next.js configuration missing"
    exit 1
fi

# Test if build works
echo "🔨 Testing build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

echo "🎉 Deployment package is ready!"
echo "📁 Package location: $(pwd)"
echo "📊 Repository size: $(du -sh . | cut -f1)"
EOF

chmod +x $DEPLOY_DIR/test-deployment.sh

# Create ZIP package
echo "📦 Creating ZIP package..."
cd $DEPLOY_DIR
zip -r ../sports-india-events-vercel-deployment.zip . -x "*.DS_Store" "*/node_modules/*" "*.next/*"
cd ..

# Calculate package size
PACKAGE_SIZE=$(du -sh sports-india-events-vercel-deployment.zip | cut -f1)
REPO_SIZE=$(du -sh $DEPLOY_DIR | cut -f1)

echo ""
echo "✅ Deployment package created successfully!"
echo "📁 Package directory: $DEPLOY_DIR"
echo "📦 ZIP file: sports-india-events-vercel-deployment.zip"
echo "📊 Package size: $PACKAGE_SIZE"
echo "📊 Repository size: $REPO_SIZE"
echo ""
echo "🚀 Next steps:"
echo "1. Upload to GitHub: git push origin main"
echo "2. Connect to Vercel: Import from GitHub"
echo "3. Configure environment variables"
echo "4. Deploy!"
echo ""
echo "📖 See DEPLOYMENT_INSTRUCTIONS.md for detailed steps"
