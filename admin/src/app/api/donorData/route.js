import connectDB from "@/lib/dbConnect";
import donorDataModels from "@/models/donorDataModels";
import { NextResponse } from "next/server";
import Papa from "papaparse";

// Set max size for body parser
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export async function POST(request) {
  try {
    console.log("[POST] /api/donors/upload - starting process");

    await connectDB();
    console.log("✅ MongoDB connected");

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      console.warn("❌ No file uploaded");
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }

    if (!file.name?.endsWith(".csv") && file.type !== "text/csv") {
      console.warn("❌ Invalid file type:", file.type);
      return NextResponse.json(
        { message: "Please upload a valid CSV file" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      console.warn("❌ File too large:", file.size);
      return NextResponse.json(
        { message: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    const fileContent = await file.text();
    if (!fileContent.trim()) {
      console.warn("❌ Empty CSV file");
      return NextResponse.json(
        { message: "The CSV file is empty" },
        { status: 400 }
      );
    }

    const parseResult = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) =>
        header.trim().toLowerCase().replace(/\s+/g, "_"),
      transform: (value) => (typeof value === "string" ? value.trim() : value),
    });

    if (parseResult.errors.length > 0) {
      console.error("❌ Parsing errors:", parseResult.errors);
      return NextResponse.json(
        {
          message: "CSV parsing failed",
          errors: parseResult.errors.map((err) => err.message),
        },
        { status: 400 }
      );
    }

    const csvData = parseResult.data;

    if (!csvData.length) {
      return NextResponse.json(
        { message: "No valid data found in CSV file" },
        { status: 400 }
      );
    }

    // Required columns
    const requiredColumns = [
      "full_name",
      "email",
      "phone",
      "address",
      "donation_amount",
      "donation_date",
      "payment_method",
    ];
    const firstRow = csvData[0];
    const missingColumns = requiredColumns.filter((col) => !(col in firstRow));

    if (missingColumns.length > 0) {
      console.warn("❌ Missing columns:", missingColumns);
      return NextResponse.json(
        {
          message: `Missing required columns: ${missingColumns.join(", ")}`,
          requiredColumns,
          foundColumns: Object.keys(firstRow),
        },
        { status: 400 }
      );
    }

    // Data validation
    const validationErrors = [];
    csvData.forEach((row, i) => {
      const rowNum = i + 1;

      if (!row.full_name)
        validationErrors.push(`Row ${rowNum}: Missing full_name`);
      if (!row.email) {
        validationErrors.push(`Row ${rowNum}: Missing email`);
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
        validationErrors.push(`Row ${rowNum}: Invalid email`);
      }

      if (!row.phone) validationErrors.push(`Row ${rowNum}: Missing phone`);
      if (!row.address) validationErrors.push(`Row ${rowNum}: Missing address`);

      const amount = parseFloat(row.donation_amount);
      if (!row.donation_amount || isNaN(amount) || amount <= 0) {
        validationErrors.push(`Row ${rowNum}: Invalid donation_amount`);
      }

      if (!row.donation_date || isNaN(Date.parse(row.donation_date))) {
        validationErrors.push(`Row ${rowNum}: Invalid donation_date`);
      }

      if (!row.payment_method)
        validationErrors.push(`Row ${rowNum}: Missing payment_method`);
    });

    if (validationErrors.length > 0) {
      console.warn(`❌ ${validationErrors.length} validation errors found`);
      return NextResponse.json(
        {
          message: "Data validation failed",
          errors: validationErrors.slice(0, 10),
          totalErrors: validationErrors.length,
        },
        { status: 400 }
      );
    }

    // Upload data
    console.log("✅ Data valid. Uploading to DB...");
    const uploadResults = await donorDataModels.bulkUploadFromCSV(csvData);

    console.log("✅ Upload results:", uploadResults);

    return NextResponse.json({
      message: "Donor data uploaded successfully",
      totalRecords: uploadResults.totalRecords,
      successCount: uploadResults.successCount,
      failureCount: uploadResults.failureCount,
      errors: uploadResults.errors.slice(0, 10),
      summary: {
        processed: uploadResults.totalRecords,
        successful: uploadResults.successCount,
        failed: uploadResults.failureCount,
        successRate:
          (
            (uploadResults.successCount / uploadResults.totalRecords) *
            100
          ).toFixed(1) + "%",
      },
    });
  } catch (err) {
    console.error("❌ Server error during donor upload:", err);
    return NextResponse.json(
      {
        message: "Internal server error while processing donor data",
        error:
          process.env.NODE_ENV === "development"
            ? err.message
            : "Please try again later",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log("[GET] /api/donors — Fetching paginated donor list");
    await connectDB();

    const donors = await donorDataModels.find();

    return NextResponse.json({
      donors,
    });
  } catch (error) {
    console.error("❌ Error fetching donor data:", error);
    return NextResponse.json(
      { message: "Failed to fetch donor data" },
      { status: 500 }
    );
  }
}
