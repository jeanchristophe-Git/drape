interface VirtualTryOnResponse {
  imageUrl: string;
  processingTime: number;
}

interface PixazoResponse {
  task_id: string;
  task_status: string;
  task_result?: {
    images: Array<{
      url: string;
    }>;
  };
}

/**
 * Génère un virtual try-on en utilisant Pixazo Kolors Virtual Try-On
 * @param personImageUrl - URL de la photo de la personne
 * @param clothImageUrl - URL de la photo du vêtement
 * @returns URL de l'image résultante et temps de traitement
 */
export async function generateVirtualTryOn({
  personImageUrl,
  clothImageUrl,
}: {
  personImageUrl: string;
  clothImageUrl: string;
}): Promise<VirtualTryOnResponse> {
  const startTime = Date.now();

  try {
    // 1. Créer la tâche de virtual try-on
    const createResponse = await fetch(
      'https://gateway.appypie.com/kling-ai-vton/v1/getVirtualTryOnTask',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Ocp-Apim-Subscription-Key': process.env.PIXAZO_API_KEY!,
        },
        body: JSON.stringify({
          human_image: personImageUrl,
          cloth_image: clothImageUrl,
          callback_url: '', // Optionnel: webhook URL
        }),
      }
    );

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Pixazo API error: ${createResponse.status} - ${errorText}`);
    }

    const createData: PixazoResponse = await createResponse.json();
    const taskId = createData.task_id;

    if (!taskId) {
      throw new Error('No task_id returned from Pixazo API');
    }

    console.log('Pixazo task created:', taskId);

    // 2. Poller pour obtenir le résultat (max 3 minutes)
    const result = await pollTaskResult(taskId);

    const processingTime = Math.round((Date.now() - startTime) / 1000);

    return {
      imageUrl: result,
      processingTime,
    };
  } catch (error: any) {
    console.error('Pixazo Kolors Virtual Try-On failed:', error);
    throw new Error(`Virtual try-on generation failed: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Poller pour vérifier le statut de la tâche Pixazo
 */
async function pollTaskResult(taskId: string): Promise<string> {
  const maxAttempts = 60; // 60 tentatives x 3 secondes = 3 minutes max
  const pollInterval = 3000; // 3 secondes entre chaque tentative

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(
        `https://gateway.appypie.com/kling-ai-vton/v1/getVirtualTryOnTask?task_id=${taskId}`,
        {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            'Ocp-Apim-Subscription-Key': process.env.PIXAZO_API_KEY!,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Poll failed: ${response.status}`);
      }

      const data: PixazoResponse = await response.json();

      // Vérifier si la tâche est terminée
      if (data.task_status === 'succeed' && data.task_result?.images?.[0]?.url) {
        console.log('Pixazo task completed:', taskId);
        return data.task_result.images[0].url;
      }

      // Vérifier si la tâche a échoué
      if (data.task_status === 'failed') {
        throw new Error('Pixazo task failed');
      }

      // Attendre avant la prochaine tentative
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    } catch (error) {
      console.error(`Poll attempt ${attempt + 1} failed:`, error);

      // Si c'est la dernière tentative, throw l'erreur
      if (attempt === maxAttempts - 1) {
        throw error;
      }

      // Sinon, attendre et réessayer
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }
  }

  throw new Error('Pixazo task timeout after 3 minutes');
}

/**
 * Teste la connectivité de l'API Pixazo
 * @returns true si la connexion fonctionne
 */
export async function testPixazoConnection(): Promise<boolean> {
  try {
    // Test simple avec une requête de vérification
    const response = await fetch(
      'https://gateway.appypie.com/kling-ai-vton/v1/getVirtualTryOnTask',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': process.env.PIXAZO_API_KEY!,
        },
        body: JSON.stringify({
          human_image: 'https://example.com/test.jpg',
          cloth_image: 'https://example.com/test.jpg',
        }),
      }
    );

    // Si on a une réponse (même une erreur), c'est que l'API key fonctionne
    return response.status !== 401 && response.status !== 403;
  } catch (error) {
    console.error('Pixazo connection test failed:', error);
    return false;
  }
}

/**
 * Obtient le coût estimé d'une génération
 * Note: Pixazo offre 100 calls gratuits, puis pricing variable
 */
export const COST_PER_GENERATION = 0.05; // Estimation ~$0.05 par génération
