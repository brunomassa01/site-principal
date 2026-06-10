// Otimiza a imagem no navegador (reduz dimensão + webp) e envia ao /api/painel/upload.
async function otimizar(file: File): Promise<File> {
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') return file;
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, 1600 / bmp.width);
    const w = Math.round(bmp.width * scale);
    const h = Math.round(bmp.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d')!.drawImage(bmp, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/webp', 0.82));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, '') + '.webp', { type: 'image/webp' });
  } catch {
    return file;
  }
}

export async function enviarImagem(file: File): Promise<string | null> {
  try {
    const fd = new FormData();
    fd.append('file', await otimizar(file));
    const r = await fetch('/api/painel/upload', { method: 'POST', body: fd });
    const d = await r.json();
    if (!r.ok) {
      alert(d.error || 'Falha ao enviar a imagem.');
      return null;
    }
    return d.url as string;
  } catch (e) {
    alert('Falha ao enviar a imagem: ' + (e as Error).message);
    return null;
  }
}
