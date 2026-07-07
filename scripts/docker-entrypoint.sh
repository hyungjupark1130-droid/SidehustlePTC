#!/bin/sh
# Runs as root at container start.
# Ensures the uploads directory (default /data/uploads) is writable by the
# nextjs user, then drops privileges and hands off to migrate-and-start.js.
UDIR="${UPLOADS_DIR:-/data/uploads}"
mkdir -p "$UDIR"
chown -R nextjs:nodejs "$UDIR" 2>/dev/null || true
chmod 755 "$UDIR"
exec su-exec nextjs node /app/migrate-and-start.js
