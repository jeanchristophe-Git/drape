# 🛡️ Guide du Panel Admin - DRAPE

## 📋 Vue d'ensemble

Le panel admin complet a été créé pour gérer votre SaaS DRAPE. Il inclut toutes les fonctionnalités nécessaires pour monitorer, gérer et optimiser votre application.

## 🚀 Accès au Panel Admin

### URL d'accès
```
http://localhost:3002/admin
```

### Devenir Admin

Pour accéder au panel admin, vous devez avoir le rôle `ADMIN` dans la base de données.

**Étape 1 : Se créer un compte**
1. Allez sur `/auth/signup`
2. Créez votre compte avec votre email

**Étape 2 : Définir le rôle admin dans la DB**

Vous avez 2 options :

**Option A - Via Prisma Studio (Recommandé)**
```bash
npx prisma studio
```
- Ouvrez le modèle `User`
- Trouvez votre utilisateur
- Changez le champ `role` de `USER` à `ADMIN`
- Sauvegardez

**Option B - Via SQL direct dans Supabase**
```sql
UPDATE "User"
SET role = 'ADMIN'
WHERE email = 'votre-email@example.com';
```

### Sécurité

Le panel admin est protégé par :
- ✅ Middleware qui vérifie l'authentification Supabase
- ✅ Vérification du rôle `ADMIN` dans la base de données
- ✅ Redirection automatique si non autorisé
- ✅ Logging de toutes les actions admin

## 📊 Fonctionnalités du Panel

### 1. Dashboard Analytics (`/admin`)

**KPIs principaux :**
- Total utilisateurs (+ nouveaux ce mois)
- MRR (Monthly Recurring Revenue)
- Nombre de try-ons générés
- Profit net (revenus - coûts API)

**Graphiques :**
- Évolution des revenus sur 7 jours (line chart)
- Utilisation quotidienne (bar chart)

**Statistiques rapides :**
- Taux de conversion Free → Premium
- Revenu moyen par utilisateur
- Coût moyen par try-on
- Marge bénéficiaire

**Alertes :**
- Nombre élevé de try-ons échoués
- Signalements de contenu en attente

---

### 2. Gestion des Utilisateurs (`/admin/users`)

**Fonctionnalités :**
- ✅ Liste complète de tous les utilisateurs
- ✅ Filtres : Tous / Premium / Free / Bannis
- ✅ Recherche par email ou nom
- ✅ Statistiques : Total, Premium, Bannis

**Actions disponibles :**
- 🚫 **Bannir un utilisateur** : Empêche l'accès avec raison
- ✅ **Débannir un utilisateur**
- 🎁 **Donner des crédits gratuits** : Ajoute des try-ons gratuits

**Informations affichées :**
- Email et nom
- Plan (Free/Premium)
- Nombre de try-ons utilisés
- Nombre de paiements
- Date d'inscription
- Statut (Actif/Banni)

---

### 3. Gestion des Paiements (`/admin/payments`)

**Statistiques :**
- Revenus totaux all-time
- Revenus du mois en cours
- Paiements réussis
- Paiements échoués

**Tableau des paiements :**
- Email utilisateur
- Montant et devise
- Statut (succeeded/failed/refunded)
- Raison de facturation
- ID Stripe (pour support)
- Date du paiement

**Limite :** 100 derniers paiements affichés

---

### 4. Modération de Contenu (`/admin/moderation`)

**Vue d'ensemble :**
- Signalements en attente
- Contenus approuvés
- Contenus supprimés
- Try-ons échoués

**Signalements :**
- Liste des signalements en attente
- Raison du signalement
- ID du try-on concerné
- Utilisateur ayant signalé

**Galerie des try-ons :**
- Affichage visuel : Person / Garment / Result
- Filtres : Tous / Réussis / Échoués / En cours
- Badge de statut
- Information utilisateur
- Action : Supprimer le try-on

**Limite :** 50 derniers try-ons affichés

