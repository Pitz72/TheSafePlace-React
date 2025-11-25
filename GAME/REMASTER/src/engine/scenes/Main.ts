import Phaser from 'phaser';
import { events, GameEvents } from '../../core/events';
import { mapManager } from '../../core/map/MapManager';
import { TILE_SIZE } from '../../core/map/TilesetMapping';
import { GameRules } from '../../core/rules/GameRules';

export class MainScene extends Phaser.Scene {
    private player!: Phaser.GameObjects.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!: {
        up: Phaser.Input.Keyboard.Key;
        down: Phaser.Input.Keyboard.Key;
        left: Phaser.Input.Keyboard.Key;
        right: Phaser.Input.Keyboard.Key;
    };
    private isMoving: boolean = false;
    private gridX: number = 0;
    private gridY: number = 0;

    constructor() {
        super('MainScene');
    }

    preload() {
        // Load the tileset image for the map layer
        this.load.image('tiles', 'assets/tilesets/ultima_tileset.svg');
        // Load the same tileset as a spritesheet for the player (and other actors)
        this.load.spritesheet('tiles_sheet', 'assets/tilesets/ultima_tileset.svg', { frameWidth: 32, frameHeight: 32 });
    }

    create() {
        console.log('MainScene started');

        const mapData = mapManager.getMapData();
        const height = mapData.length;
        const width = mapData[0].length;

        // Create a blank tilemap
        const map = this.make.tilemap({ tileWidth: TILE_SIZE, tileHeight: TILE_SIZE, width: width, height: height });
        const tileset = map.addTilesetImage('tiles', undefined, TILE_SIZE, TILE_SIZE, 0, 0);

        if (!tileset) {
            console.error("Failed to load tileset 'tiles'");
            return;
        }

        const layer = map.createBlankLayer('Ground', tileset);

        if (!layer) {
            console.error("Failed to create layer 'Ground'");
            return;
        }

        // Populate the layer
        import('../../core/map/TilesetMapping').then(({ TILE_MAPPING }) => {
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const char = mapData[y][x];
                    const tileIndex = TILE_MAPPING[char] ?? TILE_MAPPING['.']; // Default to Grass
                    layer.putTileAt(tileIndex, x, y);
                }
            }
        });

        // Player setup
        const startPos = mapManager.getStartPos();
        this.gridX = startPos.x;
        this.gridY = startPos.y;

        const worldPos = mapManager.gridToWorld(this.gridX, this.gridY);
        // Use 'tiles_sheet' and frame 8 for the Player (@)
        this.player = this.add.sprite(worldPos.x, worldPos.y, 'tiles_sheet', 8);
        this.player.setOrigin(0, 0); // Align with grid top-left

        // Camera
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, width * TILE_SIZE, height * TILE_SIZE);
        this.cameras.main.setZoom(0.8);

        // Input
        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
            this.wasd = this.input.keyboard.addKeys({
                up: Phaser.Input.Keyboard.KeyCodes.W,
                down: Phaser.Input.Keyboard.KeyCodes.S,
                left: Phaser.Input.Keyboard.KeyCodes.A,
                right: Phaser.Input.Keyboard.KeyCodes.D
            }) as any;
        }

        // Initial UI update
        events.emit(GameEvents.PLAYER_MOVED, { x: this.gridX, y: this.gridY });
        GameRules.onPlayerMove(this.gridX, this.gridY); // Log initial biome
    }

    update() {
        if (this.isMoving || !this.cursors || !this.wasd) return;

        let dx = 0;
        let dy = 0;

        if (this.cursors.left.isDown || this.wasd.left.isDown) dx = -1;
        else if (this.cursors.right.isDown || this.wasd.right.isDown) dx = 1;
        else if (this.cursors.up.isDown || this.wasd.up.isDown) dy = -1;
        else if (this.cursors.down.isDown || this.wasd.down.isDown) dy = 1;

        if (dx !== 0 || dy !== 0) {
            this.movePlayer(dx, dy);
        }
    }

    private movePlayer(dx: number, dy: number) {
        const targetX = this.gridX + dx;
        const targetY = this.gridY + dy;

        // Check both basic map bounds/walkability AND GameRules (biomes)
        if (mapManager.isWalkable(targetX, targetY) && GameRules.canMoveTo(targetX, targetY)) {
            this.isMoving = true;
            this.gridX = targetX;
            this.gridY = targetY;

            const worldPos = mapManager.gridToWorld(targetX, targetY);

            this.tweens.add({
                targets: this.player,
                x: worldPos.x,
                y: worldPos.y,
                duration: 200, // Speed of movement
                onComplete: () => {
                    this.isMoving = false;
                    // Advance time by 10 minutes per step
                    import('../../core/time/TimeManager').then(({ TimeManager }) => {
                        TimeManager.advanceTime(10);
                    });
                    events.emit(GameEvents.PLAYER_MOVED, { x: this.gridX, y: this.gridY });

                    // Trigger Game Rules (Biome effects, logging, stats)
                    GameRules.onPlayerMove(this.gridX, this.gridY);
                }
            });
        }
    }
}
