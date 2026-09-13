create table if not exists public.verifications (
  id uuid primary key default gen_random_uuid(),
  claim_hash text unique not null,
  claim_text text not null,
  input_type text not null check (input_type in ('text', 'audio', 'image')),
  verdict text not null check (verdict in ('True', 'False', 'Misleading', 'Unverified')),
  trust_score integer not null check (trust_score >= 0 and trust_score <= 100),
  response_payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists verifications_created_at_idx
  on public.verifications (created_at desc);

create index if not exists verifications_verdict_idx
  on public.verifications (verdict);
