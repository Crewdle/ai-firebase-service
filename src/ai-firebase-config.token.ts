import { InjectionToken } from '@angular/core';
import { FirebaseServiceConfig } from '@crewdle/firebase-service';

export const AI_FIREBASE_SERVICE_CONFIG = new InjectionToken<FirebaseServiceConfig>(
  'AI Firebase Service Configuration'
);