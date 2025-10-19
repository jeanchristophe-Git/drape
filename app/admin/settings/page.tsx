/**
 * ADMIN - PARAMÈTRES SYSTÈME
 * Configuration des prix, quotas, et paramètres globaux
 */

import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SettingsForm from './SettingsForm';

/**
 * Récupère tous les paramètres système
 */
async function getSettings() {
  const settings = await prisma.systemSetting.findMany({
    orderBy: {
      key: 'asc',
    },
  });

  // Convertir en objet clé-valeur
  const settingsObj: Record<string, any> = {};
  settings.forEach(setting => {
    try {
      settingsObj[setting.key] = JSON.parse(setting.value);
    } catch {
      settingsObj[setting.key] = setting.value;
    }
  });

  return settingsObj;
}

/**
 * Initialiser les paramètres par défaut s'ils n'existent pas
 */
async function initializeDefaultSettings() {
  const defaultSettings = [
    {
      key: 'free_quota',
      value: '2',
      description: 'Nombre de try-ons gratuits par utilisateur',
    },
    {
      key: 'premium_price',
      value: '9.99',
      description: 'Prix mensuel du plan Premium (USD)',
    },
    {
      key: 'premium_daily_limit',
      value: '50',
      description: 'Limite quotidienne pour les utilisateurs Premium (anti-abus)',
    },
    {
      key: 'registration_enabled',
      value: 'true',
      description: 'Autoriser les nouvelles inscriptions',
    },
    {
      key: 'free_resolution',
      value: '768x768',
      description: 'Résolution pour les utilisateurs gratuits',
    },
    {
      key: 'premium_resolution',
      value: '1024x1024',
      description: 'Résolution pour les utilisateurs Premium',
    },
    {
      key: 'free_expiration_days',
      value: '7',
      description: 'Jours avant expiration des try-ons gratuits',
    },
    {
      key: 'ai_cost_per_tryon',
      value: '0.10',
      description: 'Coût estimé par try-on (USD)',
    },
  ];

  for (const setting of defaultSettings) {
    const exists = await prisma.systemSetting.findUnique({
      where: { key: setting.key },
    });

    if (!exists) {
      await prisma.systemSetting.create({
        data: setting,
      });
    }
  }
}

export default async function AdminSettingsPage() {
  // Initialiser les paramètres par défaut
  await initializeDefaultSettings();

  // Récupérer tous les paramètres
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Paramètres système</h1>
        <p className="text-gray-500">
          Configuration globale de l'application
        </p>
      </div>

      {/* Settings Sections */}
      <div className="grid gap-6">
        {/* Quotas et limites */}
        <Card>
          <CardHeader>
            <CardTitle>Quotas et limites</CardTitle>
            <CardDescription>
              Configuration des quotas pour les utilisateurs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SettingsForm
              settings={[
                {
                  key: 'free_quota',
                  label: 'Try-ons gratuits',
                  value: settings.free_quota || 2,
                  type: 'number',
                  description: 'Nombre de try-ons offerts aux nouveaux utilisateurs',
                },
                {
                  key: 'premium_daily_limit',
                  label: 'Limite quotidienne Premium',
                  value: settings.premium_daily_limit || 50,
                  type: 'number',
                  description: 'Limite quotidienne pour éviter les abus',
                },
              ]}
            />
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Tarification</CardTitle>
            <CardDescription>
              Configuration des prix
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SettingsForm
              settings={[
                {
                  key: 'premium_price',
                  label: 'Prix Premium (USD/mois)',
                  value: settings.premium_price || 9.99,
                  type: 'number',
                  description: 'Prix de l\'abonnement mensuel Premium',
                },
                {
                  key: 'ai_cost_per_tryon',
                  label: 'Coût API par try-on (USD)',
                  value: settings.ai_cost_per_tryon || 0.10,
                  type: 'number',
                  description: 'Coût estimé de l\'API Replicate par génération',
                },
              ]}
            />
          </CardContent>
        </Card>

        {/* Qualité */}
        <Card>
          <CardHeader>
            <CardTitle>Qualité des images</CardTitle>
            <CardDescription>
              Résolutions par plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SettingsForm
              settings={[
                {
                  key: 'free_resolution',
                  label: 'Résolution Free',
                  value: settings.free_resolution || '768x768',
                  type: 'select',
                  options: ['512x512', '768x768', '1024x1024'],
                  description: 'Résolution pour les utilisateurs gratuits',
                },
                {
                  key: 'premium_resolution',
                  label: 'Résolution Premium',
                  value: settings.premium_resolution || '1024x1024',
                  type: 'select',
                  options: ['768x768', '1024x1024'],
                  description: 'Résolution pour les utilisateurs Premium',
                },
                {
                  key: 'free_expiration_days',
                  label: 'Expiration try-ons gratuits (jours)',
                  value: settings.free_expiration_days || 7,
                  type: 'number',
                  description: 'Nombre de jours avant expiration des try-ons gratuits',
                },
              ]}
            />
          </CardContent>
        </Card>

        {/* Système */}
        <Card>
          <CardHeader>
            <CardTitle>Système</CardTitle>
            <CardDescription>
              Paramètres généraux
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SettingsForm
              settings={[
                {
                  key: 'registration_enabled',
                  label: 'Inscriptions actives',
                  value: settings.registration_enabled !== false,
                  type: 'boolean',
                  description: 'Autoriser les nouvelles inscriptions',
                },
              ]}
            />
          </CardContent>
        </Card>

        {/* Variables d'environnement (lecture seule) */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Variables d'environnement</CardTitle>
            <CardDescription>
              Clés API et configuration (lecture seule)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-blue-900">REPLICATE_API_TOKEN</p>
                <p className="text-xs text-blue-700">
                  {process.env.REPLICATE_API_TOKEN ? '✓ Configuré' : '✗ Non configuré'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">STRIPE_SECRET_KEY</p>
                <p className="text-xs text-blue-700">
                  {process.env.STRIPE_SECRET_KEY ? '✓ Configuré' : '✗ Non configuré'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">SUPABASE_URL</p>
                <p className="text-xs text-blue-700">
                  {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Configuré' : '✗ Non configuré'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">DATABASE_URL</p>
                <p className="text-xs text-blue-700">
                  {process.env.DATABASE_URL ? '✓ Configuré' : '✗ Non configuré'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
