# 🔧 Guide de Dépannage - DRAPE

Ce document liste les erreurs courantes et leurs solutions.

## 🚨 Erreurs Courantes

### 1. Erreur : "Module not found: Can't resolve '@supabase/ssr'"

**Cause** : Dépendance manquante dans node_modules

**Solution** :
```bash
npm install @supabase/ssr
```

Ou réinstaller toutes les dépendances :
```bash
rm -rf node_modules package-lock.json
npm install
```

---

### 2. Erreur : "Cannot apply unknown utility class `border-border`"

**Cause** : Configuration Tailwind CSS incompatible (v3 vs v4)

**Solution** :
Vérifier que vous avez bien :
- `tailwind.config.ts` avec la configuration complète
- `app/globals.css` utilisant `@tailwind base;` (pas `@import "tailwindcss";`)
- `tailwindcss@^3.4.0` dans package.json (pas v4)

Fichiers corrigés :
```bash
# tailwind.config.ts créé avec la config shadcn/ui
# postcss.config.mjs mis à jour
# globals.css utilise @tailwind au lieu de @import
```

---

### 3. Erreur : "Prisma Client not found"

**Cause** : Client Prisma non généré après installation

**Solution** :
```bash
npx prisma generate
```

Le script `postinstall` dans package.json devrait le faire automatiquement :
```json
"postinstall": "prisma generate"
```

---

### 4. Erreur : "Environment variable not found: DATABASE_URL"

**Cause** : Fichier `.env` manquant ou mal configuré

**Solution** :
1. Vérifier que le fichier `.env` existe à la racine
2. Vérifier les variables :
```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

**Note** : Prisma CLI lit `.env`, pas `.env.local` (qui est pour Next.js)

---

### 5. Erreur : "Authentication failed for user postgres"

**Cause** : Mauvais mot de passe ou mauvaise région dans l'URL de connexion

**Solution** :
Vérifier le format correct :
```env
# Pooler (runtime) - port 6543
DATABASE_URL="postgresql://postgres.PROJECT:[PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct (migrations) - port 5432
DIRECT_URL="postgresql://postgres.PROJECT:[PASSWORD]@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
```

**Important** :
- Région correcte : `us-east-2` (pas eu-central-1)
- Même mot de passe pour les deux URLs
- Format : `postgres.PROJECT:PASSWORD@...`

---

### 6. Erreur : "Bucket not found" ou "Storage error"

**Cause** : Bucket Supabase Storage non créé ou pas public

**Solution** :
1. Aller dans Supabase Dashboard > Storage
2. Créer le bucket `drape-images`
3. Le rendre **public** :
   - Cliquer sur le bucket
   - Configuration > Make public

---

### 7. Erreur : "Insufficient credits" (Replicate)

**Cause** : Pas de carte de crédit ajoutée sur Replicate

**Solution** :
1. Aller sur [replicate.com/account/billing](https://replicate.com/account/billing)
2. Ajouter une carte de crédit
3. Replicate facture à l'usage ($0.024 par génération)

---

### 8. Erreur : "Stripe webhook signature verification failed"

**Cause** : Mauvais secret webhook ou requête non signée

**Solution en développement** :
```bash
# Utiliser Stripe CLI
stripe listen --forward-to localhost:3000/api/webhook/stripe

# Copier le webhook secret (whsec_...) dans .env
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Solution en production** :
1. Aller dans Stripe Dashboard > Developers > Webhooks
2. Vérifier que l'endpoint existe : `https://votre-domaine.com/api/webhook/stripe`
3. Copier le Signing secret dans les variables d'environnement Vercel

---

### 9. Erreur : "NextAuth callback URL mismatch"

**Cause** : URL de callback non configurée dans Supabase

**Solution** :
1. Aller dans Supabase Dashboard > Authentication > URL Configuration
2. Ajouter dans **Redirect URLs** :
   - `http://localhost:3000/auth/callback` (dev)
   - `https://votre-domaine.com/auth/callback` (prod)
