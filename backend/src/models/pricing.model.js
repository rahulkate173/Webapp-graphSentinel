import mongoose from 'mongoose';

const pricingSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  businessEmail: {
    type: String,
    required: true,
  },
  jobTitle: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
  },
  websiteUrl: {
    type: String,
  },
  transactionsPerMonth: {
    type: String,
  },
  message: {
    type: String,
  },
  country: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const PricingInquiry = mongoose.model('PricingInquiry', pricingSchema);

export default PricingInquiry;
