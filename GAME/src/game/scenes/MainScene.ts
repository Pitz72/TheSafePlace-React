import Phaser from 'phaser';
import { TILESET_SRC, TILE_MAP, TILE_SIZE } from '../../assets/tileset_ultima';
import { useGameStore } from '../../store/gameStore';
import { useCharacterStore } from '../../store/characterStore';

export class MainScene extends Phaser.Scene {
    private player!: Phaser.GameObjects.Sprite;
    // @ts-ignore
    private mapLayer!: Phaser.Tilemaps.TilemapLayer;
    private unsubscribeGameStore!: () => void;
    private unsubscribeCharStore!: () => void;
    private markersGroup!: Phaser.GameObjects.Group;
    private traderSprite!: Phaser.GameObjects.Sprite;

    constructor() {
        super({ key: 'MainScene' });
    }

    preload() {
        this.load.image('tileset', TILESET_SRC);
    }

    create() {
        const mapData = useGameStore.getState().map;
        if (!mapData || mapData.length === 0) return;

        // 1. Create Tilemap
        const mapHeight = mapData.length;
        const mapWidth = mapData[0].length;

        const tilemap = this.make.tilemap({
            data: this.convertMapToIndices(mapData),
            tileWidth: TILE_SIZE,
            tileHeight: TILE_SIZE,
            width: mapWidth,
            height: mapHeight,
        });

        const tileset = tilemap.addTilesetImage('tileset', 'tileset', TILE_SIZE, TILE_SIZE);
        if (tileset) {
            this.mapLayer = tilemap.createLayer(0, tileset, 0, 0)!;
        }

        // 2. Create Player
        const playerPos = useGameStore.getState().playerPos;
        this.player = this.add.sprite(
            playerPos.x * TILE_SIZE + TILE_SIZE / 2,
            playerPos.y * TILE_SIZE + TILE_SIZE / 2,
            'tileset'
        );
        // Set player frame (index 8 is '@')
        this.player.setFrame(8);
        this.player.setDepth(10);

        // Simple idle animation (breathing)
        this.tweens.add({
            targets: this.player,
            scaleY: 1.05,
            y: this.player.y - 2,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 3. Create Camera
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1); // Adjust zoom if needed

        // 4. Create Markers Group
        this.markersGroup = this.add.group();
        this.updateMarkers();

        // 5. Create Trader
        this.traderSprite = this.add.sprite(-100, -100, 'tileset');
        this.traderSprite.setFrame(9); // 'T' index
        this.traderSprite.setVisible(false);
        this.traderSprite.setDepth(5);
        this.updateTrader();

        // 6. Add CRT Pipeline
        const renderer = this.game.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
        if (!renderer.pipelines.has('CRTPipeline')) {
            import('../pipelines/CRTPipeline').then(({ CRTPipeline }) => {
                renderer.pipelines.addPostPipeline('CRTPipeline', CRTPipeline);
                this.cameras.main.setPostPipeline('CRTPipeline');
            });
        } else {
            this.cameras.main.setPostPipeline('CRTPipeline');
        }

        // 7. Subscribe to Store Updates
        this.unsubscribeGameStore = useGameStore.subscribe((state) => {
            this.updatePlayerPosition(state.playerPos);
            this.updateTrader(state.wanderingTrader);
        });

        this.unsubscribeCharStore = useCharacterStore.subscribe(() => {
            this.updateMarkers();
        });

        // Cleanup on scene shutdown
        this.events.on('shutdown', this.shutdown, this);
        this.events.on('destroy', this.shutdown, this);
    }

    private convertMapToIndices(mapData: string[]): number[][] {
        return mapData.map(row => row.split('').map(char => this.getTileIndex(char)));
    }

    private getTileIndex(char: string): number {
        const coords = TILE_MAP[char] || TILE_MAP['.'];
        // Calculate index: (y / 32) * 8 + (x / 32)
        // Tileset width is 8 tiles (256px)
        return (coords.y / TILE_SIZE) * 8 + (coords.x / TILE_SIZE);
    }

    private updatePlayerPosition(pos: { x: number, y: number }) {
        if (this.player) {
            // Tween for smooth movement
            this.tweens.add({
                targets: this.player,
                x: pos.x * TILE_SIZE + TILE_SIZE / 2,
                y: pos.y * TILE_SIZE + TILE_SIZE / 2,
                duration: 200, // ms
                ease: 'Linear'
            });
        }
    }

    private updateMarkers() {
        this.markersGroup.clear(true, true);

        // We need a way to get markers. The service `getActiveQuestMarkers` was used in CanvasMap.
        import('../../services/questService').then(({ getActiveQuestMarkers }) => {
            const markers = getActiveQuestMarkers();
            markers.forEach(marker => {
                const index = marker.type === 'MAIN' ? 16 : 17; // !M or !S
                const sprite = this.add.sprite(
                    marker.pos.x * TILE_SIZE + TILE_SIZE / 2,
                    marker.pos.y * TILE_SIZE + TILE_SIZE / 2,
                    'tileset'
                );
                sprite.setFrame(index);
                this.markersGroup.add(sprite);
            });
        });
    }

    private updateTrader(trader?: any) {
        const currentTrader = trader || useGameStore.getState().wanderingTrader;
        if (currentTrader && this.traderSprite) {
            this.traderSprite.setVisible(true);
            this.traderSprite.setPosition(
                currentTrader.position.x * TILE_SIZE + TILE_SIZE / 2,
                currentTrader.position.y * TILE_SIZE + TILE_SIZE / 2
            );
        } else if (this.traderSprite) {
            this.traderSprite.setVisible(false);
        }
    }

    private shutdown() {
        if (this.unsubscribeGameStore) this.unsubscribeGameStore();
        if (this.unsubscribeCharStore) this.unsubscribeCharStore();
    }
}

