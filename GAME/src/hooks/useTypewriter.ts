import { useCallback, useEffect, useState } from 'react';

/**
 * Reveals `text` one character every `msPerChar`. `finish()` shows it all at
 * once (and stops the animation for good, so the text never jumps back).
 */
export function useTypewriter(text: string, msPerChar: number) {
    const [shown, setShown] = useState(0);

    useEffect(() => {
        setShown(0);
        const timer = setInterval(() => {
            setShown(count => {
                if (count >= text.length) {
                    clearInterval(timer);
                    return count;
                }
                return count + 1;
            });
        }, msPerChar);
        return () => clearInterval(timer);
    }, [text, msPerChar]);

    const finish = useCallback(() => setShown(text.length), [text]);
    return { displayed: text.slice(0, shown), isTyping: shown < text.length, finish };
}
