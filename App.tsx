
import React, { useState, useCallback, useRef, useMemo } from 'react';
import type { YouTubePlayer } from 'youtube-player/dist/types';
import { UrlInputForm } from './components/UrlInputForm';
import { VideoPlayer } from './components/VideoPlayer';
import { TranscriptPanel } from './components/TranscriptPanel';
import { Loader } from './components/Loader';
import { getTranscript } from './services/youtubeService';
import { runAIPrompt } from './services/geminiService';
import type { TranscriptLine } from './types';
import { languages } from './constants';

const App: React.FC = () => {
    const [videoUrl, setVideoUrl] = useState<string>('');
    const [videoId, setVideoId] = useState<string | null>(null);
    const [transcript, setTranscript] = useState<TranscriptLine[] | null>(null);
    const [hiddenLineIds, setHiddenLineIds] = useState<Set<number>>(new Set());
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [aiResult, setAiResult] = useState<string | null>(null);
    
    const playerRef = useRef<YouTubePlayer | null>(null);

    const extractVideoId = (url: string): string | null => {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    const handleFetchTranscript = async (url: string) => {
        setIsLoading(true);
        setError(null);
        setTranscript(null);
        setVideoId(null);
        setVideoUrl(url);
        setHiddenLineIds(new Set());
        setAiResult(null);

        const id = extractVideoId(url);
        if (!id) {
            setError('Invalid YouTube URL. Please enter a valid video URL or ID.');
            setIsLoading(false);
            return;
        }

        setVideoId(id);

        try {
            const fetchedTranscript = await getTranscript(id);
            setTranscript(fetchedTranscript);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred while fetching the transcript.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSeekTo = useCallback((time: number) => {
        playerRef.current?.seekTo(time, true);
        playerRef.current?.playVideo();
    }, []);

    const toggleLineVisibility = (index: number) => {
        setHiddenLineIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    const visibleTranscript = useMemo(() => {
        if (!transcript) return null;
        return transcript.filter((_, index) => !hiddenLineIds.has(index));
    }, [transcript, hiddenLineIds]);

    const handleAiPrompt = async (prompt: string) => {
        if (!visibleTranscript) return;
        
        setIsAiLoading(true);
        setAiResult(null);
        setError(null);

        const transcriptText = visibleTranscript.map(line => line.text).join('\n');
        
        try {
            const result = await runAIPrompt(prompt, transcriptText);
            setAiResult(result);
        } catch (err) {
            if(err instanceof Error){
                 setError(`AI Task Failed: ${err.message}`);
            } else {
                 setError("An unknown error occurred while processing the AI task.");
            }
        } finally {
            setIsAiLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-900 font-sans text-slate-200">
            <header className="bg-dark-800/50 backdrop-blur-sm sticky top-0 z-10 shadow-lg">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        <span className="text-brand-primary">YouTube</span> Transcript Tool
                    </h1>
                    <p className="text-xs text-slate-400 hidden sm:block">Independent tool, not affiliated with YouTube/Google.</p>
                </div>
            </header>

            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="bg-dark-800 p-6 rounded-lg shadow-2xl mb-8">
                    <UrlInputForm onFetch={handleFetchTranscript} isLoading={isLoading} />
                </div>
                
                {isLoading && <div className="flex justify-center my-12"><Loader /></div>}
                
                {error && (
                    <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative my-4" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {videoId && (
                        <div className="lg:col-span-3">
                            <VideoPlayer videoId={videoId} ref={playerRef} />
                        </div>
                    )}

                    {transcript && visibleTranscript && (
                        <div className={`transition-all duration-500 ${videoId ? 'lg:col-span-2' : 'lg:col-span-5'}`}>
                            <TranscriptPanel 
                                transcript={transcript}
                                visibleTranscript={visibleTranscript}
                                hiddenLineIds={hiddenLineIds}
                                onSeek={handleSeekTo}
                                onToggleLine={toggleLineVisibility}
                                onAiPrompt={handleAiPrompt}
                                isAiLoading={isAiLoading}
                                aiResult={aiResult}
                                onClearAiResult={() => setAiResult(null)}
                            />
                        </div>
                    )}
                </div>
            </main>

            <footer className="text-center py-6 text-sm text-slate-500">
                <p>&copy; {new Date().getFullYear()} YouTube Transcript Tool. All rights reserved.</p>
                <p className="mt-1">This service is not affiliated with YouTube or Google.</p>
            </footer>
        </div>
    );
};

export default App;
