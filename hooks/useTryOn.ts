import { useState } from 'react';
import { TryOn } from '@prisma/client';

export function useTryOn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tryOn, setTryOn] = useState<TryOn | null>(null);

  const generateTryOn = async (personImage: File, clothImage: File) => {
    try {
      setLoading(true);
      setError(null);

      // Créer FormData
      const formData = new FormData();
      formData.append('personImage', personImage);
      formData.append('clothImage', clothImage);

      // Envoyer la requête
      const response = await fetch('/api/tryon', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate try-on');
      }

      // Commencer à poller pour le résultat
      const tryOnId = data.tryOnId;
      await pollTryOnResult(tryOnId);

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const pollTryOnResult = async (tryOnId: string) => {
    const maxAttempts = 60; // 60 tentatives (60 secondes)
    let attempts = 0;

    return new Promise<TryOn>((resolve, reject) => {
      const interval = setInterval(async () => {
        attempts++;

        try {
          const response = await fetch(`/api/tryon/${tryOnId}`);
          const data = await response.json();

          if (!response.ok) {
            clearInterval(interval);
            reject(new Error(data.error || 'Failed to fetch try-on'));
            return;
          }

          const tryOnData = data.data as TryOn;
          setTryOn(tryOnData);

          // Vérifier si terminé
          if (tryOnData.status === 'SUCCESS') {
            clearInterval(interval);
            resolve(tryOnData);
          } else if (tryOnData.status === 'FAILED') {
            clearInterval(interval);
            reject(new Error(tryOnData.errorMessage || 'Generation failed'));
          }

          // Timeout après 60 secondes
          if (attempts >= maxAttempts) {
            clearInterval(interval);
            reject(new Error('Generation timeout'));
          }
        } catch (err) {
          clearInterval(interval);
          reject(err);
        }
      }, 1000); // Poll toutes les secondes
    });
  };

  return {
    loading,
    error,
    tryOn,
    generateTryOn,
  };
}
