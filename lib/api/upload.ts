import { api } from "@/lib/api/client";

export type PastaUpload = "inspiration" | "portfolio" | "services" | "profiles";

export async function uploadImagem(pasta: PastaUpload, file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  // inspiration é público; as demais precisam do token (o api() já envia)
  const { url } = await api<{ url: string }>(`/uploads/${pasta}`, {
    method: "POST",
    body: form,
    auth: pasta !== "inspiration",
  });
  return url;
  
}