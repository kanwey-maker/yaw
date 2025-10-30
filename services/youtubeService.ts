
import type { TranscriptLine } from '../types';

const MOCK_TRANSCRIPT: TranscriptLine[] = [
    { text: "Hello everyone and welcome back to the channel.", start: 1.5, duration: 3.2 },
    { text: "Today, we're going to be looking at something truly special.", start: 5.0, duration: 4.1 },
    { text: "But first, I want to thank our sponsor for this video.", start: 9.5, duration: 2.8 },
    { text: "They have an amazing product that I've been using for months.", start: 12.8, duration: 4.5 },
    { text: "Let's dive right into the main topic.", start: 18.0, duration: 2.5 },
    { text: "The key thing to remember is the principle of least action.", start: 21.2, duration: 4.8 },
    { text: "This concept can be applied in many different fields.", start: 26.5, duration: 3.9 },
    { text: "For example, in physics, it's fundamental to mechanics.", start: 30.8, duration: 4.2 },
    { text: "It's also relevant in software engineering for optimization.", start: 35.5, duration: 4.8 },
    { text: "So, how do we actually implement this?", start: 41.0, duration: 3.0 },
    { text: "You start by defining your system's state and constraints.", start: 44.5, duration: 4.5 },
    { text: "Then, you can use calculus of variations to find the optimal path.", start: 49.5, duration: 5.2 },
    { text: "It might sound complicated, but it's quite intuitive once you get the hang of it.", start: 55.0, duration: 4.8 },
    { text: "Let's look at a simple code example.", start: 60.1, duration: 2.9 },
    { text: "As you can see here, the function minimizes the energy used.", start: 63.5, duration: 4.1 },
    { text: "This is a very powerful technique.", start: 68.0, duration: 2.5 },
    { text: "Make sure you subscribe for more content like this.", start: 71.0, duration: 3.2 },
    { text: "And don't forget to hit the like button if you found this helpful.", start: 74.5, duration: 4.0 },
    { text: "Thanks for watching, and I'll see you in the next one.", start: 79.0, duration: 3.5 },
];

export const getTranscript = (videoId: string): Promise<TranscriptLine[]> => {
    console.log(`Fetching transcript for videoId: ${videoId}`);

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (videoId === 'no_transcript_video') {
                reject(new Error('Transcript is not available for this video.'));
            } else if (videoId === 'error_video') {
                reject(new Error('A network error occurred while fetching the transcript.'));
            } else {
                // Return a copy to prevent mutation issues
                resolve(JSON.parse(JSON.stringify(MOCK_TRANSCRIPT)));
            }
        }, 1500); // Simulate network delay
    });
};
