import { Meta, StoryObj } from '@storybook/angular';
import { AssistantPreview, assistantPreviewProviders } from '../../hosts/assistant-preview';

const meta = {
  title: 'Layout/Assistant',
  component: AssistantPreview,
  tags: ['autodocs'],
  decorators: [assistantPreviewProviders],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `Un coordinador de UI recibe comandos tipados y publica signals. El actor vive fuera del RouterOutlet; navegar conserva su instancia. Las posiciones x/y están normalizadas entre 0 y 1 dentro del espacio disponible.

\`\`\`ts
const assistant = inject(AssistantStateService);
assistant.dispatch({ type: 'move', position: { x: 0.2, y: 0.8 }, durationMs: 800 });
assistant.dispatch({ type: 'state', state: 'thinking' });
assistant.dispatch({ type: 'state', state: 'success', durationMs: 1800 });
assistant.dispatch({ type: 'pause', paused: true });
assistant.dispatch({ type: 'visibility', visible: false });
\`\`\`

AssistantService es el contrato de datos (readProfile devuelve un Observable). ASSISTANT_SERVICE_TOKEN selecciona AssistantMockServiceImpl mediante provideAssistant(). El mock contiene las constantes y simula 400 ms de latencia; devuelve copias independientes. La futura implementación API sustituirá ese proveedor. AssistantStateService conserva solo el estado de UI y consume el contrato, sin datos mock.

Los eventos temporales cancelan el temporizador anterior. No hay bucle JavaScript por fotograma, polling ni llamadas API. Los desplazamientos usan transform y respetan movimiento reducido.`,
      },
    },
  },
} satisfies Meta<AssistantPreview>;
export default meta;
type Story = StoryObj<AssistantPreview>;
export const Events: Story = { name: 'Eventos' };
