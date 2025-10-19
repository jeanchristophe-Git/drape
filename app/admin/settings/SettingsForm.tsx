/**
 * SETTINGS FORM
 * Formulaire pour modifier les paramètres système
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Save } from 'lucide-react';

interface Setting {
  key: string;
  label: string;
  value: any;
  type: 'text' | 'number' | 'boolean' | 'select';
  options?: string[];
  description?: string;
}

interface SettingsFormProps {
  settings: Setting[];
}

export default function SettingsForm({ settings }: SettingsFormProps) {
  const [values, setValues] = useState<Record<string, any>>(
    settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {})
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        alert('Paramètres sauvegardés avec succès');
        window.location.reload();
      } else {
        alert('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {settings.map(setting => (
        <div key={setting.key} className="space-y-2">
          <Label htmlFor={setting.key}>{setting.label}</Label>

          {setting.type === 'text' && (
            <Input
              id={setting.key}
              type="text"
              value={values[setting.key]}
              onChange={(e) =>
                setValues({ ...values, [setting.key]: e.target.value })
              }
            />
          )}

          {setting.type === 'number' && (
            <Input
              id={setting.key}
              type="number"
              step="0.01"
              value={values[setting.key]}
              onChange={(e) =>
                setValues({ ...values, [setting.key]: parseFloat(e.target.value) })
              }
            />
          )}

          {setting.type === 'boolean' && (
            <div className="flex items-center gap-2">
              <Switch
                id={setting.key}
                checked={values[setting.key]}
                onCheckedChange={(checked) =>
                  setValues({ ...values, [setting.key]: checked })
                }
              />
              <span className="text-sm text-gray-600">
                {values[setting.key] ? 'Activé' : 'Désactivé'}
              </span>
            </div>
          )}

          {setting.type === 'select' && setting.options && (
            <Select
              value={values[setting.key]}
              onValueChange={(value) =>
                setValues({ ...values, [setting.key]: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {setting.options.map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {setting.description && (
            <p className="text-sm text-gray-500">{setting.description}</p>
          )}
        </div>
      ))}

      <Button onClick={handleSave} disabled={saving} className="w-full">
        <Save className="w-4 h-4 mr-2" />
        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
      </Button>
    </div>
  );
}
