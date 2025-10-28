import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ImagePanel } from './components/ImagePanel';
import { ActionButton } from './components/ActionButton';
import { UploadIcon } from './components/icons/UploadIcon';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { DiceIcon } from './components/icons/DiceIcon';
import { LockIcon } from './components/icons/LockIcon';
import { UnlockIcon } from './components/icons/UnlockIcon';
import { PasswordModal } from './components/PasswordModal';
import { Instructions } from './components/Instructions';
import { transformImage } from './services/geminiService';
import { fileToGenerativePart } from './utils/fileUtils';
import type { GenerativePart } from '@google/genai';

const BLOCKED_KEYWORDS = ['nude', 'naked', 'sexy', 'hot', 'remove clothes', 'undress', 'bikini', 'lingerie', 'erotic', 'explicit', 'obscene', 'lewd'];

const CREATIVE_PROMPTS = [
  "Turn it into a vibrant stained glass window.",
  "Reimagine this as an ancient stone carving.",
  "Make it look like a sketch in Leonardo da Vinci's notebook.",
  "Transform it into a 1980s neon-noir movie poster.",
  "Give it a pixel art style from a 16-bit video game.",
  "Cover it in intricate, glowing cyberpunk circuits.",
  "A watercolor painting on a rainy day.",
  "Make it look like it's made of liquid metal.",
  "An epic fantasy landscape.",
  "A double exposure with a forest silhouette."
];

const LOADING_MESSAGES = [
  "Analyzing Pixels...",
  "Engaging Neural Net...",
  "Reticulating Splines...",
  "Painting with Photons...",
  "Consulting the Oracle...",
  "Bending Reality...",
];

