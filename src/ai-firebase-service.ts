import { Injectable, Inject } from '@angular/core';
import { FirebaseService, FIREBASE_SERVICE_CONFIG, FirebaseServiceConfig } from '@crewdle/firebase-service';
import { httpsCallable } from 'firebase/functions';

export interface WorkflowMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface WorkflowResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export interface WorkflowFile {
  name: string;
  type: string;
  content: string;
}

export interface StreamChunk {
  choices: {
    delta: {
      content: string;
    };
  }[];
}

export interface FetchUrlResponse {
  image: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiFirebaseService {
  private readonly firebaseService: FirebaseService;

  constructor(
    @Inject(FIREBASE_SERVICE_CONFIG) config: FirebaseServiceConfig
  ) {
    this.firebaseService = new FirebaseService(config);
  }

  /**
   * Static factory method for non-Angular usage
   * @param config Firebase service configuration
   * @returns AiFirebaseService instance
   */
  static create(config: FirebaseServiceConfig): AiFirebaseService {
    // Create a temporary instance without Angular DI
    const service = Object.create(AiFirebaseService.prototype);
    service.firebaseService = FirebaseService.create(config);
    service.imagesCache = new Map<string, File>();
    return service;
  }

  /**
   * Generate content using a workflow
   * @param workflowId - ID of the workflow to run
   * @param messages - Array of conversation messages
   * @param files - Optional array of files to include
   * @returns Promise with generated content
   */
  async generateContent(workflowId: string, messages: WorkflowMessage[], files: File[] = []): Promise<string> {
    const filesToUpload: WorkflowFile[] = [];
    for (const file of files) {
      filesToUpload.push({
        name: file.name,
        type: file.type,
        content: await this.encodeFileToBase64(file),
      });
    }

    const runWorkflowFunction = httpsCallable(this.firebaseService.getFunctions(), 'runWorkflow', { timeout: 300000 });
    const response = await runWorkflowFunction({
      workflowId,
      messages,
      files: filesToUpload,
    });

    return (response.data as WorkflowResponse).choices[0].message.content;
  }

  /**
   * Stream content using a workflow
   * @param workflowId - ID of the workflow to run
   * @param messages - Array of conversation messages
   * @param files - Optional array of files to include
   * @returns AsyncGenerator yielding content chunks
   */
  async *streamContent(workflowId: string, messages: WorkflowMessage[], files: File[] = []): AsyncGenerator<string> {
    const filesToUpload: WorkflowFile[] = [];
    for (const file of files) {
      filesToUpload.push({
        name: file.name,
        type: file.type,
        content: await this.encodeFileToBase64(file),
      });
    }

    const streamWorkflowFunction = httpsCallable(this.firebaseService.getFunctions(), 'streamWorkflow', { timeout: 300000 })
    const { stream } = await streamWorkflowFunction.stream({
      workflowId,
      messages,
      files: filesToUpload,
    });
    
    for await (const chunk of stream) {
      const messages = this.splitSSEMessages(chunk as string);

      for (const data of messages) {
        yield data.choices[0].delta.content;
      }
    }
  }

  /**
   * Get the underlying FirebaseService instance
   * @returns FirebaseService instance
   */
  getFirebaseService(): FirebaseService {
    return this.firebaseService;
  }

  /**
   * Split Server-Sent Events messages
   * @param input - Raw SSE string
   * @returns Array of parsed message objects
   */
  private splitSSEMessages(input: string): StreamChunk[] {
    return input
      .split("\n\ndata: ")
      .map((message) => message.replace('data: ', '').trim())
      .filter((message) => message !== '')
      .map(message => {
        try {
          return JSON.parse(message) as StreamChunk;
        } catch (error) {
          console.error("Invalid JSON:", message);
          return null;
        }
      })
      .filter((obj): obj is StreamChunk => obj !== null);
  }

  /**
   * Encode file to base64 string
   * @param file - File to encode
   * @returns Promise with base64 string
   */
  private async encodeFileToBase64(file: File): Promise<string> {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        if (reader.result === null || typeof reader.result !== 'string') {
          reject(reader.error);
          return;
        }

        const base64File = reader.result.split(',')[1];
        resolve(base64File);
      };

      reader.onerror = (error) => {
        reject(error);
      };
    });
  }
}