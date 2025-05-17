
---

### 🧠 `THOUGHTS.md`

```markdown
# 🧠 Developer Thoughts

---

## 🔍 Approach & Logic

The core idea was to create a simple and elegant tool that automates the repetitive task of image scraping from websites, and enhances it with modern UI/UX using React + Tailwind CSS.

1. **Frontend**
   - Managed state using React hooks
   - Displayed scraped images in a responsive grid
   - Allowed toggling selection and downloading as ZIP
   - Used Axios for API calls, Tailwind for styling

2. **Backend**
   - Parsed HTML using Cheerio
   - Extracted all `<img>` tags and resolved their `src` attributes
   - Used Axios/HTTP/HTTPS to validate and store images
   - Created a ZIP using Archiver and streamed it to frontend
   - Stored history in MongoDB via Mongoose

---

## 🧗 Challenges Faced

| Challenge | Solution |
|----------|----------|
| Handling CORS and security headers from source sites | Used Axios + proper headers and fallback mechanisms |
| Validating and resolving relative image URLs | Used `url.resolve()` (legacy) or URL constructor |
| Ensuring responsive UI with image dimensions | Tailwind's utility classes & consistent aspect ratios |
| Downloading large ZIPs efficiently | Streamed the response using `archiver` and set headers |
| Avoiding duplicate URLs in history | Used `Set` and filtered on MongoDB side |

---

## 🧪 Improvements (Given More Time)

- 🌐 Support JavaScript-rendered sites (via Puppeteer or Playwright)
- 🏞️ Lazy loading and pagination of images
- 📂 Folder-based ZIP structure by domain
- 💬 User auth to save personal history
- ⏳ Rate limiting to prevent abuse
- 📈 Add analytics on usage
- ✅ Unit tests for API routes
- 🔒 Better input sanitization and error handling

---

## 💡 Lessons Learned

- DOM parsing with Cheerio is powerful but limited vs headless browsers
- User experience matters — subtle animations and feedback (loading, hover) improve usability
- Error messages should be as informative as possible

---

