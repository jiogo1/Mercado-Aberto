
import React, { useState, useCallback } from 'react';
import { editImageWithGemini } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';
import { UploadIcon, SparklesIcon, LoadingSpinner } from './icons';

const ImageEditor: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<{ file: File | null; previewUrl: string | null }>({ file: null, previewUrl: null });
  const [prompt, setPrompt] = useState<string>('');
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setOriginalImage({ file, previewUrl: URL.createObjectURL(file) });
      setEditedImageUrl(null);
      setError(null);
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!originalImage.file || !prompt) {
      setError('Please upload an image and provide an edit prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEditedImageUrl(null);

    try {
      const base64Data = await fileToBase64(originalImage.file);
      const generatedImage = await editImageWithGemini(base64Data, originalImage.file.type, prompt);
      setEditedImageUrl(generatedImage);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [originalImage.file, prompt]);

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
          <label htmlFor="file-upload" className="block text-sm font-medium text-gray-300 mb-2">1. Upload Image</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md hover:border-indigo-500 transition-colors cursor-pointer" onClick={() => document.getElementById('file-upload')?.click()}>
            <div className="space-y-1 text-center">
              {originalImage.previewUrl ? (
                <img src={originalImage.previewUrl} alt="Original preview" className="mx-auto h-32 w-32 object-cover rounded-md"/>
              ) : (
                <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
              )}
              <div className="flex text-sm text-gray-500">
                <p className="pl-1">{originalImage.file ? originalImage.file.name : 'Click to upload or drag and drop'}</p>
              </div>
              <p className="text-xs text-gray-600">PNG, JPG, WEBP up to 10MB</p>
            </div>
            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" />
          </div>
        </div>
        
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">2. Describe Your Edit</label>
          <textarea
            id="prompt"
            rows={4}
            className="w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 transition-colors placeholder-gray-500"
            placeholder="e.g., Add a retro filter, or Remove the person in the background"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={isLoading || !originalImage.file || !prompt}
          className="w-full flex justify-center items-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100"
        >
          {isLoading ? <><LoadingSpinner /> Generating...</> : <><SparklesIcon /> Edit Image</>}
        </button>
        {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
      </div>

      {/* Result Display */}
      <div className="flex flex-col gap-8">
        <ImagePlaceholder title="Edited Image">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <LoadingSpinner className="h-10 w-10 mb-4" />
              <p className="animate-pulse">Gemini is thinking...</p>
            </div>
          ) : editedImageUrl ? (
            <img src={editedImageUrl} alt="Edited result" className="w-full h-full object-contain rounded-lg" />
          ) : (
            <div className="text-gray-500">Your edited image will appear here.</div>
          )}
        </ImagePlaceholder>
      </div>
    </div>
  );
};

export default ImageEditor;
