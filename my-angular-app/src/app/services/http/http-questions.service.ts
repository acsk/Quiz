import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HttpQuestionsService {

  private topicsUrl = 'assets/data/topics.json';
  private amplifyQuestionsUrl = 'assets/data/question/amplify.json';
  private appFlowQuestionsUrl = 'assets/data/question/appFlow.json';
  private appStreamQuestionsUrl = 'assets/data/question/appStream.json';
  private appSyncQuestionsUrl = 'assets/data/question/appSync.json';
  private backupQuestionsUrl = 'assets/data/question/backup.json';
  private cloudfrontQuestionsUrl = 'assets/data/question/cloudfront.json';
  private cognitoQuestionsUrl = 'assets/data/question/cognito.json';
  private deviceFarmQuestionsUrl = 'assets/data/question/deviceFarm.json';
  private disasterRecoveryQuestionsUrl = 'assets/data/question/disasterRecovery.json';
  private dynamoQuestionsUrl = 'assets/data/question/dynamo.json';
  private ec2QuestionsUrl = 'assets/data/question/ec2.json';
  private ecsQuestionsUrl = 'assets/data/question/ecs.json';
  private iamQuestionsUrl = 'assets/data/question/iam.json';
  private iotCoreQuestionsUrl = 'assets/data/question/iotCore.json';
  private lambdaQuestionsUrl = 'assets/data/question/lambda.json';
  private rdsQuestionsUrl = 'assets/data/question/rds.json';
  private s3QuestionsUrl = 'assets/data/question/s3.json';
  private snsQuestionsUrl = 'assets/data/question/sns.json';
  private sqsQuestionsUrl = 'assets/data/question/sqs.json';
  private stepFunctionsQuestionsUrl = 'assets/data/question/stepFunctions.json';
  private stsQuestionsUrl = 'assets/data/question/sts.json';
  private supportQuestionsUrl = 'assets/data/question/support.json';
  private vpcQuestionsUrl = 'assets/data/question/vpc.json';
  private wellArchitectedQuestionsUrl = 'assets/data/question/wellArchitected.json';
  private route53QuestionsUrl = 'assets/data/question/route53.json';
  private cloudTrailQuestionsUrl = 'assets/data/question/cloudTrail.json';
  private wafQuestionsUrl = 'assets/data/question/waf.json';
  private cafQuestionsUrl = 'assets/data/question/caf.json';
  private precostQuestionsUrl = 'assets/data/question/precos.json';
  private lexQuestionsUrl = 'assets/data/question/lex.json';
  private kendraQuestionsUrl = 'assets/data/question/kendra.json';
  private personalizeQuestionsUrl = 'assets/data/question/personalize.json';

  constructor(private http: HttpClient) { }

  getTopics(): Observable<any> {
    return this.http.get<any>(this.topicsUrl);
  }

  getAmplifyQuestions(): Observable<any> {
    return this.http.get<any>(this.amplifyQuestionsUrl);
  }

  getAppFlowQuestions(): Observable<any> {
    return this.http.get<any>(this.appFlowQuestionsUrl);
  }

  getAppStreamQuestions(): Observable<any> {
    return this.http.get<any>(this.appStreamQuestionsUrl);
  }

  getAppSyncQuestions(): Observable<any> {
    return this.http.get<any>(this.appSyncQuestionsUrl);
  }

  getBackupQuestions(): Observable<any> {
    return this.http.get<any>(this.backupQuestionsUrl);
  }

  getCloudFrontQuestions(): Observable<any> {
    return this.http.get<any>(this.cloudfrontQuestionsUrl);
  }

  getCognitoQuestions(): Observable<any> {
    return this.http.get<any>(this.cognitoQuestionsUrl);
  }

  getDeviceFarmQuestions(): Observable<any> {
    return this.http.get<any>(this.deviceFarmQuestionsUrl);
  }

  getDisasterRecoveryQuestions(): Observable<any> {
    return this.http.get<any>(this.disasterRecoveryQuestionsUrl);
  }

  getDynamoQuestions(): Observable<any> {
    return this.http.get<any>(this.dynamoQuestionsUrl);
  }

  getEC2Questions(): Observable<any> {
    return this.http.get<any>(this.ec2QuestionsUrl);
  }

  getECSQuestions(): Observable<any> {
    return this.http.get<any>(this.ecsQuestionsUrl);
  }

  getIAMQuestions(): Observable<any> {
    return this.http.get<any>(this.iamQuestionsUrl);
  }

  getIoTCoreQuestions(): Observable<any> {
    return this.http.get<any>(this.iotCoreQuestionsUrl);
  }

  getLambdaQuestions(): Observable<any> {
    return this.http.get<any>(this.lambdaQuestionsUrl);
  }

  getRDSQuestions(): Observable<any> {
    return this.http.get<any>(this.rdsQuestionsUrl);
  }

  getS3Questions(): Observable<any> {
    return this.http.get<any>(this.s3QuestionsUrl);
  }

  getSNSQuestions(): Observable<any> {
    return this.http.get<any>(this.snsQuestionsUrl);
  }

  getSQSQuestions(): Observable<any> {
    return this.http.get<any>(this.sqsQuestionsUrl);
  }

  getStepFunctionsQuestions(): Observable<any> {
    return this.http.get<any>(this.stepFunctionsQuestionsUrl);
  }

  getSTSQuestions(): Observable<any> {
    return this.http.get<any>(this.stsQuestionsUrl);
  }

  getSupportQuestions(): Observable<any> {
    return this.http.get<any>(this.supportQuestionsUrl);
  }

  getVPCQuestions(): Observable<any> {
    return this.http.get<any>(this.vpcQuestionsUrl);
  }

  getWellArchitectedQuestions(): Observable<any> {
    return this.http.get<any>(this.wellArchitectedQuestionsUrl);
  }
  getRoute53Questions(): Observable<any> {
    return this.http.get<any>(this.route53QuestionsUrl);
  }
  getCloudTrailQuestions(): Observable<any> {
    return this.http.get<any>(this.cloudTrailQuestionsUrl);
  }
  getWAFQuestions(): Observable<any> {
    return this.http.get<any>(this.wafQuestionsUrl);
  }
  getCAFQuestions(): Observable<any> {
    return this.http.get<any>(this.cafQuestionsUrl);
  }
  getPrecostQuestions(): Observable<any> {
    return this.http.get<any>(this.precostQuestionsUrl);
  }
  getLexQuestions(): Observable<any> {
    return this.http.get<any>(this.lexQuestionsUrl);
  }

  getKendraQuestions(): Observable<any> {
    return this.http.get<any>(this.kendraQuestionsUrl);
  }
  
  getPersonalizeQuestions(): Observable<any> {
    return this.http.get<any>(this.personalizeQuestionsUrl);
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
      amplify: this.getAmplifyQuestions(),
      appFlow: this.getAppFlowQuestions(),
      appStream: this.getAppStreamQuestions(),
      appSync: this.getAppSyncQuestions(),
      backup: this.getBackupQuestions(),
      cloudfront: this.getCloudFrontQuestions(),
      cognito: this.getCognitoQuestions(),
      deviceFarm: this.getDeviceFarmQuestions(),
      disasterRecovery: this.getDisasterRecoveryQuestions(),
      dynamo: this.getDynamoQuestions(),
      ec2: this.getEC2Questions(),
      ecs: this.getECSQuestions(),
      iam: this.getIAMQuestions(),
      iotCore: this.getIoTCoreQuestions(),
      lambda: this.getLambdaQuestions(),
      rds: this.getRDSQuestions(),
      s3: this.getS3Questions(),
      sns: this.getSNSQuestions(),
      sqs: this.getSQSQuestions(),
      stepFunctions: this.getStepFunctionsQuestions(),
      sts: this.getSTSQuestions(),
      support: this.getSupportQuestions(),
      vpc: this.getVPCQuestions(),
      wellArchitected: this.getWellArchitectedQuestions(),
      route53: this.getRoute53Questions(),
      cloudTrail: this.getCloudTrailQuestions(),
      waf: this.getWAFQuestions(),
      caf: this.getCAFQuestions(),
      preco: this.getPrecostQuestions(),
      lex: this.getLexQuestions(),
      kendra: this.getKendraQuestions(),
      perisonalize: this.getPersonalizeQuestions()
    }).pipe(
      map((responses: any) => {
        const topicsMap = new Map(responses.topics.topics.map((topic: any) => [topic.id, topic.name]));
        const allQuestions = [
          ...responses.amplify.questions,
          ...responses.appFlow.questions,
          ...responses.appStream.questions,
          ...responses.appSync.questions,
          ...responses.backup.questions,
          ...responses.cloudfront.questions,
          ...responses.cognito.questions,
          ...responses.deviceFarm.questions,
          ...responses.disasterRecovery.questions,
          ...responses.dynamo.questions,
          ...responses.ec2.questions,
          ...responses.ecs.questions,
          ...responses.iam.questions,
          ...responses.iotCore.questions,
          ...responses.lambda.questions,
          ...responses.rds.questions,
          ...responses.s3.questions,
          ...responses.sns.questions,
          ...responses.sqs.questions,
          ...responses.stepFunctions.questions,
          ...responses.sts.questions,
          ...responses.support.questions,
          ...responses.vpc.questions,
          ...responses.wellArchitected.questions,
          ...responses.route53.questions,
          ...responses.cloudTrail.questions,
          ...responses.waf.questions,
          ...responses.caf.questions,
          ...responses.preco.questions,
          ...responses.lex.questions,
          ...responses.kendra.questions,
          ...responses.perisonalize.questions
          
        ].map((question: any) => ({
          ...question,
          topicName: topicsMap.get(question.topicId)
        }));
        return this.shuffleArray(allQuestions);
      })
    );
  }
}