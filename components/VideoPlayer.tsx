import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import type { YouTubePlayer } from 'youtube-player/dist/types';

interface VideoPlayerProps {
    videoId: string;
}

// Define the type for the global YT object
declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

export const VideoPlayer = forwardRef<YouTubePlayer | null, VideoPlayerProps>(({ videoId }, ref) => {
    const playerDivRef = useRef<HTMLDivElement>(null);
    const [player, setPlayer] = useState<YouTubePlayer | null>(null);
    const videoIdRef = useRef(videoId);
    videoIdRef.current = videoId;

    useImperativeHandle(ref, () => player, [player]);

    useEffect(() => {
        // This effect runs only once on mount to initialize the player
        let localPlayer: YouTubePlayer | null = null;
        
        const createPlayer = () => {
            if (playerDivRef.current && window.YT && window.YT.Player) {
                localPlayer = new window.YT.Player(playerDivRef.current, {
                    videoId: videoIdRef.current, // Use ref to get the initial videoId
                    playerVars: {
                        'playsinline': 1,
                        'rel': 0,
                    },
                    events: {
                        'onReady': (event) => {
                           // Set the player instance in state once it's ready
                           setPlayer(event.target);
                        }
                    }
                });
            }
        };

        if (!window.YT || !window.YT.Player) {
            window.onYouTubeIframeAPIReady = createPlayer;
        } else {
            createPlayer();
        }

        return () => {
            // Cleanup: destroy player on component unmount
            localPlayer?.destroy();
            setPlayer(null);
        };
    }, []); // Empty dependency array ensures this runs only on mount and unmount

    useEffect(() => {
        // This effect handles subsequent changes to the videoId prop
        if (player && typeof player.loadVideoById === 'function' && videoId) {
            // Ensure the player is ready and has the getVideoData method
            const currentVideoId = player.getVideoData ? player.getVideoData().video_id : null;
            if (currentVideoId !== videoId) {
                player.loadVideoById(videoId);
            }
        }
    }, [videoId, player]);

    return (
        <div className="aspect-video w-full rounded-lg overflow-hidden shadow-2xl bg-black">
            <div ref={playerDivRef} />
        </div>
    );
});
