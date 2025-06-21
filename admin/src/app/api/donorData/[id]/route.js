import connectDB from "@/lib/dbConnect";
import donorDataModels from "@/models/donorDataModels";
import { NextResponse } from "next/server";


// GET donor by ID
export const GET = async (req, { params }) => {
  try {
    await connectDB();
    const { id } = params;
    console.log("Fetching donor by ID:", id);

    const donor = await donorDataModels.findById(id);
    if (!donor) {
      return NextResponse.json({ message: "Donor not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Donor fetched successfully", data: donor },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching donor", error: error.message },
      { status: 500 }
    );
  }
};

// DELETE donor by ID
export const DELETE = async (req, { params }) => {
  try {
    await connectDB();
    const { id } = params;

    const deletedDonor = await donorDataModels.findByIdAndDelete(id);
    if (!deletedDonor) {
      return NextResponse.json({ message: "Donor not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Donor deleted successfully", data: deletedDonor },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting donor", error: error.message },
      { status: 500 }
    );
  }
};

// PUT – Replace donor data completely
export const PUT = async (req, { params }) => {
  try {
    await connectDB();
    const { id } = params;
    const newData = await req.json();

    const updatedDonor = await donorDataModels.findByIdAndUpdate(id, newData, {
      new: true,
      overwrite: true,
      runValidators: true,
    });

    if (!updatedDonor) {
      return NextResponse.json({ message: "Donor not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Donor replaced successfully", data: updatedDonor },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error replacing donor", error: error.message },
      { status: 500 }
    );
  }
};

// PATCH – Partially update donor
export const PATCH = async (req, { params }) => {
  try {
    await connectDB();
    const { id } = params;
    const updates = await req.json();

    const updatedDonor = await donorDataModels.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedDonor) {
      return NextResponse.json({ message: "Donor not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Donor updated successfully", data: updatedDonor },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating donor", error: error.message },
      { status: 500 }
    );
  }
};
