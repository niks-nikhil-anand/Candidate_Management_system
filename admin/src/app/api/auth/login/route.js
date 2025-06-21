import connectDB from "@/lib/dbConnect";
import userModels from "@/models/userModels";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import loginDetailModels from "@/models/loginDetailModels";

export const POST = async (req) => {
  try {
    console.log("Connecting to the database...");
    await connectDB();
    console.log("Database connection established.");

    // Parse the JSON body of the request
    const { email, password, rememberMe } = await req.json();

    console.log("Finding user by email:", email);
    const user = await userModels.findOne({ email });

    if (!user) {
      console.log("User not found:", email);
      return NextResponse.json({ msg: "User Not Found" }, { status: 401 });
    }

    // Compare the provided password with the hashed password in the database
    console.log("Comparing passwords...");
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password does not match for email:", email);
      return NextResponse.json(
        { msg: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if user status is "Active"
    console.log("Checking user status...");
    if (user.status !== "Active") {
      console.log("User status is not Active:", user.status);
      return NextResponse.json({ msg: "Not Authorised" }, { status: 403 });
    }

    // Check if the user's role matches the required role
    console.log("Checking user role...");

    // Generate a JWT token
    console.log("Generating token...");
    const token = generateToken({ id: user._id, role: user.role });

    // Track login details
    console.log("Tracking login details...");
    await trackLoginDetails(user._id, req);

    const response = NextResponse.json(
      { msg: "Login successful" },
      { status: 200 }
    );

    // Set the cookie with the token
    console.log("Setting cookie with token...");
    response.cookies.set("adminAuthToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7, // 1 month if 'rememberMe', otherwise 1 week
      path: "/",
    });

    console.log("Response with cookie:", response);
    console.log("Generated token:", token);

    return response;
  } catch (error) {
    console.error("Error processing login:", error);
    return NextResponse.json(
      { msg: "Error processing login", error: error.message || error },
      { status: 500 }
    );
  }
};

// Function to generate a JWT token
function generateToken(user) {
  console.log("Generating token for user:", user);
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1d" });
}

// Function to track login details
async function trackLoginDetails(userId, req) {
  try {
    // Get user agent and parse it
    const userAgent = req.headers.get("user-agent") || "";
    const deviceInfo = parseUserAgent(userAgent);

    // Check if there's already a login record for today
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const existingLogin = await loginDetailModels.findOne({
      user: userId,
      loginDate: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    });

    if (existingLogin) {
      // Update existing login record
      existingLogin.loginTime = new Date().toLocaleTimeString();
      existingLogin.totalLogins += 1;
      existingLogin.device = deviceInfo.device;
      existingLogin.userAgent = userAgent;
      existingLogin.os = deviceInfo.os;
      existingLogin.platform = deviceInfo.platform;
      existingLogin.browser = deviceInfo.browser;
      existingLogin.browserVersion = deviceInfo.browserVersion;
      existingLogin.engine = deviceInfo.engine;
      await existingLogin.save();
      console.log("Updated existing login record for user:", userId);
    } else {
      // Create new login record
      const newLoginDetail = new loginDetailModels({
        user: userId,
        totalLogins: 1,
        device: deviceInfo.device,
        userAgent: userAgent,
        os: deviceInfo.os,
        platform: deviceInfo.platform,
        browser: deviceInfo.browser,
        browserVersion: deviceInfo.browserVersion,
        engine: deviceInfo.engine
      });
      await newLoginDetail.save();
      console.log("Created new login record for user:", userId);
    }
  } catch (error) {
    console.error("Error tracking login details:", error);
    // Don't throw error here to avoid breaking the login process
  }
}

// Function to parse user agent and extract device information
function parseUserAgent(userAgent) {
  const ua = userAgent.toLowerCase();
  
  // Device detection
  let device = 'Desktop';
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    device = 'Mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    device = 'Tablet';
  } else if (!ua.includes('desktop') && !ua.includes('windows') && !ua.includes('macintosh') && !ua.includes('linux')) {
    device = 'Other';
  }

  // OS detection
  let os = '';
  if (ua.includes('windows')) {
    os = 'Windows';
  } else if (ua.includes('macintosh') || ua.includes('mac os')) {
    os = 'macOS';
  } else if (ua.includes('linux')) {
    os = 'Linux';
  } else if (ua.includes('android')) {
    os = 'Android';
  } else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ios')) {
    os = 'iOS';
  } else {
    os = 'Unknown';
  }

  // Platform detection
  let platform = '';
  if (ua.includes('x86_64') || ua.includes('amd64')) {
    platform = 'x64';
  } else if (ua.includes('x86') || ua.includes('i386')) {
    platform = 'x86';
  } else if (ua.includes('arm')) {
    platform = 'ARM';
  } else {
    platform = 'Unknown';
  }

  // Browser detection
  let browser = '';
  let browserVersion = '';
  
  if (ua.includes('firefox')) {
    browser = 'Firefox';
    const match = ua.match(/firefox\/(\d+\.\d+)/);
    browserVersion = match ? match[1] : '';
  } else if (ua.includes('chrome') && !ua.includes('edg')) {
    browser = 'Chrome';
    const match = ua.match(/chrome\/(\d+\.\d+)/);
    browserVersion = match ? match[1] : '';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Safari';
    const match = ua.match(/version\/(\d+\.\d+)/);
    browserVersion = match ? match[1] : '';
  } else if (ua.includes('edg')) {
    browser = 'Edge';
    const match = ua.match(/edg\/(\d+\.\d+)/);
    browserVersion = match ? match[1] : '';
  } else if (ua.includes('opera') || ua.includes('opr')) {
    browser = 'Opera';
    const match = ua.match(/(?:opera|opr)\/(\d+\.\d+)/);
    browserVersion = match ? match[1] : '';
  } else {
    browser = 'Unknown';
  }

  // Engine detection
  let engine = '';
  if (ua.includes('webkit')) {
    if (ua.includes('blink')) {
      engine = 'Blink';
    } else {
      engine = 'WebKit';
    }
  } else if (ua.includes('gecko')) {
    engine = 'Gecko';
  } else if (ua.includes('trident')) {
    engine = 'Trident';
  } else {
    engine = 'Unknown';
  }

  return {
    device,
    os,
    platform,
    browser,
    browserVersion,
    engine
  };
}