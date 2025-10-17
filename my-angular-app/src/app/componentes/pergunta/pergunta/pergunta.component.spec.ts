import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { MultiSelectBoxModule } from '../../multi-select-box/multi-select-box.module';
import { ModalService } from '../../modal/modal.service';
import { HttpQuestionsService } from '../../../services/http/http-questions.service';
import { PerguntaComponent } from './pergunta.component';

describe('PerguntaComponent', () => {
  let component: PerguntaComponent;
  let fixture: ComponentFixture<PerguntaComponent>;

  const httpQuestionsServiceStub = jasmine.createSpyObj<HttpQuestionsService>('HttpQuestionsService', [
    'getAllQuestions',
    'getTopics'
  ]);
  httpQuestionsServiceStub.getAllQuestions.and.returnValue(of([]));
  httpQuestionsServiceStub.getTopics.and.returnValue(of({ topics: [] }));

  const modalServiceStub = jasmine.createSpyObj<ModalService>(
    'ModalService',
    ['open', 'openWith', 'confirm', 'cancel', 'current', 'isOpen'],
    { state$: of(null) }
  );
  modalServiceStub.current.and.returnValue(null);
  modalServiceStub.isOpen.and.returnValue(false);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PerguntaComponent],
      imports: [CommonModule, FormsModule, ReactiveFormsModule, MultiSelectBoxModule],
      providers: [
        { provide: HttpQuestionsService, useValue: httpQuestionsServiceStub },
        { provide: ModalService, useValue: modalServiceStub }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PerguntaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
