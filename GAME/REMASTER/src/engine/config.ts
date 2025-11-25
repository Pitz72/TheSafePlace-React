import Phaser from 'phaser';
import { BootScene } from './scenes/Boot.ts';
import { MainScene } from './scenes/Main.ts';

export const gameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'phaser-game',
    width: 640,
    height: 360,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 }, // Top-down RPG, no gravity
            debug: true
        }
    },
    scene: [BootScene, MainScene],
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};
