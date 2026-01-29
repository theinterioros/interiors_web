import { put } from "@vercel/blob";

export async function uploadBlob(file: File, pathPrefix: string) {
  const fileName = `${pathPrefix}/${Date.now()}-${file.name}`;
  const { url } = await put(fileName, file, {
    access: "public",
  });

  return url;
}
