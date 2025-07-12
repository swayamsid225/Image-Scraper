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

// MongoDB setup
mongoose.connect(process.env.MONGODB_URI);
const scrapeSchema = new mongoose.Schema({
  url: String,
  images: [String],
  date: { type: Date, default: Date.now },
});
const Scrape = mongoose.model('Scrape', scrapeSchema);

// Helper to validate URL
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

//Scrape images
app.post('/api/scrape', async (req, res) => {
  let { urls } = req.body;
  if (!urls || !Array.isArray(urls)) return res.status(400).json({ error: 'Invalid input' });

  urls = Array.from(new Set(urls.map(url => url.trim()).filter(isValidUrl)));

  const results = {};

  await Promise.all(urls.map(async (url) => {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });

      const $ = cheerio.load(response.data);
      const imgLinks = [];

      $('img').each((_, img) => {
        let src = $(img).attr('src') ||
          $(img).attr('data-src') ||
          $(img).attr('data-lazy') ||
          $(img).attr('data-original');

        if (src) {
          try {
            const base = new URL(url);
            if (!src.startsWith('http')) {
              src = base.origin + (src.startsWith('/') ? src : '/' + src);
            }
            imgLinks.push(src);
          } catch (_) { }
        }
      });

      const uniqueImgs = Array.from(new Set(imgLinks));
      results[url] = uniqueImgs;

      const existing = await Scrape.findOne({ url });
      if (!existing) {
        await Scrape.create({ url, images: uniqueImgs });
      } else {
        existing.date = new Date();
        existing.images = uniqueImgs;
        await existing.save();
      }
    } catch (err) {
      results[url] = [`Error: ${err.message}`];
    }
  }));

  res.json(results);
});

//History
app.get('/api/history', async (req, res) => {
  try {
    const history = await Scrape.find().sort({ date: -1 }).limit(10);

    if (!Array.isArray(history)) {
      return res.status(500).json({ error: 'History format invalid' });
    }

    res.json(history);
  } catch (err) {
    console.error("Fetch history error:", err.message);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});


//Delete history
app.delete('/api/history', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });

  try {
    const result = await Scrape.deleteOne({ url });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ error: 'Delete failed' });
  }
});

//Download selected images as ZIP
app.post('/api/download', async (req, res) => {
  const { images } = req.body;
  if (!Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ error: 'No images provided' });
  }

  const zipPath = path.join(__dirname, 'images.zip');
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    // Only trigger download after archive is finalized and closed
    res.download(zipPath, 'images.zip', (err) => {
      if (err) {
        console.error('Download failed:', err.message);
        return;
      }

      if (fs.existsSync(zipPath)) {
        try {
          fs.unlinkSync(zipPath);
        } catch (err) {
          console.error('Error deleting ZIP file:', err.message);
        }
      }

      fs.readdirSync(__dirname)
        .filter(f => f.startsWith('temp_'))
        .forEach(f => {
          try {
            fs.unlinkSync(path.join(__dirname, f));
          } catch (err) {
            console.error('Failed to delete temp file:', f);
          }
        });
    });
  });

  archive.on('error', err => {
    console.error('Archive error:', err.message);
    res.status(500).json({ error: 'Failed to create ZIP archive' });
  });

  archive.pipe(output);

  for (let i = 0; i < images.length; i++) {
    const imgUrl = images[i];
    try {
      const filename = `image_${i + 1}.png`;
      const filePath = path.join(__dirname, 'temp_' + filename);
      const client = imgUrl.startsWith('https') ? https : http;

      await new Promise((resolve, reject) => {
        client.get(imgUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Referer': 'https://www.google.com'
          }
        }, (response) => {
          const chunks = [];
          response.on('data', chunk => chunks.push(chunk));
          response.on('end', async () => {
            try {
              const buffer = Buffer.concat(chunks);
              await sharp(buffer).png().toFile(filePath);
              archive.file(filePath, { name: filename });
              resolve();
            } catch (err) {
              console.warn(`Failed to process image ${imgUrl}: ${err.message}`);
              resolve(); // skip the image but allow the ZIP to continue
            }
          });
        }).on('error', (err) => {
          console.warn(`Failed to download image ${imgUrl}: ${err.message}`);
          resolve(); // skip image on error
        });
      });
    } catch (err) {
      console.warn(`Unexpected error with image ${imgUrl}: ${err.message}`);
      continue;
    }
  }

  archive.finalize();
});


//IMAGE PROXY to bypass 403
app.get('/api/proxy', (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) return res.status(400).send('Missing image URL');

  const client = imageUrl.startsWith('https') ? https : http;

  client.get(imageUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Accept': 'image/*,*/*',
      'Referer': 'https://www.google.com'
    }
  }, (response) => {
    if (response.statusCode !== 200) {
      res.status(response.statusCode).send(`Failed to fetch image: ${response.statusCode}`);
      return;
    }

    res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
    response.pipe(res);
  }).on('error', (err) => {
    console.error('Proxy error:', err.message);
    res.status(500).send('Failed to proxy image');
  });
});

// Root
app.get('/', (req, res) => {
  res.send('Image Scraper API is running.');
});

//Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