---

### 5. Configuration Système (`/admin/settings`)

**Quotas et limites :**
- Try-ons gratuits par utilisateur (défaut: 2)
- Limite quotidienne Premium (défaut: 50)

**Tarification :**
- Prix Premium USD/mois (défaut: 9.99)
- Coût API par try-on (défaut: 0.10)

**Qualité des images :**
- Résolution Free (512x512 / 768x768 / 1024x1024)
- Résolution Premium (768x768 / 1024x1024)
- Expiration try-ons gratuits en jours (défaut: 7)

**Système :**
- Autoriser les nouvelles inscriptions (toggle)

**Variables d'environnement (lecture seule) :**
- REPLICATE_API_TOKEN
- STRIPE_SECRET_KEY
- SUPABASE_URL
- DATABASE_URL

---

### 6. Rapports et Exports (`/admin/reports`)

**Exports CSV disponibles :**

1. **Utilisateurs** (`/api/admin/export/users`)
   - Tous les utilisateurs avec plan, dates, statuts

2. **Paiements** (`/api/admin/export/payments`)
   - Historique complet des paiements

3. **Try-Ons** (`/api/admin/export/tryons`)
   - Tous les try-ons avec statuts et coûts

4. **Rapport Financier** (`/api/admin/export/financial`)
   - Analyse mensuelle : revenus, coûts, marges

5. **Logs Admin** (`/api/admin/export/admin-logs`)
   - Historique des actions admin (1000 derniers)

**Format :** CSV compatible Excel

---

## 🗂️ Structure des Fichiers

```
app/
├── (admin)/                          # Groupe de route admin
│   ├── layout.tsx                   # Layout avec sidebar
│   ├── page.tsx                     # Dashboard principal
│   ├── components/
│   │   ├── RevenueChart.tsx         # Graphique revenus
│   │   └── UsageChart.tsx           # Graphique utilisation
│   ├── users/
│   │   ├── page.tsx                 # Page gestion users
│   │   └── UsersTable.tsx           # Table interactive
│   ├── payments/
│   │   └── page.tsx                 # Page paiements
│   ├── moderation/
│   │   ├── page.tsx                 # Page modération
│   │   └── ModerationContent.tsx    # Galerie try-ons
│   ├── settings/
│   │   ├── page.tsx                 # Page paramètres
│   │   └── SettingsForm.tsx         # Formulaire settings
│   └── reports/
│       ├── page.tsx                 # Page rapports
│       └── ExportButtons.tsx        # Boutons export
│
└── api/admin/                        # API routes admin
    ├── users/
    │   ├── ban/route.ts             # Bannir user
    │   ├── unban/route.ts           # Débannir user
    │   └── credits/route.ts         # Donner crédits
    ├── moderation/
    │   └── delete/route.ts          # Supprimer try-on
    ├── settings/route.ts            # Update settings
    └── export/
        ├── users/route.ts           # Export users CSV
        ├── payments/route.ts        # Export payments CSV
        ├── tryons/route.ts          # Export try-ons CSV
        ├── financial/route.ts       # Export rapport CSV
        └── admin-logs/route.ts      # Export logs CSV

lib/
└── admin.ts                         # Utilitaires admin
    ├── getCurrentUser()             # Get current user
    ├── requireAdmin()               # Middleware protection
    ├── isAdmin()                    # Check if admin
    └── logAdminAction()             # Logger actions

prisma/
└── schema.prisma                    # Schéma DB
    ├── User (+ role: UserRole)      # Ajout du rôle
    ├── DailyAnalytics               # Analytics quotidiennes
    ├── ModerationFlag               # Signalements
    ├── SystemSetting                # Paramètres système
    └── AdminLog                     # Logs actions admin
```

---

## 🔐 Tables de la Base de Données

### UserRole Enum
```prisma
enum UserRole {
  USER
  ADMIN
}
```

### User (modifié)
- Ajout du champ `role: UserRole` (défaut: USER)

