
import { NextResponse } from "next/server";
import { insertReport, getReports } from "@/lib/mongodb";

export async function POST(request) {
  try {
    const reportData = await request.json();
    const savedReport = await insertReport(reportData);
    return NextResponse.json(savedReport, { status: 201 });
  } catch (error) {
    console.error("API Error inserting report:", error);
    return NextResponse.json(
      { message: "Failed to insert report", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const reports = await getReports();
    return NextResponse.json(reports);
  } catch (error) {
    console.error("API Error fetching reports:", error);
    return NextResponse.json(
      { message: "Failed to fetch reports", error: error.message },
      { status: 500 }
    );
  }
}
