#!/bin/sh
# Runs the app as PUID:PGID and makes sure it owns /data. Unraid bind-mounts
# appdata owned by nobody:users (99:100), so the template sets those; the
# default is the image's own node user (1000:1000).
set -e

PUID="${PUID:-1000}"
PGID="${PGID:-1000}"

if [ "$(id -u)" = "0" ]; then
	mkdir -p /data
	chown -R "$PUID:$PGID" /data
	exec setpriv --reuid="$PUID" --regid="$PGID" --clear-groups -- "$@"
fi

exec "$@"
