import { Component, OnInit } from '@angular/core';
import { HttpQuestionsService } from '../../../services/http/http-questions.service';

@Component({
  selector: 'app-pergunta',
  templateUrl: './pergunta.component.html',
  styleUrls: ['./pergunta.component.css'],
})
export class PerguntaComponent implements OnInit {
  maxQuestionLength: number = 320; // Valor padrão para o número de caracteres
  testStarted: boolean = false;
  showSummary: boolean = false;
  correctAnswers: number = 0;
  incorrectAnswers: number = 0;
  selectedOptions: { [key: string]: number[] } = {};
  showAnswers: { [key: string]: boolean } = {};
  unansweredQuestions: Set<string> = new Set();
  selectedOption: number[] = [];
  showAnswer: boolean = false;
  currentQuestionIndex: number = 0;
  currentQuestion: any;
  selectedTopicIds: number[] = [];
  selectedLevelId: number | null = null;
  resetMultiSelectBoxes: boolean = false;
  filteredQuestions: any[] = [];
  topics: any[] = [];
  allQuestions: any[] = [];
  repeatWrongQuestions: boolean = false; // Controla o modo de repetição
  wrongQuestionsQueue: any[] = []; // Fila de perguntas erradas a serem repetidas
  filterShortQuestionsActive: boolean = false; // Controla o filtro de questões curtas

  constructor(private httpQuestionsService: HttpQuestionsService) {}

  ngOnInit(): void {
    this.loadQuestions();
    this.loadTopics();
  }

