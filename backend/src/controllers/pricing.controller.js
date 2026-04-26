import PricingInquiry from '../models/pricing.model.js';

export const submitPricingInquiry = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      businessEmail,
      jobTitle,
      phoneNumber,
      websiteUrl,
      transactionsPerMonth,
      message,
      country,
    } = req.body;

    if (!firstName || !lastName || !businessEmail || !jobTitle) {
      return res.status(400).json({ error: 'Required fields are missing.' });
    }

    const newInquiry = new PricingInquiry({
      firstName,
      lastName,
      businessEmail,
      jobTitle,
      phoneNumber,
      websiteUrl,
      transactionsPerMonth,
      message,
      country,
    });

    await newInquiry.save();

    res.status(201).json({
      message: 'Pricing inquiry submitted successfully.',
      inquiry: newInquiry,
    });
  } catch (error) {
    console.error('Error submitting pricing inquiry:', error);
    res.status(500).json({ error: 'Failed to submit pricing inquiry. Please try again later.' });
  }
};
