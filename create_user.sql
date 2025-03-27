DO $$
DECLARE
  user_id UUID;
BEGIN
  -- Create auth user
  user_id := (auth.admin.create_user(
    email := 'newuser@example.com',
    password := 'password123',
    user_metadata := '{"role": "Student"}'::jsonb
  )).id;

  -- Create public.users record
  INSERT INTO public.users (id, email, role)
  VALUES (user_id, 'newuser@example.com', 'Student');

  -- Create app_users record
  INSERT INTO public.app_users (id, name, email, password, role)
  VALUES (user_id, 'New User', 'newuser@example.com', 'password123', 'Student');

  RAISE NOTICE 'User created successfully with ID: %', user_id;
END $$;
