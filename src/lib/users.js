import UserModel from "@/models/User.model";

export async function generateUniqueUsername(base) {
  const sanitized = base
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 20);

  let candidate = sanitized.length >= 3 ? sanitized : `user${sanitized}`;
  let suffix = 0;

  while (suffix < 1000) {
    const username = suffix === 0 ? candidate : `${candidate}${suffix}`;
    const exists = await UserModel.exists({ username });
    if (!exists) return username;
    suffix += 1;
  }

  return `user${Date.now()}`;
}

export async function findOrCreateOAuthUser({ email, name, image, provider }) {
  const normalizedEmail = email.toLowerCase();
  let user = await UserModel.findOne({ email: normalizedEmail });

  if (user) {
    const updates = {};
    if (image && !user.image) updates.image = image;
    if (!user.providers.includes(provider)) {
      updates.providers = [...user.providers, provider];
    }
    if (Object.keys(updates).length > 0) {
      Object.assign(user, updates);
      await user.save();
    }
    return user;
  }

  const nameParts = (name || "User").trim().split(/\s+/);
  const firstName = nameParts[0] || "User";
  const lastName = nameParts.slice(1).join(" ") || "";
  const username = await generateUniqueUsername(normalizedEmail.split("@")[0]);

  user = await UserModel.create({
    firstName,
    lastName,
    username,
    email: normalizedEmail,
    provider,
    providers: [provider],
    image: image || undefined,
  });

  return user;
}
