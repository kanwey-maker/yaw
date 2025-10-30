
import React, { useState } from 'react';
import { LinkIcon } from './icons/LinkIcon';

interface UrlInputFormProps {
    onFetch: (url: string) => void;
    isLoading: boolean;
}

export const UrlInputForm: React.FC<UrlInputFormProps> = ({ onFetch, isLoading }) => {
    const [url, setUrl] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url.trim()) {
            onFetch(url);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter YouTube video URL or ID"
                    className="w-full pl-10 pr-4 py-3 bg-dark-700/50 border border-dark-600 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-150 ease-in-out placeholder-slate-400"
                    disabled={isLoading}
                />
            </div>
            <button
                type="submit"
                disabled={isLoading || !url.trim()}
                className="w-full sm:w-auto flex-shrink-0 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-800 focus:ring-brand-primary disabled:bg-slate-500 disabled:cursor-not-allowed transition duration-150 ease-in-out"
            >
                {isLoading ? 'Fetching...' : 'Get Transcript'}
            </button>
        </form>
    );
};
