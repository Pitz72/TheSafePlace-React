import Phaser from 'phaser';
import { TILESET_SRC, TILE_MAP, TILE_SIZE } from '../../assets/tileset_ultima';
import { useGameStore } from '../../store/gameStore';
import { useCharacterStore } from '../../store/characterStore';

import { useInputStore } from '../../store/inputStore';

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

    private interactionKey!: Phaser.Input.Keyboard.Key;
    private isInputLocked: boolean = false;

    create() {
        const mapData: string[][] = useGameStore.getState().map;
        if (!mapData || mapData.length === 0) return;

        // DISABLE MOUSE INPUT - KEYBOARD ONLY
        this.input.mouse.enabled = false;

        // 1. Create Tilemap
        const mapHeight = mapData.length;
        const mapWidth = mapData[0].length;

        const tilemap = this.make.tilemap({
            data: this.convertMapToIndices(mapData) as number[][],
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
        this.traderSprite.setName('npc_trader'); // Set name for interaction
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

        // 8. Input Handling
        if (this.input.keyboard) {
            this.interactionKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        }

        // Subscribe to Narrative Store for Input Locking
        import('../../store/narrativeStore').then(({ useNarrativeStore }) => {
            useNarrativeStore.subscribe((state) => {
                this.isInputLocked = state.isStoryActive;
            });
        });

        // Cleanup on scene shutdown
        this.events.on('shutdown', this.shutdown, this);
        this.events.on('destroy', this.shutdown, this);
    }

    update() {
        const currentContext = useInputStore.getState().currentContext;

        // Only allow movement if in GAME context
        if (currentContext !== 'GAME') {
            if (this.player) {
                // Stop player animation if moving
                // Note: Phaser Arcade Physics would use setVelocity(0), but here we might be using tweens or custom logic.
                // Since updatePlayerPosition uses tweens based on store updates, we just need to stop the store updates from happening
                // or stop the input processing that triggers them.
                // The input processing is likely handled elsewhere (e.g. React component or another system), 
                // but if there was direct input handling here, we'd block it.
                // Wait, movement is handled by React component listening to keys and calling movePlayer?
                // If so, blocking here in update() might not be enough if the React component doesn't check context.
                // BUT, we are updating MainScene to respect context.
                // Let's check if MainScene handles movement input. 
                // It seems MainScene only handles 'E' for interaction. Movement is likely handled by App.tsx or a hook.
                // Ah, the user request said "Input: Serve un gestore unico per tastiera/mouse per evitare conflitti tra UI e Gioco."
                // So we need to make sure WHOEVER handles movement checks the context.
            }
            // We still allow interaction if it's the GAME context, but here we are in NOT GAME context.
            return;
        }

        if (this.isInputLocked) return;

        if (Phaser.Input.Keyboard.JustDown(this.interactionKey)) {
            this.handleInteraction();
        }
    }

    private handleInteraction() {
        // Check for nearby interactables
        const playerCenter = this.player.getCenter();
        const interactionRadius = TILE_SIZE * 1.5;

        // Check Trader
        if (this.traderSprite.visible) {
            const dist = Phaser.Math.Distance.BetweenPoints(playerCenter, this.traderSprite.getCenter());
            if (dist <= interactionRadius) {
                this.triggerInteraction(this.traderSprite.name);
                return;
            }
        }

        // Check Markers (NPCs, POIs)
        const markers = this.markersGroup.getChildren() as Phaser.GameObjects.Sprite[];
        for (const marker of markers) {
            const dist = Phaser.Math.Distance.BetweenPoints(playerCenter, marker.getCenter());
            if (dist <= interactionRadius) {
                if (marker.name) {
                    this.triggerInteraction(marker.name);
                    return;
                }
            }
        }
    }

    private triggerInteraction(spriteId: string) {
        import('../../config/interactionMap').then(({ INTERACTION_MAP }) => {
            const knot = INTERACTION_MAP[spriteId];
            if (knot) {
                import('../../services/NarrativeService').then(({ narrativeService }) => {
                    narrativeService.jumpTo(knot);
                });
            }
        });
    }

    private convertMapToIndices(mapData: string[][]): number[][] {
        return mapData.map(row => row.map(char => this.getTileIndex(char)));
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
                // Assign a name or ID to the sprite for interaction
                if (marker.id) {
                    sprite.setName(marker.id);
                }
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

