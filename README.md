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

```
<h3>Output Images</h3>

<table>
  <tr>
    <td align="center">
      <strong>Output Image</strong><br>
      <img src="images/Screenshot 2025-05-17 172606.png" width="200">
    </td>
    <td align="center">
      <strong>Download in Zip</strong><br>
      <img src="images/Screenshot 2025-05-17 172621.png" width="200">
    </td>
    <td align="center">
      <strong>Multiple Links</strong><br>
      <img src="images/Screenshot 2025-05-17 172910.png" width="200">
    </td>
  </tr>
  <tr>
    <td align="center">
      <strong>Link History</strong><br>
      <img src="images/Screenshot 2025-05-17 173000.png" width="200">
    </td>
    <td align="center">
      <strong>Mobile View</strong><br>
      <img src="images/Screenshot 2025-05-17 173026.png" width="200">
    </td>
    <td align="center">
      <strong>Responsive</strong><br>
      <img src="images/Screenshot 2025-05-17 173039.png" width="200">
    </td>
  </tr>
</table>
