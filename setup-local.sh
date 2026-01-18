#!/bin/bash
# Bash script for Mac/Linux local setup

echo "🚗 Setting up cpool.ai locally..."

# Check Node.js
echo ""
echo "📦 Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✓ Node.js found: $NODE_VERSION"
else
    echo "✗ Node.js not found. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

# Check Go
echo ""
echo "🔧 Checking Go..."
if command -v go &> /dev/null; then
    GO_VERSION=$(go version)
    echo "✓ Go found: $GO_VERSION"
else
    echo "✗ Go not found. Please install Go 1.21+ from https://golang.org"
    exit 1
fi

# Check PostgreSQL
echo ""
echo "🗄️  Checking PostgreSQL..."
if command -v psql &> /dev/null; then
    echo "✓ PostgreSQL found"
else
    echo "⚠ PostgreSQL not found. Make sure PostgreSQL is installed."
    echo "  Install from https://www.postgresql.org/download/"
fi

# Create .env files
echo ""
echo "📝 Creating environment files..."

if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "✓ Created backend/.env"
    echo "  ⚠ Please edit backend/.env with your database credentials"
else
    echo "✓ backend/.env already exists"
fi

if [ ! -f "frontend/.env.local" ]; then
    cp frontend/.env.local.example frontend/.env.local
    echo "✓ Created frontend/.env.local"
else
    echo "✓ frontend/.env.local already exists"
fi

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
if [ $? -eq 0 ]; then
    echo "✓ Frontend dependencies installed"
else
    echo "✗ Failed to install frontend dependencies"
    cd ..
    exit 1
fi
cd ..

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend
go mod download
if [ $? -eq 0 ]; then
    echo "✓ Backend dependencies installed"
else
    echo "✗ Failed to install backend dependencies"
    cd ..
    exit 1
fi
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set up PostgreSQL database:"
echo "   createdb cpool"
echo "   OR: psql -U postgres -c 'CREATE DATABASE cpool;'"
echo ""
echo "2. Update backend/.env with your database credentials"
echo ""
echo "3. Run migrations:"
echo "   cd backend"
echo "   go run cmd/migrate/main.go"
echo ""
echo "4. Start backend (in one terminal):"
echo "   cd backend"
echo "   go run main.go"
echo ""
echo "5. Start frontend (in another terminal):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "6. Open http://localhost:3000"
echo ""
echo "🔐 Default admin login:"
echo "   Email: admin@135"
echo "   Password: admin"
