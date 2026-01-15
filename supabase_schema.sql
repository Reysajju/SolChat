-- SOLCHAT DATABASE SCHEMA (Consolidated)
-- Run this entire script in Supabase SQL Editor to verify/setup the database.

-- 1. Create Users Table
create table if not exists public.users (
  id uuid default gen_random_uuid() primary key,
  wallet_address text unique not null,
  public_encryption_key text not null, -- Stores the X25519 Public Key
  username text unique, -- Optional unique username (lowercase, alphanumeric + underscore)
  is_searchable boolean default true, -- Whether user appears in search results
  created_at timestamp with time zone default timezone('utc'::text, now()),
  
  -- Ensure username is lowercase and valid format
  constraint username_format check (username ~ '^[a-z0-9_]{3,20}$')
);

-- Create index on username for fast lookups
create index if not exists idx_users_username on public.users(username);

-- 2. Create Messages Table
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  sender_wallet text not null,
  receiver_wallet text not null,
  encrypted_content text not null, -- Pure Ciphertext
  nonce text not null, -- Needed for decryption
  status text default 'sent', -- 'sent', 'delivered', 'read'
  reactions jsonb default '{}'::jsonb, -- Store emoji reactions
  file_info jsonb, -- Metadata for file attachments
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Enable Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.messages enable row level security;

-- 4. RLS Policies

-- USERS Table Policies
-- Anyone can see public keys (needed to send messages)
drop policy if exists "Public keys are visible to everyone" on public.users;
create policy "Public keys are visible to everyone" 
on public.users for select 
using (true);

-- Users can register themselves
drop policy if exists "Users can register themselves" on public.users;
create policy "Users can register themselves" 
on public.users for insert 
with check ( true ); 

-- Users can update their own profile
drop policy if exists "Users can update their own profile" on public.users;
create policy "Users can update their own profile" 
on public.users for update
using (
  wallet_address = current_setting('request.headers', true)::json->>'x-wallet-address'
)
with check (
  wallet_address = current_setting('request.headers', true)::json->>'x-wallet-address'
);


-- MESSAGES Table Policies (Strict Security)

-- Drop potential old/conflicting policies
drop policy if exists "Anyone can send a message" on public.messages;
drop policy if exists "Users can see their own messages" on public.messages;
drop policy if exists "Users can update messages involved in" on public.messages;

-- SELECT: Users can only see messages sent TO them or BY them.
create policy "Users can see their own messages" 
on public.messages for select 
using ( 
  (current_setting('request.headers', true)::json->>'x-wallet-address' = receiver_wallet)
  OR
  (current_setting('request.headers', true)::json->>'x-wallet-address' = sender_wallet)
);

-- INSERT: Authenticated users can send messages
create policy "Users can send messages" 
on public.messages for insert 
with check (
    -- Allow insert if sender_wallet matches the authenticated user header
    -- Note: 'check(true)' is also acceptable for MVP but this is stricter
    sender_wallet = current_setting('request.headers', true)::json->>'x-wallet-address'
);

-- UPDATE: Users can update messages they are involved in (e.g. read status, reactions)
create policy "Users can update messages involved in"
on public.messages for update
using (
  sender_wallet = current_setting('request.headers', true)::json->>'x-wallet-address'
  or
  receiver_wallet = current_setting('request.headers', true)::json->>'x-wallet-address'
)
with check (
  sender_wallet = current_setting('request.headers', true)::json->>'x-wallet-address'
  or
  receiver_wallet = current_setting('request.headers', true)::json->>'x-wallet-address'
);


-- 5. Enable Realtime
alter publication supabase_realtime add table messages;


-- 6. RPC Functions

-- Function to get recent chat partners with their public keys
drop function if exists get_chat_partners(text);

create or replace function get_chat_partners(user_wallet text)
returns table (
  wallet_address text,
  username text,
  public_encryption_key text,
  last_msg timestamptz
) 
language plpgsql
security definer
as $$
begin
  return query
  with partners as (
    select 
      case 
        when sender_wallet = user_wallet then receiver_wallet 
        else sender_wallet 
      end as partner_wallet,
      max(created_at) as last_msg_time
    from messages
    where sender_wallet = user_wallet or receiver_wallet = user_wallet
    group by partner_wallet
  )
  select 
    u.wallet_address,
    u.username,
    u.public_encryption_key,
    p.last_msg_time as last_msg
  from partners p
  join users u on u.wallet_address = p.partner_wallet
  order by p.last_msg_time desc;
end;
$$;
