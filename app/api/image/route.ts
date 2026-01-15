import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    // Usando SDXL Lightning para geração rápida (ou troque por @cf/black-forest-labs/flux-1-schnell)
    const model = '@cf/bytedance/stable-diffusion-xl-lightning-1-0';
    
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      }
    );

    if (!response.ok) {
        throw new Error("Falha ao gerar imagem na Cloudflare");
    }

    // A Cloudflare retorna a imagem em binário
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;

    return NextResponse.json({ image: dataUrl });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro na geração' }, { status: 500 });
  }
}
