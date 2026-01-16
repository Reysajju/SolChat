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
  receiver_hash text not null, -- SHA-256 of the receiver's wallet address
  encrypted_content text not null, -- Pure Ciphertext
  nonce text not null, -- Needed for decryption
  ephemeral_public_key text, -- Needed for anonymous decryption
  status text default 'sent', -- 'sent', 'delivered', 'read'
  reactions jsonb default '{}'::jsonb, -- Store emoji reactions
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create index for fast message delivery
create index if not exists idx_messages_receiver_hash on public.messages(receiver_hash);

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

-- SELECT: Users can only see messages sent TO them (via hash).
-- Note: Sender information is now encrypted inside the payload.
create policy "Users can see their incoming messages" 
on public.messages for select 
using ( 
  receiver_hash = current_setting('request.headers', true)::json->>'x-wallet-hash'
);

-- INSERT: Anyone can send a message (Blind Posting)
create policy "Anyone can send messages" 
on public.messages for insert 
with check ( true );

-- UPDATE: Receivers can update message status/reactions
create policy "Receivers can update messages"
on public.messages for update
using (
  receiver_hash = current_setting('request.headers', true)::json->>'x-wallet-hash'
)
with check (
  receiver_hash = current_setting('request.headers', true)::json->>'x-wallet-hash'
);


-- 5. Enable Realtime
alter publication supabase_realtime add table messages;
