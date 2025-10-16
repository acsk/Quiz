import { Component, Input, Output, EventEmitter, HostListener, OnInit, TemplateRef, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { Directive } from '@angular/core';

@Component({
  selector: 'app-multi-select-box',
  templateUrl: './multi-select-box.component.html',
  styleUrls: ['./multi-select-box.component.css']
})
export class MultiSelectBoxComponent implements OnInit, OnChanges {
  @Input() items: any[] = [];
  @Input() disabled: boolean = false;
  @Input() itemTemplate: TemplateRef<any> | null = null;
  @Input() value: any[] | null = null;
  @Input() compareKey: string | null = 'id';
  @Output() selectionChange = new EventEmitter<any[]>();
  @ViewChild('searchInput') searchInput!: ElementRef;

  selectedItems: any[] = [];
  dropdownOpen = false;
  searchText = '';
  filteredItems: any[] = [];
  allSelected = false;

  ngOnInit() {
    this.filteredItems = this.items;
    this.syncSelectedItems();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) {
      this.filteredItems = this.items;
    }
    if (changes['items'] || changes['value']) {
      this.syncSelectedItems();
    }
  }

  toggleDropdown() {
    if (!this.disabled) {
      this.dropdownOpen = !this.dropdownOpen;
      if (this.dropdownOpen) {
        this.filteredItems = this.items;
        this.searchText = '';
        setTimeout(() => {
          this.searchInput?.nativeElement?.focus();
        }, 0);
      }
    }
  }

  closeDropdown() {
    this.dropdownOpen = false;
    this.searchText = '';
    this.filteredItems = this.items;
  }

  filterItems() {
    const term = this.searchText.trim().toLowerCase();
    if (!term) {
      this.filteredItems = this.items;
      return;
    }

    this.filteredItems = this.items.filter(item => {
      const itemName = this.resolveItemLabel(item);
      return itemName.toLowerCase().includes(term);
    });
  }

  isSelected(item: any): boolean {
    return this.selectedItems.includes(item);
  }

  toggleSelection(item: any) {
    if (this.isSelected(item)) {
      this.selectedItems = this.selectedItems.filter(i => i !== item);
    } else {
      this.selectedItems.push(item);
    }
    this.emitSelection();
    this.updateSelectAllState();
  }

  toggleSelectAll() {
    if (this.allSelected) {
      this.selectedItems = [];
    } else {
      this.selectedItems = [...this.items];
    }
    this.emitSelection();
    this.updateSelectAllState();
  }

  clearAll() {
    this.selectedItems = [];
    this.emitSelection();
    this.updateSelectAllState();
  }

  updateSelectAllState() {
    this.allSelected = this.items.length > 0 && this.selectedItems.length === this.items.length;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target && !target.closest('.multi-select')) {
      this.closeDropdown();
    }
  }

  get displayLabel(): string {
    if (this.selectedItems.length === 0) {
      return 'Selecione os tópicos';
    }

    if (this.selectedItems.length === 1) {
      return this.resolveItemLabel(this.selectedItems[0]);
    }

    return `${this.selectedItems.length} tópicos selecionados`;
  }

  get isPartialSelection(): boolean {
    return this.selectedItems.length > 0 && this.selectedItems.length < this.items.length;
  }

  trackByItem(_index: number, item: any): string | number {
    if (item && typeof item === 'object' && 'id' in item) {
      return (item as { id: string | number }).id;
    }
    return typeof item === 'string' ? item : _index;
  }

  private resolveItemLabel(item: any): string {
    if (!item) {
      return '';
    }
    if (typeof item === 'string') {
      return item;
    }
    if (typeof item === 'object' && 'name' in item) {
      return String((item as { name: string }).name);
    }
    return String(item);
  }

  private syncSelectedItems(): void {
    if (!Array.isArray(this.value)) {
      this.selectedItems = [];
      this.updateSelectAllState();
      return;
    }

    const matched = this.items.filter(item =>
      this.value!.some(selected => this.areItemsEqual(item, selected))
    );

    this.selectedItems = matched;
    this.updateSelectAllState();
  }

  private areItemsEqual(itemA: any, itemB: any): boolean {
    if (this.compareKey && typeof itemA === 'object' && itemA !== null && typeof itemB === 'object' && itemB !== null) {
      const key = this.compareKey;
      return itemA[key as keyof typeof itemA] === itemB[key as keyof typeof itemB];
    }
    return itemA === itemB;
  }

  private emitSelection(): void {
    this.selectionChange.emit([...this.selectedItems]);
  }
}

@Directive({
  selector: '[clickOutside]'
})
export class ClickOutsideDirective {
  @Output() clickOutside = new EventEmitter<void>();

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event.target'])
  onClick(targetElement: HTMLElement) {
    const clickedInside = this.elementRef.nativeElement.contains(targetElement);
    if (!clickedInside) {
      this.clickOutside.emit();
    }
  }
}
