import { Component, OnInit } from '@angular/core';
import { HttpQuestionsService } from '../../../services/http/http-questions.service';

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
  subjects: string[] = [];
  tags: string[] = [];
  selectedSubjects: string[] = [];
  selectedTags: string[] = [];

  constructor(private httpQuestionsService: HttpQuestionsService) {}

  ngOnInit(): void {
    this.httpQuestionsService.getAllQuestions().subscribe((data) => {
      this.allQuestions = data;
      this.filteredQuestions = this.allQuestions;
      this.currentQuestion = this.filteredQuestions[this.currentQuestionIndex];
      this.extractSubjectsAndTags();
      this.countQuestionsByTopic();
      console.log('Todas as perguntas:', this.allQuestions);
      console.log('Perguntas filtradas:', this.filteredQuestions);
    });

    this.httpQuestionsService.getTopics().subscribe((data) => {
      this.topics = data.topics;
      console.log('Tópicos carregados:', this.topics);
    });

    this.filterQuestionsByTopic();
  }

  extractSubjectsAndTags(): void {
    const subjectsSet = new Set<string>();
    const tagsSet = new Set<string>();

    this.allQuestions.forEach((question) => {
      if (question.subject) {
        subjectsSet.add(question.subject);
      }
      if (question.tags) {
        question.tags.forEach((tag: string) => tagsSet.add(tag));
      }
    });

    this.subjects = Array.from(subjectsSet);
    this.tags = Array.from(tagsSet);
    console.log('Assuntos extraídos:', this.subjects);
    console.log('Tags extraídas:', this.tags);
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
    console.log('Assuntos selecionados:', this.selectedSubjects);
    console.log('Tags selecionadas:', this.selectedTags);

    this.filteredQuestions = this.allQuestions.filter((question) => {
      const matchesTopic = this.selectedTopicIds.length === 0 || this.selectedTopicIds.includes(question.topicId);
      const matchesLevel = this.selectedLevelId === null || question.levelId === this.selectedLevelId;
      const matchesSubject = this.selectedSubjects.length === 0 || this.selectedSubjects.includes(question.subject);
      const matchesTags = this.selectedTags.length === 0 || (question.tags && this.selectedTags.some(tag => question.tags.includes(tag)));
      return matchesTopic && matchesLevel && matchesSubject && matchesTags;
    });

    console.log('Perguntas após aplicação dos filtros:', this.filteredQuestions);

    this.countQuestionsByTopic();
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

  countQuestionsByTopic(): void {
    this.questionCounts = this.filteredQuestions.reduce((counts, question) => {
      counts[question.topicId] = (counts[question.topicId] || 0) + 1;
      return counts;
    }, {});
    console.log('Quantidade de perguntas por tópico:', this.questionCounts);
  }

  finalizeTest(): void {
    this.testStarted = false;
    this.showSummary = true;
    this.correctAnswers = this.filteredQuestions.filter((question) => 
      this.selectedOptions[question.id] === question.answer
    ).length;
    this.incorrectAnswers = this.filteredQuestions.length - this.correctAnswers;
  }

  onTopicsChange(selectedTopics: any[]): void {
    this.selectedTopicIds = selectedTopics.map(topic => topic.id); // Extraindo apenas os IDs dos tópicos
    console.log('Tópicos selecionados:', this.selectedTopicIds);
    this.filterQuestionsByTopic();
  }

  onSubjectsChange(selectedSubjects: string[]): void {
    this.selectedSubjects = selectedSubjects;
    console.log('Assuntos selecionados:', this.selectedSubjects);
    this.filterQuestionsByTopic();
  }

  onTagsChange(selectedTags: string[]): void {
    this.selectedTags = selectedTags;
    console.log('Tags selecionadas:', this.selectedTags);
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
  }

  getGoogleSearchUrl(question: string, answer?: string): string {
    let query = question;
    if (answer) {
      query += ' ' + answer;
    }
    return 'https://www.google.com/search?q=' + encodeURIComponent(query);
  }
}