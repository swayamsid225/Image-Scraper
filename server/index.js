const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const mongoose = require('mongoose');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const sharp = require('sharp');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/imageScraper', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Mongoose Schema
const scrapeSchema = new mongoose.Schema({
  url: String,
  images: [String],
  date: { type: Date, default: Date.now },
});
const Scrape = mongoose.model('Scrape', scrapeSchema);

// Utility
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// API: Scrape images
app.post('/api/scrape', async (req, res) => {
  let { urls } = req.body;

  if (!urls || !Array.isArray(urls)) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  urls = Array.from(new Set(urls.map(url => url.trim()).filter(url => isValidUrl(url))));

  const results = {};

  await Promise.all(urls.map(async (url) => {
    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      const imgLinks = [];

      $('img').each((_, img) => {
        let src = $(img).attr('src');
        if (src && !src.startsWith('http')) {
          const base = new URL(url);
          src = base.origin + (src.startsWith('/') ? src : '/' + src);
        }
        if (src) imgLinks.push(src);
      });

      const uniqueImgs = Array.from(new Set(imgLinks));
      results[url] = uniqueImgs;

      const existing = await Scrape.findOne({ url });
      if (!existing) {
        await Scrape.create({ url, images: uniqueImgs });
      } else {
        existing.date = new Date();
        await existing.save();
      }
    } catch (err) {
      results[url] = [`Error: ${err.message}`];
    }
  }));

  res.json(results);
});

// API: Fetch history
app.get('/api/history', async (req, res) => {
  try {
    const history = await Scrape.find().sort({ date: -1 }).limit(10);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// API: Delete a history item
app.delete('/api/history', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required to delete history item' });
  }

  try {
    const result = await Scrape.deleteOne({ url });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'History item not found' });
    }
    res.json({ message: 'History item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete history item' });
  }
});

// API: Download selected images as ZIP
app.post('/api/download', async (req, res) => {
  const { images } = req.body;
  if (!images || !Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ error: 'No images to download' });
  }

  const zipPath = path.join(__dirname, 'images.zip');
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    res.download(zipPath, 'images.zip', () => {
      fs.unlinkSync(zipPath);
      fs.readdirSync(__dirname)
        .filter(file => file.startsWith('temp_'))
        .forEach(file => fs.unlinkSync(path.join(__dirname, file)));
    });
  });

  archive.on('error', (err) => res.status(500).send({ error: err.message }));
  archive.pipe(output);

  for (let i = 0; i < images.length; i++) {
    const imgUrl = images[i];
    try {
      const filename = `image_${i + 1}.png`;
      const filePath = path.join(__dirname, 'temp_' + filename);
      const client = imgUrl.startsWith('https') ? https : http;

      await new Promise((resolve, reject) => {
        client.get(imgUrl, (response) => {
          const chunks = [];
          response.on('data', chunk => chunks.push(chunk));
          response.on('end', async () => {
            try {
              const buffer = Buffer.concat(chunks);
              await sharp(buffer).png().toFile(filePath);
              archive.file(filePath, { name: filename });
              resolve();
            } catch (err) {
              reject(err);
            }
          });
        }).on('error', reject);
      });
    } catch (error) {
      continue;
    }
  }

  archive.finalize();
});

// Root
app.get('/', (req, res) => {
  res.send('Image Scraper API is running.');
});

// Start server
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
