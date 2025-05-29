import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HttpQuestionsService {

  private topicsUrl = 'assets/data/topics.json';


  /**FORMATO SIMULADOS */
  private awsPractitioner1QuestionsUrl = 'assets/data/question/simulados/awsPractitioner-1.json';
  private awsPractitioner2QuestionsUrl = 'assets/data/question/simulados/awsPractitioner-2.json';
  private awsPractitioner3QuestionsUrl = 'assets/data/question/simulados/awsPractitioner-3.json';
  private awsPractitioner4QuestionsUrl = 'assets/data/question/simulados/awsPractitioner-4.json';
  private awsPractitioner5QuestionsUrl = 'assets/data/question/simulados/awsPractitioner-5.json';
  private awsPractitioner6QuestionsUrl = 'assets/data/question/simulados/awsPractitioner-6.json';

  private awsSAAC03QuestionsUrl_1 = 'assets/data/question/simulados/awsSAAC03-1.json';
  private awsSAAC03QuestionsUrl_2 = 'assets/data/question/simulados/awsSAAC03-2.json';
  private awsSAAC03QuestionsUrl_3 = 'assets/data/question/simulados/awsSAAC03-3.json';
  private awsSAAC03QuestionsUrl_4 = 'assets/data/question/simulados/awsSAAC03-4.json';
  private awsSAAC03QuestionsUrl_5 = 'assets/data/question/simulados/awsSAAC03-5.json';
  private awsSAAC03QuestionsUrl_6 = 'assets/data/question/simulados/awsSAAC03-6.json';
  private awsSAAC03QuestionsUrl_7 = 'assets/data/question/simulados/awsSAAC03-7.json';
  
  //asuntos
  private vpc = 'assets/data/question/assuntos/awsSAAC03-4.json';


  constructor(private http: HttpClient) { }

  getTopics(): Observable<any> {
    return this.http.get<any>(this.topicsUrl);
  }


  getawsPractitioner3Questions(): Observable<any> {
    return this.http.get<any>(this.awsPractitioner3QuestionsUrl);
  }
  getawsPractitioner4Questions(): Observable<any> {
    return this.http.get<any>(this.awsPractitioner4QuestionsUrl);
  }
  getawsPractitioner2Questions(): Observable<any> {
    return this.http.get<any>(this.awsPractitioner2QuestionsUrl);
  }
  getawsPractitioner1Questions(): Observable<any> {
    return this.http.get<any>(this.awsPractitioner1QuestionsUrl);
  }
  getawsPractitioner5Questions(): Observable<any> {
    return this.http.get<any>(this.awsPractitioner5QuestionsUrl);
  }
  getawsPractitioner6Questions(): Observable<any> {
    return this.http.get<any>(this.awsPractitioner6QuestionsUrl);
  }

  getawsSAAC03Questions_1(): Observable<any> {
    return this.http.get<any>(this.awsSAAC03QuestionsUrl_1);
  }
  getawsSAAC03Questions_2(): Observable<any> {
    return this.http.get<any>(this.awsSAAC03QuestionsUrl_2);
  }
  getawsSAAC03Questions_3(): Observable<any> {
    return this.http.get<any>(this.awsSAAC03QuestionsUrl_3);
  }
  getawsSAAC03Questions_4(): Observable<any> {
    return this.http.get<any>(this.awsSAAC03QuestionsUrl_4);
  }
  getawsSAAC03Questions_5(): Observable<any> {
    return this.http.get<any>(this.awsSAAC03QuestionsUrl_5);
  }
  getawsSAAC03Questions_6(): Observable<any> {
    return this.http.get<any>(this.awsSAAC03QuestionsUrl_6);
  }
  getawsSAAC03Questions_7(): Observable<any> {
    return this.http.get<any>(this.awsSAAC03QuestionsUrl_7);
  }
  getawsVPC(): Observable<any> {
    return this.http.get<any>(this.vpc);
  }
  private shuffleArray(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  getAllQuestions(): Observable<any> {
    return forkJoin({
      topics: this.getTopics(),
     
      //PRACTITIONER
      awsPractitioner1: this.getawsPractitioner1Questions(),
      awsPractitioner2: this.getawsPractitioner2Questions(),
      awsPractitioner3: this.getawsPractitioner3Questions(),
      awsPractitioner4: this.getawsPractitioner4Questions(),
      awsPractitioner5: this.getawsPractitioner5Questions(),
      awsPractitioner6: this.getawsPractitioner6Questions(),
      
      //SAAC03
      awsSAAC031: this.getawsSAAC03Questions_1(),
      awsSAAC032: this.getawsSAAC03Questions_2(),
      awsSAAC033: this.getawsSAAC03Questions_3(),
      awsSAAC034: this.getawsSAAC03Questions_4(),
      awsSAAC035: this.getawsSAAC03Questions_5(),
      awsSAAC036: this.getawsSAAC03Questions_6(),
      awsSAAC037: this.getawsSAAC03Questions_7(),
     
      //assuntos
      vpc: this.getawsVPC(),
    
    }).pipe(
      map((responses: any) => {
        const topicsMap = new Map(responses.topics.topics.map((topic: any) => [topic.id, topic.name]));
        const allQuestions = [
         
          ...responses.awsPractitioner1.questions,
          ...responses.awsPractitioner2.questions,
          ...responses.awsPractitioner3.questions,
          ...responses.awsPractitioner4.questions,
          ...responses.awsPractitioner5.questions,
          ...responses.awsPractitioner6.questions,
          ...responses.awsSAAC031.questions,
          ...responses.awsSAAC032.questions,
          ...responses.awsSAAC033.questions,
          ...responses.awsSAAC034.questions,
          ...responses.awsSAAC035.questions,
          ...responses.awsSAAC036.questions,
          ...responses.awsSAAC037.questions,
         
          //assuntos
          ...responses.vpc.questions,

        ].map((question: any) => ({
          ...question,
          topicName: topicsMap.get(question.topicId)
        }));
        return this.shuffleArray(allQuestions);
      })
    );
  }
}