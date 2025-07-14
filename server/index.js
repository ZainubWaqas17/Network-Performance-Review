const express = require('express');
const cors = require('cors');
const multer = require('multer'); // for file uploads
const processExcel = require('./processExcel');
const app = express();

app.use(cors()); // cors to allow frontend to make requests to backend
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const upload = multer();

// defines a post endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    console.log("Upload endpoint hit");

    const { siteList, startDate, endDate, penaltyRate } = req.body;
    const buffer = req.file.buffer;

    const result = await processExcel(
      buffer,
      JSON.parse(siteList),
      startDate,
      endDate,
      parseFloat(penaltyRate) || 0
    );

    console.log("Processed result:", result);
    res.json(result);
  } catch (err) {
    console.error("Error in upload route:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
