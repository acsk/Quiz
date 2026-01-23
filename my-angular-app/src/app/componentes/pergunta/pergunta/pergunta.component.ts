import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpQuestionsService } from '../../../services/http/http-questions.service';
import { ModalService } from '../../modal/modal.service';
import { ToastService } from '../../toast/toast.service';

@Component({
  selector: 'app-pergunta',
  templateUrl: './pergunta.component.html',
  styleUrls: ['./pergunta.component.css'],
})
export class PerguntaComponent implements OnInit, OnDestroy {
  maxQuestionLength: number = 320; // Valor padrão para o número de caracteres
  testStarted: boolean = false;
  showSummary: boolean = false;
  correctAnswers: number = 0;
  incorrectAnswers: number = 0;
  selectedOptions: { [key: string]: number[] } = {};
  showAnswers: { [key: string]: boolean } = {};
  selectedOption: number[] = [];
  showAnswer: boolean = false;
  currentQuestionIndex: number = 0;
  currentQuestion: any;
  selectedTopicIds: number[] = [];
  selectedTopics: any[] = [];
  resetMultiSelectBoxes: boolean = false;
  filteredQuestions: any[] = [];
  topics: any[] = [];
  allQuestions: any[] = [];
  repeatWrongQuestions: boolean = false; // Controla o modo de repetição
  wrongQuestionsQueue: any[] = []; // Fila de perguntas erradas a serem repetidas
  filterShortQuestionsActive: boolean = false; // Controla o filtro de questões curtas
  isDrawerOpen: boolean = false;
  favoriteQuestionIds: Set<string> = new Set();
  deferredQuestionIds: Set<string> = new Set();
  pendingReviewPromptVisible: boolean = false;
  themePreference: 'system' | 'light' | 'dark' = 'system';
  isDarkModeEnabled: boolean = false;
  private readonly themePreferenceKey = 'quizThemePreference';
  private systemDarkMedia?: MediaQueryList;
  private systemThemeListener?: (event: MediaQueryListEvent | MediaQueryList) => void;

  constructor(
    private httpQuestionsService: HttpQuestionsService,
    private modalService: ModalService,
    private toast: ToastService
  ) {
    this.initializeFavoriteQuestions();
  }

  ngOnInit(): void {
    this.loadQuestions();
    this.loadTopics();
    this.initializeTheme();
  }

  loadQuestions(): void {
    this.deferredQuestionIds.clear();
    this.httpQuestionsService.getAllQuestions().subscribe((data) => {
      const answeredQuestions = JSON.parse(localStorage.getItem('answeredQuestions') || '[]');
      this.allQuestions = data;

      this.synchronizeFavoritesWithQuestions();

      // Filtrar perguntas que não foram respondidas
      this.filteredQuestions = this.allQuestions.filter((question: any) => !answeredQuestions.includes(question.id));

      // Configurar a pergunta atual
      this.currentQuestionIndex = 0;
      this.currentQuestion = this.filteredQuestions[this.currentQuestionIndex];
      this.hydrateCurrentQuestionState();
      console.log('Todas as perguntas:', this.allQuestions);
      console.log('Perguntas filtradas:', this.filteredQuestions);
    });
  }

  loadTopics(): void {
    this.httpQuestionsService.getTopics().subscribe((data) => {
      this.topics = data.topics;
      console.log('Tópicos carregados:', this.topics);
      this.syncSelectedTopicsFromIds();
    });
  }

  get progressPercentage(): number {
    if (this.filteredQuestions.length === 0) {
      return 0;
    }
    return ((this.currentQuestionIndex + 1) / this.filteredQuestions.length) * 100;
  }

  get currentQuestionNumber(): number {
    return this.filteredQuestions.length ? this.currentQuestionIndex + 1 : 0;
  }

  get hasQuestionLoaded(): boolean {
    return !!this.currentQuestion && this.filteredQuestions.length > 0;
  }

