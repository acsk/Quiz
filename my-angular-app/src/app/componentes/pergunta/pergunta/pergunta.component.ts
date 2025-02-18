import { Component, OnInit } from '@angular/core';
import { HttpQuestionsService } from '../../../services/http-questions.service';

@Component({
  selector: 'app-pergunta',
  templateUrl: './pergunta.component.html',
  styleUrls: ['./pergunta.component.css']
})
export class PerguntaComponent implements OnInit {

  allQuestions: any[] = [];
  filteredQuestions: any[] = [];
  currentQuestionIndex: number = 0;
  currentQuestion: any;
  selectedOption: number | null = null;
  showAnswer: boolean = false;
  topics: any[] = [];
  selectedTopicId: number | null = null;
  questionCounts: { [key: number]: number } = {};
  selectedOptions: { [key: string]: number | null } = {};

  constructor(private httpQuestionsService: HttpQuestionsService) { }

  ngOnInit(): void {
    this.httpQuestionsService.getAllQuestions().subscribe(data => {
      this.allQuestions = data;
      this.filteredQuestions = this.allQuestions;
      this.currentQuestion = this.filteredQuestions[this.currentQuestionIndex];
      this.countQuestionsByTopic();
    });

    this.httpQuestionsService.getTopics().subscribe(data => {
      this.topics = data.topics;
    });
  }

  selectOption(index: number): void {
    this.selectedOption = index;
    this.selectedOptions[this.currentQuestion.id] = index;
  }

  checkAnswer(): void {
    this.showAnswer = true;
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.filteredQuestions.length - 1) {
      this.currentQuestionIndex++;
      this.currentQuestion = this.filteredQuestions[this.currentQuestionIndex];
      this.selectedOption = this.selectedOptions[this.currentQuestion.id] || null;
      this.showAnswer = false;
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.currentQuestion = this.filteredQuestions[this.currentQuestionIndex];
      this.selectedOption = this.selectedOptions[this.currentQuestion.id] || null;
      this.showAnswer = false;
    }
  }

  filterQuestionsByTopic(): void {
    if (this.selectedTopicId !== null) {
      this.filteredQuestions = this.allQuestions.filter(q => q.topicId === this.selectedTopicId);
    } else {
      this.filteredQuestions = this.allQuestions;
    }
    this.currentQuestionIndex = 0;
    this.currentQuestion = this.filteredQuestions[this.currentQuestionIndex];
    this.selectedOption = this.selectedOptions[this.currentQuestion.id] || null;
  }

  countQuestionsByTopic(): void {
    this.questionCounts = this.allQuestions.reduce((counts, question) => {
      counts[question.topicId] = (counts[question.topicId] || 0) + 1;
      return counts;
    }, {});
  }
}