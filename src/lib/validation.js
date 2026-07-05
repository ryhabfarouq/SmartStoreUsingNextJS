const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,30}$/;
const PASSWORD_UPPER = /[A-Z]/;
const PASSWORD_LOWER = /[a-z]/;
const PASSWORD_NUMBER = /[0-9]/;
const PASSWORD_SPECIAL = /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/~`]/;

const WEAK_PASSWORDS = new Set([
  "password",
  "password1",
  "password123",
  "12345678",
  "123456789",
  "qwerty123",
  "admin123",
  "letmein",
  "welcome1",
  "iloveyou",
  "abc12345",
  "passw0rd",
  "changeme",
  "football",
  "monkey123",
]);

export function sanitizeString(value, maxLength = 500) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export function validateEmail(email) {
  const normalized = sanitizeString(email, 254).toLowerCase();
  if (!normalized) return { valid: false, error: "Email is required." };
  if (!EMAIL_REGEX.test(normalized)) {
    return { valid: false, error: "Please enter a valid email address." };
  }
  return { valid: true, value: normalized };
}

export function validateUsername(username) {
  const normalized = sanitizeString(username, 30);
  if (!normalized) return { valid: false, error: "Username is required." };
  if (normalized.length < 3) {
    return { valid: false, error: "Username must be at least 3 characters." };
  }
  if (normalized.length > 30) {
    return { valid: false, error: "Username must be at most 30 characters." };
  }
  if (!USERNAME_REGEX.test(normalized)) {
    return {
      valid: false,
      error: "Username may only contain letters, numbers, underscores, and hyphens.",
    };
  }
  return { valid: true, value: normalized.toLowerCase() };
}

export function validatePassword(password) {
  if (typeof password !== "string" || !password) {
    return { valid: false, error: "Password is required." };
  }
  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters." };
  }
  if (!PASSWORD_UPPER.test(password)) {
    return { valid: false, error: "Password must contain at least one uppercase letter." };
  }
  if (!PASSWORD_LOWER.test(password)) {
    return { valid: false, error: "Password must contain at least one lowercase letter." };
  }
  if (!PASSWORD_NUMBER.test(password)) {
    return { valid: false, error: "Password must contain at least one number." };
  }
  if (!PASSWORD_SPECIAL.test(password)) {
    return { valid: false, error: "Password must contain at least one special character." };
  }
  if (WEAK_PASSWORDS.has(password.toLowerCase())) {
    return { valid: false, error: "This password is too common. Please choose a stronger password." };
  }
  return { valid: true, value: password };
}

export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) {
    return { valid: false, error: "Please confirm your password." };
  }
  if (password !== confirmPassword) {
    return { valid: false, error: "Passwords do not match." };
  }
  return { valid: true };
}

export function validateSignupData(data) {
  const errors = {};

  const firstName = sanitizeString(data.firstName, 50);
  const lastName = sanitizeString(data.lastName, 50);

  if (!firstName) errors.firstName = "First name is required.";
  if (!lastName) errors.lastName = "Last name is required.";

  const emailResult = validateEmail(data.email);
  if (!emailResult.valid) errors.email = emailResult.error;

  const usernameResult = validateUsername(data.username);
  if (!usernameResult.valid) errors.username = usernameResult.error;

  const passwordResult = validatePassword(data.password);
  if (!passwordResult.valid) errors.password = passwordResult.error;

  const confirmResult = validateConfirmPassword(data.password, data.confirmPassword);
  if (!confirmResult.valid) errors.confirmPassword = confirmResult.error;

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      firstName,
      lastName,
      email: emailResult.value,
      username: usernameResult.value,
      password: passwordResult.value,
    },
  };
}

export function validateCheckoutData(data) {
  const errors = {};

  const fullName = sanitizeString(data.fullName, 100);
  const emailResult = validateEmail(data.email);
  const phone = sanitizeString(data.phone, 20);
  const country = sanitizeString(data.country, 80);
  const city = sanitizeString(data.city, 80);
  const address = sanitizeString(data.address, 300);
  const postalCode = sanitizeString(data.postalCode, 20);
  const notes = sanitizeString(data.notes || "", 500);

  if (!fullName || fullName.length < 2) {
    errors.fullName = "Full name is required (minimum 2 characters).";
  }
  if (!emailResult.valid) errors.email = emailResult.error;
  if (!phone || phone.length < 7) {
    errors.phone = "Please enter a valid phone number.";
  }
  if (!country) errors.country = "Country is required.";
  if (!city) errors.city = "City is required.";
  if (!address || address.length < 5) {
    errors.address = "Address is required (minimum 5 characters).";
  }
  if (!postalCode || postalCode.length < 3) {
    errors.postalCode = "Postal code is required.";
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      fullName,
      email: emailResult.value,
      phone,
      country,
      city,
      address,
      postalCode,
      notes,
    },
  };
}
