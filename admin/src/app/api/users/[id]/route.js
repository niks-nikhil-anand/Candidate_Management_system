import connectDB from "@/lib/dbConnect";
import userModels from "@/models/userModels";
import { NextResponse } from "next/server";


// GET user by slug (assuming slug is user ID or email/username)
export const GET = async (req, { params }) => {
  try {
    await connectDB();
    const { id } = await params;
    console.log(id)

    const user = await userModels.findOne({ _id: id }).select("-password");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "User fetched successfully", data: user },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching user", error: error.message },
      { status: 500 }
    );
  }
};

// DELETE user by slug (user ID)
export const DELETE = async (req, { params }) => {
  try {
    await connectDB();
    const { slug } = params;

    const deletedUser = await userModels.findByIdAndDelete(slug);
    if (!deletedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "User deleted successfully", data: deletedUser },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting user", error: error.message },
      { status: 500 }
    );
  }
};

// PUT – Replace user data completely
export const PUT = async (req, { params }) => {
  try {
    await connectDB();
    const { id } = params;
    const newData = await req.json();

    const updatedUser = await userModels.findByIdAndUpdate(id, newData, {
      new: true,
      overwrite: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "User replaced successfully", data: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error replacing user", error: error.message },
      { status: 500 }
    );
  }
};

// PATCH – Partially update user
export const PATCH = async (req, { params }) => {
  try {
    await connectDB();
    const { slug } = params;
    const updates = await req.json();

    const updatedUser = await userModels.findByIdAndUpdate(slug, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "User updated successfully", data: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating user", error: error.message },
      { status: 500 }
    );
  }
};