  get hasMoreQuestionsAhead(): boolean {
    return this.currentQuestionIndex < this.filteredQuestions.length - 1 || (this.repeatWrongQuestions && this.wrongQuestionsQueue.length > 0);
  }

  getOptionLetter(position: number): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (position < alphabet.length) {
      return alphabet[position];
    }
    return `Opção ${position + 1}`;
  }

  get isCurrentQuestionFavorite(): boolean {
    return !!(this.currentQuestion && this.favoriteQuestionIds.has(String(this.currentQuestion.id)));
  }

  get isCurrentQuestionAnswered(): boolean {
    return !!(this.currentQuestion && this.showAnswers[this.currentQuestion.id]);
  }

  get unansweredCount(): number {
    if (!this.filteredQuestions?.length) {
      return 0;
    }
    return this.filteredQuestions.filter((question: any) => !this.showAnswers[question.id]).length;
  }

  get favoriteCount(): number {
    if (!this.filteredQuestions?.length) {
      return 0;
    }
    return this.filteredQuestions.filter((question: any) => this.favoriteQuestionIds.has(String(question.id))).length;
  }

  get hasFavoriteQuestions(): boolean {
    return this.favoriteQuestionIds.size > 0;
  }

  get canSkipQuestion(): boolean {
    return this.filteredQuestions.length > 1;
  }

  get canDeferCurrentQuestion(): boolean {
    if (!this.currentQuestion) {
      return false;
    }
    if (this.filteredQuestions.length <= 1) {
      return false;
    }
    const currentId = String(this.currentQuestion.id);
    if (this.deferredQuestionIds.has(currentId)) {
      return false;
    }
    return !this.showAnswers[currentId];
  }

  get primaryActionLabel(): string {
    if (this.showAnswer || (this.currentQuestion && this.showAnswers[this.currentQuestion.id])) {
      return this.hasMoreQuestionsAhead ? 'Próxima' : 'Finalizar';
    }
    return 'Confirmar Resposta';
  }

  get isPrimaryActionDisabled(): boolean {
    if (this.showAnswer || (this.currentQuestion && this.showAnswers[this.currentQuestion.id])) {
      return false;
    }
    return this.selectedOption.length === 0;
  }

  get themeToggleLabel(): string {
    switch (this.themePreference) {
      case 'dark':
        return 'Modo Escuro';
      case 'light':
        return 'Modo Claro';
      default:
        return 'Modo Automático';
    }
  }

  get themeToggleIcon(): string {
    switch (this.themePreference) {
      case 'dark':
        return 'fas fa-moon';
      case 'light':
        return 'fas fa-sun';
      default:
        return 'fas fa-adjust';
    }
  }

  get summaryChartAvailable(): boolean {
    return this.summaryTotalQuestions > 0;
  }

  get summaryTotalQuestions(): number {
    return this.filteredQuestions.length;
  }

  get summaryCorrectPercentage(): number {
    const total = this.summaryTotalQuestions;
    if (total === 0) {
      return 0;
    }
    return Math.round((this.correctAnswers / total) * 100);
  }

  get summaryIncorrectPercentage(): number {
    const total = this.summaryTotalQuestions;
    if (total === 0) {
      return 0;
    }
    const incorrect = Math.round((this.incorrectAnswers / total) * 100);
    const residual = 100 - this.summaryCorrectPercentage;
    return Math.min(incorrect, residual);
  }

  onOptionChange(event: Event, index: number): void {
    if (!this.currentQuestion) {
      return;
    }

    if (this.showAnswer || this.showAnswers[this.currentQuestion.id]) {
      return;
    }

    const isChecked = (event.target as HTMLInputElement).checked;
    const isMultiSelect = this.currentQuestion.answer.length > 1;
    let nextSelection = [...this.selectedOption];

    if (isMultiSelect) {
      if (isChecked) {
        nextSelection = Array.from(new Set([...nextSelection, index]));
      } else {
        nextSelection = nextSelection.filter((i) => i !== index);
      }
    } else {
      nextSelection = isChecked ? [index] : [];
    }

    this.selectedOption = [...nextSelection];
    this.selectedOptions[this.currentQuestion.id] = [...nextSelection];
  }

  toggleRepeatWrongQuestions(): void {
    this.repeatWrongQuestions = !this.repeatWrongQuestions;
    if (this.repeatWrongQuestions) {
      this.wrongQuestionsQueue = []; // Limpa a fila ao ativar o modo
      this.toast.success('Modo de repetição de perguntas erradas ativado!');
    } else {
      this.toast.info('Modo de repetição de perguntas erradas desativado!');
    }
  }

  checkAnswer(): void {
    this.showAnswer = true;
    this.showAnswers[this.currentQuestion.id] = true;
    this.deferredQuestionIds.delete(String(this.currentQuestion.id));

    const selectedAnswers = this.selectedOptions[this.currentQuestion.id] || [];
    const correctAnswers = this.currentQuestion.answer;

    // Verificar se todas as respostas corretas estão selecionadas e se o número de respostas está correto
    const correct = correctAnswers.every((ans: number) => selectedAnswers.includes(ans)) &&
                    selectedAnswers.length === correctAnswers.length;

    if (correct) {
      this.correctAnswers++;

      // Remover da lista de perguntas erradas, se existir
      const wrongQuestions = JSON.parse(localStorage.getItem('wrongQuestions') || '[]');
      const updatedWrongQuestions = wrongQuestions.filter((id: string) => id !== this.currentQuestion.id);
      localStorage.setItem('wrongQuestions', JSON.stringify(updatedWrongQuestions));

      // Atualizar o contador de respostas incorretas
      this.incorrectAnswers = updatedWrongQuestions.length;
    } else {
      this.incorrectAnswers++;

      // Adicionar à lista de perguntas erradas no localStorage
      const wrongQuestions = JSON.parse(localStorage.getItem('wrongQuestions') || '[]');
      if (!wrongQuestions.includes(this.currentQuestion.id)) {
        wrongQuestions.push(this.currentQuestion.id);
        localStorage.setItem('wrongQuestions', JSON.stringify(wrongQuestions));
      }

      if (this.repeatWrongQuestions) {
        // Adiciona a pergunta errada à fila para repetição após 2 perguntas
        const questionToRepeat = { ...this.currentQuestion, repeatAfter: this.currentQuestionIndex + 2 };
        this.wrongQuestionsQueue.push(questionToRepeat);
      }
    }

    // Salvar a pergunta como respondida apenas se estiver correta
    this.saveAnsweredQuestion(this.currentQuestion.id, correct);

    // Verificar se é a última pergunta e finalizar o teste
    if (this.currentQuestionIndex >= this.filteredQuestions.length - 1) {
      this.finalizeTest();
    }
  }

  nextQuestion(): void {
    this.currentQuestionIndex++;

    // Verifica se há perguntas erradas na fila para repetição
    const nextWrongQuestion = this.wrongQuestionsQueue.find(q => q.repeatAfter === this.currentQuestionIndex);
    if (nextWrongQuestion) {
      this.currentQuestion = nextWrongQuestion;
      this.wrongQuestionsQueue = this.wrongQuestionsQueue.filter(q => q.id !== nextWrongQuestion.id); // Remove da fila

      // Zera as respostas da pergunta repetida
      this.selectedOptions[this.currentQuestion.id] = [];
      this.showAnswers[this.currentQuestion.id] = false;
    } else if (this.currentQuestionIndex < this.filteredQuestions.length) {
      this.currentQuestion = this.filteredQuestions[this.currentQuestionIndex];
    } else if (this.repeatWrongQuestions && this.wrongQuestionsQueue.length > 0) {
      // Se o modo de repetição está ativado e há perguntas erradas na fila
      this.currentQuestion = this.wrongQuestionsQueue.shift(); // Pega a próxima pergunta errada
      this.selectedOptions[this.currentQuestion.id] = [];
      this.showAnswers[this.currentQuestion.id] = false;
      this.currentQuestionIndex--; // Mantém o índice para continuar o fluxo
    } else {
      // Finaliza o teste se não houver mais perguntas
      this.finalizeTest();
      return;
    }

    this.hydrateCurrentQuestionState();
  }

  skipQuestion(): void {
    if (!this.canSkipQuestion) {
      return;
    }
    this.nextQuestion();
  }

  deferCurrentQuestion(): void {
    if (!this.currentQuestion || !this.canDeferCurrentQuestion) {
      return;
    }

    const currentId = String(this.currentQuestion.id);
    const removed = this.filteredQuestions.splice(this.currentQuestionIndex, 1);
    if (!removed.length) {
      return;
    }
    // Empurra a atual para o final
    this.filteredQuestions.push(removed[0]);
    this.deferredQuestionIds.add(currentId);

    // Mantém o índice apontando para a próxima questão original.
    // Caso a questão adiada fosse a última, volta para o início da lista.
    if (this.currentQuestionIndex >= this.filteredQuestions.length - 1) {
      this.currentQuestionIndex = 0;
    }

    // Define explicitamente a próxima questão e reidrata o estado, sem acionar a fila de erradas.
    this.currentQuestion = this.filteredQuestions[this.currentQuestionIndex] || null;
    this.hydrateCurrentQuestionState();
    this.toast.info('Questão marcada para responder depois.');
  }

  handlePrimaryAction(): void {
    if (!this.currentQuestion) {
      return;
    }
    if (this.showAnswer || this.showAnswers[this.currentQuestion.id]) {
      this.nextQuestion();
      return;
    }
    if (this.selectedOption.length === 0) {
      return;
    }
    this.checkAnswer();
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.currentQuestion = this.filteredQuestions[this.currentQuestionIndex];
      this.hydrateCurrentQuestionState();
    }
  }

  filterQuestionsByTopic(): void {
    const answeredQuestions = JSON.parse(localStorage.getItem('answeredQuestions') || '[]');

    // Filtrar perguntas com base nos tópicos, níveis e perguntas respondidas
    this.filteredQuestions = this.allQuestions.filter((question: any) => {
      const matchesTopic = this.selectedTopicIds.length === 0 || this.selectedTopicIds.includes(question.topicId);
      const notAnswered = !answeredQuestions.includes(question.id);
      return matchesTopic && notAnswered;
    });

    // Atualizar a pergunta atual
    this.currentQuestionIndex = 0;
    this.currentQuestion = this.filteredQuestions[this.currentQuestionIndex] || null;
    this.hydrateCurrentQuestionState();
  }

  filterShortQuestions(maxLength: number): void {
    this.filterShortQuestionsActive = true; // Ativa o filtro de questões curtas
    this.filterQuestionsByTopic(); // Reaplica o filtro geral com base nos tópicos e níveis selecionados

    // Filtra as questões com base no número de caracteres
    this.filteredQuestions = this.filteredQuestions.filter((question: any) => question.question.length <= maxLength);

    // Atualiza a pergunta atual
    this.currentQuestionIndex = 0;
    this.currentQuestion = this.filteredQuestions[this.currentQuestionIndex] || null;
    this.hydrateCurrentQuestionState();

    this.toast.info(`Foram filtradas ${this.filteredQuestions.length} questões com até ${maxLength} caracteres.`);
  }

  finalizeTest(force: boolean = false, showPendingNotice: boolean = true): void {
    const pending = this.unansweredCount;
    if (pending > 0 && !this.pendingReviewPromptVisible && !force) {
      this.modalService.openWith({
        title: 'Questões sem resposta detectadas',
        message: `Você possui ${pending} questão(ões) pendente(s). Deseja revisá-las antes de finalizar?`,
        confirmText: 'Rever Pendentes',
        cancelText: 'Finalizar Mesmo Assim',
        type: 'warning',
        onConfirm: () => {
          this.reviewPendingQuestions();
        },
        onCancel: () => {
          this.pendingReviewPromptVisible = false;
          this.finalizeTest(true, false);
        }
      });
      return;
    }

    this.testStarted = false;
    this.showSummary = true;

    // Corrigir o cálculo de respostas corretas e incorretas
    this.correctAnswers = this.filteredQuestions.filter((question: any) => 
      question.answer.every((ans: number) => this.selectedOptions[question.id]?.includes(ans)) &&
      this.selectedOptions[question.id]?.length === question.answer.length
    ).length;

    this.incorrectAnswers = this.filteredQuestions.length - this.correctAnswers;
    this.pendingReviewPromptVisible = showPendingNotice && pending > 0;
    if (!this.pendingReviewPromptVisible) {
      this.toast.success('Parabéns! Você concluiu o teste.');
    }
  }

  onTopicsChange(selectedTopics: any[]): void {
    console.log('onTopicsChange - selectedTopics:', selectedTopics);
    this.selectedTopics = [...selectedTopics];
    this.selectedTopicIds = this.selectedTopics
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
      if (this.filteredQuestions.length === 0) {
        this.toast.warning('Nenhuma pergunta disponível para os filtros selecionados. Ajuste os filtros e tente novamente.');
        return;
      }
      this.testStarted = true;
      this.showSummary = false;
      this.currentQuestionIndex = 0;
      this.currentQuestion = this.filteredQuestions[this.currentQuestionIndex];
      this.deferredQuestionIds.clear();
      this.closeDrawer();
      this.hydrateCurrentQuestionState();
    }
  }

  resetTest(): void {
    this.testStarted = false;
    this.showSummary = false;
    this.correctAnswers = 0;
    this.incorrectAnswers = 0;
    this.selectedOptions = {};
    this.showAnswers = {};
    this.selectedOption = [];
    this.showAnswer = false;
    this.currentQuestionIndex = 0;
    this.currentQuestion = this.filteredQuestions[this.currentQuestionIndex];
    this.hydrateCurrentQuestionState();
    this.pendingReviewPromptVisible = false;
    this.deferredQuestionIds.clear();
  
    // Resetar dropdowns
    this.selectedTopicIds = [];
    this.selectedTopics = [];
  
    // Emitir evento de reset para os componentes multi-select-box
    this.resetMultiSelectBoxes = true;
  
    // Limpar lista de perguntas erradas
    localStorage.removeItem('wrongQuestions');
  
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
        this.toast.success('Pergunta e opções copiadas para a área de transferência!');
      }).catch(err => {
        console.error('Erro ao copiar para a área de transferência:', err);
        this.toast.danger('Não foi possível copiar. Verifique se a pergunta e as opções estão carregadas corretamente.');
      });
    } else {
      console.error('Erro: Dados da pergunta ou opções estão ausentes.');
      this.toast.danger('Não foi possível copiar. Verifique se a pergunta e as opções estão carregadas corretamente.');
    }
  }

  toggleFavoriteCurrent(): void {
    if (!this.currentQuestion) {
      return;
    }
    this.toggleFavorite(String(this.currentQuestion.id));
  }

  reviewPendingQuestions(): void {
    this.pendingReviewPromptVisible = false;
    if (this.unansweredCount === 0) {
      this.toast.info('Não há questões pendentes. Ótimo trabalho!');
      return;
    }

    const unanswered = this.filteredQuestions
      .map((question: any, index: number) => ({ question, index }))
      .filter(({ question }) => !this.showAnswers[question.id]);

    if (!unanswered.length) {
      this.toast.info('Não há questões pendentes. Ótimo trabalho!');
      return;
    }

    const next = unanswered[0];
    this.showSummary = false;
    this.testStarted = true;
    this.currentQuestionIndex = next.index;
    this.currentQuestion = next.question;
    this.hydrateCurrentQuestionState();
    this.closeDrawer();
    this.pendingReviewPromptVisible = false;
  }

  finalizeWithoutPending(): void {
    this.pendingReviewPromptVisible = false;
    this.toast.success('Teste finalizado com sucesso!');
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
    this.toast.success('Perguntas respondidas foram limpas!');
    this.loadQuestions(); // Recarregar perguntas
  }

  clearFavoriteQuestions(): void {
    if (!this.hasFavoriteQuestions) {
      this.toast.info('Nenhuma pergunta favorita para limpar.');
      return;
    }
    this.favoriteQuestionIds = new Set();
    this.persistFavoriteQuestions();
    this.toast.success('Perguntas favoritas foram limpas!');
  }

  cycleThemePreference(): void {
    if (this.themePreference === 'system') {
      this.themePreference = this.isDarkModeEnabled ? 'light' : 'dark';
    } else if (this.themePreference === 'dark') {
      this.themePreference = 'light';
    } else {
      this.themePreference = 'system';
    }
    this.applyThemeFromPreference(true);
  }

  setThemePreferenceSystem(checked: boolean): void {
    if (checked) {
      this.themePreference = 'system';
    } else {
      // ao sair de automático, mantenha o modo visual atual como preferência
      this.themePreference = this.isDarkModeEnabled ? 'dark' : 'light';
    }
    this.applyThemeFromPreference(true);
  }

  setThemePreferenceDark(checked: boolean): void {
    if (this.themePreference === 'system') {
      return;
    }
    this.themePreference = checked ? 'dark' : 'light';
    this.applyThemeFromPreference(true);
  }

  get totalFilteredQuestions(): number {
    const answeredQuestions = JSON.parse(localStorage.getItem('answeredQuestions') || '[]');
    return this.allQuestions.filter((question: any) => !answeredQuestions.includes(question.id)).length;
  }

  toggleDrawer(): void {
    if (this.isDrawerOpen) {
      this.closeDrawer();
    } else {
      this.openDrawer();
    }
  }

  openDrawer(): void {
    this.isDrawerOpen = true;
    this.lockScroll();
  }

  closeDrawer(): void {
    this.isDrawerOpen = false;
    this.unlockScroll();
  }

  private hydrateCurrentQuestionState(): void {
    if (!this.currentQuestion) {
      this.selectedOption = [];
      this.showAnswer = false;
      return;
    }
    const storedSelection = this.selectedOptions[this.currentQuestion.id] || [];
    this.selectedOption = [...storedSelection];
    this.showAnswer = this.showAnswers[this.currentQuestion.id] || false;
  }

  private lockScroll(): void {
    if (typeof document === 'undefined') {
      return;
    }
    document.documentElement.classList.add('no-scroll');
  }

  private unlockScroll(): void {
    if (typeof document === 'undefined') {
      return;
    }
    document.documentElement.classList.remove('no-scroll');
  }

  private initializeFavoriteQuestions(): void {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const stored = localStorage.getItem('favoriteQuestions');
      if (!stored) {
        this.favoriteQuestionIds = new Set();
        return;
      }
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        this.favoriteQuestionIds = new Set(parsed.map((id: unknown) => String(id)));
      } else {
        this.favoriteQuestionIds = new Set();
      }
    } catch (error) {
      console.error('Falha ao carregar favoritos:', error);
      this.favoriteQuestionIds = new Set();
    }
  }

  private synchronizeFavoritesWithQuestions(): void {
    if (!this.allQuestions?.length || this.favoriteQuestionIds.size === 0) {
      return;
    }
    const validIds = new Set(this.allQuestions.map((question: any) => String(question.id)));
    const filtered = Array.from(this.favoriteQuestionIds).filter((id) => validIds.has(String(id)));
    if (filtered.length !== this.favoriteQuestionIds.size) {
      this.favoriteQuestionIds = new Set(filtered);
      this.persistFavoriteQuestions();
    }
  }

  private toggleFavorite(questionId: string): void {
    if (!questionId) {
      return;
    }
    const normalizedId = String(questionId);
    if (this.favoriteQuestionIds.has(normalizedId)) {
      this.favoriteQuestionIds.delete(normalizedId);
    } else {
      this.favoriteQuestionIds.add(normalizedId);
    }
    this.persistFavoriteQuestions();
  }

  private persistFavoriteQuestions(): void {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem('favoriteQuestions', JSON.stringify(Array.from(this.favoriteQuestionIds)));
  }

  ngOnDestroy(): void {
    this.unlockScroll();
    if (this.systemDarkMedia && this.systemThemeListener) {
      if (typeof this.systemDarkMedia.removeEventListener === 'function') {
        this.systemDarkMedia.removeEventListener('change', this.systemThemeListener);
      } else if (typeof this.systemDarkMedia.removeListener === 'function') {
        this.systemDarkMedia.removeListener(this.systemThemeListener);
      }
    }
  }

  private syncSelectedTopicsFromIds(): void {
    if (!this.selectedTopicIds.length) {
      this.selectedTopics = [];
      return;
    }
    this.selectedTopics = this.topics.filter(topic => this.selectedTopicIds.includes(topic.id));
  }

  private initializeTheme(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      this.themePreference = 'light';
      this.isDarkModeEnabled = false;
      return;
    }

    const storedPreference = localStorage.getItem(this.themePreferenceKey);
    if (storedPreference === 'dark' || storedPreference === 'light') {
      this.themePreference = storedPreference;
    } else {
      this.themePreference = 'system';
    }

    if (typeof window.matchMedia === 'function') {
      this.systemDarkMedia = window.matchMedia('(prefers-color-scheme: dark)');
      this.systemThemeListener = (event: MediaQueryListEvent | MediaQueryList) => {
        if (this.themePreference === 'system') {
          this.applyThemeMode(event.matches ? 'dark' : 'light');
        }
      };
      if (this.systemDarkMedia) {
        if (typeof this.systemDarkMedia.addEventListener === 'function') {
          this.systemDarkMedia.addEventListener('change', this.systemThemeListener);
        } else if (typeof this.systemDarkMedia.addListener === 'function') {
          this.systemDarkMedia.addListener(this.systemThemeListener);
        }
      }
    }

    this.applyThemeFromPreference(false);
  }

  private applyThemeFromPreference(persist: boolean): void {
    const mode = this.resolveThemeMode();
    this.applyThemeMode(mode);

    if (!persist) {
      return;
    }

    if (this.themePreference === 'system') {
      localStorage.removeItem(this.themePreferenceKey);
    } else {
      localStorage.setItem(this.themePreferenceKey, this.themePreference);
    }
  }

  private resolveThemeMode(): 'dark' | 'light' {
    if (this.themePreference === 'dark') {
      return 'dark';
    }
    if (this.themePreference === 'light') {
      return 'light';
    }
    if (this.systemDarkMedia) {
      return this.systemDarkMedia.matches ? 'dark' : 'light';
    }
    return 'light';
  }

  private applyThemeMode(mode: 'dark' | 'light'): void {
    this.isDarkModeEnabled = mode === 'dark';
    if (typeof document === 'undefined') {
      return;
    }
    const body = document.body;
    body.classList.toggle('theme-dark', this.isDarkModeEnabled);
    body.classList.toggle('theme-light', !this.isDarkModeEnabled);
    document.documentElement.style.setProperty('color-scheme', this.isDarkModeEnabled ? 'dark' : 'light');
  }
}
