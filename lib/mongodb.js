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
    required: true,
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
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    throw new Error(
      `Failed to connect to MongoDB. Please ensure MongoDB is running locally on port 27017. Error: ${error.message}`
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
