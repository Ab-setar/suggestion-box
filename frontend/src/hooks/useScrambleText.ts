import { useEffect, useState } from 'react';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*';

export function useScrambleText(finalText: string, speed = 30) {
    const [displayText, setDisplayText] = useState('');

    useEffect(() => {
        let frame = 0;
        const totalFrames = finalText.length * 3;

        const interval = setInterval(() => {
            frame++;
            const revealedCount = Math.floor((frame / totalFrames) * finalText.length);

            const next = finalText
                .split('')
                .map((char, i) => {
                    if (char === ' ') return ' ';
                    if (i < revealedCount) return char;
                    return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
                })
                .join('');

            setDisplayText(next);

            if (revealedCount >= finalText.length) {
                clearInterval(interval);
                setDisplayText(finalText);
            }
        }, speed);

        return () => clearInterval(interval);
    }, [finalText, speed]);

    return displayText;
}