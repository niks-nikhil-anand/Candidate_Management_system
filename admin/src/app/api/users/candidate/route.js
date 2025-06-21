import connectDB from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import userModels from "@/models/userModels";


export const POST = async (req) => {
  try {
    console.log("Database is connecting")
    await connectDB();
    console.log("Databse is connected")

    const body = await req.json();
    const { fullName, email, password, role } = body;

    if (!fullName || !email || !password || !role) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const existingUser = await userModels.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userModels.create({
      fullName,
      email,
      password: hashedPassword,
      role,
    });

    return NextResponse.json(
      { message: "User created successfully", userId: newUser._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating account:", error.message);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
};


export const GET = async () => {
  try {
    console.log("Connecting to database...");
    await connectDB();
    console.log("Database connected.");

    const candidates = await userModels
      .find({ role: "Candidate" })
      .select("-password"); // Exclude password field

    return NextResponse.json(
      { message: "Candidates fetched successfully", candidates },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching candidates:", error.message);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
};