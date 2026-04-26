import AnalysisResult from '../models/analysis.model.js';

export const getHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all analysis records for this organization, sorted by newest first
    // We only select the summary and URLs to keep the payload light.
    const history = await AnalysisResult.find({ organization: userId })
      .select('analyzed_at summary transactions_cloudinary_url accounts_cloudinary_url')
      .sort({ analyzed_at: -1 })
      .allowDiskUse(true)
      .exec();

    res.status(200).json({ history });
  } catch (error) {
    console.error("Error fetching analysis history:", error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};

export const getHistoryById = async (req, res) => {
  try {
    const userId = req.user._id;
    const recordId = req.params.id;

    // Fetch the full document including fraud_rings, suspicious_accounts, etc.
    const record = await AnalysisResult.findOne({ _id: recordId, organization: userId }).exec();

    if (!record) {
      return res.status(404).json({ error: "Analysis record not found or access denied." });
    }

    res.status(200).json({ record });
  } catch (error) {
    console.error("Error fetching history details:", error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};
