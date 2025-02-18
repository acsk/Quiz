import { Component, OnInit } from '@angular/core';
import { HttpQuestionsService } from '../../../services/http-questions.service';

@Component({
  selector: 'app-pergunta',
  templateUrl: './pergunta.component.html',
  styleUrls: ['./pergunta.component.css'],
})
export class PerguntaComponent implements OnInit {
  allQuestions: any[] = [];
  filteredQuestions: any[] = [];
  currentQuestionIndex: number = 0;
  currentQuestion: any;
  selectedOption: number | null = null;
  showAnswer: boolean = false;
  topics: any[] = [];
  selectedTopicIds: number[] = [];
  selectedLevelId: number | null = null;
  questionCounts: { [key: number]: number } = {};
  selectedOptions: { [key: string]: number | null } = {};
  showAnswers: { [key: string]: boolean } = {};
  unansweredQuestions: Set<string> = new Set();
  showSummary: boolean = false;
  correctAnswers: number = 0;
  incorrectAnswers: number = 0;
  testStarted: boolean = false;

  constructor(private httpQuestionsService: HttpQuestionsService) {}

  ngOnInit(): void {
    this.httpQuestionsService.getAllQuestions().subscribe((data) => {
      this.allQuestions = data;
      this.filteredQuestions = this.allQuestions;
      this.currentQuestion = this.filteredQuestions[this.currentQuestionIndex];
      this.countQuestionsByTopic();
    });

    this.httpQuestionsService.getTopics().subscribe((data) => {
      this.topics = data.topics;
    });

    this.filterQuestionsByTopic();
  }

  get progressPercentage(): number {
    return ((this.currentQuestionIndex + 1) / this.filteredQuestions.length) * 100;
  }

  selectOption(index: number): void {
    this.selectedOption = index;
    this.selectedOptions[this.currentQuestion.id] = index;
    this.unansweredQuestions.add(this.currentQuestion.id);
  }

  checkAnswer(): void {
    this.showAnswer = true;
    this.showAnswers[this.currentQuestion.id] = true;
    this.unansweredQuestions.delete(this.currentQuestion.id);
    if (this.selectedOptions[this.currentQuestion.id] === this.currentQuestion.answer) {
      this.correctAnswers++;
    } else {
      this.incorrectAnswers++;
    }

    // Verificar se é a última pergunta e finalizar o teste
    if (this.currentQuestionIndex >= this.filteredQuestions.length - 1) {
      this.finalizeTest();
    }
  }

  nextQuestion(): void {
    if (this.selectedOption !== null && !this.showAnswer) {
      alert('Você marcou uma resposta, mas não clicou em "Responder". Por favor, responda antes de continuar.');
      return;
    }
    if (this.currentQuestionIndex < this.filteredQuestions.length - 1) {
      this.currentQuestionIndex++;
      this.currentQuestion = this.filteredQuestions[this.currentQuestionIndex];
      this.selectedOption = this.selectedOptions[this.currentQuestion.id] || null;
      this.showAnswer = this.showAnswers[this.currentQuestion.id] || false;
    }
  }

  previousQuestion(): void {
    if (this.selectedOption !== null && !this.showAnswer) {
      alert('Você marcou uma resposta, mas não clicou em "Responder". Por favor, responda antes de continuar.');
      return;
    }
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.currentQuestion = this.filteredQuestions[this.currentQuestionIndex];
      this.selectedOption = this.selectedOptions[this.currentQuestion.id] || null;
      this.showAnswer = this.showAnswers[this.currentQuestion.id] || false;
    }
  }

  filterQuestionsByTopic(): void {
    this.filteredQuestions = this.allQuestions.filter((question) => {
      const matchesTopic = this.selectedTopicIds.length === 0 || this.selectedTopicIds.includes(question.topicId);
      const matchesLevel = this.selectedLevelId === null || question.levelId === this.selectedLevelId;
      return matchesTopic && matchesLevel;
    });
    this.currentQuestionIndex = 0;
    this.currentQuestion = this.filteredQuestions[this.currentQuestionIndex];
    this.selectedOption = this.selectedOptions[this.currentQuestion.id] || null;
    this.showAnswer = this.showAnswers[this.currentQuestion.id] || false;
  }

  countQuestionsByTopic(): void {
    this.questionCounts = this.allQuestions.reduce((counts, question) => {
      counts[question.topicId] = (counts[question.topicId] || 0) + 1;
      return counts;
    }, {});
  }

  finalizeTest(): void {
    this.correctAnswers = this.filteredQuestions.filter((question) => 
      this.selectedOptions[question.id] === question.answer
    ).length;
    this.incorrectAnswers = this.filteredQuestions.length - this.correctAnswers;
    this.showSummary = true;
  }

  onTopicsChange(selectedTopics: number[]): void {
    this.selectedTopicIds = selectedTopics;
    this.filterQuestionsByTopic();
  }

  canStartTest(): boolean {
    return this.selectedTopicIds.length > 0;
  }

  startTest(): void {
    if (this.canStartTest()) {
      this.testStarted = true;
      this.currentQuestionIndex = 0;
      this.currentQuestion = this.filteredQuestions[this.currentQuestionIndex];
    }
  }

  resetTest(): void {
    this.testStarted = false;
    this.showSummary = false;
    this.correctAnswers = 0;
    this.incorrectAnswers = 0;
    this.selectedOptions = {};
    this.showAnswers = {};
    this.unansweredQuestions.clear();
    this.selectedOption = null;
    this.showAnswer = false;
    this.currentQuestionIndex = 0;
    this.currentQuestion = this.filteredQuestions[this.currentQuestionIndex];
  }
}