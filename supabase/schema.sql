-- ShopUP / UPTrade starter schema for Supabase
-- Run this in the Supabase SQL editor.

begin;

create extension if not exists pgcrypto;

-- Enums ---------------------------------------------------------------------

do $$
begin
  create type public.listing_status as enum ('draft', 'active', 'sold', 'archived');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.listing_condition as enum ('like_new', 'good', 'fair', 'for_parts');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.order_status as enum ('pending', 'completed', 'cancelled', 'refunded');
exception
  when duplicate_object then null;
end $$;

-- Helpers -------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', null)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Tables --------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  username text unique,
  avatar_url text,
  campus text not null default 'UP Mindanao',
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id bigserial primary key,
  name text not null unique,
  slug text not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  category_id bigint references public.categories (id) on delete set null,
  title text not null,
  description text not null,
  price numeric(12,2) not null check (price >= 0),
  condition public.listing_condition not null,
  status public.listing_status not null default 'draft',
  campus text not null default 'UP Mindanao',
  location text,
  views_count integer not null default 0,
  inquiries_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.favorites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings (id) on delete cascade,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (listing_id, buyer_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  status public.order_status not null default 'pending',
  price numeric(12,2) not null check (price >= 0),
  quantity integer not null default 1 check (quantity > 0),
  total_amount numeric(12,2) generated always as (price * quantity) stored,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders (id) on delete cascade,
  reviewer_id uuid not null references public.profiles (id) on delete cascade,
  reviewee_id uuid not null references public.profiles (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

-- Triggers ------------------------------------------------------------------

drop trigger if exists on_profiles_updated_at on public.profiles;
create trigger on_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists on_categories_updated_at on public.categories;
create trigger on_categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists on_listings_updated_at on public.listings;
create trigger on_listings_updated_at
before update on public.listings
for each row execute function public.set_updated_at();

drop trigger if exists on_conversations_updated_at on public.conversations;
create trigger on_conversations_updated_at
before update on public.conversations
for each row execute function public.set_updated_at();

drop trigger if exists on_orders_updated_at on public.orders;
create trigger on_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Indexes -------------------------------------------------------------------

create index if not exists listings_seller_id_idx on public.listings (seller_id);
create index if not exists listings_category_id_idx on public.listings (category_id);
create index if not exists listings_status_idx on public.listings (status);
create index if not exists listing_images_listing_id_idx on public.listing_images (listing_id);
create index if not exists favorites_listing_id_idx on public.favorites (listing_id);
create index if not exists conversations_listing_id_idx on public.conversations (listing_id);
create index if not exists conversations_buyer_id_idx on public.conversations (buyer_id);
create index if not exists conversations_seller_id_idx on public.conversations (seller_id);
create index if not exists messages_conversation_id_idx on public.messages (conversation_id);
create index if not exists messages_sender_id_idx on public.messages (sender_id);
create index if not exists orders_listing_id_idx on public.orders (listing_id);
create index if not exists orders_buyer_id_idx on public.orders (buyer_id);
create index if not exists orders_seller_id_idx on public.orders (seller_id);
create index if not exists reviews_order_id_idx on public.reviews (order_id);
create index if not exists reviews_reviewee_id_idx on public.reviews (reviewee_id);

-- Seed categories ------------------------------------------------------------

insert into public.categories (name, slug, description) values
  ('Textbooks', 'textbooks', 'Course materials, reviewers, and reference books'),
  ('Electronics', 'electronics', 'Laptops, tablets, calculators, and gadgets'),
  ('Clothing', 'clothing', 'Uniforms, casual wear, and accessories'),
  ('Furniture', 'furniture', 'Furniture, appliances, and room decor'),
  ('School Supplies', 'school-supplies', 'Notebooks, stationery, and art materials'),
  ('Sports Equipment', 'sports-equipment', 'Sports gear and workout equipment'),
  ('Sports', 'sports', 'Sports gear and active lifestyle items'),
  ('Books', 'books', 'Novels, readers, and general books'),
  ('Notes', 'notes', 'Class notes, reviewers, and handouts'),
  ('Other', 'other', 'Miscellaneous items'),
  ('Dorm Essentials', 'dorm-essentials', 'Bed, room, and dorm setup items'),
  ('Sports & Fitness', 'sports-fitness', 'Fitness and recreational equipment'),
  ('Musical Instruments', 'musical-instruments', 'Guitars, keyboards, and accessories'),
  ('Tickets & Vouchers', 'tickets-vouchers', 'Event tickets, gift cards, and coupons')
on conflict (slug) do nothing;

-- Row Level Security ---------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.favorites enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.orders enable row level security;
alter table public.reviews enable row level security;

-- Profiles

drop policy if exists "profiles are publicly readable" on public.profiles;
create policy "profiles are publicly readable"
  on public.profiles for select
  using (true);

drop policy if exists "users can insert their own profile" on public.profiles;
create policy "users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "users can update their own profile" on public.profiles;
create policy "users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Categories

drop policy if exists "categories are publicly readable" on public.categories;
create policy "categories are publicly readable"
  on public.categories for select
  using (true);

-- Listings

drop policy if exists "active listings are publicly readable" on public.listings;
create policy "active listings are publicly readable"
  on public.listings for select
  using (status = 'active' or seller_id = auth.uid());

drop policy if exists "authenticated users can create listings" on public.listings;
create policy "authenticated users can create listings"
  on public.listings for insert
  with check (auth.uid() = seller_id);

drop policy if exists "sellers can update their own listings" on public.listings;
create policy "sellers can update their own listings"
  on public.listings for update
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

drop policy if exists "sellers can delete their own listings" on public.listings;
create policy "sellers can delete their own listings"
  on public.listings for delete
  using (auth.uid() = seller_id);

-- Listing images

drop policy if exists "listing images are publicly readable for active listings" on public.listing_images;
create policy "listing images are publicly readable for active listings"
  on public.listing_images for select
  using (
    exists (
      select 1
      from public.listings l
      where l.id = listing_id
        and (l.status = 'active' or l.seller_id = auth.uid())
    )
  );

drop policy if exists "owners manage listing images" on public.listing_images;
create policy "owners manage listing images"
  on public.listing_images for all
  using (
    exists (
      select 1
      from public.listings l
      where l.id = listing_id
        and l.seller_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.listings l
      where l.id = listing_id
        and l.seller_id = auth.uid()
    )
  );

-- Favorites

drop policy if exists "users can read their own favorites" on public.favorites;
create policy "users can read their own favorites"
  on public.favorites for select
  using (auth.uid() = user_id);

drop policy if exists "users can manage their own favorites" on public.favorites;
create policy "users can manage their own favorites"
  on public.favorites for insert
  with check (auth.uid() = user_id);

drop policy if exists "users can delete their own favorites" on public.favorites;
create policy "users can delete their own favorites"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- Conversations

drop policy if exists "participants can read conversations" on public.conversations;
create policy "participants can read conversations"
  on public.conversations for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

drop policy if exists "participants can create conversations" on public.conversations;
create policy "participants can create conversations"
  on public.conversations for insert
  with check (auth.uid() = buyer_id or auth.uid() = seller_id);

drop policy if exists "participants can update conversations" on public.conversations;
create policy "participants can update conversations"
  on public.conversations for update
  using (auth.uid() = buyer_id or auth.uid() = seller_id)
  with check (auth.uid() = buyer_id or auth.uid() = seller_id);

-- Messages

drop policy if exists "participants can read messages" on public.messages;
create policy "participants can read messages"
  on public.messages for select
  using (
    exists (
      select 1
      from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

drop policy if exists "participants can send messages" on public.messages;
create policy "participants can send messages"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1
      from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

-- Orders

drop policy if exists "buyers and sellers can read orders" on public.orders;
create policy "buyers and sellers can read orders"
  on public.orders for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

drop policy if exists "buyers and sellers can create orders" on public.orders;
create policy "buyers and sellers can create orders"
  on public.orders for insert
  with check (auth.uid() = buyer_id or auth.uid() = seller_id);

drop policy if exists "buyers and sellers can update orders" on public.orders;
create policy "buyers and sellers can update orders"
  on public.orders for update
  using (auth.uid() = buyer_id or auth.uid() = seller_id)
  with check (auth.uid() = buyer_id or auth.uid() = seller_id);

-- Reviews

drop policy if exists "reviews are publicly readable" on public.reviews;
create policy "reviews are publicly readable"
  on public.reviews for select
  using (true);

drop policy if exists "participants can create reviews" on public.reviews;
create policy "participants can create reviews"
  on public.reviews for insert
  with check (auth.uid() = reviewer_id);

drop policy if exists "review authors can update reviews" on public.reviews;
create policy "review authors can update reviews"
  on public.reviews for update
  using (auth.uid() = reviewer_id)
  with check (auth.uid() = reviewer_id);

drop policy if exists "review authors can delete reviews" on public.reviews;
create policy "review authors can delete reviews"
  on public.reviews for delete
  using (auth.uid() = reviewer_id);

commit;
