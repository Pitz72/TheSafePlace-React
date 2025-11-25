import React from 'react';
import { CRTOverlay } from './CRTOverlay';
import { StatusPanel } from '../components/StatusPanel';
import { InventoryPanel } from '../components/InventoryPanel';
import { CommandPanel } from '../components/CommandPanel';
import { InfoPanel } from '../components/InfoPanel';
import { EquipmentPanel } from '../components/EquipmentPanel';
import { StatsPanel } from '../components/StatsPanel';
import { MoralCompass } from '../components/MoralCompass';
import { LogPanel } from '../components/LogPanel';

interface GameLayoutProps {
    children?: React.ReactNode;
}

export const GameLayout: React.FC<GameLayoutProps> = ({ children }) => {
    return (
        <div className="relative w-full h-full bg-black text-green-500 font-mono overflow-hidden">
            {/* CRT Effects Layer */}
            <CRTOverlay />

            {/* Main Grid Container */}
            <div className="relative z-10 w-full h-full grid grid-cols-12 grid-rows-12 gap-1 p-2">

                {/* LEFT COLUMN (Cols 1-3) */}
                <div className="col-span-3 row-span-12 flex flex-col gap-1">
                    <StatusPanel />
                    <InventoryPanel />
                    <CommandPanel />
                </div>

                {/* CENTER COLUMN (Cols 4-9) - MAP & LOG */}
                <div className="col-span-6 row-span-12 flex flex-col gap-1">
                    {/* Map Area (Top Center) - This is where Phaser lives visually */}
                    <div className="flex-grow border border-green-800 relative rounded overflow-hidden">
                        <div className="absolute top-0 left-0 bg-black/50 px-2 py-1 text-xs border-br border-green-900 z-10">
                            MAPPA DEL MONDO
                        </div>
                        {/* Render Phaser Container here */}
                        <div className="w-full h-full relative">
                            {children}
                        </div>
                    </div>

                    <LogPanel />
                </div>

                {/* RIGHT COLUMN (Cols 10-12) */}
                <div className="col-span-3 row-span-12 flex flex-col gap-1">
                    <InfoPanel />
                    <EquipmentPanel />
                    <StatsPanel />
                    <MoralCompass />
                </div>

            </div>
        </div>
    );
};
