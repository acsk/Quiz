import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PerguntaComponent } from './pergunta/pergunta.component';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    PerguntaComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    PerguntaComponent
  ]
})
export class PerguntaModule { }
