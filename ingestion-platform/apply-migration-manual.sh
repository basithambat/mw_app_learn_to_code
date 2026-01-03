#!/bin/bash

# Manual Migration Application Script
# Applies the comment system migration using psql

set -e

echo "🚀 Applying comment system migration manually..."

cd "$(dirname "$0")"

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    exit 1
fi

# Load DATABASE_URL from .env
export $(grep -v '^#' .env | xargs)

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL not found in .env"
    exit 1
fi

MIGRATION_FILE="prisma/migrations/manual_migration.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "📋 Applying migration from: $MIGRATION_FILE"
echo "📊 Database: ${DATABASE_URL%%@*}" # Show only user@host part for security

# Try to apply migration
if command -v psql &> /dev/null; then
    echo "✅ psql found, applying migration..."
    psql "$DATABASE_URL" -f "$MIGRATION_FILE"
    echo ""
    echo "✅ Migration applied successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Run: npx prisma generate"
    echo "2. Run: npm run build"
    echo "3. Test: npm run dev"
else
    echo "⚠️  psql not found in PATH"
    echo ""
    echo "Please apply the migration manually:"
    echo "  psql \"\$DATABASE_URL\" -f $MIGRATION_FILE"
    echo ""
    echo "Or use your database client to run the SQL in:"
    echo "  $MIGRATION_FILE"
fi
