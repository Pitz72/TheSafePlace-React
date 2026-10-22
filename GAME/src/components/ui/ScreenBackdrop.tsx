import React from 'react';
import KeyArt from '../art/KeyArt';

/** Background of the screens outside the game (options, saves, instructions...): the key art, dimmed. */
const ScreenBackdrop: React.FC = () => (
    <>
        <KeyArt variant="dusk" shade="none" />
        <div className="absolute inset-0 bg-bg0/10" />
    </>
);

export default ScreenBackdrop;
