const express = require('express');
const multer = require('multer');
const cors = require('cors');
const pdfParse = require('pdf-parse');
const tesseract = require('tesseract.js');
const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const docx = require('docx');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

// Initialize Express app
const app = express();
const port = 5000;

// Enable CORS
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

const apiKey = process.env.GOOGLE_API_KEY;
const customsearch = google.customsearch('v1');

// Define file upload route
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  const filePath = req.file.path;
  const fileExtension = path.extname(req.file.originalname).toLowerCase();
  let extractedText = '';

  try {
    if (fileExtension === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      extractedText = await pdfParse(dataBuffer);
    } else if (fileExtension === '.jpg' || fileExtension === '.jpeg' || fileExtension === '.png') {
      const img = fs.readFileSync(filePath);
      extractedText = await tesseract.recognize(img);
    } else if (fileExtension === '.docx') {
      const document = new docx.Document(fs.readFileSync(filePath));
      extractedText = document.paragraphs.map(p => p.text).join('\n');
    }
  } catch (error) {
    return res.status(500).json({ error: `Error processing file: ${error.message}` });
  } finally {
    fs.unlinkSync(filePath); // Delete the file after processing
  }

  console.log('File uploaded:', req.file);
  res.send({ message: 'File uploaded successfully', file: req.file, text: extractedText });
});

app.post('/generate-content', async (req, res) => {
  const { prompt, text } = req.body;

  try {
    const auth = new GoogleAuth({ apiKey });
    const client = await auth.getClient();
    const response = await customsearch.cse.list({
      auth: client,
      cx: 'YOUR_CX_ID', // Custom search engine ID
      q: prompt,
      num: 1,
    });

    res.json(response.data.items[0].snippet);
  } catch (error) {
    res.status(500).json({ error: `Error generating content: ${error.message}` });
  }
});

// Chatbot route
app.post('/chatbot', async (req, res) => {
  const { message } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/engines/davinci-codex/completions',
      {
        prompt: message,
        max_tokens: 150,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    res.json(response.data.choices[0].text);
  } catch (error) {
    res.status(500).json({ error: `Error with chatbot: ${error.message}` });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
