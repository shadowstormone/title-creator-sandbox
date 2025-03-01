
-- If you need to recreate the profiles table from scratch,
-- you can drop it, but be careful as this will delete all profile data

-- Comment out these lines if you want to keep the profiles table
-- and just update it instead

-- Удаляем все связанные политики
-- drop policy if exists "Public profiles are viewable by everyone" on profiles;
-- drop policy if exists "Users can insert their own profile" on profiles;
-- drop policy if exists "Users can update own profile" on profiles;

-- Удаляем триггеры
-- drop trigger if exists handle_profiles_updated_at on profiles;
-- drop trigger if exists on_auth_user_created on auth.users;

-- Удаляем функции
-- drop function if exists public.handle_updated_at();
-- drop function if exists public.handle_new_user();

-- Удаляем таблицу
-- drop table if exists public.profiles;
