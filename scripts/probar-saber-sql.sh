#!/usr/bin/env bash
# Prueba la migración de cuentas Saber en un Postgres temporal (no toca ninguna base real).
# Requiere los binarios de PostgreSQL (initdb, pg_ctl, psql).
set -euo pipefail
cd "$(dirname "$0")/.."
BIN=$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | tail -1 || true)
[ -n "$BIN" ] && export PATH="$BIN:$PATH"
D=$(mktemp -d); trap 'pg_ctl -D "$D/data" -m immediate stop >/dev/null 2>&1 || true; rm -rf "$D"' EXIT
chmod 700 "$D"
if [ "$(id -u)" = 0 ]; then
  id postgres >/dev/null 2>&1 || useradd -m postgres
  chown postgres "$D"
  RUN="su postgres -c"
  q() { su postgres -c "export PATH=$PATH; $*"; }
else
  q() { bash -c "$*"; }
fi
q "initdb -D $D/data -A trust >/dev/null"
q "pg_ctl -D $D/data -o \"-k $D -c listen_addresses=''\" -w -l $D/log start >/dev/null"
P="psql -h $D -d postgres -v ON_ERROR_STOP=1 -q"
chmod -R a+rX supabase
q "$P -f supabase/tests/saber-stub-auth.sql"
q "$P -f supabase/migrations/20261023000000_saber_cuentas.sql"
q "$P -f supabase/migrations/20261023000000_saber_cuentas.sql"   # se puede aplicar dos veces
q "$P -f supabase/tests/saber-cuentas.test.sql"
