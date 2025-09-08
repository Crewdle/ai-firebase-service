export { AiFirebaseService as default, AiFirebaseService } from './ai-firebase-service';
export type { 
  WorkflowMessage, 
  WorkflowResponse, 
  WorkflowFile, 
  StreamChunk, 
  FetchUrlResponse 
} from './ai-firebase-service';
export { AI_FIREBASE_SERVICE_CONFIG } from './ai-firebase-config.token';
export { AiFirebaseServiceModule } from './ai-firebase-service.module';

// Re-export Firebase service types for convenience
export type { FirebaseServiceConfig } from '@crewdle/firebase-service';