-- Script manual para promover a un usuario existente a Admin
-- Cambia 'TU_EMAIL' por el correo del usuario en la tabla auth.users

UPDATE public.profiles
SET role = 'superadmin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'TU_EMAIL_AQUI');
