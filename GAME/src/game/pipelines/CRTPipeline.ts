import Phaser from 'phaser';

const fragShader = `
precision mediump float;

uniform sampler2D uMainSampler;
uniform float uTime;
uniform vec2 uResolution;

varying vec2 outTexCoord;

void main()
{
    vec2 uv = outTexCoord;
    
    // Curvature (optional, subtle)
    // vec2 dc = abs(0.5 - uv);
    // dc *= dc;
    // uv.x -= 0.5; uv.x *= 1.0 + (dc.y * (0.3 * 0.1)); uv.x += 0.5;
    // uv.y -= 0.5; uv.y *= 1.0 + (dc.x * (0.4 * 0.1)); uv.y += 0.5;

    // Scanlines
    float scanline = sin(uv.y * 800.0) * 0.04;
    
    vec4 color = texture2D(uMainSampler, uv);
    
    // Apply scanlines
    color.rgb -= scanline;
    
    // Vignette
    float dist = distance(uv, vec2(0.5));
    color.rgb *= smoothstep(0.8, 0.2, dist * 0.5 + 0.2);

    // Color grading (slight green tint for retro feel)
    color.g *= 1.05;
    color.b *= 0.95;

    gl_FragColor = color;
}
`;

export class CRTPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
    constructor(game: Phaser.Game) {
        super({
            game,
            name: 'CRTPipeline',
            fragShader
        });
    }
}