const COOLDOWN_SECONDS = 60;

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [transformedImage, setTransformedImage] = useState<string | null>(null);
  const [imagePart, setImagePart] = useState<GenerativePart | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const [isAdultMode, setIsAdultMode] = useState<boolean>(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [lastTransformTime, setLastTransformTime] = useState<number | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [activeImageTab, setActiveImageTab] = useState<'original' | 'transformed'>('original');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingMessage(prev => {
          const currentIndex = LOADING_MESSAGES.indexOf(prev);
          const nextIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
          return LOADING_MESSAGES[nextIndex];
        });
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);
  
  useEffect(() => {
    if (feedback) {
        const timer = setTimeout(() => {
            setFeedback(null);
        }, 4000);
        return () => clearTimeout(timer);
    }
}, [feedback]);

  useEffect(() => {
    if (!lastTransformTime || isAdultMode) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timePassed = Math.floor((now - lastTransformTime) / 1000);
      const remaining = COOLDOWN_SECONDS - timePassed;
      if (remaining <= 0) {
        setCooldownRemaining(0);
        setLastTransformTime(null);
        clearInterval(interval);
      } else {
        setCooldownRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastTransformTime, isAdultMode]);

  useEffect(() => {
    if (isLoading || transformedImage) {
      setActiveImageTab('transformed');
    }
  }, [isLoading, transformedImage]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };
  
  const handleAdultModeToggle = () => {
    if (isAdultMode) {
      setIsAdultMode(false);
      setFeedback({ message: 'Unrestricted mode disabled. Filter active.', type: 'success' });
      return;
    }
    setIsPasswordModalOpen(true);
  };
  
  const handlePasswordSubmit = (password: string) => {
    if (password === 'November849') {
      setIsAdultMode(true);
      setFeedback({ message: 'Unrestricted mode enabled.', type: 'success' });
    } else {
      setFeedback({ message: 'Incorrect password.', type: 'error' });
    }
    setIsPasswordModalOpen(false);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setTransformedImage(null);
      setFeedback(null);
      setActiveImageTab('original');
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      try {
        const part = await fileToGenerativePart(file);
        setImagePart(part);
      } catch (err) {
        setFeedback({ message: 'Failed to process image file.', type: 'error' });
        console.error(err);
      }
    }
  };
  
  const handleSurpriseMe = () => {
    const randomPrompt = CREATIVE_PROMPTS[Math.floor(Math.random() * CREATIVE_PROMPTS.length)];
    setPrompt(randomPrompt);
  };

  const handleTransform = useCallback(async () => {
    if (!isAdultMode && cooldownRemaining > 0) return;
    
    if (!imagePart) {
      setFeedback({ message: 'Please select an image first.', type: 'error' });
      return;
    }
    if (!prompt.trim()) {
        setFeedback({ message: 'Please describe the transformation you want.', type: 'error' });
        return;
    }

    const lowerCasePrompt = prompt.toLowerCase();
    const isBlocked = BLOCKED_KEYWORDS.some(keyword => lowerCasePrompt.includes(keyword));

    if (!isAdultMode && isBlocked) {
        setFeedback({ message: "Inappropriate content is not allowed.", type: 'error' });
        return;
    }

    setIsLoading(true);
    setTransformedImage(null);
    setFeedback(null);
    
    if (!isAdultMode) {
      setLastTransformTime(Date.now());
      setCooldownRemaining(COOLDOWN_SECONDS);
    }

    try {
      const result = await transformImage(imagePart, prompt);
      setTransformedImage(`data:image/png;base64,${result}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setFeedback({ message: `Transformation failed: ${errorMessage}`, type: 'error' });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [imagePart, prompt, isAdultMode, cooldownRemaining]);
  
  const isTransformDisabled = !originalImage || !prompt.trim() || isLoading || (!isAdultMode && cooldownRemaining > 0);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      {feedback && (
        <div className={`fixed top-5 z-50 px-4 py-2 rounded-lg text-sm font-semibold shadow-lg transition-all duration-300 ${
          feedback.type === 'error' ? 'bg-red-500/90 text-white' : 'bg-green-500/90 text-white'
        }`}>
          {feedback.message}
        </div>
      )}

      {isPasswordModalOpen && <PasswordModal onSubmit={handlePasswordSubmit} onClose={() => setIsPasswordModalOpen(false)} />}
      
      <div className="w-full max-w-screen-xl bg-slate-900/50 rounded-2xl border border-slate-800 shadow-2xl shadow-black/30 overflow-hidden flex flex-col">
        <header className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">Futuristic Image Transformer</h1>
            <button onClick={handleAdultModeToggle} className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-slate-400 hover:text-cyan-400 transition-colors">
              {isAdultMode ? <UnlockIcon /> : <LockIcon />}
              <span>{isAdultMode ? 'Unrestricted' : 'Standard'} Mode</span>
            </button>
        </header>
        
        <main className="flex-grow p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col md:h-[65vh]">
            {/* Tabs for small screens */}
            <div className="flex-shrink-0 md:hidden border-b border-slate-700 mb-4">
              <button
                onClick={() => setActiveImageTab('original')}
                className={`w-1/2 py-3 text-center text-sm font-semibold uppercase tracking-wider transition-colors duration-200 focus:outline-none ${activeImageTab === 'original' ? 'text-cyan-400 bg-slate-800/50' : 'text-slate-400'}`}
              >
                Original
              </button>
              <button
                onClick={() => setActiveImageTab('transformed')}
                className={`w-1/2 py-3 text-center text-sm font-semibold uppercase tracking-wider transition-colors duration-200 focus:outline-none disabled:text-slate-600 ${activeImageTab === 'transformed' ? 'text-cyan-400 bg-slate-800/50' : 'text-slate-400'}`}
                disabled={!transformedImage && !isLoading}
              >
                Transformed
              </button>
            </div>
            
            {/* Panels for small screens (tabbed) */}
            <div className="flex-grow md:hidden">
              {activeImageTab === 'original' ? (
                <ImagePanel title="Original Image" imageUrl={originalImage} />
              ) : (
                <ImagePanel title="Transformed Image" imageUrl={transformedImage} isLoading={isLoading} loadingMessage={loadingMessage} />
              )}
            </div>

            {/* Panels for medium+ screens (side-by-side) */}
            <div className="hidden md:grid grid-cols-2 gap-6 h-full">
              <ImagePanel title="Original Image" imageUrl={originalImage} />
              <ImagePanel title="Transformed Image" imageUrl={transformedImage} isLoading={isLoading} loadingMessage={loadingMessage} />
            </div>
          </div>
          
          <div className="lg:col-span-1 bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6 flex flex-col mt-6 lg:mt-0 md:h-[65vh]">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            
            <div className="flex-grow flex flex-col gap-4">
              <label htmlFor="prompt" className="text-sm font-semibold text-slate-400">Your Vision</label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A watercolor painting on a rainy day."
                className="w-full h-32 flex-grow resize-none bg-slate-900/50 border border-slate-700 text-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder:text-slate-500"
              />
              <ActionButton onClick={handleSurpriseMe} variant="secondary" icon={<DiceIcon/>}>
                Surprise Me
              </ActionButton>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-700 flex flex-col gap-6">
              <Instructions />
              <div className="flex flex-col gap-4">
                <ActionButton onClick={handleFileSelect} variant="secondary" icon={<UploadIcon />}>
                  {originalImage ? 'Select Another Image' : 'Select Image'}
                </ActionButton>
                <ActionButton
                  onClick={handleTransform}
                  disabled={isTransformDisabled}
                  icon={<SparklesIcon />}
                >
                  {isLoading
                    ? 'Transforming...'
                    : cooldownRemaining > 0 && !isAdultMode
                    ? `Wait ${cooldownRemaining}s`
                    : 'Transform Image'}
                </ActionButton>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
