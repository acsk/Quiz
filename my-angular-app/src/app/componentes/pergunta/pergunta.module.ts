import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PerguntaComponent } from './pergunta/pergunta.component';
import { FormsModule } from '@angular/forms';
import { MultiSelectBoxModule } from '../multi-select-box/multi-select-box.module';



@NgModule({
  declarations: [
    PerguntaComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MultiSelectBoxModule
  ],
  exports: [
    PerguntaComponent
  ]
})
export class PerguntaModule { }
