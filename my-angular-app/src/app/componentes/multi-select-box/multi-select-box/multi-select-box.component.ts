import { Component, Input, Output, EventEmitter, HostListener, OnInit, TemplateRef, ViewChild, ElementRef } from '@angular/core';
import { Directive } from '@angular/core';

@Component({
  selector: 'app-multi-select-box',
  templateUrl: './multi-select-box.component.html',
  styleUrls: ['./multi-select-box.component.css']
})
export class MultiSelectBoxComponent implements OnInit {
  @Input() items: any[] = [];
  @Input() disabled: boolean = false;
  @Input() itemTemplate: TemplateRef<any> | null = null;
  @Output() selectionChange = new EventEmitter<any[]>();
  @ViewChild('searchInput') searchInput!: ElementRef;

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
        setTimeout(() => {
          this.searchInput.nativeElement.focus();
        }, 0);
      }
    }
  }

  closeDropdown() {
    this.dropdownOpen = false;
  }

  filterItems() {
    this.filteredItems = this.items.filter(item => {
      const itemName = item.name || item; // Use item diretamente se item.name não estiver presente
      return itemName.toLowerCase().includes(this.searchText.toLowerCase());
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
    this.selectionChange.emit(this.selectedItems);
    this.updateSelectAllState();
  }

  toggleSelectAll() {
    if (this.allSelected) {
      this.selectedItems = [];
    } else {
      this.selectedItems = [...this.items];
    }
    this.selectionChange.emit(this.selectedItems);
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