# AI Blood Report Analyzer

A frontend-only web application built with Next.js and TailwindCSS that allows users to upload blood test reports, select the test type, and analyze them using Google Gemini API. Reports are stored in MongoDB.

## Features

- Upload blood report images using Cloudinary
- Select test type (Dengue, Malaria, Typhoid, Thyroid, Diabetes, etc.)
- AI analysis using Google Gemini API
- Store and fetch analysis history in MongoDB
- Responsive design with TailwindCSS

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory and add the following variables:

```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name_here
CLOUDINARY_API_KEY=your_cloudinary_api_key_here
CLOUDINARY_API_SECRET=your_cloudinary_api_secret_here
MONGODB_URI=mongodb://localhost:27017/blood-report-db
```

### 3. Set up Google Gemini API

- Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Add it to `NEXT_PUBLIC_GEMINI_API_KEY`

### 4. Set up Cloudinary

- Create a Cloudinary account
- Get your cloud name, API key, and API secret from your dashboard
- Add them to the environment variables
- The app uses server-side upload via API route for secure authentication

### 5. Set up MongoDB

- Install MongoDB locally or use MongoDB Atlas
- For local MongoDB: Install MongoDB Community Server
- Start MongoDB service (default port 27017)
- The database will be created automatically when you first run the app
- Update MONGODB_URI if using a different port or remote instance

### 6. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

1. Go to the home page
2. Upload a blood report image using the upload button
3. Select the test type from the dropdown
4. Click "Analyze Report" to get AI analysis
5. View the results with parameters, status, summary, and recommendations
6. Check the History page to view past analyses

## Technologies Used

- Next.js 15
- TailwindCSS
- Google Gemini API
- Cloudinary
- MongoDB Atlas Data API
