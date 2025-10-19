# 💳 Configuration Stripe - Guide Rapide

## Étape 1 : Créer un compte Stripe

1. Allez sur **https://dashboard.stripe.com/register**
2. Créez votre compte
3. **Activez le mode TEST** (toggle en haut à droite du dashboard)

---

## Étape 2 : Récupérer vos clés API

1. Dans le dashboard Stripe, allez dans **Developers** > **API keys**
2. Vous verrez 2 clés :

### Secret Key
- Cliquez sur **Reveal test key**
- Copiez la clé qui commence par `sk_test_...`
- Collez dans `.env.local` : `STRIPE_SECRET_KEY=sk_test_...`

### Publishable Key
- Visible directement
- Commence par `pk_test_...`
- Collez dans `.env.local` : `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...`

---

## Étape 3 : Créer le produit Premium

1. Dans le dashboard, allez dans **Products**
2. Cliquez **+ Add product**
3. Remplissez le formulaire :

```
Name: DRAPE Premium
Description: Unlimited virtual try-ons with high resolution

Pricing model: Standard pricing
Price: $9.99
Billing period: Monthly (recurring every 1 month)
Currency: USD
```

4. Cliquez **Save product**
5. Sur la page du produit, dans la section **Pricing**, vous verrez le **Price ID**
6. Copiez le Price ID (commence par `price_...`)
7. Collez dans `.env.local` : `NEXT_PUBLIC_STRIPE_PRICE_ID=price_...`

---

## Étape 4 : Configurer le Webhook (pour le dev local)

### Option A : Stripe CLI (Recommandé pour le dev local)

1. **Installez Stripe CLI**
   - Windows : https://github.com/stripe/stripe-cli/releases
   - Mac : `brew install stripe/stripe-cli/stripe`

2. **Authentifiez-vous**
   ```bash
   stripe login
   ```

3. **Lancez le tunnel webhook**
   ```bash
   stripe listen --forward-to localhost:3002/api/webhook/stripe
   ```

4. La commande affichera un webhook signing secret (`whsec_...`)
5. Copiez-le et collez dans `.env.local` : `STRIPE_WEBHOOK_SECRET=whsec_...`

6. **Laissez cette commande tourner** dans un terminal pendant que vous développez

### Option B : Webhook en production (plus tard)

Quand vous déployez en production :

1. Allez dans **Developers** > **Webhooks**
2. Cliquez **Add endpoint**
3. URL : `https://votre-domaine.com/api/webhook/stripe`
4. Sélectionnez ces événements :
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Cliquez **Add endpoint**
6. Copiez le **Signing secret** et mettez-le dans vos variables d'environnement de production

---

## Étape 5 : Vérifier la configuration

Votre `.env.local` devrait ressembler à ça :

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_51AbCdE...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51AbCdE...
NEXT_PUBLIC_STRIPE_PRICE_ID=price_1AbCdE...
STRIPE_WEBHOOK_SECRET=whsec_AbCdE... (si vous utilisez Stripe CLI)
```

---

## Étape 6 : Redémarrer le serveur

```bash
npm run dev
```

---

## ✅ Tester que tout fonctionne

1. Allez sur `http://localhost:3002/pricing`
2. Cliquez sur **Get Started** pour Premium
3. Utilisez une carte de test Stripe :
   - **Numéro** : `4242 4242 4242 4242`
   - **Date** : N'importe quelle date future (ex: 12/34)
   - **CVC** : N'importe quel 3 chiffres (ex: 123)
   - **ZIP** : N'importe quel code postal (ex: 12345)

4. Complétez le paiement
5. Vous devriez être redirigé vers `/success`
6. Vérifiez votre profil - vous devriez être Premium

---

## 🔍 Debugging

### Voir les logs Stripe

Dans le dashboard Stripe :
- **Developers** > **Events** : voir tous les événements
- **Developers** > **Webhooks** : voir les webhooks reçus
- **Payments** > **All payments** : voir tous les paiements

### Voir les logs dans votre terminal

Si vous utilisez Stripe CLI :
```bash
stripe listen --forward-to localhost:3002/api/webhook/stripe
```

Vous verrez tous les événements en temps réel.

---

## 🚀 Passer en production

Quand vous êtes prêt pour la production :

1. Désactivez le **mode test** dans Stripe
2. Créez le même produit Premium en mode **live**
3. Récupérez les nouvelles clés API (mode live) :
   - `sk_live_...`
   - `pk_live_...`
   - `price_live_...`
4. Configurez un webhook en production
5. Mettez à jour vos variables d'environnement de production

⚠️ **Important** : Ne JAMAIS commit vos clés Stripe dans Git !

---

## 📚 Ressources

- [Stripe Dashboard](https://dashboard.stripe.com)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Cartes de test](https://stripe.com/docs/testing)
- [Documentation Stripe](https://stripe.com/docs)

---

Vous êtes prêt ! 🎉
