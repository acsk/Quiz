import { Component, OnInit } from '@angular/core';
import { HttpQuestionsService } from '../../../services/http/http-questions.service';

@Component({
  selector: 'app-pergunta',
  templateUrl: './pergunta.component.html',
  styleUrls: ['./pergunta.component.css'],
})
export class PerguntaComponent implements OnInit {
  testStarted: boolean = false;
  showSummary: boolean = false;
  correctAnswers: number = 0;
  incorrectAnswers: number = 0;
  selectedOptions: { [key: string]: number | null } = {};
  showAnswers: { [key: string]: boolean } = {};
  unansweredQuestions: Set<string> = new Set();
  selectedOption: number | null = null;
  showAnswer: boolean = false;
  currentQuestionIndex: number = 0;
  currentQuestion: any;
  selectedTopicIds: number[] = [];
  selectedLevelId: number | null = null;
  resetMultiSelectBoxes: boolean = false;
  filteredQuestions: any[] = [];
  topics: any[] = [];
  allQuestions: any[] = [];

  constructor(private httpQuestionsService: HttpQuestionsService) {}

  ngOnInit(): void {
    this.loadQuestions();
    this.loadTopics();
  }

  loadQuestions(): void {
    this.httpQuestionsService.getAllQuestions().subscribe((data) => {
      this.allQuestions = data;
      this.filteredQuestions = this.allQuestions;
      this.currentQuestion = this.filteredQuestions[this.currentQuestionIndex];
      console.log('Todas as perguntas:', this.allQuestions);
      console.log('Perguntas filtradas:', this.filteredQuestions);
    });
  }

  loadTopics(): void {
    this.httpQuestionsService.getTopics().subscribe((data) => {
      this.topics = data.topics;
      console.log('Tópicos carregados:', this.topics);
    });
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
    console.log('Filtrando perguntas com os seguintes critérios:');
    console.log('Tópicos selecionados:', this.selectedTopicIds);
    console.log('Nível selecionado:', this.selectedLevelId);

    this.filteredQuestions = this.allQuestions.filter((question: any) => {
      const matchesTopic = this.selectedTopicIds.length === 0 || this.selectedTopicIds.includes(question.topicId);
      const matchesLevel = this.selectedLevelId === null || question.levelId === this.selectedLevelId;
      return matchesTopic && matchesLevel;
    });

    console.log('Perguntas após aplicação dos filtros:', this.filteredQuestions);

    this.currentQuestionIndex = 0;
    if (this.filteredQuestions.length > 0) {
      this.currentQuestion = this.filteredQuestions[this.currentQuestionIndex];
      this.selectedOption = this.selectedOptions[this.currentQuestion.id] || null;
      this.showAnswer = this.showAnswers[this.currentQuestion.id] || false;
    } else {
      this.currentQuestion = null;
      this.selectedOption = null;
      this.showAnswer = false;
    }
  }

  finalizeTest(): void {
    this.testStarted = false;
    this.showSummary = true;
    this.correctAnswers = this.filteredQuestions.filter((question: any) => 
      this.selectedOptions[question.id] === question.answer
    ).length;
    this.incorrectAnswers = this.filteredQuestions.length - this.correctAnswers;
  }

  onTopicsChange(selectedTopics: any[]): void {
    console.log('onTopicsChange - selectedTopics:', selectedTopics);
    this.selectedTopicIds = selectedTopics
      .filter(topic => topic && topic.id !== undefined) // Filtrar tópicos válidos
      .map(topic => topic.id); // Extraindo apenas os IDs dos tópicos
    console.log('Tópicos selecionados:', this.selectedTopicIds);
    this.filterQuestionsByTopic();
  }

  canStartTest(): boolean {
    return this.selectedTopicIds.length > 0;
  }

  startTest(): void {
    if (this.canStartTest()) {
      this.testStarted = true;
      this.showSummary = false;
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
  
    // Resetar dropdowns
    this.selectedTopicIds = [];
    this.selectedLevelId = null;
  
    // Emitir evento de reset para os componentes multi-select-box
    this.resetMultiSelectBoxes = true;

    // Reaplicar os filtros para garantir que todas as perguntas sejam exibidas
    this.filterQuestionsByTopic();
  }

  onResetComplete(): void {
    this.resetMultiSelectBoxes = false;
  }

  getGoogleSearchUrl(question: string, answer?: string): string {
    let query = question;
    if (answer) {
      query += ' ' + answer;
    }
    return 'https://www.google.com/search?q=' + encodeURIComponent(query);
  }
}