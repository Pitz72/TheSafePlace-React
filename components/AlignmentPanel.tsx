import React from 'react';
import { useCharacterStore } from '../store/characterStore';
import Panel from './Panel';

const AlignmentPanel: React.FC = () => {
    const alignment = useCharacterStore((state) => state.alignment);
    const { lena, elian } = alignment;

    const totalPoints = Math.max(1, lena + elian);
    const balance = totalPoints === 1 ? 0 : (elian - lena) / totalPoints;
    
    // Converte il bilanciamento in una percentuale da 0% (Lena) a 100% (Elian) per il posizionamento
    const positionPercent = ((balance + 1) / 2) * 100;

    let dominantAlignment = 'NEUTRALE';
    const alignmentDifference = lena - elian;
    const ALIGNMENT_THRESHOLD = 5;

    if (alignmentDifference > ALIGNMENT_THRESHOLD) dominantAlignment = 'COMPASSIONEVOLE (LENA)';
    if (alignmentDifference < -ALIGNMENT_THRESHOLD) dominantAlignment = 'PRAGMATICO (ELIAN)';


    return (
        <Panel title="BUSSOLA MORALE">
            <div className="flex flex-col items-center justify-center h-full px-2 space-y-1 text-sm">
                <div className="w-full flex justify-between">
                    <span className="text-blue-400">Lena</span>
                    <span className="text-red-400">Elian</span>
                </div>
                {/* FIX v1.2.4: Increased bar size and marker visibility */}
                <div className="w-full h-3 bg-gray-900 rounded-full relative border border-green-400/50">
                    <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-gray-300 to-red-500 rounded-full w-full opacity-80"></div>
                    <div 
                        className="absolute -top-1 w-2 h-5 bg-yellow-400 border-2 border-green-400 rounded shadow-lg shadow-yellow-400/50"
                        style={{ left: `calc(${positionPercent}% - 4px)` }}
                    ></div>
                </div>
                <div className="text-center text-xs">
                    {dominantAlignment}
                </div>
            </div>
        </Panel>
    );
};

export default AlignmentPanel;