import { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import { AssistantSprite, OPENF_ASSISTANT_SPRITES } from '@shared/ui';

const meta = {
  title: 'UI/AssistantSprite',
  component: AssistantSprite,
  tags: ['autodocs'],
  args: {
    state: 'idle',
    variant: 'character',
    size: 128,
    speed: 1,
    direction: 'right',
    paused: false,
    interactive: false,
    disabled: false,
    decorative: false,
    label: 'Asistente de OpenF',
    sprites: OPENF_ASSISTANT_SPRITES,
    activated: fn(),
  },
  argTypes: {
    state: {
      control: 'select',
      options: ['idle', 'moving', 'thinking', 'success', 'error', 'sleeping'],
    },
    variant: { control: 'inline-radio', options: ['character', 'eye'] },
    direction: { control: 'inline-radio', options: ['left', 'right'] },
    size: { control: { type: 'range', min: 24, max: 256, step: 4 } },
    speed: { control: { type: 'range', min: 0.25, max: 3, step: 0.25 } },
    sprites: { control: false },
    activated: { control: false },
  },
  render: (args) => ({
    props: args,
    template: `<of-assistant-sprite
      [state]="state" [variant]="variant" [size]="size" [speed]="speed"
      [direction]="direction" [paused]="paused" [interactive]="interactive"
      [disabled]="disabled" [decorative]="decorative" [label]="label"
      [sprites]="sprites" (activated)="activated()"
    />`,
  }),
  parameters: {
    docs: {
      description: {
        component:
          'Personaje original de un ojo. El componente solo recibe configuración y emite activated; no conoce rutas, formularios ni servicios.\n\nInputs: state (idle, moving, thinking, success, error, sleeping), variant (character/eye), size (24–256 px), speed (0.25–3), direction, paused, interactive, disabled, decorative, label y sprites. Los atlas personalizados siguen la misma disposición: cuatro columnas, cuatro filas para el cuerpo y una para el ojo.\n\nLos fotogramas usan transform con steps(); el desplazamiento global usa otra capa de transform. No se cambia background-position ni se programa un temporizador por fotograma. La animación se pausa fuera de pantalla o con la pestaña oculta, y respeta prefers-reduced-motion. Las imágenes son locales y usan NgOptimizedImage.\n\nGeneración: herramienta integrada imagegen. Archivos finales: public/images/assistant/assistant-sprite.webp (93 KB) y assistant-eye-sprite.webp (19 KB). Se alinearon las celdas y se optimizó el atlas para la aplicación.\n\n<details><summary>Prompt de generación</summary>\n\nUse case: stylized-concept.\nAsset type: production 2D animated UI companion sprite atlas, real transparent PNG, no background.\nCreate one original friendly small blush-pink cyclops mascot: soft rounded bean-shaped body and oversized rounded head, one large white-rimmed oval eye with a muted plum-pink pupil and tiny white glint, a little curved smile, short rounded arms and two tiny feet, a pale pink belly. Clean flat pastel 2D art, smooth crisp edges, minimal shading, cute and calm. The pink single-eyed character is the subject; do not use a green two-eyed mascot or any existing logo.\nCRITICAL layout: exactly FOUR columns and FIVE rows, TWENTY equal cells in a perfect uniform grid. Prefer a 1024 by 1280 canvas, cells 256 square. No labels, numbers, grid lines, text, badges, props or shadows outside characters. Every cell is transparent with generous empty margins. Character identity, proportions, eye position, scale and palette must stay consistent in all full-body cells. Body centered at x=128 and baseline near y=218 within each cell.\nRows one through four: full-body animation, four consecutive frames per row, left to right:\nRow 1 idle blink: eyes fully open, half-closed eyelid, fully closed eyelid, eye fully open again; relaxed identical standing body position.\nRow 2 four-frame walk cycle: left leg forward, passing, right leg forward, passing. Small opposing arm swings, same body baseline.\nRow 3 thinking: four subtle consecutive thinking poses, one hand near chin, gentle head tilt and a thoughtful eye; no question marks or bubbles.\nRow 4 celebration: four consecutive small joyful bounce/wave poses, arms lifted and smiling, all feet/arms fully inside the cell.\nRow 5: ONLY THE SINGLE ISOLATED EYE, without body, head or face, larger and centered in each cell. Same pink eyelid/rim and white/plum eye as the character. Four frames: open, half-closed, closed as a soft curved pink stroke, open again. No rectangular patch around the eye.\nComposition must be an actual evenly aligned sprite sheet suitable for slicing into cells. Preserve true transparent alpha.\n\n</details>',
      },
    },
  },
} satisfies Meta<AssistantSprite>;
export default meta;
type Story = StoryObj<AssistantSprite>;
export const Playground: Story = {};
export const Eye: Story = { name: 'Solo ojo', args: { variant: 'eye', size: 76 } };
export const Walking: Story = { name: 'Caminando', args: { state: 'moving' } };
export const Thinking: Story = { name: 'Pensando', args: { state: 'thinking' } };
export const Success: Story = { name: 'Celebrando', args: { state: 'success' } };
export const Error: Story = { args: { state: 'error' } };
export const Sleeping: Story = {
  name: 'Ojo cerrado',
  args: { variant: 'eye', state: 'sleeping', size: 76 },
};
export const Paused: Story = { name: 'Pausado', args: { state: 'moving', paused: true } };
export const Interactive: Story = {
  name: 'Interactivo',
  args: { interactive: true },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Asistente de OpenF' }),
    );
    await expect(args.activated).toHaveBeenCalled();
  },
};
