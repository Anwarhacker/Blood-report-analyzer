import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

// Define the Report schema
const ReportSchema = new mongoose.Schema({
  test_name: {
    type: String,
    required: true,
  },
  report_image_url: {
    type: String,
    required: true,
  },
  ai_result_json: {
    type: Object,
    required: false,
    default: null,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Check if the model already exists to prevent re-compilation
const Report = mongoose.models.Report || mongoose.model("Report", ReportSchema);

async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    console.log("Attempting to connect to MongoDB Atlas...");
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      bufferCommands: false,
    });
    console.log("✅ Successfully connected to MongoDB Atlas");
  } catch (error) {
    console.error("❌ MongoDB Atlas Connection Error:", error.message);
    console.error("Full error:", error);
    throw new Error(
      `Failed to connect to MongoDB Atlas. Please check your connection string, IP whitelist, and network connectivity. Error: ${error.message}`
    );
  }
}

export async function insertReport(reportData) {
  try {
    await connectToDatabase();
    const report = new Report(reportData);
    const savedReport = await report.save();
    return savedReport;
  } catch (error) {
    console.error("Error inserting report:", error);
    throw error;
  }
}

export async function getReports() {
  try {
    await connectToDatabase();
    const reports = await Report.find().sort({ created_at: -1 });
    return reports;
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw error;
  }
}
