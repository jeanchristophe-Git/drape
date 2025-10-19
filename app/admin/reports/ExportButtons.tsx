/**
 * EXPORT BUTTONS
 * Boutons pour exporter différents types de données
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ExportButtonsProps {
  type: 'users' | 'payments' | 'tryons' | 'financial' | 'admin-logs';
}

export default function ExportButtons({ type }: ExportButtonsProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);

    try {
      const response = await fetch(`/api/admin/export/${type}`, {
        method: 'GET',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Erreur lors de l\'export');
      }
    } catch (error) {
      console.error(error);
      alert('Erreur lors de l\'export');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={exporting}
      className="w-full"
    >
      <Download className="w-4 h-4 mr-2" />
      {exporting ? 'Export en cours...' : 'Télécharger CSV'}
    </Button>
  );
}
