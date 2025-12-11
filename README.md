# Police Department Dashboard - Frontend

## 🚀 Project Overview

This project is a modern, real-time dashboard for managing police complaints and viewing analytics. It is built to be fast, responsive, and easy to use for officers and administrators.

## 🛠️ Tech Stack & Tools

We are using the latest and most efficient web technologies:

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router) - The React framework for the web.
- **Language**: [TypeScript](https://www.typescriptlang.org/) - For type-safe and robust code.
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) - For rapid, beautiful UI design.
- **Icons**: [Lucide React](https://lucide.dev/) - Clean and consistent icons.
- **Backend & Database**: [Supabase](https://supabase.com/) - Provides the database, authentication, and real-time capabilities.
- **UI Components**: Custom components built with accessibility in mind (using Radix UI primitives).

## 📂 Project Structure

Here is how the project is organized:

- **`app/`**: Contains all the pages and routes.
  - `complaints/`: The main complaints management page.
  - `analytics/`: The data visualization dashboard.
  - `layout.tsx`: The main wrapper for the app (includes navigation).
- **`components/`**: Reusable UI parts like Buttons, Cards, and the Navigation bar.
- **`lib/`**: Helper functions, specifically `supabaseClient.ts` for connecting to the database.

## 🔄 How It Works

1.  **Real-time Data**: The app connects to Supabase to fetch complaints instantly. When a new complaint is filed (e.g., via the Telegram bot), it appears here immediately without refreshing.
2.  **Complaint Management**:
    - **Pending**: New complaints arrive here. You can **Accept** (move to Open) or **Reject** (move to Closed).
    - **Open**: Active investigations.
    - **Closed**: Resolved or rejected cases.
3.  **Analytics**: Visualizes data to help understand crime trends and complaint volumes.

## 🏃‍♂️ How to Run Locally

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Run the Server**:
    ```bash
    npm run dev
    ```
3.  **Access the App**:
    Open [http://localhost:1002](http://localhost:1002) in your browser.
