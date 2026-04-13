/**
 * Email validation regex
 */
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Validates registration form fields
 */
export const validateRegisterForm = (values) => {
  if (!values.fullName || !values.username || !values.email || !values.password) {
    return "Please fill in all fields";
  }
  if (!isValidEmail(values.email)) {
    return "Please enter a valid email address";
  }
  if (values.password.length < 8) {
    return "Password must be at least 8 characters";
  }
  return null;
};

/**
 * Validates login form fields
 */
export const validateLoginForm = (values) => {
  if (!values.email || !values.password) {
    return "Please fill in all fields";
  }
  if (!isValidEmail(values.email)) {
    return "Please enter a valid email address";
  }
  return null;
};

/**
 * Validates profile update fields
 */
export const validateProfileForm = (values) => {
  if (!values.fullName?.trim()) {
    return "Full name is required";
  }
  return null;
};
