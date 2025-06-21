import mongoose from "mongoose";

const donorDataSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters long"],
      maxlength: [100, "Full name cannot exceed 100 characters"]
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      // More flexible phone validation to handle international formats
      match: [/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"]
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      minlength: [10, "Address must be at least 10 characters long"],
      maxlength: [500, "Address cannot exceed 500 characters"]
    },
    donationAmount: {
      type: Number,
      required: [true, "Donation amount is required"],
      min: [0.01, "Donation amount must be greater than 0"],
      validate: {
        validator: function(value) {
          return !isNaN(value) && isFinite(value);
        },
        message: "Please provide a valid donation amount"
      }
    },
    donationDate: {
      type: Date,
      required: [true, "Donation date is required"],
      validate: {
        validator: function(date) {
          return date <= new Date();
        },
        message: "Donation date cannot be in the future"
      }
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
      enum: {
        values: ["Credit Card", "Debit Card", "Bank Transfer", "Check", "Cash", "UPI", "PayPal", "Other"],
        message: "Please select a valid payment method"
      },
      trim: true
    },
    notes: {
      type: String,
      default: "",
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters"]
    },
    // Aggregated fields for tracking
    totalDonated: {
      type: Number,
      default: function() {
        return this.donationAmount || 0;
      }
    },
    donationHistory: [{
      amount: {
        type: Number,
        required: true
      },
      date: {
        type: Date,
        required: true
      },
      paymentMethod: {
        type: String,
        required: true
      },
      notes: {
        type: String,
        default: ""
      }
    }],
    lastDonated: {
      type: Date,
      default: function() {
        return this.donationDate;
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    source: {
      type: String,
      enum: ["CSV Upload", "Manual Entry", "Website Form", "Mobile App"],
      default: "CSV Upload"
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better performance
donorDataSchema.index({ email: 1 }, { unique: true });
donorDataSchema.index({ phone: 1 });
donorDataSchema.index({ donationDate: -1 });
donorDataSchema.index({ totalDonated: -1 });
donorDataSchema.index({ createdAt: -1 });

// Virtual for donor display name
donorDataSchema.virtual('displayName').get(function() {
  return this.fullName || this.email;
});

// Virtual for formatted donation amount
donorDataSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(this.donationAmount || 0);
});

// Pre-save middleware to update donation history
donorDataSchema.pre('save', function(next) {
  if (this.isNew) {
    // Add initial donation to history
    this.donationHistory.push({
      amount: this.donationAmount,
      date: this.donationDate,
      paymentMethod: this.paymentMethod,
      notes: this.notes
    });
    this.totalDonated = this.donationAmount;
    this.lastDonated = this.donationDate;
  }
  next();
});

// Static method to find or update donor
donorDataSchema.statics.findOrUpdateDonor = async function(donorData) {
  try {
    const existingDonor = await this.findOne({ email: donorData.email });
    
    if (existingDonor) {
      // Update existing donor
      existingDonor.donationHistory.push({
        amount: donorData.donationAmount,
        date: donorData.donationDate,
        paymentMethod: donorData.paymentMethod,
        notes: donorData.notes || ''
      });
      
      existingDonor.totalDonated += donorData.donationAmount;
      existingDonor.lastDonated = donorData.donationDate;
      
      // Update other fields if they're different
      if (donorData.fullName && donorData.fullName !== existingDonor.fullName) {
        existingDonor.fullName = donorData.fullName;
      }
      if (donorData.phone && donorData.phone !== existingDonor.phone) {
        existingDonor.phone = donorData.phone;
      }
      if (donorData.address && donorData.address !== existingDonor.address) {
        existingDonor.address = donorData.address;
      }
      
      return await existingDonor.save();
    } else {
      // Create new donor
      return await this.create(donorData);
    }
  } catch (error) {
    throw error;
  }
};

// Static method for bulk CSV upload
donorDataSchema.statics.bulkUploadFromCSV = async function(csvData) {
  const results = {
    totalRecords: csvData.length,
    successCount: 0,
    failureCount: 0,
    errors: []
  };

  for (let i = 0; i < csvData.length; i++) {
    try {
      const row = csvData[i];
      
      // Map CSV columns to schema fields
      const donorData = {
        fullName: row.full_name?.trim(),
        email: row.email?.trim().toLowerCase(),
        phone: row.phone?.trim(),
        address: row.address?.trim(),
        donationAmount: parseFloat(row.donation_amount),
        donationDate: new Date(row.donation_date),
        paymentMethod: row.payment_method?.trim(),
        notes: row.notes?.trim() || '',
        source: 'CSV Upload'
      };

      // Validate required fields
      if (!donorData.fullName || !donorData.email || !donorData.phone || 
          !donorData.address || !donorData.donationAmount || !donorData.donationDate || 
          !donorData.paymentMethod) {
        throw new Error(`Missing required fields in row ${i + 1}`);
      }

      await this.findOrUpdateDonor(donorData);
      results.successCount++;
      
    } catch (error) {
      results.failureCount++;
      results.errors.push({
        row: i + 1,
        error: error.message
      });
    }
  }

  return results;
};

export default mongoose.models.DonorData || mongoose.model("DonorData", donorDataSchema);