import mongoose from "mongoose";
import { createApp, useModules, finishApp } from "./app.js";
import EmailCronService from "./src/config/email-cron-job.js";

const app = createApp();

useModules(app);
finishApp(app);

const emailCronService = new EmailCronService();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGOOSE_URI);
    console.log("✅ MongoDB connected successfully");

    // Start email cron job after DB connection
    console.log("🔄 Initializing email cron service...");

    // Test email configuration first
    const isEmailConfigValid = await emailCronService.testEmailConfig();

    if (isEmailConfigValid) {
      emailCronService.start();
    } else {
      console.error("❌ Email configuration invalid. Cron job not started.");
    }
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

try {
  connectDB();
  const PORT = process.env.APPLICATIONPORT || 4000;
  app.listen(PORT);
  console.log(`server connected at ${PORT}`);
} catch (err) {
  console.log(err);
}
