import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PerguntaModule } from './componentes/pergunta/pergunta.module';
import { HttpClientModule } from '@angular/common/http';
import { SpinnerComponent } from './componentes/spinner/spinner.component';
import { ModalComponent } from './componentes/modal/modal.component';
import { ToastComponent } from './componentes/toast/toast.component';


@NgModule({
  declarations: [
    AppComponent,
    SpinnerComponent,
    ModalComponent,
    ToastComponent,
 
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    PerguntaModule,
    HttpClientModule
   
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
