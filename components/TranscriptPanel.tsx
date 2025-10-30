
import React, { useState, useCallback, useMemo } from 'react';
import type { TranscriptLine, Language } from '../types';
import { languages, AI_PROMPTS } from '../constants';
import { CopyIcon } from './icons/CopyIcon';
import { EyeIcon } from './icons/EyeIcon';
import { EyeOffIcon } from './icons/EyeOffIcon';
import { CloseIcon } from './icons/CloseIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { Loader } from './Loader';

interface TranscriptPanelProps {
    transcript: TranscriptLine[];
    visibleTranscript: TranscriptLine[];
    hiddenLineIds: Set<number>;
    onSeek: (time: number) => void;
    onToggleLine: (index: number) => void;
    onAiPrompt: (prompt: string) => void;
    isAiLoading: boolean;
    aiResult: string | null;
    onClearAiResult: () => void;
}

// A simple mock translation function
const mockTranslate = async (text: string, lang: Language): Promise<string> => {
    if (lang.code === 'en') return text;
    await new Promise(res => setTimeout(res, 300)); // Simulate API call
    return `${text} (Translated to ${lang.name})`;
};


export const TranscriptPanel: React.FC<TranscriptPanelProps> = ({
    transcript,
    visibleTranscript,
    hiddenLineIds,
    onSeek,
    onToggleLine,
    onAiPrompt,
    isAiLoading,
    aiResult,
    onClearAiResult
}) => {
    const [selectedLanguage, setSelectedLanguage] = useState<Language>(languages[0]);
    const [translatedLines, setTranslatedLines] = useState<Record<number, string>>({});
    const [isTranslating, setIsTranslating] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');

    const formatTimestamp = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        if (h > 0) {
            return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
        }
        return [m, s].map(v => v.toString().padStart(2, '0')).join(':');
    };

    const handleLanguageChange = async (lang: Language) => {
        setSelectedLanguage(lang);
        if (lang.code === 'en') {
            setTranslatedLines({});
            return;
        }

        setIsTranslating(true);
        const newTranslations: Record<number, string> = {};
        for (let i = 0; i < transcript.length; i++) {
            const line = transcript[i];
            newTranslations[i] = await mockTranslate(line.text, lang);
        }
        setTranslatedLines(newTranslations);
        setIsTranslating(false);
    };
    
    const handleCopy = useCallback(() => {
        const textToCopy = visibleTranscript
            .map((line, index) => {
                const originalIndex = transcript.findIndex(l => l === line);
                const text = selectedLanguage.code !== 'en' && translatedLines[originalIndex]
                    ? translatedLines[originalIndex]
                    : line.text;
                return `[${formatTimestamp(line.start)}] ${text}`;
            })
            .join('\n');
            
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess('Failed to copy');
            setTimeout(() => setCopySuccess(''), 2000);
        });
    }, [visibleTranscript, transcript, translatedLines, selectedLanguage]);
    
    const renderedTranscript = useMemo(() => {
        return selectedLanguage.code === 'en' ? transcript : transcript.map((line, index) => ({
            ...line,
            text: translatedLines[index] || line.text
        }));
    }, [selectedLanguage, transcript, translatedLines]);
    

    return (
        <div className="bg-dark-800 rounded-lg shadow-2xl h-full flex flex-col">
            <div className="p-4 border-b border-dark-700 space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                    <select
                        value={selectedLanguage.code}
                        onChange={(e) => {
                            const lang = languages.find(l => l.code === e.target.value);
                            if (lang) handleLanguageChange(lang);
                        }}
                        className="flex-1 min-w-[150px] bg-dark-700 border border-dark-600 rounded-md py-2 px-3 focus:ring-brand-primary focus:border-brand-primary"
                    >
                        {languages.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                    </select>
                     <select
                        onChange={(e) => onAiPrompt(e.target.value)}
                        defaultValue=""
                        className="flex-1 min-w-[150px] bg-dark-700 border border-dark-600 rounded-md py-2 px-3 focus:ring-brand-primary focus:border-brand-primary disabled:opacity-50"
                        disabled={isAiLoading}
                    >
                        <option value="" disabled>✨ AI Actions...</option>
                        {AI_PROMPTS.map(p => <option key={p.label} value={p.prompt}>{p.label}</option>)}
                    </select>

                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 bg-dark-700 hover:bg-dark-600 text-slate-300 font-medium py-2 px-4 rounded-md transition duration-150"
                    >
                        <CopyIcon className="w-5 h-5" />
                        <span>{copySuccess || 'Copy'}</span>
                    </button>
                </div>
            </div>

            {aiResult && (
                <div className="p-4 bg-brand-primary/10 border-b border-dark-700">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-brand-secondary flex items-center gap-2">
                            <SparklesIcon className="w-5 h-5" />
                            AI Generated Result
                        </h3>
                        <button onClick={onClearAiResult} className="text-slate-400 hover:text-white">
                            <CloseIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="text-sm whitespace-pre-wrap font-mono bg-dark-900/50 p-3 rounded-md max-h-48 overflow-y-auto">{aiResult}</div>
                </div>
            )}
            
            {(isTranslating || isAiLoading) && 
                <div className="p-4 flex justify-center items-center gap-2 text-slate-400">
                    <Loader />
                    <span>{isTranslating ? `Translating to ${selectedLanguage.name}...` : 'AI is thinking...'}</span>
                </div>
            }

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {renderedTranscript.map((line, index) => (
                    <div
                        key={index}
                        className={`flex items-start gap-3 p-2 rounded-md transition-colors duration-150 group ${hiddenLineIds.has(index) ? 'opacity-40 bg-dark-700/50' : 'hover:bg-dark-700/50'}`}
                    >
                        <button
                            onClick={() => onToggleLine(index)}
                            className="opacity-50 group-hover:opacity-100 text-slate-400 hover:text-white transition-opacity"
                            title={hiddenLineIds.has(index) ? 'Show line' : 'Hide line'}
                        >
                            {hiddenLineIds.has(index) ? <EyeIcon className="w-5 h-5" /> : <EyeOffIcon className="w-5 h-5" />}
                        </button>
                        <div
                            className="flex-1 cursor-pointer"
                            onClick={() => onSeek(line.start)}
                        >
                            <span className="font-mono text-sm text-brand-secondary">{formatTimestamp(line.start)}</span>
                            <p className="text-slate-200 leading-relaxed">{line.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
