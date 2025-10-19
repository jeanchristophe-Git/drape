import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

interface VirtualTryOnResponse {
  imageUrl: string;
  processingTime: number;
}

/**
 * Génère un virtual try-on en utilisant Replicate CatVTON-Flux (2x plus rapide)
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
    // Appeler le modèle CatVTON-Flux sur Replicate (33s avg, 2x plus rapide qu'IDM-VTON)
    const output = await replicate.run(
      "mmezhov/catvton-flux",
      {
        input: {
          image: personImageUrl,         // Image de la personne
          garment: clothImageUrl,        // Image du vêtement
          seed: 42,                      // Seed pour reproductibilité
          steps: 30                      // Nombre d'étapes de diffusion
        }
      }
    ) as any;

    const processingTime = Math.round((Date.now() - startTime) / 1000);

    // Replicate retourne un FileOutput avec une méthode url()
    const imageUrl = typeof output === 'string' ? output : output.url();

    return {
      imageUrl,
      processingTime
    };

  } catch (error: any) {
    console.error('Replicate CatVTON-Flux generation failed:', error);
    throw new Error(`Virtual try-on generation failed: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Teste la connectivité de l'API Replicate
 * @returns true si la connexion fonctionne
 */
export async function testReplicateConnection(): Promise<boolean> {
  try {
    // Vérifie si le token est valide en listant les prédictions
    await replicate.predictions.list();
    return true;
  } catch (error) {
    console.error('Replicate connection test failed:', error);
    return false;
  }
}

/**
 * Obtient le coût estimé d'une génération
 * Note: CatVTON-Flux coûte environ $0.046 par génération sur Replicate (21 runs per $1)
 */
export const COST_PER_GENERATION = 0.046; // $0.046 par génération
