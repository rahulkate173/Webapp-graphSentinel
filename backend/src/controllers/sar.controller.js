import sarDraftModel from '../models/sarDraft.model.js';
import { encryptSAR, decryptSAR } from '../utils/encryption.util.js';

export const saveDraft = async (req, res) => {
  try {
    const userId = req.user._id;
    const { formData } = req.body;

    if (!formData) {
      return res.status(400).json({ error: "formData is required" });
    }

    // Encrypt the sensitive JSON
    const { encryptedData, iv } = encryptSAR(formData);

    // Upsert the draft for the user
    await sarDraftModel.findOneAndUpdate(
      { user: userId },
      { encryptedData, iv },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "Draft saved securely." });
  } catch (error) {
    console.error("Error saving SAR draft:", error);
    res.status(500).json({ error: "Failed to save draft" });
  }
};

export const getDraft = async (req, res) => {
  try {
    const userId = req.user._id;

    const draft = await sarDraftModel.findOne({ user: userId });
    
    if (!draft) {
      return res.status(200).json({ formData: null }); // No draft found
    }

    // Decrypt back to plain JSON
    const formData = decryptSAR(draft.encryptedData, draft.iv);

    res.status(200).json({ formData });
  } catch (error) {
    console.error("Error fetching SAR draft:", error);
    res.status(500).json({ error: "Failed to load draft" });
  }
};

export const clearDraft = async (req, res) => {
  try {
    const userId = req.user._id;
    await sarDraftModel.findOneAndDelete({ user: userId });
    res.status(200).json({ message: "Draft cleared." });
  } catch (error) {
    console.error("Error clearing SAR draft:", error);
    res.status(500).json({ error: "Failed to clear draft" });
  }
};
