import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  NgZone,
  OnDestroy,
  Output,
  QueryList,
  ViewChildren,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  COLOR_GRID_ITEMS_DEFAULT,
  COLOR_GRID_ITEM_SIZES,
  ColorGridItemSize,
  ColorGridItemComponent,
  ColorGridSelect,
  COLOR_GRID_SELECT,
} from './item';
import { FocusKeyManager } from '@angular/cdk/a11y';
import {
  DOWN_ARROW,
  LEFT_ARROW,
  RIGHT_ARROW,
  UP_ARROW,
} from '@angular/cdk/keycodes';
import { chunk, find, includes, indexOf } from 'lodash';
import { _getFocusedElementPierceShadowDom } from '@angular/cdk/platform';
import { Subject, takeUntil } from 'rxjs';

/**
 *
 * A lot of the code has been inspired by
 * [MatSelectionList](https://github.com/angular/components/blob/main/src/material/list/selection-list.ts)
 * for focus management and accessibility.
 *
 * @todo
 * - Handle {@link ColorGridSelectComponent._onKeydown}
 * - Calculate {@link ColorGridSelectComponent.grid}
 *
 * @link https://blog.angular-university.io/angular-custom-form-controls/
 */
@Component({
  selector: 'brew-color-grid-select',
  standalone: true,
  imports: [CommonModule, ColorGridItemComponent],
  templateUrl: './color-grid-select.component.html',
  styleUrl: './color-grid-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: ColorGridSelectComponent,
    },
    {
      provide: COLOR_GRID_SELECT,
      useExisting: ColorGridSelectComponent,
    },
  ],
})
export class ColorGridSelectComponent
  implements ControlValueAccessor, ColorGridSelect, AfterViewInit, OnDestroy {
  private readonly _ngZone = inject(NgZone);
  private readonly _el = inject(ElementRef<ColorGridSelectComponent>);

  private readonly _elContainer = inject(ElementRef);

  /** Emits when the list has been destroyed. */
  private readonly _destroyed = new Subject<void>();

  /** The number of items per row. Updated upon container size change */
  private readonly _itemsPerRow = signal(5);

  /** The items to be displayed in the grid */
  private readonly _items = signal(COLOR_GRID_ITEMS_DEFAULT);

  /** The size of the item in the grid */
  private readonly _itemSize = signal<ColorGridItemSize>(
    COLOR_GRID_ITEM_SIZES[0]
  );

  /** The FocusKeyManager which handles focus within the children item components */
  private _keyManager!: FocusKeyManager<ColorGridItemComponent>;

  /** The currently selected value */
  private _value?: string | null | undefined = COLOR_GRID_ITEMS_DEFAULT[0];

  private _disabled = false;
  private _touched = false;

  private _onTouched = (): void => void 0;
  private _onChange = (val?: string | null): void => void 0;

  constructor() {
    window.addEventListener('resize', this._calculateItemsPerRow.bind(this)); // Bind to window resize
  }

  trackByItem(index: number, item: string): string {
    return item;
  }

  @HostBinding('attr.tabindex')
  private get _tabIndex() {
    return -1;
    // return this.disabled ? -1 : 0;
  }

  /** The appropriate role of the listbox */
  @HostBinding('role')
  private get _role() {
    return 'radiogroup';
  }

  @ViewChildren(ColorGridItemComponent)
  private _colorGridItemsQl!: QueryList<ColorGridItemComponent>;

  @Input()
  public disabled = false;

  @Input()
  public set items(value) {
    this._items.set(value);
  }

  public get items() {
    return this._items();
  }

  @Input()
  public get itemSize(): ColorGridItemSize {
    return this._itemSize();
  }

  public set itemSize(value: ColorGridItemSize) {
    this._itemSize.set(value);
  }

  @Input()
  public get value(): string | null | undefined {
    return this._value;
  }

  public set value(value: string | null | undefined) {
    this._value = value;
    // this._updateKeyManagerActiveItem();
  }

  /** Emits when the selected value changes. Naming convention supports `[(value)]` usage */
  @Output()
  public readonly valueChange = new EventEmitter<string | null | undefined>();

  /** The computed 2d grid of items */
  public readonly grid = computed((): string[][] => {
    const itemsPerRow = this._itemsPerRow();  // How many items per row
    const items = this._items();              // The list of color items

    console.log('Items:', items);             // Log items
    console.log('Items per Row:', itemsPerRow); // Log number of items per row

    const chunkedItems = chunk(items, itemsPerRow);  // Chunking the array
    console.log('Chunked grid:', chunkedItems);      // Log chunked grid for debugging

    return chunkedItems;
  });


  private _calculateItemsPerRow(): void {
    const containerWidth = this._elContainer.nativeElement.offsetWidth;

    // Set fixed item width (adjust based on your preferences)
    const itemWidth = 80; // You can change this value as needed

    // Dynamically calculate items per row based on the container's width
    const itemsPerRow = Math.max(Math.floor(containerWidth / itemWidth))

    console.log('Container Width:', containerWidth);
    console.log('Updated items per row:', itemsPerRow);

    // Ensure we have at least 1 item per row
    this._itemsPerRow.set(itemsPerRow);
  }


  // ControlValueAccessor implementation
  public writeValue(val: string): void {
    this.value = val;
  }

  public registerOnChange(onChange: (val?: string | null) => void): void {
    this._onChange = onChange;
  }

  public registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this._disabled = isDisabled;
  }
  // /ControlValueAccessor implementation

  /** Marks the component as touched */
  public markAsTouched() {
    if (!this._touched) {
      this._onTouched();
      this._touched = true;
    }
  }

  /** 
   * Select a color and update the component's state 
   * 
   * Handles the selection of a color, sets the value, and emits the change event.
   */
  selectColor(color: string) {
    if (!this.disabled) {
      this.value = color;
      this.emitChange(color);
    }
  }

  /** Implemented as part of {@link ColorGridSelect} interface */
  public emitChange(value?: string | null | undefined) {
    this.markAsTouched();

    if (!this._disabled) {
      this.value = value;
      this._onChange(this.value);
      this.valueChange.emit(value);
    }
  }

  public ngAfterViewInit() {
    this._calculateItemsPerRow();
    // this._itemsPerRow.set(5);
    this._adjustItemsPerRow();
    window.addEventListener('resize', this._onResize.bind(this));

    // this._calculateItemsPerRow();

    // window.addEventListener('resize', this._calculateItemsPerRow.bind(this));

    // Set initial value of itemsPerRow

    this._keyManager = new FocusKeyManager(this._colorGridItemsQl)
      .withHomeAndEnd()
      .withHorizontalOrientation('ltr')
      .skipPredicate(() => this.disabled)
      .withWrap();

    // Set the initial focus.
    this._resetActiveOption();

    // If the active item is removed from the list, reset back to the first one.
    this._colorGridItemsQl.changes
      .pipe(takeUntil(this._destroyed))
      .subscribe(() => {
        const activeItem = this._keyManager.activeItem;

        if (
          !activeItem ||
          this._colorGridItemsQl.toArray().indexOf(activeItem) === -1
        ) {
          this._resetActiveOption();
        }
      });

    // These events are bound outside the zone, because they don't change
    // any change-detected properties and they can trigger timeouts.
    this._ngZone.runOutsideAngular(() => {
      this._el.nativeElement.addEventListener('focusin', this._handleFocusin);
      this._el.nativeElement.addEventListener('focusout', this._handleFocusout);
    });

    this._keyManager = new FocusKeyManager(this._colorGridItemsQl)
      .withHomeAndEnd()
      .withHorizontalOrientation('ltr')
      .skipPredicate(() => this.disabled)
      .withWrap();
  }

  private _adjustItemsPerRow = () => {
    const containerWidth = this._el.nativeElement.offsetWidth;
    const itemMargin = 10;  // Adjust based on the actual margin around your items
    const itemWidth = 80 + 2 * itemMargin;  // Assuming each item takes around 80px + margin
    let itemsPerRow = Math.floor(containerWidth / itemWidth);

    // Ensure it doesn't go below 1
    itemsPerRow = Math.max(itemsPerRow, 1);  // Minimum of 1 item

    // Only update if it changes
    if (itemsPerRow !== this._itemsPerRow()) {
      this._ngZone.run(() => {
        this._itemsPerRow.set(itemsPerRow);
        console.log('Updated items per row:', this._itemsPerRow());
      });
    }
  };

  ngOnInit(): void {
    this._calculateItemsPerRow();
  }

  public ngOnDestroy() {
    this._keyManager.destroy();
    this._el.nativeElement.removeEventListener('focusin', this._handleFocusin);
    this._el.nativeElement.removeEventListener(
      'focusout',
      this._handleFocusout
    );

    this._destroyed.next();
    this._destroyed.complete();
    window.removeEventListener('resize', this._calculateItemsPerRow.bind(this));
  }

  // Resize event handler
  private _onResize() {
    this._setItemsPerRow();
  }

  // Dynamically calculate the number of items per row based on the container width
  private _setItemsPerRow() {
    const containerWidth = this._el.nativeElement.offsetWidth;

    // For example, each item is 100px wide with 10px margin (adjust this value based on your item size)
    const itemWidth = 70;

    // Calculate how many items fit in one row
    const itemsPerRow = Math.floor(containerWidth / itemWidth);

    // Set items per row
    this._itemsPerRow.set(itemsPerRow);

    console.log('Items per Row:', itemsPerRow); // Debugging
  }

  /**
   * @todo
   * The logic to decide how to navigate inside the grid when the
   * up, down, left and right buttons are pressed
   */
  @HostListener('keydown', ['$event'])
  private _onKeydown(event: KeyboardEvent) {
    const activeIndex = this._keyManager.activeItemIndex;

    // Ensure we always have an active item
    if (activeIndex === null || this._keyManager.activeItem === null) {
      this._keyManager.setActiveItem(0);
    }

    const currentIndex = this._colorGridItemsQl.toArray().indexOf(this._keyManager.activeItem!); // ActiveItem will not be null now
    const columns = this._itemsPerRow();

    switch (event.keyCode) {
      case UP_ARROW: {
        const newIndexUp = currentIndex - columns;
        if (newIndexUp >= 0) {
          this._keyManager.setActiveItem(newIndexUp);
          this.emitChange(this._items()[newIndexUp]);
        }
        break;
      }
      case DOWN_ARROW: {
        const newIndexDown = currentIndex + columns;
        if (newIndexDown < this._items().length) {
          this._keyManager.setActiveItem(newIndexDown);
          this.emitChange(this._items()[newIndexDown]);
        }
        break;
      }
      case LEFT_ARROW:
      case RIGHT_ARROW: {
        this._keyManager.onKeydown(event);
        break;
      }
    }

    // // @fixme remove the following code block after
    // // the above navigation logic is completed
    // // ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
    // if (
    //   includes([UP_ARROW, DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW], event.keyCode)
    // ) {
    //   this._keyManager.onKeydown(event);
    // }
    // // ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
  }

  /** Handles focusout events within the list. */
  private readonly _handleFocusout = () => {
    // Focus takes a while to update so we have to wrap our call in a timeout.
    setTimeout(() => {
      if (!this._containsFocus()) {
        this._resetActiveOption();
      }
    });
  };

  /** Handles focusin events within the list. */
  private readonly _handleFocusin = (event: FocusEvent) => {
    if (this.disabled) {
      return;
    }

    const activeIndex = this._colorGridItemsQl
      .toArray()
      .findIndex((item) =>
        item.elRef.nativeElement.contains(event.target as HTMLElement)
      );

    if (activeIndex > -1) {
      this._setActiveOption(activeIndex);
    } else {
      this._resetActiveOption();
    }
  };

  /**
   * Sets an option as active.
   * @param index Index of the active option.
   *              If set to -1, no option will be active.
   */
  private _setActiveOption(index: number) {
    this._colorGridItemsQl.forEach((item, itemIndex) =>
      item.setTabindex(itemIndex === index ? 0 : -1)
    );

    this._keyManager.updateActiveItem(index);
  }

  /**
   * Resets the active option.
   *
   * When the list is disabled,
   * remove all options from to the tab order.
   * Otherwise, focus the first selected option.
   */
  private _resetActiveOption() {
    let index = -1;

    if (!this.disabled) {
      const colorGridItems = this._colorGridItemsQl.toArray();

      const activeItem =
        find(colorGridItems, (item) => item.checked && !item.disabled) ??
        this._colorGridItemsQl.first;

      index = activeItem ? indexOf(colorGridItems, activeItem) : -1;
    }

    this._setActiveOption(index);
  }

  /** Returns whether the focus is currently within the list. */
  private _containsFocus() {
    const activeElement = _getFocusedElementPierceShadowDom();
    return activeElement && this._el.nativeElement.contains(activeElement);
  }
}
