#!/bin/bash

# Script to backup production database
# Usage: ./backup-prod.sh

# Exit on error
set -e

# Set timestamp for backup file
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./data/backups"
BACKUP_FILE="${BACKUP_DIR}/backup-${TIMESTAMP}.sql"

# Overwrite existing staging file backup
STAGING_FILE="${BACKUP_DIR}/backup-for-staging.sql"

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Export database credentials (for prod)
export PGCONTAINER=receipts-db-1
export PGUSER=postgres
export PGDATABASE=receipts_app

# Create backup
if ! docker exec -t ${PGCONTAINER} pg_dump -U ${PGUSER} -d ${PGDATABASE} > "${BACKUP_FILE}"; then
    rm -f "${BACKUP_FILE}"
    exit 1
fi

# Create staging version (overwrite file)
sed 's/OWNER TO postgres/OWNER TO postgresstaging/g' "${BACKUP_FILE}" > "${STAGING_FILE}"

# Clean up exports
unset PGCONTAINER
unset PGUSER
unset PGDATABASE

echo "Production database backup successfully created at ${BACKUP_FILE}"