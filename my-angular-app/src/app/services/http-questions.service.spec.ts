import { TestBed } from '@angular/core/testing';

import { HttpQuestionsService } from './http-questions.service';

describe('HttpQuestionsService', () => {
  let service: HttpQuestionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HttpQuestionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
