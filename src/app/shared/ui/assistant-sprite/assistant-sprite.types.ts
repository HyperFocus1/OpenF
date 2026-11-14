export type AssistantState = 'idle' | 'moving' | 'thinking' | 'success' | 'error' | 'sleeping';
export type AssistantVariant = 'character' | 'eye';
export type AssistantDirection = 'left' | 'right';

export interface AssistantAtlas {
  readonly src: string;
  readonly width: number;
  readonly height: number;
}

/** Four columns: idle/blink, walk, thinking and celebration rows; the eye has one row. */
export interface AssistantSprites {
  readonly character: AssistantAtlas;
  readonly eye: AssistantAtlas;
}

export const OPENF_ASSISTANT_SPRITES: AssistantSprites = {
  character: { src: '/images/assistant/assistant-sprite.webp', width: 768, height: 768 },
  eye: { src: '/images/assistant/assistant-eye-sprite.webp', width: 768, height: 192 },
};
