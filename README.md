# hackthehaze-fullstack-image-scraper

link - https://image-scraperr.netlify.app/

# 🖼️ Image Scraper

A full-stack web application that scrapes images from provided URLs, displays them in a responsive grid, and allows downloading selected images in a ZIP file.

---

## 🚀 Project Overview

This app allows users to input one or more webpage URLs, scrape all images from them, view them in a clean UI, select images, and download selected ones as a ZIP file. It also maintains a history of scraped URLs for quick reuse.

---

## 🛠️ Tech Stack

### Frontend:
- ⚛️ React with Tailwind CSS
- 📦 Axios (API requests)
- 💡 Lordicon (animated icons)

### Backend:
- 🖥️ Node.js + Express
- 🔍 Cheerio (HTML parsing)
- 🌐 Axios / HTTP / HTTPS for fetching images
- 🗜️ Archiver (ZIP creation)
- 🧠 Sharp (optional for image processing)
- 📦 MongoDB (history storage via Mongoose)

---

## 🛠️ Setup Instructions

### 🔧 Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)

---

### 🧩 Installation

#### 1️⃣ Backend Setup

```bash
cd backend
npm install
