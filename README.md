# Network Performance Review Automation App

This project automates the performance review of telecom mobile network sites by processing KPI data from Excel files. Users can input a site number and date range to visualize outages, calculate key metrics, and export results for reporting.

## Features

- Upload and parse telecom KPI Excel files
- Filter by site number and date range
- Display outage metrics and summaries
- Export filtered results to Excel
- Simple, user-friendly interface

## Tech Stack

| Layer       | Technology                   |
|-------------|------------------------------|
| Frontend    | React.js + Bootstrap         |
| Backend     | Node.js + Express.js         |
| Excel Parsing | xlsx npm package           |
| Styling     | Bootstrap 5                  |

## Project Structure

- `client/`: React frontend (UI for uploading, filtering, visualizing data)
- `server/`: Express backend (handles Excel processing and API routes)



## Getting Started

### Clone the repository

   - git clone https://github.com/your-username/jazz-network-review.git
   - cd jazz-network-review

### Install Dependencies

  ##### Backend dependencies
- cd server
- npm install

##### Frontend dependencies
- cd ../client
- npm install

### Run the App (in two terminals)

##### Terminal 1 - Start backend
- cd server
- node index.js

##### Terminal 2 - Start frontend
- cd client
- npm start

### Access the App

Open your browser and go to:
http://localhost:3000





