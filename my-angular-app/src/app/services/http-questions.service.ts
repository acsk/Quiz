import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HttpQuestionsService {

  private topicsUrl = 'assets/data/topics.json';
  private s3QuestionsUrl = 'assets/data/question/s3.json';
  private ec2QuestionsUrl = 'assets/data/question/ec2.json';
  private lambdaQuestionsUrl = 'assets/data/question/lambda.json';
  private rdsQuestionsUrl = 'assets/data/question/rds.json';
  private supportQuestionsUrl = 'assets/data/question/support.json';
  private dynamoQuestionsUrl = 'assets/data/question/dynamo.json';
  private snsQuestionsUrl = 'assets/data/question/sns.json';
  private sqsQuestionsUrl = 'assets/data/question/sqs.json';
  private cloudfrontQuestionsUrl = 'assets/data/question/cloudfront.json';
  private wellArchitectedQuestionsUrl = 'assets/data/question/wellArchitected.json';

  constructor(private http: HttpClient) { }

  getTopics(): Observable<any> {
    return this.http.get<any>(this.topicsUrl);
  }

  getS3Questions(): Observable<any> {
    return this.http.get<any>(this.s3QuestionsUrl);
  }

  getEC2Questions(): Observable<any> {
    return this.http.get<any>(this.ec2QuestionsUrl);
  }

  getLambdaQuestions(): Observable<any> {
    return this.http.get<any>(this.lambdaQuestionsUrl);
  }

  getRDSQuestions(): Observable<any> {
    return this.http.get<any>(this.rdsQuestionsUrl);
  }

  getSupportQuestions(): Observable<any> {
    return this.http.get<any>(this.supportQuestionsUrl);
  }

  getDynamoQuestions(): Observable<any> {
    return this.http.get<any>(this.dynamoQuestionsUrl);
  }

  getSNSQuestions(): Observable<any> {
    return this.http.get<any>(this.snsQuestionsUrl);
  }

  getSQSQuestions(): Observable<any> {
    return this.http.get<any>(this.sqsQuestionsUrl);
  }

  getCloudFrontQuestions(): Observable<any> {
    return this.http.get<any>(this.cloudfrontQuestionsUrl);
  }

  getWellArchitectedQuestions(): Observable<any> {
    return this.http.get<any>(this.wellArchitectedQuestionsUrl);
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
      s3: this.getS3Questions(),
      ec2: this.getEC2Questions(),
      lambda: this.getLambdaQuestions(),
      rds: this.getRDSQuestions(),
      support: this.getSupportQuestions(),
      dynamo: this.getDynamoQuestions(),
      sns: this.getSNSQuestions(),
      sqs: this.getSQSQuestions(),
      cloudfront: this.getCloudFrontQuestions(),
      wellArchitected: this.getWellArchitectedQuestions()
    }).pipe(
      map((responses: any) => {
        const topicsMap = new Map(responses.topics.topics.map((topic: any) => [topic.id, topic.name]));
        const allQuestions = [
          ...responses.s3.questions,
          ...responses.ec2.questions,
          ...responses.lambda.questions,
          ...responses.rds.questions,
          ...responses.support.questions,
          ...responses.dynamo.questions,
          ...responses.sns.questions,
          ...responses.sqs.questions,
          ...responses.cloudfront.questions,
          ...responses.wellArchitected.questions
        ].map((question: any) => ({
          ...question,
          topicName: topicsMap.get(question.topicId)
        }));
        return this.shuffleArray(allQuestions);
      })
    );
  }
}