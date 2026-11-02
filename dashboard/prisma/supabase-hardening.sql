-- Run this once in Supabase SQL Editor.
-- DS Flow uses a direct PostgreSQL connection from the trusted server. Browser
-- roles do not need direct table access through the Supabase Data API.

begin;

alter table public."AuditLog" enable row level security;
alter table public."Product" enable row level security;
alter table public."ProductCard" enable row level security;
alter table public."PromoSection" enable row level security;
alter table public."RateLimit" enable row level security;
alter table public."Site" enable row level security;
alter table public."User" enable row level security;

revoke all privileges on table public."AuditLog" from anon, authenticated;
revoke all privileges on table public."Product" from anon, authenticated;
revoke all privileges on table public."ProductCard" from anon, authenticated;
revoke all privileges on table public."PromoSection" from anon, authenticated;
revoke all privileges on table public."RateLimit" from anon, authenticated;
revoke all privileges on table public."Site" from anon, authenticated;
revoke all privileges on table public."User" from anon, authenticated;

commit;
