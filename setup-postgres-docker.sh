#!/bin/bash
# Bash script to setup PostgreSQL with Docker

echo "🐳 Setting up PostgreSQL with Docker..."

# Check if Docker is installed
echo ""
echo "📦 Checking Docker..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo "✓ Docker found: $DOCKER_VERSION"
else
    echo "✗ Docker not found!"
    echo ""
    echo "Please install Docker:"
    echo "1. Download from: https://www.docker.com/products/docker-desktop"
    echo "2. Install Docker Desktop"
    echo "3. Start Docker Desktop"
    echo "4. Run this script again"
    exit 1
fi

# Check if Docker is running
echo ""
echo "🔍 Checking if Docker is running..."
if docker ps &> /dev/null; then
    echo "✓ Docker is running"
else
    echo "✗ Docker is not running!"
    echo "Please start Docker Desktop and try again"
    exit 1
fi

# Check if container already exists
echo ""
echo "🔍 Checking for existing container..."
if docker ps -a --format '{{.Names}}' | grep -q "^cpool-db$"; then
    echo "⚠ Container 'cpool-db' already exists"
    read -p "Do you want to remove and recreate it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Removing existing container..."
        docker stop cpool-db 2>/dev/null
        docker rm cpool-db 2>/dev/null
        echo "✓ Container removed"
    else
        echo "Using existing container..."
        docker start cpool-db 2>/dev/null
        echo "✓ Container started"
        echo ""
        echo "✅ PostgreSQL is ready!"
        echo ""
        echo "📝 Database Details:"
        echo "   Host: localhost"
        echo "   Port: 5432"
        echo "   Database: cpool"
        echo "   Username: postgres"
        echo "   Password: postgres123"
        echo ""
        echo "Update backend/.env with:"
        echo "DATABASE_URL=postgres://postgres:postgres123@localhost:5432/cpool?sslmode=disable"
        exit 0
    fi
fi

# Set password
POSTGRES_PASSWORD="postgres123"
echo ""
echo "🔐 Using password: $POSTGRES_PASSWORD"
echo "   (You can change this in the script if needed)"

# Pull PostgreSQL image if not exists
echo ""
echo "📥 Pulling PostgreSQL image..."
docker pull postgres:14

# Create and start container
echo ""
echo "🚀 Creating PostgreSQL container..."
docker run --name cpool-db \
  -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
  -e POSTGRES_DB=cpool \
  -p 5432:5432 \
  -d postgres:14

if [ $? -eq 0 ]; then
    echo "✓ Container created and started"
else
    echo "✗ Failed to create container"
    exit 1
fi

# Wait for PostgreSQL to be ready
echo ""
echo "⏳ Waiting for PostgreSQL to start..."
max_attempts=30
attempt=0
ready=false

while [ $attempt -lt $max_attempts ] && [ "$ready" = false ]; do
    sleep 2
    attempt=$((attempt + 1))
    if docker exec cpool-db psql -U postgres -d cpool -c "SELECT 1;" &> /dev/null; then
        ready=true
    fi
    echo -n "."
done

echo ""

if [ "$ready" = true ]; then
    echo "✓ PostgreSQL is ready!"
else
    echo "⚠ PostgreSQL might still be starting. Please wait a moment."
fi

# Test connection
echo ""
echo "🔍 Testing database connection..."
if docker exec cpool-db psql -U postgres -d cpool -c "SELECT version();" &> /dev/null; then
    echo "✓ Database connection successful!"
else
    echo "⚠ Connection test failed, but container is running"
fi

# Create .env file if it doesn't exist
echo ""
echo "📝 Updating backend/.env..."
if [ ! -f "backend/.env" ]; then
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        echo "✓ Created backend/.env from template"
    else
        cat > backend/.env << EOF
PORT=8080
DATABASE_URL=postgres://postgres:$POSTGRES_PASSWORD@localhost:5432/cpool?sslmode=disable
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
EOF
        echo "✓ Created backend/.env"
    fi
else
    echo "⚠ backend/.env already exists"
    echo "   Please update DATABASE_URL manually:"
    echo "   DATABASE_URL=postgres://postgres:$POSTGRES_PASSWORD@localhost:5432/cpool?sslmode=disable"
fi

# Update .env file with correct DATABASE_URL
sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=postgres://postgres:$POSTGRES_PASSWORD@localhost:5432/cpool?sslmode=disable|g" backend/.env
rm -f backend/.env.bak
echo "✓ Updated DATABASE_URL in backend/.env"

echo ""
echo "✅ PostgreSQL setup complete!"
echo ""
echo "📋 Database Details:"
echo "   Host: localhost"
echo "   Port: 5432"
echo "   Database: cpool"
echo "   Username: postgres"
echo "   Password: $POSTGRES_PASSWORD"

echo ""
echo "📝 Next Steps:"
echo "1. Run migrations:"
echo "   cd backend"
echo "   go run cmd/migrate/main.go"
echo ""
echo "2. Start backend:"
echo "   cd backend"
echo "   go run main.go"
echo ""
echo "3. Start frontend:"
echo "   cd frontend"
echo "   npm run dev"

echo ""
echo "💡 Useful Commands:"
echo "   Stop database: docker stop cpool-db"
echo "   Start database: docker start cpool-db"
echo "   View logs: docker logs cpool-db"
echo "   Connect to DB: docker exec -it cpool-db psql -U postgres -d cpool"
