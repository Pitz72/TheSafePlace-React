import Phaser from 'phaser';

export class PhaserGame {
    private game: Phaser.Game | null = null;

    constructor(config: Phaser.Types.Core.GameConfig) {
        this.game = new Phaser.Game(config);
    }

    public destroy() {
        if (this.game) {
            this.game.destroy(true);
            this.game = null;
        }
    }
}

export const createGameConfig = (parent: string): Phaser.Types.Core.GameConfig => {
    return {
        type: Phaser.AUTO,
        parent: parent,
        width: 800,
        height: 600,
        backgroundColor: '#000000',
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { x: 0, y: 0 },
                debug: false
            }
        },
        scene: [] // To be populated with scenes
    };
};
