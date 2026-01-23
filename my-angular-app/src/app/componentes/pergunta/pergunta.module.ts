import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MultiSelectBoxModule } from '../multi-select-box/multi-select-box.module';
import { PerguntaComponent } from './pergunta/pergunta.component';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MultiSelectBoxModule,
    ReactiveFormsModule
  ],
  declarations: [
    PerguntaComponent
  ],
  exports: [
    PerguntaComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PerguntaModule { }
