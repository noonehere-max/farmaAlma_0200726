-- Migración: tabla de historial de cambios
-- Ejecutar esto en el SQL Editor de Supabase (new query -> run)

create table if not exists historial (
  id bigint generated always as identity primary key,
  created_at timestamp with time zone default now(),
  user_email text not null,
  accion text not null check (accion in ('crear', 'editar', 'eliminar', 'mover')),
  inventario_id text not null,
  producto_nombre text not null,
  cambios jsonb not null default '[]'::jsonb
);

-- Índices útiles
create index if not exists idx_historial_created_at on historial (created_at desc);
create index if not exists idx_historial_inventario on historial (inventario_id);

-- Política básica: permitir lectura/escritura anónima mientras la app usa anon key
-- (Ajustar si se habilita RLS con autenticación por usuario)
alter table historial enable row level security;

create policy if not exists "Allow anonymous select"
  on historial for select
  to anon
  using (true);

create policy if not exists "Allow anonymous insert"
  on historial for insert
  to anon
  with check (true);

create policy if not exists "Allow anonymous delete"
  on historial for delete
  to anon
  using (true);
