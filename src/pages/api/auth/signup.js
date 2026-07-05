import bcrypt from "bcryptjs";
import connectDB from "@/lib/db.connection";
import UserModel from "@/models/User.model";
import { validateSignupData } from "@/lib/validation";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  try {
    const validation = validateSignupData(req.body);

    if (!validation.valid) {
      return res.status(400).json({ message: "Validation failed.", errors: validation.errors });
    }

    await connectDB();

    const { firstName, lastName, email, username, password } = validation.data;

    const existingEmail = await UserModel.exists({ email });
    if (existingEmail) {
      return res.status(409).json({
        message: "Validation failed.",
        errors: { email: "This email is already registered." },
      });
    }

    const existingUsername = await UserModel.exists({ username });
    if (existingUsername) {
      return res.status(409).json({
        message: "Validation failed.",
        errors: { username: "This username is already taken." },
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await UserModel.create({
      firstName,
      lastName,
      username,
      email,
      passwordHash,
      provider: "credentials",
      providers: ["credentials"],
    });

    return res.status(201).json({
      message: "Account created successfully.",
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Failed to create account. Please try again." });
  }
}
