import { Component, OnInit } from '@angular/core';
import { HttpQuestionsService } from '../../../services/http-questions.service';

@Component({
  selector: 'app-pergunta',
  templateUrl: './pergunta.component.html',
  styleUrls: ['./pergunta.component.css']
})
export class PerguntaComponent implements OnInit {

  allQuestions: any[] = [];
  currentQuestionIndex: number = 0;
  currentQuestion: any;
  selectedOption: number | null = null;
  showAnswer: boolean = false;

  constructor(private httpQuestionsService: HttpQuestionsService) { }

  ngOnInit(): void {
    this.httpQuestionsService.getAllQuestions().subscribe(data => {
      this.allQuestions = data;
      this.currentQuestion = this.allQuestions[this.currentQuestionIndex];
    });
  }

  selectOption(index: number): void {
    this.selectedOption = index;
  }

  checkAnswer(): void {
    this.showAnswer = true;
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.allQuestions.length - 1) {
      this.currentQuestionIndex++;
      this.currentQuestion = this.allQuestions[this.currentQuestionIndex];
      this.selectedOption = null;
      this.showAnswer = false;
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.currentQuestion = this.allQuestions[this.currentQuestionIndex];
      this.selectedOption = null;
      this.showAnswer = false;
    }
  }
}