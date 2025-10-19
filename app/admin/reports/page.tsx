/**
 * ADMIN - RAPPORTS ET EXPORTS
 * Génération de rapports et exports CSV
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Users, CreditCard, Image } from 'lucide-react';
import ExportButtons from './ExportButtons';

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Rapports et exports</h1>
        <p className="text-gray-500">
          Téléchargez des rapports et exportez les données
        </p>
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Utilisateurs */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>Utilisateurs</CardTitle>
                <CardDescription>
                  Exporter tous les utilisateurs
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Téléchargez un fichier CSV contenant tous les utilisateurs avec leurs informations
              (email, plan, date d'inscription, etc.)
            </p>
            <ExportButtons type="users" />
          </CardContent>
        </Card>

        {/* Export Paiements */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <CardTitle>Paiements</CardTitle>
                <CardDescription>
                  Exporter l'historique des paiements
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Téléchargez un fichier CSV contenant tous les paiements avec montants, dates, et
              statuts
            </p>
            <ExportButtons type="payments" />
          </CardContent>
        </Card>

        {/* Export Try-Ons */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Image className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <CardTitle>Try-Ons</CardTitle>
                <CardDescription>
                  Exporter les try-ons générés
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Téléchargez un fichier CSV contenant tous les try-ons avec statuts, résolutions, et
              coûts
            </p>
            <ExportButtons type="tryons" />
          </CardContent>
        </Card>

        {/* Rapport financier */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <CardTitle>Rapport financier</CardTitle>
                <CardDescription>
                  Rapport mensuel complet
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Téléchargez un rapport financier mensuel avec revenus, coûts API, et marges
            </p>
            <ExportButtons type="financial" />
          </CardContent>
        </Card>
      </div>

      {/* Logs Admin */}
      <Card>
        <CardHeader>
          <CardTitle>Logs des actions admin</CardTitle>
          <CardDescription>
            Historique des actions administratives récentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Consultez l'historique de toutes les actions effectuées par les administrateurs
          </p>
          <ExportButtons type="admin-logs" />
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Download className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900">À propos des exports</p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• Les fichiers sont générés au format CSV (compatible Excel)</li>
                <li>• Les exports incluent toutes les données jusqu'à maintenant</li>
                <li>• Les données sensibles (mots de passe, tokens) ne sont jamais exportées</li>
                <li>• Les exports sont générés en temps réel à chaque téléchargement</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
