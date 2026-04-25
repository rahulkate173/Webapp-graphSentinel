import mongoose from 'mongoose';

const sarDraftSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
      unique: true // A user only has one active draft at a time
    },
    encryptedData: {
      type: String,
      required: true
    },
    iv: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const sarDraftModel = mongoose.model('sarDraft', sarDraftSchema);

export default sarDraftModel;
