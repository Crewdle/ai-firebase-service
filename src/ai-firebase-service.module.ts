import { NgModule, ModuleWithProviders } from '@angular/core';
import { AiFirebaseService } from './ai-firebase-service';
import { AI_FIREBASE_SERVICE_CONFIG } from './ai-firebase-config.token';
import { FirebaseServiceConfig, FIREBASE_SERVICE_CONFIG } from '@crewdle/firebase-service';

@NgModule({})
export class AiFirebaseServiceModule {
  
  /**
   * Configure the AiFirebaseService for the root module
   * @param config Firebase service configuration
   * @returns Module with providers
   */
  static forRoot(config: FirebaseServiceConfig): ModuleWithProviders<AiFirebaseServiceModule> {
    return {
      ngModule: AiFirebaseServiceModule,
      providers: [
        {
          provide: FIREBASE_SERVICE_CONFIG,
          useValue: config
        },
        {
          provide: AI_FIREBASE_SERVICE_CONFIG,
          useValue: config
        },
        AiFirebaseService
      ]
    };
  }

  /**
   * Configure the AiFirebaseService for feature modules
   * @returns Module with providers
   */
  static forChild(): ModuleWithProviders<AiFirebaseServiceModule> {
    return {
      ngModule: AiFirebaseServiceModule,
      providers: [AiFirebaseService]
    };
  }
}