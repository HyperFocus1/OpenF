import { Injectable } from '@angular/core';
import { map, Observable, timer } from 'rxjs';
import {
  KanbanSnapshot,
  KanbanTask,
  TaskPerson,
  TaskChanges,
  TaskDraft,
  TaskMove,
  TaskComment,
  TaskActivity,
  TaskReactionChange,
  KanbanCatalogItem,
} from '@models/kanban/kanban.model';
import { KanbanService } from './kanban.service';

/** Mock storage, defaults and mutations. No HTTP, browser storage or external requests. */
@Injectable()
export class KanbanMockServiceImpl implements KanbanService {
  private static readonly MOCK_DELAY_MS = 400;
  private static readonly MOCK_MEMBERS: TaskPerson[] = [
    { name: 'Ana García', role: 'Product Designer', avatarUrl: '/images/kanban/ana.jpg' },
    { name: 'Mateo Torres', role: 'UX Researcher', avatarUrl: '/images/kanban/mateo.jpg' },
    { name: 'Sofía Ruiz', role: 'UI Designer', avatarUrl: '/images/kanban/sofia.jpg' },
  ];
  private static readonly MOCK_TAGS: KanbanCatalogItem[] = [
    { id: 'hologram', label: 'Hologram', icon: 'tag', tone: 'neutral', color: '#484354' },
    { id: 'design-system', label: 'Design System', icon: 'tag', tone: 'primary', color: '#173529' },
  ];
  private static readonly MOCK_COMMENTS: TaskComment[] = [
    {
      id: 'tom',
      author: 'Mateo Torres',
      avatarUrl: '/images/kanban/mateo.jpg',
      date: 'Ahora',
      text: 'Hola equipo, revisen cómo se ve en móvil. Debería adaptarse a todas las pantallas.',
      reactions: [],
    },
    {
      id: 'luke',
      author: 'Ana García',
      avatarUrl: '/images/kanban/ana.jpg',
      date: 'Hace 10 min',
      text: '¡Buen trabajo, equipo!',
      reactions: [
        { emoji: '🔥', count: 2, reacted: false },
        { emoji: '🙌', count: 1, reacted: true },
      ],
    },
    {
      id: 'matt',
      author: 'Sofía Ruiz',
      avatarUrl: '/images/kanban/sofia.jpg',
      date: 'Hace 12 min',
      text: 'Por favor, añadan el enlace al prototipo.',
      reactions: [],
    },
  ];

