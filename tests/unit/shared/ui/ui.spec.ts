import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActionGroup, Button, IconButton, IconName, PromptInput } from '@shared/ui';

@Component({
  imports: [ActionGroup, Button, IconButton, PromptInput],
  template: `<of-action-group label="Acciones">
    <of-icon-button [icon]="icon()" label="Acción" variant="primary" [unavailable]="unavailable()" (pressed)="actions.set(actions() + 1)" />
  </of-action-group>
  <of-prompt-input label="Instrucción" placeholder="¿Qué quieres ajustar?" [(value)]="text" [busy]="busy()" (submitted)="messages.push($event)" />
  <button ofButton="primary" [icon]="icon()" [busy]="busy()" [toggle]="true" [active]="active()">Guardar</button>`,
})
class DsHarness {
  readonly icon = signal<IconName>('plus');
  readonly unavailable = signal(false);
  readonly actions = signal(0);
  readonly text = signal('');
  readonly busy = signal(false);
  readonly active = signal(false);
  readonly messages: string[] = [];
}

describe('Componentes compartidos', () => {
  it('configura iconos, estado activo y bloqueo durante envíos en el botón nativo', () => {
    TestBed.configureTestingModule({ imports: [DsHarness] });
    const fixture = TestBed.createComponent(DsHarness);
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('button[ofButton]')!;
    const path = button.querySelector('path')!.getAttribute('d');
    fixture.componentInstance.icon.set('sliders');
    fixture.componentInstance.active.set(true);
    fixture.detectChanges();
    expect(button.querySelector('path')!.getAttribute('d')).not.toBe(path);
    expect(button.getAttribute('aria-pressed')).toBe('true');
    fixture.componentInstance.busy.set(true);
    fixture.detectChanges();
    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.querySelector('of-icon')).toBeNull();
  });
  it('permite cambiar el icono y evita emitir acciones no disponibles', async () => {
    TestBed.configureTestingModule({ imports: [DsHarness] });
    const fixture = TestBed.createComponent(DsHarness);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const action = root.querySelector<HTMLButtonElement>('[aria-label="Acción"]')!;
    const originalPath = action.querySelector('path')!.getAttribute('d');
    action.click();
    expect(fixture.componentInstance.actions()).toBe(1);
    fixture.componentInstance.icon.set('sliders');
    fixture.componentInstance.unavailable.set(true);
    fixture.detectChanges();
    expect(action.querySelector('path')!.getAttribute('d')).not.toBe(originalPath);
    expect(action.getAttribute('aria-disabled')).toBe('true');
    action.click();
    expect(fixture.componentInstance.actions()).toBe(1);
  });

  it('sincroniza texto y emite mensajes válidos; bloquea envíos vacíos o en curso', async () => {
    TestBed.configureTestingModule({ imports: [DsHarness] });
    const fixture = TestBed.createComponent(DsHarness);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const form = root.querySelector('form')!;
    const input = root.querySelector('input')!;
    const submit = () => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    submit();
    expect(fixture.componentInstance.messages).toEqual([]);
    input.value = '  Resume el documento  ';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.text()).toBe('  Resume el documento  ');
    submit();
    expect(fixture.componentInstance.messages).toEqual(['Resume el documento']);
    fixture.componentInstance.busy.set(true);
    fixture.detectChanges();
    submit();
    expect(input.readOnly).toBe(true);
    expect(fixture.componentInstance.messages).toHaveLength(1);
  });
});
