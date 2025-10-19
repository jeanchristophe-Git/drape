import { createClient } from '@/utils/supabase/client';

const BUCKET_NAME = 'drape-images';

export async function uploadToSupabase(
  file: File | string,
  userId: string,
  type: 'person' | 'cloth' | 'result'
): Promise<string> {
  const supabase = createClient();

  // Générer un nom de fichier unique
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(7);
  const extension = file instanceof File ? file.name.split('.').pop() : 'jpg';
  const fileName = `${userId}/${type}/${timestamp}-${randomId}.${extension}`;

  let fileData: File | Blob;

  if (typeof file === 'string') {
    // Si c'est une URL, télécharger l'image d'abord
    const response = await fetch(file);
    fileData = await response.blob();
  } else {
    fileData = file;
  }

  // Upload vers Supabase Storage
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, fileData, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Supabase upload error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  // Obtenir l'URL publique
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);

  return publicUrl;
}

export async function deleteFromSupabase(fileUrl: string): Promise<void> {
  const supabase = createClient();

  // Extraire le chemin du fichier depuis l'URL
  const url = new URL(fileUrl);
  const pathParts = url.pathname.split(`/storage/v1/object/public/${BUCKET_NAME}/`);
  const filePath = pathParts[1];

  if (!filePath) {
    throw new Error('Invalid file URL');
  }

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    console.error('Supabase delete error:', error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

export async function getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
  const supabase = createClient();

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`);
  }

  return data.signedUrl;
}
