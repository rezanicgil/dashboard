'use client';

import { useState } from 'react';

export default function HomePage() {
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // Loader durumu

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResponse(null);
    setLoading(true); // Loader'ı başlat

    if (!file) {
      setError('Please upload a file.');
      setLoading(false); // Loader'ı durdur
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('prompt', prompt);

      const token = localStorage.getItem('accessToken'); // Token'ı localStorage'dan al
      if (!token) {
        setError('Authorization token is missing.');
        setLoading(false); // Loader'ı durdur
        return;
      }

      const res = await fetch('http://localhost:8080/gemini/generate-content', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to generate content.');
      }

      const data = await res.json();
      setResponse(data.content.replace(/\n/g, '<br>')); // Yanıtı işleyip <br> ile değiştir
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false); // Loader'ı durdur
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-400 via-blue-500 to-purple-600">
      <div className="w-full max-w-2xl p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
          Ross AI
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="prompt"
              className="block text-sm font-medium text-gray-700"
            >
              Prompt
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your prompt here..."
              rows={5}
              required
            />
          </div>
          <div>
            <label
              htmlFor="file"
              className="block text-sm font-medium text-gray-700"
            >
              Upload File
            </label>
            <input
              type="file"
              id="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-gray-300 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Submit
          </button>
        </form>
        {loading && (
          <div className="flex justify-center items-center mt-6">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {response && (
          <div className="mt-6">
            <h2 className="text-lg font-bold text-gray-800">Response:</h2>
            <div
              className="mt-2 p-4 bg-gray-100 rounded-lg text-sm text-gray-800 overflow-auto"
              dangerouslySetInnerHTML={{ __html: response }} // HTML olarak render et
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}