  private static readonly MOCK_TASKS: KanbanTask[] = [
    {
      title: 'List admin APIs for international pricing by country',
      columnId: 'backlog',
      priority: 'medium',
      categoryId: 'Research',
      toolIds: ['Figma', 'Notion'],
    },
    {
      title: 'Web UI kit automation',
      columnId: 'backlog',
      priority: 'urgent',
      categoryId: 'Diseño UX',
      toolIds: ['Figma'],
    },
    {
      title: 'Inventory Delivery Performance & Lifecycle',
      columnId: 'backlog',
      priority: 'low',
      categoryId: 'Branding',
      toolIds: ['Framer'],
    },
    {
      title: 'Integrate SSL web certificates into onboarding workflow',
      columnId: 'todo',
      priority: 'high',
      categoryId: 'Diseño UX',
      toolIds: ['Figma'],
    },
    {
      title: 'Document activity logs',
      columnId: 'todo',
      priority: 'low',
      categoryId: 'Diseño UX',
      toolIds: ['Figma'],
    },
    {
      title: 'Inventory Overview',
      columnId: 'todo',
      priority: 'high',
      categoryId: 'Desarrollo',
      toolIds: ['Framer'],
    },
    {
      title:
        'Analyze competitors and industry trends to identify best practices and areas for improvement.',
      columnId: 'review',
      priority: 'high',
      categoryId: 'Research',
      toolIds: ['Figma', 'Framer'],
    },
    {
      title: 'Optimize code, assets, and images for fast loading times',
      columnId: 'review',
      priority: 'medium',
      categoryId: 'Diseño UX',
      toolIds: ['Figma'],
    },
    {
      title:
        'Update the Design System to Support Dark Mode and High Contrast Accessibility Options',
      columnId: 'review',
      priority: 'high',
      categoryId: 'Diseño UI',
      toolIds: ['Figma'],
    },
    {
      title: 'Maintain project documentation and team guidelines',
      columnId: 'done',
      priority: 'medium',
      categoryId: 'Design System',
      toolIds: ['Figma', 'Notion'],
    },
    {
      title: 'Build reusable components for the design system',
      columnId: 'done',
      priority: 'low',
      categoryId: 'Planificación',
      toolIds: ['Notion'],
    },
  ].map((entry, index) => ({
    ...entry,
    id: `OF-${String(index + 1).padStart(3, '0')}`,
    code: `OF-${String(index + 1).padStart(3, '0')}`,
    positionY: (index + 1) * 100,
    description: `Trabajemos en una experiencia más clara, útil y consistente. Esta tarea forma parte del rediseño de OpenF y debe seguir los fundamentos de nuestro Design System.\n\nCompartir la propuesta con el equipo, recoger los comentarios y validar la versión final antes de cerrar la tarea.`,
    assignees: [
      KanbanMockServiceImpl.MOCK_MEMBERS[index % KanbanMockServiceImpl.MOCK_MEMBERS.length],
      KanbanMockServiceImpl.MOCK_MEMBERS[(index + 1) % KanbanMockServiceImpl.MOCK_MEMBERS.length],
    ],
    commentCount: 65 - index * 3,
    attachmentCount: 70 - index * 2,
    cover:
      index === 5
        ? {
            src: '/images/kanban/workspace.jpg',
            alt: 'Laptop and design tools on a white desk',
            width: 640,
            height: 360,
          }
        : index === 7
          ? {
              src: '/images/kanban/research.jpg',
              alt: 'Product research at a bright workspace',
              width: 640,
              height: 360,
            }
          : null,
    due: `${16 + index} nov`,
    amount: '$ 10,000 – 20,000',
    areas: [entry.categoryId, 'Producto', 'SaaS'],
    tags: KanbanMockServiceImpl.MOCK_TAGS,
    activity: [
      {
        id: `activity-review-${index}`,
        author: 'Mateo Torres',
        avatarUrl: '/images/kanban/mateo.jpg',
        text: 'actualizó los requisitos y compartió una propuesta.',
        date: 'Hace 15 min',
      },
      {
        id: `activity-created-${index}`,
        author: 'Ana García',
        avatarUrl: '/images/kanban/ana.jpg',
        text: 'creó esta tarea y añadió a los responsables.',
        date: 'Ayer · 09:30',
      },
    ],
    contact: 'ana.garcia@example.com',
    social: 'ana.garcia',
    files: [
      {
        id: `brief-${index}`,
        name: 'Brief del proyecto',
        date: '10 nov, 2026',
        content: `Brief del proyecto OpenF\n\nObjetivo: ${entry.title}.\n\nAlcance: explorar, diseñar y validar una experiencia consistente con el Design System.\n\nCriterios de aceptación:\n- Revisar la propuesta con el equipo.\n- Incorporar el feedback.\n- Documentar la decisión final.`,
      },
      {
        id: `feedback-${index}`,
        name: 'Feedback y notas del equipo',
        date: '12 nov, 2026',
        content:
          'Feedback del equipo OpenF\n\n- Mantener una jerarquía clara.\n- Usar la paleta y los componentes existentes.\n- Revisar la experiencia en móvil y con teclado.',
      },
      {
        id: `accessibility-${index}`,
        name: 'Checklist de accesibilidad',
        date: '12 nov, 2026',
        content:
          'Verificar contraste AA, navegación con teclado, foco visible y movimiento reducido.',
      },
      {
        id: `handoff-${index}`,
        name: 'Notas de implementación',
        date: '13 nov, 2026',
        content:
          'Usar los tokens de la paleta, los componentes del DS y estados derivados mediante signals.',
      },
    ],
    comments: KanbanMockServiceImpl.MOCK_COMMENTS.map((comment) => ({
      ...comment,
      id: `${index}-${comment.id}`,
      reactions: comment.reactions.map((reaction) => ({ ...reaction })),
    })),
    bookmarked: false,
    startWeek: Math.min(3, Math.floor(index / 3)),
    duration: Math.min(index % 3 === 0 ? 2 : 1, 4 - Math.min(3, Math.floor(index / 3))),
  }));

