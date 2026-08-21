// Storage helpers para Cloudflare R2 via AWS SDK (S3-compatible)
// URLs públicas NUNCA são expostas — leitura via URL assinada (15 min).
// Assinaturas das funções mantidas para compatibilidade com os callers existentes.

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getS3Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Credenciais R2 ausentes: configure R2_ACCOUNT_ID, R2_ACCESS_KEY_ID e R2_SECRET_ACCESS_KEY"
    );
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function getBucketName(): string {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) {
    throw new Error("R2_BUCKET_NAME não configurado");
  }
  return bucket;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

/** Faz upload de um objeto para o R2 e retorna sua chave. */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const client = getS3Client();
  const bucket = getBucketName();
  const key = normalizeKey(relKey);

  const body =
    typeof data === "string" ? Buffer.from(data, "utf-8") : Buffer.from(data);

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  // Retorna URL assinada imediatamente para uso no mesmo request.
  const url = await getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn: 900 } // 15 minutos
  );

  return { key, url };
}

/** Gera URL assinada (15 min) para leitura de um objeto existente. */
export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const client = getS3Client();
  const bucket = getBucketName();
  const key = normalizeKey(relKey);

  const url = await getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn: 900 } // 15 minutos
  );

  return { key, url };
}

/**
 * Resolve uma chave de objeto para URL assinada (15 min).
 * Retorna null se a chave for vazia/nula ou se o R2 não estiver configurado.
 */
export async function resolveSignedUrl(key: string | null | undefined): Promise<string | null> {
  if (!key) return null;
  try {
    const { url } = await storageGet(key);
    return url;
  } catch {
    return null;
  }
}

/** Remove um objeto do R2 (uso interno — não exposto em tRPC diretamente). */
export async function storageDelete(relKey: string): Promise<void> {
  const client = getS3Client();
  const bucket = getBucketName();
  const key = normalizeKey(relKey);

  await client.send(
    new DeleteObjectCommand({ Bucket: bucket, Key: key })
  );
}
