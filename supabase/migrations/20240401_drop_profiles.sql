-- Удаляем все связанные политики
drop policy if exists "Public profiles are viewable by everyone" on profiles;
drop policy if exists "Users can insert their own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;

-- Удаляем триггеры
drop trigger if exists handle_profiles_updated_at on profiles;
drop trigger if exists on_auth_user_created on auth.users;

-- Удаляем функции
drop function if exists public.handle_updated_at();
drop function if exists public.handle_new_user();

-- Удаляем таблицу
drop table if exists public.profiles;