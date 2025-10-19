import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

interface VirtualTryOnResponse {
  imageUrl: string;
  processingTime: number;
}

/**
 * Génère un virtual try-on en utilisant Replicate IDM-VTON
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
    // Appeler le modèle IDM-VTON sur Replicate
    const output = await replicate.run(
      "cuuupid/idm-vton:0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985",
      {
        input: {
          garm_img: clothImageUrl,      // Image du vêtement
          human_img: personImageUrl,     // Image de la personne
          garment_des: "clothing",       // Description du vêtement
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
    console.error('Replicate IDM-VTON generation failed:', error);
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
 * Note: IDM-VTON coûte environ $0.024 par génération sur Replicate
 */
export const COST_PER_GENERATION = 0.024; // $0.024 par génération
