import type {
  AssistantDirection,
  AssistantState,
} from '@shared/ui/assistant-sprite/assistant-sprite.types';

/** Normalized coordinates inside the available workspace: 0 is the start, 1 is the end. */
export interface AssistantPosition {
  readonly x: number;
  readonly y: number;
}
/** Data supplied by the assistant implementation, independently of local animation state. */
export interface AssistantProfile {
  readonly name: string;
  readonly greeting: { readonly message: string; readonly durationMs: number };
  readonly welcomeDurationMs: number;
  readonly travelDurationMs: number;
  readonly defaultPosition: AssistantPosition;
  readonly routes: readonly { readonly path: string; readonly position: AssistantPosition }[];
}
export interface AssistantView {
  readonly state: AssistantState;
  readonly position: AssistantPosition;
  readonly direction: AssistantDirection;
  readonly durationMs: number;
  readonly visible: boolean;
  readonly paused: boolean;
  readonly message: string;
}
export type AssistantEvent =
  | { type: 'greet' }
  | { type: 'move'; position: AssistantPosition; durationMs?: number }
  | { type: 'state'; state: AssistantState; message?: string; durationMs?: number }
  | { type: 'visibility'; visible: boolean }
  | { type: 'pause'; paused: boolean }
  | { type: 'reset' };
