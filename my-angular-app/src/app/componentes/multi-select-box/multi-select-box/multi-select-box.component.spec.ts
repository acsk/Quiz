import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-multi-select-box',
  templateUrl: './multi-select-box.component.html',
  styleUrls: ['./multi-select-box.component.css']
})
export class MultiSelectBoxComponent {
  @Input() items: any[] = [];
  @Output() selectionChange = new EventEmitter<any[]>();

  selectedItems: any[] = [];
  dropdownOpen = false;
  searchText = '';
  filteredItems: any[] = [];

  ngOnInit() {
    this.filteredItems = this.items;
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
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
    this.selectionChange.emit(this.selectedItems);
  }
}