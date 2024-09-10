import Color from 'color';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  InjectionToken,
  Input,
  booleanAttribute,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { FocusableOption, Highlightable } from '@angular/cdk/a11y';

export const COLOR_GRID_ITEMS_DEFAULT = [
  'rgb(255, 0, 0)', // Red
  'rgb(0, 255, 0)', // Lime
  'rgb(0, 0, 255)', // Blue
  'rgb(255, 255, 0)', // Yellow
  'rgb(0, 255, 255)', // Cyan
  'rgb(255, 0, 255)', // Magenta
  'rgb(192, 192, 192)', // Silver
  'rgb(128, 128, 128)', // Gray
  'rgb(128, 0, 0)', // Maroon
  'rgb(128, 128, 0)', // Olive
  'rgb(0, 128, 0)', // Green
  'rgb(128, 0, 128)', // Purple
  'rgb(0, 128, 128)', // Teal
  'rgb(0, 0, 128)', // Navy
  'rgb(255, 165, 0)', // Orange
  'rgb(255, 105, 180)', // Hot Pink
  'rgb(75, 0, 130)', // Indigo
  'rgb(240, 128, 128)', // Light Coral
  'rgb(32, 178, 170)', // Light Sea Green
  'rgb(255, 222, 173)', // Navajo White
];

export const COLOR_GRID_ITEM_SIZES = ['small', 'medium', 'large'] as const;

export const getContrastColor = (color: Color | string) =>
  Color(color).isDark() ? 'rgb(255,255,255)' : 'rgb(0,0,0)';

export type ColorGridItemSize = (typeof COLOR_GRID_ITEM_SIZES)[number];

export type ColorGridSelect = {
  /** The currently selected value. */
  value?: string | null;
  /** Emits when the selected value changes. */
  emitChange: (value?: string | null) => void;
};
/**
 * Injection token that can be used to inject instances of `ColorGridSelectComponent`. It serves as
 * alternative token to the actual `ColorGridSelectComponent` class which could cause unnecessary
 * retention of the class and its component metadata.
 */
export const COLOR_GRID_SELECT = new InjectionToken<ColorGridSelect>(
  'ColorGridSelect'
);

let nextUniqueId = 0;

@Component({
  selector: 'brew-color-grid-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './item.component.html',
  styleUrl: './item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorGridItemComponent implements Highlightable, FocusableOption {
  private _uniqueId = `brew-color-grid-item-${++nextUniqueId}`;

  /** Whether this item is disabled. */
  private _disabled = false;

  private _value?: string;

  private readonly _colorGridSelect = inject(COLOR_GRID_SELECT, {
    optional: true,
  });
  private readonly _changeDetector = inject(ChangeDetectorRef);

  @HostBinding('role')
  private get _role() {
    return 'option';
  }

  /** The unique ID for the radio button. */
  @HostBinding('attr.id')
  @Input()
  public id: string = this._uniqueId;

  /** Analog to HTML 'name' attribute used to group radios for unique selection. */
  @Input() name!: string;

  @Input()
  public get value() {
    return this._value;
  }

  public set value(value) {
    this._value = value;
    if (this._value) {
      this.colorContrast = getContrastColor(this._value);
    }
  }

  @Input()
  public size: ColorGridItemSize = COLOR_GRID_ITEM_SIZES[0];

  @HostBinding('attr.aria-selected')
  @Input({ transform: booleanAttribute })
  public checked = false;

  /** Whether the radio button is disabled. */
  @Input({ transform: booleanAttribute })
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._setDisabled(value);
  }

  /** ID of the native input element inside `<brew-color-grid-item>` */
  public get inputId(): string {
    return `${this.id || this._uniqueId}-input`;
  }

  public readonly elRef = inject(ElementRef);

  public colorContrast?: string;

  @HostBinding('class.active')
  public active = false;

  public setActiveStyles(): void {
    this.active = true;
  }

  public setInactiveStyles(): void {
    this.active = false;
  }

  public focus() {
    this.elRef.nativeElement.focus();
    this._toggleOnInteraction();
  }

  /** Sets the tabindex of the list option. */
  public setTabindex(value: number) {
    this.elRef.nativeElement.setAttribute('tabindex', value + '');
  }

  /** Sets the disabled state and marks for check if a change occurred. */
  protected _setDisabled(value: boolean) {
    if (this._disabled !== value) {
      this._disabled = value;
      this._changeDetector.markForCheck();
    }
  }

  @HostListener('click')
  private _toggleOnInteraction() {
    if (!this.disabled) {
      if (!this.checked) {
        this.checked = true;
        this._colorGridSelect?.emitChange(this.value);
      }
    }
  }
}