### DailyAnalytics (nouvelle)
Stocke les métriques quotidiennes :
- Utilisateurs (total, nouveaux, actifs, premium)
- Try-ons (total, free, premium, taux de succès)
- Finances (revenus, coûts API, profit, MRR)

### ModerationFlag (nouvelle)
Gère les signalements de contenu :
- tryOnId, reportedBy, reason
- status (PENDING/APPROVED/REMOVED)
- reviewedBy, reviewNote

### SystemSetting (nouvelle)
Configuration globale :
- key/value (JSON)
- description, updatedBy

### AdminLog (nouvelle)
Logs de toutes les actions admin :
- adminId, action, targetType, targetId
- metadata (JSON)

---

## 📡 API Routes Admin

Toutes les routes sont protégées par `requireAdmin()`.

### Users Management
- `POST /api/admin/users/ban` - Bannir un utilisateur
- `POST /api/admin/users/unban` - Débannir un utilisateur
- `POST /api/admin/users/credits` - Donner des crédits

### Moderation
- `POST /api/admin/moderation/delete` - Supprimer un try-on

### Settings
- `POST /api/admin/settings` - Mettre à jour les paramètres

### Exports
- `GET /api/admin/export/users` - Export CSV utilisateurs
- `GET /api/admin/export/payments` - Export CSV paiements
- `GET /api/admin/export/tryons` - Export CSV try-ons
- `GET /api/admin/export/financial` - Export CSV rapport financier
- `GET /api/admin/export/admin-logs` - Export CSV logs admin

---

## 🎨 UI/UX

**Design System :**
- Utilise shadcn/ui components
- Sidebar fixe avec navigation
- Cards pour les sections
- Tables interactives
- Graphiques Recharts
- Filtres et recherche
- Actions rapides (dropdown menus)

**Couleurs :**
- Primary : Bleu
- Success : Vert
- Warning : Orange
- Danger : Rouge

---

## 📊 Dépendances Installées

```json
{
  "recharts": "Graphiques (line, bar)",
  "@tanstack/react-table": "Tables avancées (non utilisé finalement)",
  "date-fns": "Manipulation de dates",
  "lucide-react": "Icônes"
}
```

---

## ⚠️ Important

1. **Sécurité :**
   - Toujours vérifier le rôle admin côté serveur
   - Ne jamais faire confiance au client
   - Logger toutes les actions sensibles

2. **Performance :**
   - Les exports CSV sont limités (ex: 1000 logs)
   - Considérer la pagination pour de très gros volumes

3. **Supabase Storage :**
   - La suppression de try-ons ne supprime PAS les images dans Storage
   - Vous pouvez ajouter cette logique si nécessaire

4. **Stripe :**
   - Les actions admin n'affectent PAS Stripe automatiquement
   - Pour annuler un abonnement, utilisez le Stripe Dashboard

---

## 🚀 Prochaines Étapes

1. **Tester le panel :**
   ```bash
   npm run dev
   ```
   - Créez un compte
   - Définissez-vous comme admin
   - Accédez à `/admin`

2. **Personnaliser :**
   - Ajustez les couleurs dans le layout
   - Ajoutez vos propres métriques
   - Configurez les alertes selon vos seuils

3. **Monitoring :**
   - Configurez des cron jobs pour calculer les DailyAnalytics
   - Ajoutez des notifications (email, Slack) pour les alertes

4. **Automatisation :**
   - Script pour bannir automatiquement les utilisateurs abusifs
   - Auto-modération avec IA pour détecter le contenu inapproprié
   - Génération automatique de rapports mensuels

---

## 📞 Support

Pour toute question sur le panel admin, consultez :
- Le code commenté dans chaque fichier
- La documentation Prisma pour les requêtes DB
- La documentation shadcn/ui pour les composants

---

**Panel Admin DRAPE v1.0**
Créé avec Next.js 15, Prisma, Supabase, Stripe, et ❤️
