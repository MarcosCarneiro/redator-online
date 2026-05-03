import imageCompression from 'browser-image-compression';

export async function compressAndConvertToBase64(file: File): Promise<string> {
  const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
  const compressedFile = await imageCompression(file, options);
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(compressedFile);
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
  });
}
