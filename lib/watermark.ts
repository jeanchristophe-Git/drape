import sharp from 'sharp';

export async function addWatermark(
  imageUrl: string,
  watermarkText: string = 'DRAPE'
): Promise<string> {
  try {
    // Télécharger l'image depuis l'URL
    const response = await fetch(imageUrl);
    const imageBuffer = await response.arrayBuffer();

    // Créer le watermark SVG
    const svgWatermark = `
      <svg width="200" height="50">
        <text
          x="50%"
          y="50%"
          text-anchor="middle"
          dominant-baseline="middle"
          font-family="Arial, sans-serif"
          font-size="32"
          font-weight="bold"
          fill="white"
          opacity="0.5"
        >
          ${watermarkText}
        </text>
      </svg>
    `;

    // Appliquer le watermark
    const watermarkedBuffer = await sharp(Buffer.from(imageBuffer))
      .composite([
        {
          input: Buffer.from(svgWatermark),
          gravity: 'center',
        },
      ])
      .toBuffer();

    // Convertir en base64 pour upload
    const base64Image = watermarkedBuffer.toString('base64');
    return `data:image/jpeg;base64,${base64Image}`;

  } catch (error) {
    console.error('Watermark error:', error);
    throw new Error('Failed to add watermark');
  }
}

export async function removeWatermark(imageBuffer: Buffer): Promise<Buffer> {
  // Cette fonction est juste un placeholder
  // En production, on ne peut pas vraiment "enlever" un watermark
  // On stockerait plutôt deux versions (avec et sans)
  return imageBuffer;
}
