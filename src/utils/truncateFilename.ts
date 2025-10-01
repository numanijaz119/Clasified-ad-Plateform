export const truncateFilename = (file: File): File => {
  const maxLength = 80; // Keep safe margin below 100
  const extension = file.name.split(".").pop() || "";
  const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf("."));

  if (file.name.length <= maxLength) {
    return file;
  }

  // Create shorter name: timestamp + random + extension
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const newName = `avatar_${timestamp}_${random}.${extension}`;

  // Create new File object with shorter name
  return new File([file], newName, { type: file.type });
};