  private static readonly MOCK_BOARD: KanbanSnapshot = {
    project: {
      accessLabel: 'Private',
      status: { id: 'active', label: 'En curso', icon: 'circle', tone: 'primary' },
      name: 'Product Development',
      code: 'OpenF',
      workspace: 'All Task',
      tagline: 'Un espacio compartido para transformar ideas en experiencias que importan.',
      description:
        'Estamos construyendo la siguiente versión de OpenF: más intuitiva, consistente y cercana. Aquí organizamos la investigación, el diseño y las entregas del equipo.',
      sprintGoal:
        'Validar el nuevo flujo de la aplicación y preparar los componentes para su implementación.',
      teamName: 'Equipo de diseño',
      members: KanbanMockServiceImpl.MOCK_MEMBERS.map((person) => ({ ...person })),
      currentUser: { ...KanbanMockServiceImpl.MOCK_MEMBERS[0] },
      dateRange: '11–30 nov, 2026',
      dueDate: '30 de noviembre, 2026',
      dueShort: '30 nov',
      year: 2026,
      areas: ['Producto', 'Diseño UX/UI', 'Design System'],
      weeks: ['09 nov', '16 nov', '23 nov', '30 nov'],
      roadmapTitle: 'Noviembre 2026',
      contact: 'ana.garcia@example.com',
      social: 'ana.garcia',
    },
    columns: [
      {
        id: 'backlog',
        projectId: 'openf',
        name: 'To do',
        position: 0,
        color: '#484354',
        icon: 'circle',
        tone: 'neutral',
        completed: false,
        review: false,
      },
      {
        id: 'todo',
        projectId: 'openf',
        name: 'Work in progress',
        position: 1,
        color: '#674b4b',
        icon: 'clock',
        tone: 'primary',
        completed: false,
        review: false,
      },
      {
        id: 'review',
        projectId: 'openf',
        name: 'Under review',
        position: 2,
        color: '#60573d',
        icon: 'eye',
        tone: 'neutral',
        completed: false,
        review: true,
      },
      {
        id: 'done',
        projectId: 'openf',
        name: 'Completed',
        position: 3,
        color: '#405650',
        icon: 'check-circle',
        tone: 'primary',
        completed: true,
        review: false,
      },
    ],
    priorities: [
      {
        id: 'low',
        label: 'Neither',
        shortLabel: 'Low',
        rank: 3,
        icon: 'chart',
        tone: 'neutral',
        color: '#494453',
        emoji: '🍒',
      },
      {
        id: 'medium',
        label: 'Important',
        shortLabel: 'Medium',
        rank: 2,
        icon: 'chart',
        tone: 'neutral',
        color: '#50513e',
        emoji: '🔥',
      },
      {
        id: 'urgent',
        label: 'Urgent',
        shortLabel: 'Urgent',
        rank: 1,
        icon: 'chart',
        tone: 'danger',
        color: '#65503e',
        emoji: '💥',
      },
      {
        id: 'high',
        label: 'Important and urgent',
        shortLabel: 'High',
        rank: 0,
        icon: 'chart',
        tone: 'danger',
        color: '#3e5951',
        emoji: '🍒',
      },
    ],
    categories: [
      {
        id: 'Research',
        label: 'Frontend Development',
        icon: 'message',
        tone: 'primary',
        color: '#56503e',
      },
      { id: 'Diseño UX', label: 'UX Design', icon: 'pen', tone: 'primary', color: '#62494b' },
      { id: 'Branding', label: 'UI Design', icon: 'sparkles', tone: 'primary', color: '#405650' },
      { id: 'Diseño UI', label: 'UI Design', icon: 'apps', tone: 'primary', color: '#405650' },
      { id: 'Desarrollo', label: 'UX Design', icon: 'brand', tone: 'primary', color: '#62494b' },
      {
        id: 'Design System',
        label: 'UX Research',
        icon: 'kanban',
        tone: 'primary',
        color: '#654451',
      },
      {
        id: 'Planificación',
        label: 'Frontend Development',
        icon: 'projects',
        tone: 'primary',
        color: '#56503e',
      },
      { id: 'Producto', label: 'Product', icon: 'pen', tone: 'primary', color: '#405650' },
    ],
    tools: [
      { id: 'Figma', label: 'Figma', icon: 'pen', tone: 'neutral' },
      { id: 'Framer', label: 'Framer', icon: 'brand', tone: 'neutral' },
      { id: 'Notion', label: 'Notion', icon: 'file', tone: 'neutral' },
    ],
    defaults: {
      columnId: 'backlog',
      priority: 'medium',
      categoryId: 'Producto',
      toolIds: ['Figma'],
    },
    tasks: KanbanMockServiceImpl.MOCK_TASKS,
  };

  private readonly board = structuredClone(KanbanMockServiceImpl.MOCK_BOARD);
  private nextId = this.board.tasks.length + 1;

  readBoard(): Observable<KanbanSnapshot> {
    return this.respond(() => structuredClone(this.board));
  }

