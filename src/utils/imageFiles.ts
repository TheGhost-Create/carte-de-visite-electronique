const acceptedImageTypes = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const maxImageBytes = 7 * 1024 * 1024;

export function validateCardImageFile(file: File) {
  if (!acceptedImageTypes.includes(file.type)) {
    return "Format non pris en charge. Utilisez PNG, JPG, WebP ou SVG.";
  }

  if (file.size > maxImageBytes) {
    return "Image trop volumineuse. Choisissez une image de moins de 7 Mo.";
  }

  return "";
}

export function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Impossible de lire cette image."));
    reader.readAsDataURL(file);
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
