/**
 * Automatically converts an object into FormData.
 * Robustly handles booleans, files, and arrays.
 */
export const toFormData = (object) => {
  const formData = new FormData();
  Object.keys(object).forEach((key) => {
    const value = object[key];
    if (value !== null && value !== undefined) {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((v) => formData.append(key, v));
      } else {
        formData.append(key, String(value));
      }
    }
  });
  return formData;
};

/**
 * Validates image file size and type
 */
export const validateImageFile = (file, maxMB = 2) => {
  if (!file) return null;
  
  if (!file.type.startsWith("image/")) {
    return "Please upload a valid image file";
  }
  
  const maxSize = maxMB * 1024 * 1024;
  if (file.size > maxSize) {
    return `Image size should be less than ${maxMB}MB`;
  }
  
  return null;
};
