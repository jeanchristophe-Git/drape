-- Script pour définir un utilisateur comme ADMIN
-- Remplacez 'votre-email@example.com' par votre email

-- Option 1: Par email
UPDATE "User"
SET role = 'ADMIN'
WHERE email = 'votre-email@example.com';

-- Option 2: Par ID (si vous connaissez votre user ID)
-- UPDATE "User"
-- SET role = 'ADMIN'
-- WHERE id = 'votre-user-id';

-- Vérifier que ça a fonctionné
SELECT id, email, name, role, "isPremium"
FROM "User"
WHERE role = 'ADMIN';
