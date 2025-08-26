/**
 * WeatherDisplay.tsx — Componente per visualizzare le condizioni meteo
 * Mostra il meteo attuale con icone ASCII e descrizioni
 */
import React from 'react';
import { useGameStore } from '../stores/gameStore';
import { WeatherType } from '../interfaces/gameState';

const WeatherDisplay: React.FC = () => {
  const weatherState = useGameStore(state => state.weatherState);

  const getWeatherIcon = (weather: WeatherType): string => {
    const icons = {
      [WeatherType.CLEAR]: '☀',
      [WeatherType.LIGHT_RAIN]: '🌦',
      [WeatherType.HEAVY_RAIN]: '🌧',
      [WeatherType.STORM]: '⛈',
      [WeatherType.FOG]: '🌫',
      [WeatherType.WIND]: '💨'
    };
    return icons[weather] || '?';
  };

  const getWeatherName = (weather: WeatherType): string => {
    const names = {
      [WeatherType.CLEAR]: 'Sereno',
      [WeatherType.LIGHT_RAIN]: 'Pioggia Leggera',
      [WeatherType.HEAVY_RAIN]: 'Pioggia Intensa',
      [WeatherType.STORM]: 'Tempesta',
      [WeatherType.FOG]: 'Nebbia',
      [WeatherType.WIND]: 'Vento Forte'
    };
    return names[weather] || 'Sconosciuto';
  };

  const getIntensityColor = (intensity: number): string => {
    if (intensity < 30) return 'text-green-400';
    if (intensity < 60) return 'text-yellow-400';
    if (intensity < 80) return 'text-orange-400';
    return 'text-red-400';
  };

  const getIntensityDescription = (intensity: number): string => {
    if (intensity < 30) return 'Leggero';
    if (intensity < 60) return 'Moderato';
    if (intensity < 80) return 'Intenso';
    return 'Estremo';
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getEffectsDescription = () => {
    const { effects } = weatherState;
    const descriptions = [];

    if (effects.movementModifier < 1.0) {
      const penalty = Math.round((1 - effects.movementModifier) * 100);
      descriptions.push(`Movimento -${penalty}%`);
    }

    if (effects.survivalModifier > 1.0) {
      const penalty = Math.round((effects.survivalModifier - 1) * 100);
      descriptions.push(`Consumo +${penalty}%`);
    }

    if (effects.skillCheckModifier !== 0) {
      const modifier = effects.skillCheckModifier > 0 ? `+${effects.skillCheckModifier}` : `${effects.skillCheckModifier}`;
      descriptions.push(`Abilità ${modifier}`);
    }

    return descriptions.length > 0 ? descriptions.join(', ') : 'Nessun effetto';
  };

  return (
    <div className="weather-display border border-phosphor-600 p-2 bg-gray-900 bg-opacity-50">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getWeatherIcon(weatherState.currentWeather)}</span>
          <span className="text-phosphor-400 font-bold">
            {getWeatherName(weatherState.currentWeather)}
          </span>
        </div>
        <div className="text-right">
          <div className={`text-sm ${getIntensityColor(weatherState.intensity)}`}>
            {getIntensityDescription(weatherState.intensity)} ({weatherState.intensity}%)
          </div>
          <div className="text-xs text-phosphor-600">
            ~{formatDuration(weatherState.duration)}
          </div>
        </div>
      </div>
      
      <div className="text-xs text-phosphor-500 border-t border-phosphor-700 pt-1">
        Effetti: {getEffectsDescription()}
      </div>
    </div>
  );
};

export default WeatherDisplay;