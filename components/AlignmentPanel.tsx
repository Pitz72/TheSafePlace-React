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
            <div className="flex flex-col items-center justify-center h-full px-2 space-y-3">
                <div className="w-full flex justify-between text-2xl">
                    <span className="text-blue-400">Lena</span>
                    <span className="text-red-400">Elian</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full relative">
                    <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-gray-400 to-red-500 rounded-full w-full"></div>
                    <div 
                        className="absolute -top-1 w-1 h-4 bg-yellow-400 border border-black rounded"
                        style={{ left: `calc(${positionPercent}% - 2px)` }}
                    ></div>
                </div>
                <div className="text-center text-xl pt-1">
                    {dominantAlignment}
                </div>
            </div>
        </Panel>
    );
};

export default AlignmentPanel;