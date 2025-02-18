import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultiSelectBoxComponent } from './multi-select-box/multi-select-box.component';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    MultiSelectBoxComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    MultiSelectBoxComponent
  ]
})
export class MultiSelectBoxModule { }
