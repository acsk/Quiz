import { Component, Input, Output, EventEmitter, HostListener, OnInit } from '@angular/core';
import { Directive, ElementRef } from '@angular/core';

@Component({
  selector: 'app-multi-select-box',
  templateUrl: './multi-select-box.component.html',
  styleUrls: ['./multi-select-box.component.css']
})
export class MultiSelectBoxComponent implements OnInit {
  @Input() items: any[] = [];
  @Input() disabled: boolean = false; // Adicionar a propriedade disabled
  @Output() selectionChange = new EventEmitter<number[]>();

  selectedItems: any[] = [];
  dropdownOpen = false;
  searchText = '';
  filteredItems: any[] = [];
  allSelected = false;

  ngOnInit() {
    this.filteredItems = this.items;

  }

  toggleDropdown() {
    if (!this.disabled) {
      this.dropdownOpen = !this.dropdownOpen;
      if (this.dropdownOpen) {
        this.filteredItems = this.items;
      }
    }
  }

  closeDropdown() {
    this.dropdownOpen = false;
  }

  filterItems() {
    this.filteredItems = this.items.filter(item => item.name.toLowerCase().includes(this.searchText.toLowerCase()));
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
    this.selectionChange.emit(this.selectedItems.map(i => i.id));
    this.updateSelectAllState();
  }

  toggleSelectAll() {
    if (this.allSelected) {
      this.selectedItems = [];
    } else {
      this.selectedItems = [...this.items];
    }
    this.selectionChange.emit(this.selectedItems.map(i => i.id));
    this.allSelected = !this.allSelected;
  }

  clearAll() {
    this.selectedItems = [];
    this.selectionChange.emit(this.selectedItems);
    this.allSelected = false;
  }

  updateSelectAllState() {
    this.allSelected = this.selectedItems.length === this.items.length;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target && !target.closest('.relative')) {
      this.closeDropdown();
    }
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