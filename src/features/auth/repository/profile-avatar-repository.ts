import { File } from "expo-file-system";

import { readAvatarBytes } from "@/src/features/auth/model/profile-avatar-upload";
import { supabase } from "@/src/shared/supabase/supabase-client";

const avatarBucket = "profile-avatars";
const maxAvatarSizeInBytes = 512 * 1024;

export async function uploadProfileAvatar(userId: string, uri: string): Promise<string> {
  const image = await readAvatarBytes(uri, (fileUri) => new File(fileUri).arrayBuffer());
  if (image.byteLength > maxAvatarSizeInBytes) {
    throw new Error("A foto ficou grande demais. Escolha outra imagem.");
  }

  const path = `${userId}/avatar.jpg`;
  const { error: uploadError } = await supabase.storage.from(avatarBucket).upload(path, image, {
    cacheControl: "3600",
    contentType: "image/jpeg",
    upsert: true,
  });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(avatarBucket).getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}
