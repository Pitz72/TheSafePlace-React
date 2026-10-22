import React from 'react';
import { Key } from './KeyHints';

/**
 * Instruction text with light markup: "[I]" becomes a keycap, words in
 * capitals are emphasised, and "LABEL: text" gets a bold label.
 */
const RichText: React.FC<{ text: string; lead?: boolean }> = ({ text, lead = false }) => {
    let label: string | null = null;
    let body = text;
    const colon = text.indexOf(':');
    if (lead && colon > 0 && colon < 48 && !text.slice(0, colon).includes('[')) {
        label = text.slice(0, colon + 1);
        body = text.slice(colon + 1);
    }
    const parts = body.split(/(\[[^\]]{1,8}\])/g).filter(Boolean);
    return (
        <>
            {label && <strong className="font-semibold text-ink">{label}</strong>}
            {parts.map((part, index) => {
                const key = /^\[([^\]]+)\]$/.exec(part);
                if (key) return <span key={index} className="mx-1 inline-block -translate-y-0.5"><Key k={key[1]} /></span>;
                return part.split(/(\b[A-ZÀÈÉÌÒÙ]{3,}(?:\s[A-ZÀÈÉÌÒÙ]{3,})*\b)/g).map((chunk, i) =>
                    /^[A-ZÀÈÉÌÒÙ]{3,}(?:\s[A-ZÀÈÉÌÒÙ]{3,})*$/.test(chunk)
                        ? <strong key={`${index}-${i}`} className="font-semibold text-ink">{chunk}</strong>
                        : <React.Fragment key={`${index}-${i}`}>{chunk}</React.Fragment>);
            })}
        </>
    );
};

export default RichText;
