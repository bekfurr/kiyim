-- Kiyim Database Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null check (role in ('seller', 'buyer')),
  full_name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Stores Table
create table if not exists public.stores (
  id uuid default uuid_generate_v4() primary key,
  seller_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  delivery_options text not null check (delivery_options in ('pickup', 'delivery', 'both')),
  location text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Products Table
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references public.stores(id) on delete cascade not null,
  name text not null,
  description text,
  price numeric not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Cart Items Table
create table if not exists public.cart_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  quantity integer not null default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Orders Table
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  buyer_id uuid references public.profiles(id) on delete cascade not null,
  store_id uuid references public.stores(id) on delete cascade not null,
  total_amount numeric not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  delivery_method text not null check (delivery_method in ('pickup', 'delivery')),
  delivery_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Order Items Table
create table if not exists public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete restrict not null,
  quantity integer not null,
  price_at_time numeric not null
);

-- 7. Messages Table (Chat)
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Row Level Security)

-- Profiles
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Stores
alter table public.stores enable row level security;
create policy "Stores are viewable by everyone." on stores for select using (true);
create policy "Sellers can create stores." on stores for insert with check (auth.uid() = seller_id);
create policy "Sellers can update own store." on stores for update using (auth.uid() = seller_id);
create policy "Sellers can delete own store." on stores for delete using (auth.uid() = seller_id);

-- Products
alter table public.products enable row level security;
create policy "Products are viewable by everyone." on products for select using (true);
create policy "Sellers can insert products to their store." on products for insert with check (
  exists (select 1 from stores where stores.id = products.store_id and stores.seller_id = auth.uid())
);
create policy "Sellers can update products in their store." on products for update using (
  exists (select 1 from stores where stores.id = products.store_id and stores.seller_id = auth.uid())
);
create policy "Sellers can delete products in their store." on products for delete using (
  exists (select 1 from stores where stores.id = products.store_id and stores.seller_id = auth.uid())
);

-- Cart Items
alter table public.cart_items enable row level security;
create policy "Users can view own cart." on cart_items for select using (auth.uid() = user_id);
create policy "Users can insert to own cart." on cart_items for insert with check (auth.uid() = user_id);
create policy "Users can update own cart." on cart_items for update using (auth.uid() = user_id);
create policy "Users can delete from own cart." on cart_items for delete using (auth.uid() = user_id);

-- Orders
alter table public.orders enable row level security;
create policy "Buyers can view own orders." on orders for select using (auth.uid() = buyer_id);
create policy "Sellers can view orders for their store." on orders for select using (
  exists (select 1 from stores where stores.id = orders.store_id and stores.seller_id = auth.uid())
);
create policy "Buyers can insert orders." on orders for insert with check (auth.uid() = buyer_id);
create policy "Sellers can update order status." on orders for update using (
  exists (select 1 from stores where stores.id = orders.store_id and stores.seller_id = auth.uid())
);

-- Order Items
alter table public.order_items enable row level security;
create policy "Buyers can view own order items." on order_items for select using (
  exists (select 1 from orders where orders.id = order_items.order_id and orders.buyer_id = auth.uid())
);
create policy "Sellers can view order items for their store." on order_items for select using (
  exists (select 1 from orders join stores on orders.store_id = stores.id where orders.id = order_items.order_id and stores.seller_id = auth.uid())
);
create policy "Buyers can insert order items." on order_items for insert with check (
  exists (select 1 from orders where orders.id = order_items.order_id and orders.buyer_id = auth.uid())
);

-- Messages
alter table public.messages enable row level security;
create policy "Users can view their own messages." on messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Users can send messages." on messages for insert with check (auth.uid() = sender_id);

-- Create a trigger to automatically create a profile when a new user signs up
-- Wait, the user will provide role and full_name during signup via user_metadata, so we can use a trigger.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'role');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Enable Storage for Product Images
insert into storage.buckets (id, name, public) values ('products', 'products', true);

create policy "Product images are publicly accessible." on storage.objects for select using (bucket_id = 'products');
create policy "Authenticated users can upload product images." on storage.objects for insert with check (bucket_id = 'products' and auth.role() = 'authenticated');
create policy "Users can update their own product images." on storage.objects for update using (bucket_id = 'products' and auth.uid() = owner);
create policy "Users can delete their own product images." on storage.objects for delete using (bucket_id = 'products' and auth.uid() = owner);