3. Définir **Site URL** :
   - `http://localhost:3000` (dev)
   - `https://votre-domaine.com` (prod)

---

### 10. Erreur : "Rate limit exceeded"

**Cause** : Trop de requêtes en 30 secondes (cooldown)

**Solution** :
- C'est normal, attendez 30 secondes entre les générations
- Pour désactiver en dev, commenter le check dans `app/api/tryon/route.ts` :
```typescript
// const rateLimitResult = await checkRateLimit(userId);
// if (!rateLimitResult.success) {
//   return NextResponse.json(...)
// }
```

**⚠️ Ne jamais désactiver en production !**

---

### 11. Erreur : "Image optimization failed"

**Cause** : Domaine d'image non autorisé dans next.config.ts

**Solution** :
Ajouter le domaine dans `next.config.ts` :
```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kwbkohunxdjfkopoclus.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'replicate.delivery',
      },
    ],
  },
};
```

---

### 12. Build Error : "Type error in components"

**Cause** : Problèmes de types TypeScript

**Solution** :
```bash
# Vérifier les types
npm run lint

# Régénérer les types Prisma
npx prisma generate

# En dernier recours, supprimer le cache
rm -rf .next
npm run build
```

---

### 13. Erreur : "CORS error" lors de l'upload d'images

**Cause** : Politique CORS Supabase Storage mal configurée

**Solution** :
1. Aller dans Supabase Dashboard > Storage > drape-images
2. Configuration > CORS
3. Ajouter votre domaine :
```json
[
  {
    "allowedOrigins": ["http://localhost:3000", "https://votre-domaine.com"],
    "allowedMethods": ["GET", "POST", "PUT", "DELETE"],
    "allowedHeaders": ["*"]
  }
]
```

---

### 14. Erreur : "Cannot read properties of null (reading 'user')"

**Cause** : Utilisateur non authentifié tentant d'accéder à une page protégée

**Solution** :
Le middleware dans `middleware.ts` devrait rediriger vers `/auth/signin`.

Vérifier que vous avez bien :
```typescript
// middleware.ts
export const config = {
  matcher: [
    '/tryon/:path*',
    '/history/:path*',
    '/settings/:path*',
    '/result/:path*',
  ],
};
```

---

### 15. npm install très lent / timeout

**Cause** : Connexion réseau lente ou registre npm surchargé

**Solutions** :
```bash
# Vider le cache npm
npm cache clean --force

# Utiliser un autre registre (Cloudflare)
npm config set registry https://registry.npmmirror.com

# Ou augmenter le timeout
npm config set fetch-timeout 600000

# Puis réinstaller
npm install
```

---

## 🔍 Commandes de Diagnostic

### Vérifier la configuration
```bash
# Versions installées
node --version
npm --version

# Variables d'environnement chargées
npm run env

# État de la base de données
npx prisma db pull
npx prisma studio
```

### Logs et Debugging

**Développement** :
```bash
# Logs détaillés Next.js
npm run dev -- --turbo

# Logs Prisma
DEBUG="prisma:*" npm run dev
```

**Production (Vercel)** :
- Dashboard > Deployments > [votre déploiement] > Logs
- Runtime Logs pour les erreurs serveur
- Build Logs pour les erreurs de compilation

**Supabase** :
- Dashboard > Logs > API Logs

**Stripe** :
- Dashboard > Developers > Logs
- Dashboard > Developers > Webhooks > [endpoint] > Logs

---

## 📞 Support

Si aucune solution ne fonctionne :

1. Vérifier les logs détaillés (browser console + terminal)
2. Chercher l'erreur exacte sur Google/Stack Overflow
3. Consulter la documentation officielle :
   - [Next.js Docs](https://nextjs.org/docs)
   - [Prisma Docs](https://www.prisma.io/docs)
   - [Supabase Docs](https://supabase.com/docs)
   - [Stripe Docs](https://stripe.com/docs)
   - [Replicate Docs](https://replicate.com/docs)

---

**Dernière mise à jour** : 2025-10-18