  loadQuestions(): void {
    this.httpQuestionsService.getAllQuestions().subscribe((data) => {
      const answeredQuestions = JSON.parse(localStorage.getItem('answeredQuestions') || '[]');
      this.allQuestions = data;

      // Filtrar perguntas que não foram respondidas
      this.filteredQuestions = this.allQuestions.filter((question: any) => !answeredQuestions.includes(question.id));

      // Configurar a pergunta atual
      this.currentQuestionIndex = 0;
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
    if (this.currentQuestion.answer.length > 1) {
      if (this.selectedOption.includes(index)) {
        this.selectedOption = this.selectedOption.filter((i) => i !== index);
      } else {
        this.selectedOption.push(index);
      }
    } else {
      this.selectedOption = [index];
    }
    this.selectedOptions[this.currentQuestion.id] = this.selectedOption;
    this.unansweredQuestions.add(this.currentQuestion.id);
  }

  toggleRepeatWrongQuestions(): void {
    this.repeatWrongQuestions = !this.repeatWrongQuestions;
    if (this.repeatWrongQuestions) {
      this.wrongQuestionsQueue = []; // Limpa a fila ao ativar o modo
      alert('Modo de repetição de perguntas erradas ativado!');
    } else {
      alert('Modo de repetição de perguntas erradas desativado!');
    }
  }

  checkAnswer(): void {
    this.showAnswer = true;
    this.showAnswers[this.currentQuestion.id] = true;

    const selectedAnswers = this.selectedOptions[this.currentQuestion.id] || [];
    const correctAnswers = this.currentQuestion.answer;

    // Verificar se todas as respostas corretas estão selecionadas e se o número de respostas está correto
    const correct = correctAnswers.every((ans: number) => selectedAnswers.includes(ans)) &&
                    selectedAnswers.length === correctAnswers.length;

    if (correct) {
      this.correctAnswers++;
    } else {
      this.incorrectAnswers++;
      if (this.repeatWrongQuestions) {
        // Adiciona a pergunta errada à fila para repetição
        const questionToRepeat = { ...this.currentQuestion, repeatAfter: this.currentQuestionIndex + 5 };
        this.wrongQuestionsQueue.push(questionToRepeat);
      }
    }

    // Não apagar as opções selecionadas, apenas salvar o estado atual
    this.saveAnsweredQuestion(this.currentQuestion.id, correct);

    // Verificar se é a última pergunta e finalizar o teste
    if (this.currentQuestionIndex >= this.filteredQuestions.length - 1) {
      this.finalizeTest();
    }
  }

  nextQuestion(): void {
    if (this.selectedOption.length > 0 && !this.showAnswer) {
      alert('Você marcou uma resposta, mas não clicou em "Responder". Por favor, responda antes de continuar.');
      return;
    }

    this.currentQuestionIndex++;

    // Verifica se há perguntas erradas na fila para repetição
    const nextWrongQuestion = this.wrongQuestionsQueue.find(q => q.repeatAfter === this.currentQuestionIndex);
    if (nextWrongQuestion) {
      this.currentQuestion = nextWrongQuestion;
      this.wrongQuestionsQueue = this.wrongQuestionsQueue.filter(q => q.id !== nextWrongQuestion.id); // Remove da fila

      // Zera as respostas da pergunta repetida
      this.selectedOptions[this.currentQuestion.id] = [];
      this.showAnswers[this.currentQuestion.id] = false;
      this.selectedOption = [];
      this.showAnswer = false;
    } else if (this.currentQuestionIndex < this.filteredQuestions.length) {
      this.currentQuestion = this.filteredQuestions[this.currentQuestionIndex];
    } else if (this.repeatWrongQuestions && this.wrongQuestionsQueue.length > 0) {
      // Se o modo de repetição está ativado e há perguntas erradas na fila
      this.currentQuestion = this.wrongQuestionsQueue.shift(); // Pega a próxima pergunta errada
      this.selectedOptions[this.currentQuestion.id] = [];
      this.showAnswers[this.currentQuestion.id] = false;
      this.selectedOption = [];
      this.showAnswer = false;
      this.currentQuestionIndex--; // Mantém o índice para continuar o fluxo
    } else {
      // Finaliza o teste se não houver mais perguntas
      this.finalizeTest();
    }

    this.selectedOption = this.selectedOptions[this.currentQuestion.id] || [];
    this.showAnswer = this.showAnswers[this.currentQuestion.id] || false;
  }

  previousQuestion(): void {
    if (this.selectedOption.length > 0 && !this.showAnswer) {
      alert('Você marcou uma resposta, mas não clicou em "Responder". Por favor, responda antes de continuar.');
      return;
    }
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.currentQuestion = this.filteredQuestions[this.currentQuestionIndex];
      this.selectedOption = this.selectedOptions[this.currentQuestion.id] || [];
      this.showAnswer = this.showAnswers[this.currentQuestion.id] || false;
    }
  }

  filterQuestionsByTopic(): void {
    const answeredQuestions = JSON.parse(localStorage.getItem('answeredQuestions') || '[]');

    // Filtrar perguntas com base nos tópicos, níveis e perguntas respondidas
    this.filteredQuestions = this.allQuestions.filter((question: any) => {
      const matchesTopic = this.selectedTopicIds.length === 0 || this.selectedTopicIds.includes(question.topicId);
      const matchesLevel = this.selectedLevelId === null || question.levelId === this.selectedLevelId;
      const notAnswered = !answeredQuestions.includes(question.id);
      return matchesTopic && matchesLevel && notAnswered;
    });

    // Aplicar o filtro de questões curtas, se necessário
    if (this.filterShortQuestionsActive) {
      this.filteredQuestions = this.filteredQuestions.filter((question: any) => question.question.length <= 320);
    }

    // Atualizar a pergunta atual
    this.currentQuestionIndex = 0;
    this.currentQuestion = this.filteredQuestions[this.currentQuestionIndex] || null;
  }


  filterShortQuestions(maxLength: number): void {
    this.filterShortQuestionsActive = true; // Ativa o filtro de questões curtas
    this.filteredQuestions = this.allQuestions.filter((question: any) => question.question.length <= maxLength);

    // Atualizar a pergunta atual
    this.currentQuestionIndex = 0;
    this.currentQuestion = this.filteredQuestions[this.currentQuestionIndex] || null;

    alert(`Foram filtradas ${this.filteredQuestions.length} questões com até ${maxLength} caracteres.`);
  }

  finalizeTest(): void {
    this.testStarted = false;
    this.showSummary = true;

    // Corrigir o cálculo de respostas corretas e incorretas
    this.correctAnswers = this.filteredQuestions.filter((question: any) => 
      question.answer.every((ans: number) => this.selectedOptions[question.id]?.includes(ans)) &&
      this.selectedOptions[question.id]?.length === question.answer.length
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
    this.selectedOption = [];
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

  copyQuestionToClipboard(): void {
    if (this.currentQuestion && this.currentQuestion.options) {
      const questionText = `Pergunta: ${this.currentQuestion.question}\n\nOpções:\n` +
        this.currentQuestion.options.map((option: { text: string }, index: number) => `${index + 1}. ${option.text}`).join('\n');
      
      navigator.clipboard.writeText(questionText).then(() => {
        alert('Pergunta e opções copiadas para a área de transferência!');
      }).catch(err => {
        console.error('Erro ao copiar para a área de transferência:', err);
      });
    } else {
      console.error('Erro: Dados da pergunta ou opções estão ausentes.');
      alert('Não foi possível copiar. Verifique se a pergunta e as opções estão carregadas corretamente.');
    }
  }

  saveAnsweredQuestion(questionId: string, isCorrect: boolean): void {
    if (isCorrect) {
      const answeredQuestions = JSON.parse(localStorage.getItem('answeredQuestions') || '[]');
      if (!answeredQuestions.includes(questionId)) {
        answeredQuestions.push(questionId);
        localStorage.setItem('answeredQuestions', JSON.stringify(answeredQuestions));
      }
    }
  }

  clearAnsweredQuestions(): void {
    localStorage.removeItem('answeredQuestions');
    alert('Perguntas respondidas foram limpas!');
    this.loadQuestions(); // Recarregar perguntas
  }

  get totalFilteredQuestions(): number {
    const answeredQuestions = JSON.parse(localStorage.getItem('answeredQuestions') || '[]');
    return this.allQuestions.filter((question: any) => !answeredQuestions.includes(question.id)).length;
  }
}