/**
 * Generates a batch number string from a model name.
 * Example: "hot 9" -> "H0T9-129394"
 */
export const generateBatchNumber = (modelName: string): string => {
  if (!modelName || !modelName.trim()) {
    return '';
  }

  const cleaned = modelName
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/O/g, '0');

  const randomDigits = Math.floor(100000 + Math.random() * 900000);

  return `${cleaned}-${randomDigits}`;
};
