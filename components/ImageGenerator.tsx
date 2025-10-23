
import React, { useState, useCallback } from 'react';
import { generateImageWithImagen } from '../services/geminiService';
import { SparklesIcon, LoadingSpinner, ImageIcon } from './icons';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!prompt) {
      setError('Please provide a prompt to generate an image.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImageUrl(null);

    try {
      const generatedImage = await generateImageWithImagen(prompt);
      setGeneratedImageUrl(generatedImage);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt]);

  const ImagePlaceholder: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="w-full aspect-square bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-600 flex flex-col justify-center items-center p-4 text-center">
      <h3 className="text-lg font-semibold text-gray-400 mb-4">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Control Panel */}
      <div className="flex flex-col gap-6 p-6 bg-gray-800 rounded-xl shadow-2xl">
        <div>
          <label htmlFor="prompt-generator" className="block text-sm font-medium text-gray-300 mb-2">1. Describe The Image You Want</label>
          <textarea
            id="prompt-generator"
            rows={6}
            className="w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 transition-colors placeholder-gray-500"
            placeholder="e.g., A photo of an astronaut riding a horse on Mars, cinematic lighting."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={isLoading || !prompt}
          className="w-full flex justify-center items-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100"
        >
          {isLoading ? <><LoadingSpinner /> Generating...</> : <><SparklesIcon /> Generate Image</>}
        </button>
        {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
      </div>

      {/* Result Display */}
      <div className="flex flex-col gap-8">
        <ImagePlaceholder title="Generated Image">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <LoadingSpinner className="h-10 w-10 mb-4" />
              <p className="animate-pulse">Imagen is creating magic...</p>
            </div>
          ) : generatedImageUrl ? (
            <img src={generatedImageUrl} alt="Generated result" className="w-full h-full object-contain rounded-lg" />
          ) : (
             <div className="flex flex-col items-center text-gray-500">
                <ImageIcon className="h-16 w-16 mb-2" />
                <p>Your generated image will appear here.</p>
             </div>
          )}
        </ImagePlaceholder>
      </div>
    </div>
  );
};

export default ImageGenerator;
