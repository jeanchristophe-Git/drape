# 🚀 Guide de Déploiement - DRAPE

Ce guide explique comment déployer DRAPE en production sur Vercel avec toutes les configurations nécessaires.

## 📋 Prérequis

Avant de déployer, assurez-vous d'avoir :
- [x] Compte Vercel (gratuit)
- [x] Compte Supabase avec base de données configurée
- [x] Compte Replicate avec carte de crédit ajoutée
- [x] Compte Stripe avec produit Premium créé
- [x] Repository Git (GitHub, GitLab, ou Bitbucket)

## 🌐 Déploiement sur Vercel

### Étape 1 : Préparer le repository

```bash
# Initialiser git si ce n'est pas déjà fait
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "Initial commit - DRAPE SaaS"

# Créer un repository sur GitHub et le lier
git remote add origin https://github.com/votre-username/drape.git
git branch -M main
git push -u origin main
```

### Étape 2 : Connecter à Vercel

1. Aller sur [vercel.com](https://vercel.com)
2. Cliquer sur **"Add New Project"**
3. Importer votre repository GitHub
4. Configurer le projet :
   - **Framework Preset** : Next.js
   - **Root Directory** : `./` (racine)
   - **Build Command** : `npm run build` (par défaut)
   - **Output Directory** : `.next` (par défaut)

### Étape 3 : Configurer les variables d'environnement

Dans Vercel Dashboard > Settings > Environment Variables, ajouter :

```env
# App
NEXT_PUBLIC_APP_URL=https://votre-domaine.vercel.app
NEXT_PUBLIC_APP_NAME=DRAPE

# Database (Supabase)
DATABASE_URL=postgresql://postgres.kwbkohunxdjfkopoclus:[PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.kwbkohunxdjfkopoclus:[PASSWORD]@aws-1-us-east-2.pooler.supabase.com:5432/postgres

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://kwbkohunxdjfkopoclus.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Replicate AI
REPLICATE_API_TOKEN=r8_...

# Stripe (PRODUCTION)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**⚠️ Important :**
- Utiliser les clés **LIVE** de Stripe en production (sk_live_... et pk_live_...)
- Ne jamais commiter le fichier `.env` dans Git
- Chaque variable doit être ajoutée pour tous les environnements (Production, Preview, Development)

### Étape 4 : Déployer

```bash
# Première méthode : Via Vercel Dashboard
# Cliquer sur "Deploy" dans l'interface

# Deuxième méthode : Via CLI
npm i -g vercel
vercel --prod
```

Le déploiement prend environ 2-3 minutes.

## 🔗 Configuration du domaine personnalisé

### Étape 1 : Ajouter un domaine

1. Dans Vercel Dashboard > Settings > Domains
2. Cliquer sur **"Add"**
3. Entrer votre domaine (ex: drape.app)

### Étape 2 : Configurer le DNS

Ajouter les records suivants chez votre registrar (Namecheap, GoDaddy, etc.) :

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

Attendre 24-48h pour la propagation DNS.

### Étape 3 : Mettre à jour les variables

Une fois le domaine actif, mettre à jour :
```env
NEXT_PUBLIC_APP_URL=https://drape.app
```

Et dans Stripe :
- Webhooks URL : `https://drape.app/api/webhook/stripe`
- Redirect URLs : `https://drape.app/success`

## 🔔 Configuration des Webhooks Stripe

### En production

1. Aller dans [Stripe Dashboard](https://dashboard.stripe.com) > Developers > Webhooks
2. Cliquer sur **"Add endpoint"**
3. Configurer :
   - **Endpoint URL** : `https://votre-domaine.vercel.app/api/webhook/stripe`
   - **Description** : DRAPE Production Webhooks
   - **Events to send** :
     - `checkout.session.completed`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `customer.subscription.deleted`
     - `customer.subscription.updated`
4. Copier le **Signing secret** (whsec_...)
5. L'ajouter dans Vercel > Environment Variables > `STRIPE_WEBHOOK_SECRET`
6. Redéployer l'application

### Tester les webhooks

```bash
# Installer Stripe CLI
stripe login

# Tester un webhook
stripe trigger checkout.session.completed
```

Vérifier les logs dans Stripe Dashboard > Developers > Webhooks > [votre endpoint] > Logs

## 📊 Configuration Supabase pour la production

### 1. Vérifier les politiques RLS (Row Level Security)

Aller dans Supabase Dashboard > Authentication > Policies et créer les politiques suivantes :

**Table `User`** :
```sql
-- Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile" ON "User"
  FOR SELECT USING (auth.uid()::text = id);

-- Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile" ON "User"
  FOR UPDATE USING (auth.uid()::text = id);
```

**Table `TryOn`** :
```sql
-- Les utilisateurs peuvent voir leurs propres try-ons
CREATE POLICY "Users can view own try-ons" ON "TryOn"
  FOR SELECT USING (auth.uid()::text = "userId");

-- Les utilisateurs peuvent créer leurs propres try-ons
CREATE POLICY "Users can create try-ons" ON "TryOn"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");
```

### 2. Configurer le bucket Storage

1. Aller dans Storage > drape-images
2. S'assurer qu'il est **public**
3. Configurer les politiques :

```sql
-- Autoriser l'upload pour les utilisateurs authentifiés
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'drape-images');

-- Autoriser la lecture publique
CREATE POLICY "Public can read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'drape-images');
```

### 3. Configurer l'authentification

Dans Supabase Dashboard > Authentication > Settings :
- **Site URL** : `https://votre-domaine.vercel.app`
- **Redirect URLs** :
  - `https://votre-domaine.vercel.app/auth/callback`
  - `https://votre-domaine.vercel.app/success`

## 🔐 Sécurité et Bonnes Pratiques

### Variables d'environnement

- ✅ Toujours utiliser les clés **LIVE** Stripe en production
- ✅ Ne jamais exposer `SUPABASE_SERVICE_ROLE_KEY` côté client
- ✅ Vérifier que `.env` est dans `.gitignore`

### Rate Limiting

Le rate limiting est déjà implémenté avec un cooldown de 30 secondes. Pour ajouter une protection supplémentaire :

1. Créer un compte Upstash Redis
2. Ajouter les variables :
```env
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```
3. Le rate limiter utilisera automatiquement Redis

### Monitoring

**Vercel Analytics** (recommandé) :
1. Aller dans Vercel Dashboard > Analytics
2. Activer Analytics (gratuit pour 100k événements/mois)

**Sentry** (optionnel pour error tracking) :
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

## 📈 Optimisations de Performance

### Images Next.js

Les images sont déjà optimisées via `next/image`. Configurer les domaines autorisés dans `next.config.js` :

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
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
}

module.exports = nextConfig
```

### Caching

Vercel met automatiquement en cache :
- Pages statiques (landing, pricing)
- Images optimisées
- Assets (.js, .css)

Les routes API sont dynamiques et ne sont pas mises en cache.

## 🧪 Tests avant la mise en production

### Checklist de tests

- [ ] Inscription d'un nouvel utilisateur
- [ ] Connexion avec un utilisateur existant
- [ ] Upload de 2 photos (personne + vêtement)
- [ ] Génération d'un try-on (attendre ~18 secondes)
- [ ] Vérification du résultat avec slider
- [ ] Téléchargement de l'image (avec watermark pour FREE)
- [ ] Épuisement du quota FREE (2 essais)
- [ ] Passage à Premium via Stripe
- [ ] Vérification de l'abonnement dans Settings
- [ ] Génération sans watermark (Premium)
- [ ] Accès au Stripe Customer Portal
- [ ] Annulation de l'abonnement
- [ ] Webhooks reçus et traités correctement

### Tests de charge

Pour tester avec plusieurs utilisateurs simultanés :

```bash
# Installer k6
brew install k6  # macOS
# ou
choco install k6  # Windows

# Créer un script de test load-test.js
# Exécuter
k6 run load-test.js
```

## 🔄 Mises à jour et CI/CD

### Déploiements automatiques

Vercel déploie automatiquement :
- **Production** : À chaque push sur `main`
- **Preview** : À chaque pull request

### Migration de base de données

Pour les futures migrations Prisma :

```bash
# En local, créer une migration
npx prisma migrate dev --name nom_migration

# Commit et push
git add prisma/migrations
git commit -m "Add migration: nom_migration"
git push

# Vercel exécutera automatiquement : npx prisma generate
```

**⚠️ Important** : Les migrations automatiques ne sont pas appliquées par défaut. Pour les appliquer en production, ajouter dans `package.json` :

```json
{
  "scripts": {
    "build": "prisma generate && prisma db push && next build"
  }
}
```

## 📞 Support et Logs

### Consulter les logs

**Vercel** :
- Dashboard > Deployments > [votre déploiement] > Logs

**Supabase** :
- Dashboard > Logs > API Logs

**Stripe** :
- Dashboard > Developers > Logs

### En cas de problème

1. Vérifier les logs Vercel pour les erreurs serveur
2. Vérifier la console navigateur pour les erreurs client
3. Tester les webhooks Stripe dans le Dashboard
4. Vérifier que toutes les variables d'environnement sont configurées
5. Vérifier que la base de données est accessible (ping Supabase)

## 🎉 Félicitations !

Votre application DRAPE est maintenant en production !

**Prochaines étapes** :
- Partager le lien avec vos premiers utilisateurs
- Monitorer les conversions FREE → PREMIUM
- Analyser les métriques Vercel Analytics
- Optimiser le funnel de conversion
- Ajouter des fonctionnalités basées sur les retours utilisateurs

---

**Ressources utiles** :
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Stripe Production Checklist](https://stripe.com/docs/development/checklist)
- [Supabase Production](https://supabase.com/docs/guides/platform/going-into-prod)
