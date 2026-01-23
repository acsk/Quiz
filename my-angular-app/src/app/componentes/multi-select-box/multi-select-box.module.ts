import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClickOutsideDirective, MultiSelectBoxComponent } from './multi-select-box/multi-select-box.component';



@NgModule({
  declarations: [
    MultiSelectBoxComponent,
    ClickOutsideDirective
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    MultiSelectBoxComponent,
    ClickOutsideDirective
  ]
})
export class MultiSelectBoxModule { }
