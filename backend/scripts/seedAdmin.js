import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Subscription from "../models/Subscription.js";
import config from "../config/config.js";
import database from "../config/database.js";

const seedAdmin = async () => {
  try {
    // Connect to database
    await database.connect();

    const adminEmail = "admin@gmail.com";
    const adminPassword = "admin123";

    // Check if admin already exists
    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      // Update existing admin
      admin.name = "Admin User";
      admin.password = adminPassword; // Will be hashed by pre-save middleware
      admin.role = "admin";
      admin.isActive = true;
      await admin.save();
      console.log("✅ Admin user updated successfully");
    } else {
      // Create new admin
      admin = await User.create({
        name: "Admin User",
        email: adminEmail,
        password: adminPassword,
        role: "admin",
        isActive: true,
        department: "management",
      });
      console.log("✅ Admin user created successfully");
    }

    // Create or update subscription for admin
    let subscription = await Subscription.findOne({ user: admin._id });
    if (!subscription) {
      subscription = await Subscription.create({
        user: admin._id,
        plan: "premium", // Admin gets premium plan
        status: "active",
        callLimit: 1000, // High limit for admin (or 0 for unlimited)
        callsUsed: 0,
        billingPeriod: "monthly",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      });
      console.log("✅ Admin subscription created");
    } else {
      // Update existing subscription with new fields if missing
      if (!subscription.callLimit) {
        subscription.plan = subscription.plan || "premium";
        subscription.callLimit = 1000; // High limit for admin
        subscription.callsUsed = subscription.callsUsed || 0;
        subscription.billingPeriod = subscription.billingPeriod || "monthly";
        await subscription.save();
        console.log("✅ Admin subscription updated with call limits");
      }
    }

    console.log("\n📋 Admin Credentials:");
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log("\n✅ Admin setup completed!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();

