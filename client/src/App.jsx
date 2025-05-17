import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ImageScraper() {
  const [urls, setUrls] = useState('');
  const [images, setImages] = useState({});
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('https://hackthehaze-fullstack-image-scraper.onrender.com/api/history');
      setHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch history');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setImages({});
    setSelected([]);
    setError('');

    try {
      const inputUrls = urls
        .split(/\s|,/) // split by spaces or commas
        .map(u => u.trim())
        .filter(u => u && /^https?:\/.+/.test(u));

      const uniqueUrls = Array.from(new Set(inputUrls));

      const res = await axios.post('https://hackthehaze-fullstack-image-scraper.onrender.com/api/scrape', {
        urls: uniqueUrls
      });
      setImages(res.data);
      fetchHistory();
    } catch (err) {
      setError('Failed to scrape. Check URLs and try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (src) => {
    setSelected(prev =>
      prev.includes(src) ? prev.filter(i => i !== src) : [...prev, src]
    );
  };

  const handleDownloadSelected = async () => {
    try {
      const res = await axios.post('https://hackthehaze-fullstack-image-scraper.onrender.com/api/download', { images: selected }, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/zip' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'selected-images.zip';
      link.click();
    } catch (err) {
      alert('Failed to download selected images');
    }
  };

  const handleHistoryClick = async (url) => {
    setUrls(url);
    try {
      setLoading(true);
      const res = await axios.post('https://hackthehaze-fullstack-image-scraper.onrender.com/api/scrape', {
        urls: [url]
      });
      setImages(res.data);
    } catch (err) {
      setError('Failed to scrape from history');
    } finally {
      setLoading(false);
    }
  };

  const handleClearUrls = () => {
    setUrls('');
    setImages({});
    setSelected([]);
  };

  const handleRemoveTopHistory = async () => {
    if (history.length === 0) return;
    const topHistoryItem = history[0];
    try {
      await axios.delete(`https://hackthehaze-fullstack-image-scraper.onrender.com/api/history`, { data: { url: topHistoryItem.url } });
      fetchHistory();
    } catch (err) {
      console.error('Failed to remove top history item');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-6 text-center text-blue-900 flex items-center justify-center gap-2 group">
          <lord-icon
            src="https://cdn.lordicon.com/wahyhize.json"
            trigger="loop"
            state="loop-sea"
            style={{ width: '48px', height: '48px' }}
          ></lord-icon>
          <span>
            Image Scraper
          </span>
        </h1>



        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-lg space-y-4">
          <div className="relative">
  <textarea
    rows="4"
    placeholder="Enter URLs (comma-separated or multiline)"
    value={urls}
    onChange={(e) => setUrls(e.target.value)}
    className="w-full p-3 pr-12 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
  />
  <button
    type="button"
    onClick={handleClearUrls}
    className="absolute top-2 right-2"
  >
    <lord-icon
      src="https://cdn.lordicon.com/ebyacdql.json"
      trigger="hover"
      colors="primary:#e83a30"
    ></lord-icon>
  </button>
</div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-3 group"
          >
            <lord-icon
              src="https://cdn.lordicon.com/rihvnffu.json"
              trigger="hover"
              colors="primary:#e8e230">
            </lord-icon>

            <span className="transition-all duration-300 transform group-hover:scale-105 group-hover:tracking-wide">
              Scrape Images
            </span>
          </button>

        </form>

        {loading && (
          <p className="mt-4 text-center text-blue-900 animate-pulse flex items-center justify-center gap-2">
            Loading
            <lord-icon
              src="https://cdn.lordicon.com/tewlfgbl.json"
              trigger="loop"
              state="loop-expand-alt-2"
              colors="primary:#0d47a1"
              style={{ width: '28px', height: '28px' }}
            ></lord-icon>
          </p>
        )}
        {error && <p className="mt-4 text-center text-red-500">{error}</p>}

        {Object.keys(images).length > 0 && (
          <>
            {selected.length > 0 && (
              <button
                onClick={handleDownloadSelected}
                className="mt-4 mb-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded shadow-lg flex items-center gap-2"
              >
                <lord-icon
                  src="https://cdn.lordicon.com/qwybfpea.json"
                  trigger="hover"
                  colors="primary:#ffffff"
                  style={{ width: "24px", height: "24px" }}
                ></lord-icon>
                Download Selected Images ({selected.length})
              </button>

            )}
            <div className="mt-8 space-y-10">
              {Object.entries(images).map(([url, imgLinks]) => (
                <div key={url}>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2 break-words flex items-center gap-2">
                    <lord-icon
                      src="https://cdn.lordicon.com/ymjswsps.json"
                      trigger="hover"
                      colors="primary:#0d47a1"
                      style={{ width: '24px', height: '24px' }}
                    ></lord-icon>
                    {url}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {imgLinks.map((src, idx) => (
                      <div
                        key={idx}
                        className={`relative cursor-pointer border-4 transition duration-200 ease-in-out transform hover:scale-105 ${selected.includes(src) ? 'border-blue-500' : 'border-transparent'}`}
                        onClick={() => toggleSelect(src)}
                      >
                        <img
                          src={src}
                          alt={`img-${idx}`}
                          className="w-full h-48 object-cover rounded-xl shadow-md"
                        />
                        {selected.includes(src) && (
                          <div className="absolute top-1 right-1 bg-blue-600 text-white px-2 py-1 text-xs rounded shadow">Selected</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {history.length > 0 && (
          <div className="mt-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-blue-800 flex items-center gap-2">
                <lord-icon
                  src="https://cdn.lordicon.com/zzodbdoh.json"
                  trigger="hover"
                  colors="primary:#0d47a1"
                  style={{ width: '28px', height: '28px' }}
                ></lord-icon>
                <span className="transition-all duration-300 group-hover:tracking-widest">History</span>
              </h2>
              <button
                onClick={handleRemoveTopHistory}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-red-500 hover:from-red-600 hover:to-rose-600 text-white font-medium rounded-full shadow-md hover:shadow-lg transition duration-300 ease-in-out"
              >
                <lord-icon
                  src="https://cdn.lordicon.com/xyfswyxf.json"
                  trigger="hover"
                  colors="primary:#ffffff"
                  style={{ width: '24px', height: '24px' }}
                ></lord-icon>
                <span className="tracking-wide">Clear History</span>
              </button>


            </div>
            <ul className="space-y-2">
              {history.map((item, idx) => (
                <li
                  key={idx}
                  onClick={() => handleHistoryClick(item.url)}
                  className="bg-white p-4 rounded-xl shadow hover:bg-blue-100 cursor-pointer transition"
                >
                  <p className="font-semibold text-blue-700 break-all hover:underline">{item.url}</p>
                  <p className="text-gray-500 text-sm">{new Date(item.date).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
