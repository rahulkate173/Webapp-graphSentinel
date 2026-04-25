import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  organization_name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  contact_person: String,
  contact_number: String,

  api_key: {
    type: String,
    unique: true
  },
  verified:{
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});


userSchema.pre("save", async function () {
  try {
    if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 10);
    }

    if (!this.api_key) {
      this.api_key = crypto.randomBytes(32).toString("hex");
    }

  } catch (err) {
    throw err; 
  }
});


userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const userModel = mongoose.model("user", userSchema);

export default userModel;