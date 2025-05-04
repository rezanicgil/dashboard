'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Yardımcı fonksiyon: Yanıtı HTML olarak işlemek
const formatResponse = (response: string) => {
  if (!response) return ''; // Null veya undefined kontrolü

  // **metin** ifadelerini <strong> ile değiştir
  let formatted = response.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // \n karakterlerini <br> ile değiştir
  formatted = formatted.replace(/\n/g, '<br>');

  return formatted;
};

export default function HomePage() {
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResponse(null);
    setLoading(true);

    if (!file) {
      setError('Please upload a file.');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('prompt', prompt);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login'); 
        return;
      }
      

      const res = await fetch('https://intense-slice-458811-c9.ew.r.appspot.com/gemini/generate-content', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.status === 401) {
        localStorage.removeItem('accessToken');
        router.push('/login');
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to generate content.');
      }


      const data = await res.json();
      setResponse(formatResponse(data.content || '')); // Yanıtı işleyip HTML formatına dönüştür
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError('Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 relative">
      {/* Prompt Display */}
      {prompt && (
        <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-300">
          <div className="flex justify-between items-center">
            <span className="text-gray-800 text-sm">{prompt}</span>
            <button
              onClick={() => setPrompt('')}
              className="ml-4 text-gray-500 hover:text-red-500 transition"
            >
              ✕
            </button>
          </div>
        </div>
      )}

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
              dangerouslySetInnerHTML={{ __html: response }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}