  createTask(draft: TaskDraft): Observable<KanbanTask> {
    return this.respond(() => {
      const title = draft.title.trim();
      if (!title || title.length > 140)
        throw new Error('El nombre debe tener entre 1 y 140 caracteres.');
      this.requireColumn(draft.columnId);
      if (!this.board.priorities.some((priority) => priority.id === draft.priority))
        throw new Error('Prioridad no disponible.');
      const id = `OF-${String(this.nextId++).padStart(3, '0')}`;
      const positionY =
        Math.max(
          0,
          ...this.board.tasks
            .filter((task) => task.columnId === draft.columnId)
            .map((task) => task.positionY),
        ) + 100;
      const task: KanbanTask = {
        ...draft,
        id,
        code: id,
        positionY,
        title,
        description:
          draft.description.trim() || 'Añade aquí los objetivos y el contexto de esta tarea.',
        categoryId: this.board.defaults.categoryId,
        toolIds: [...this.board.defaults.toolIds],
        assignees: [{ ...this.board.project.currentUser }],
        due: this.board.project.dueShort,
        amount: 'Por definir',
        areas: [...this.board.project.areas],
        contact: this.board.project.contact,
        social: this.board.project.social,
        files: [],
        comments: [],
        tags: [...KanbanMockServiceImpl.MOCK_TAGS],
        activity: [this.activity('creó esta tarea.')],
        commentCount: 0,
        attachmentCount: 0,
        cover: null,
        bookmarked: false,
        startWeek: this.board.project.weeks.length - 1,
        duration: 1,
      };
      this.board.tasks = [...this.board.tasks, task];
      return structuredClone(task);
    });
  }

  updateTask(id: string, changes: TaskChanges): Observable<void> {
    return this.respond(() => {
      if (changes.columnId !== undefined) this.requireColumn(changes.columnId);
      if (
        changes.priority !== undefined &&
        !this.board.priorities.some((priority) => priority.id === changes.priority)
      )
        throw new Error('Prioridad no disponible.');
      this.board.tasks = this.board.tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              ...changes,
              activity: [this.activity('actualizó los atributos de la tarea.'), ...task.activity],
            }
          : task,
      );
    });
  }

  moveTask(move: TaskMove): Observable<void> {
    return this.respond(() => {
      this.requireColumn(move.columnId);
      const task = this.board.tasks.find((task) => task.id === move.id);
      if (!task) return;
      const destination = this.board.tasks
        .filter((task) => task.columnId === move.columnId && task.id !== move.id)
        .sort((a, b) => a.positionY - b.positionY);
      const beforeIndex = destination.findIndex((task) => task.id === move.beforeId);
      destination.splice(beforeIndex < 0 ? destination.length : beforeIndex, 0, {
        ...task,
        columnId: move.columnId,
      });
      const positions = new Map(destination.map((task, index) => [task.id, (index + 1) * 100]));
      this.board.tasks = this.board.tasks.map((item) =>
        item.id === move.id
          ? {
              ...task,
              columnId: move.columnId,
              positionY: positions.get(item.id)!,
              activity: [this.activity('movió la tarea a otra columna.'), ...task.activity],
            }
          : positions.has(item.id)
            ? { ...item, positionY: positions.get(item.id)! }
            : item,
      );
    });
  }

  private requireColumn(id: string): void {
    if (!this.board.columns.some((column) => column.id === id))
      throw new Error('Columna no disponible.');
  }

  addComment(id: string, value: string): Observable<void> {
    return this.respond(() => {
      const text = value.trim();
      if (!text || text.length > 2000) return;
      this.board.tasks = this.board.tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              commentCount: task.commentCount + 1,
              activity: [this.activity('añadió un comentario.'), ...task.activity],
              comments: [
                ...task.comments,
                {
                  id: crypto.randomUUID(),
                  author: this.board.project.currentUser.name,
                  avatarUrl: this.board.project.currentUser.avatarUrl,
                  text,
                  date: 'Ahora',
                  reactions: [],
                },
              ],
            }
          : task,
      );
    });
  }

  toggleCommentReaction(change: TaskReactionChange): Observable<void> {
    return this.respond(() => {
      this.board.tasks = this.board.tasks.map((task) =>
        task.id === change.taskId
          ? {
              ...task,
              comments: task.comments.map((comment) => {
                if (comment.id !== change.commentId) return comment;
                const existing = comment.reactions.find(
                  (reaction) => reaction.emoji === change.emoji,
                );
                return {
                  ...comment,
                  reactions: existing
                    ? comment.reactions
                        .map((reaction) =>
                          reaction === existing
                            ? {
                                ...reaction,
                                reacted: !reaction.reacted,
                                count: reaction.count + (reaction.reacted ? -1 : 1),
                              }
                            : reaction,
                        )
                        .filter((reaction) => reaction.count > 0)
                    : [...comment.reactions, { emoji: change.emoji, count: 1, reacted: true }],
                };
              }),
            }
          : task,
      );
    });
  }

  private activity(text: string): TaskActivity {
    return {
      id: crypto.randomUUID(),
      author: this.board.project.currentUser.name,
      avatarUrl: this.board.project.currentUser.avatarUrl,
      text,
      date: 'Ahora',
    };
  }

  /** Cold request: cancellation before the timer fires also cancels the mutation. */
  private respond<T>(operation: () => T): Observable<T> {
    return timer(KanbanMockServiceImpl.MOCK_DELAY_MS).pipe(map(() => operation()));
  }
}
