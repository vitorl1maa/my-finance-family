type AvatarFileReader = (uri: string) => Promise<ArrayBuffer>;

export async function readAvatarBytes(
  uri: string,
  readFile: AvatarFileReader,
): Promise<ArrayBuffer> {
  try {
    const image = await readFile(uri);
    const bytes = new Uint8Array(image);
    const isJpeg =
      bytes.length >= 4 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[bytes.length - 2] === 0xff &&
      bytes[bytes.length - 1] === 0xd9;

    if (!isJpeg) throw new Error();
    return image;
  } catch {
    throw new Error("Não foi possível preparar a foto selecionada.");
  }
}
