import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      select: false,
    },
    provider: {
      type: String,
      default: "credentials",
    },
    providers: {
      type: [String],
      default: ["credentials"],
    },
    image: String,
  },
  {
    timestamps: true,
  },
);

const UserModel = mongoose.models.User || mongoose.model("User", userSchema);

export default UserModel;
