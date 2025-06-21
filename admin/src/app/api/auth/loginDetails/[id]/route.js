import connectDB from "@/lib/dbConnect";
import loginDetailModels from "@/models/loginDetailModels";
import { NextResponse } from "next/server";

export const GET = async (req, { params }) => {
  try {
    await connectDB();

    const { id } = await params;
    console.log(id)
    console.log("Fetching login details for user ID:", id);

    const loginDetails = await loginDetailModels.find({ user: id });

    if (!loginDetails || loginDetails.length === 0) {
      return NextResponse.json({ message: "No login details found for this user" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Login details fetched successfully", data: loginDetails },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching login details:", error);
    return NextResponse.json(
      { message: "Error fetching login details", error: error.message },
      { status: 500 }
    );
  }
};
