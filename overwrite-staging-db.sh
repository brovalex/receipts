#!/bin/bash

# Script to overwrite staging database with production backup
# Usage: ./overwrite-staging-db.sh

# Exit on error
set -e

# Set backup file path
BACKUP_FILE="./data/backups/backup-for-staging.sql"

# Export database credentials (for staging)
export PGCONTAINER=receipts-db-staging-1
export PGUSER=postgresstaging
export PGDATABASE=receipts_app_staging

# Check if backup file exists
if [ ! -f "${BACKUP_FILE}" ]; then
    echo "Error: Backup file ${BACKUP_FILE} not found"
    exit 1
fi

# Drop and recreate database
docker exec -t ${PGCONTAINER} psql -U ${PGUSER} -d postgres -c "DROP DATABASE ${PGDATABASE};"
docker exec -t ${PGCONTAINER} psql -U ${PGUSER} -d postgres -c "CREATE DATABASE ${PGDATABASE};"

cat ${BACKUP_FILE} | docker exec -i ${PGCONTAINER} psql -U ${PGUSER} -d ${PGDATABASE}

# Clean up exports
unset PGCONTAINER
unset PGUSER
unset PGDATABASE

echo "Staging database successfully restored from backup"
