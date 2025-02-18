import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PerguntaComponent } from './pergunta/pergunta.component';



@NgModule({
  declarations: [
    PerguntaComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    PerguntaComponent
  ]
})
export class PerguntaModule { }
