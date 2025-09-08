# @crewdle/ai-firebase-service

A TypeScript AI Firebase service wrapper that provides workflow execution and file processing capabilities for Crewdle applications. Built on top of @crewdle/firebase-service.

## Features

- 🤖 **AI Workflows**: Execute AI workflows with message history and file attachments
- 📦 **File Processing**: Handle file uploads with base64 encoding and caching
- 🔄 **Streaming Support**: Stream AI responses in real-time
- 💾 **Image Caching**: Automatic caching of fetched images for performance
- 🎯 **TypeScript**: Full type safety and IntelliSense support
- 🔧 **Flexible**: Works with any Firebase project configuration
- 📱 **Angular Integration**: Injectable service with module support

## Installation

```bash
npm install @crewdle/ai-firebase-service @crewdle/firebase-service
```

Note: Firebase is a peer dependency, so you need to install it separately:

```bash
npm install firebase
```

## Quick Start

### Angular Usage (Recommended)

**1. Install the package:**
```bash
npm install @crewdle/ai-firebase-service @crewdle/firebase-service firebase
```

**2. Configure in your app module:**
```typescript
import { NgModule } from '@angular/core';
import { AiFirebaseServiceModule } from '@crewdle/ai-firebase-service';
import { environment } from '../environments/environment';

@NgModule({
  imports: [
    AiFirebaseServiceModule.forRoot({
      firebaseConfig: environment.firebaseConfig,
      functionsRegion: 'us-central1' // optional
    })
  ]
})
export class AppModule { }
```

**Alternative: Using providers directly (for standalone apps):**
```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { AiFirebaseService, AI_FIREBASE_SERVICE_CONFIG } from '@crewdle/ai-firebase-service';
import { environment } from './environments/environment';

bootstrapApplication(AppComponent, {
  providers: [
    {
      provide: AI_FIREBASE_SERVICE_CONFIG,
      useValue: {
        firebaseConfig: environment.firebaseConfig,
        functionsRegion: 'us-central1'
      }
    },
    AiFirebaseService
  ]
});
```

**3. Inject and use in your components/services:**
```typescript
import { Component, inject } from '@angular/core';
import { AiFirebaseService, WorkflowMessage } from '@crewdle/ai-firebase-service';

@Component({
  selector: 'app-example',
  template: '...'
})
export class ExampleComponent {
  private readonly aiService = inject(AiFirebaseService);

  async generateContent() {
    const messages: WorkflowMessage[] = [
      { role: 'user', content: 'Hello, can you help me?' }
    ];
    
    const response = await this.aiService.generateContent('workflow-id', messages);
    console.log(response);
  }
}
```

### Non-Angular Usage

```typescript
import { AiFirebaseService } from '@crewdle/ai-firebase-service';

const aiService = AiFirebaseService.create({
  firebaseConfig: {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    // ... other config
  },
  functionsRegion: "us-central1" // optional, defaults to us-central1
});
```

## API Reference

### Workflow Execution

```typescript
// Generate content using a workflow
const messages: WorkflowMessage[] = [
  { role: 'user', content: 'Analyze this data' }
];

const response = await aiService.generateContent('workflow-id', messages);
console.log('Generated content:', response);

// Generate content with file attachments
const files = [new File(['content'], 'data.txt', { type: 'text/plain' })];
const responseWithFiles = await aiService.generateContent('workflow-id', messages, files);
```

### Streaming Responses

```typescript
// Stream AI responses in real-time
const messages: WorkflowMessage[] = [
  { role: 'user', content: 'Write a story about AI' }
];

for await (const chunk of aiService.streamContent('workflow-id', messages)) {
  console.log('Chunk:', chunk);
  // Update UI with streaming content
}
```

### Image Processing

```typescript
// Fetch and cache images from URLs
const imageFile = await aiService.fetchUrl('https://example.com/image.jpg');
console.log('Image file:', imageFile.name, imageFile.size);

// Use fetched image in workflow
const messages: WorkflowMessage[] = [
  { role: 'user', content: 'Describe this image' }
];
const description = await aiService.generateContent('vision-workflow', messages, [imageFile]);
```

### Cache Management

```typescript
// Check cached images count
const cacheCount = aiService.getCachedImageCount();
console.log('Cached images:', cacheCount);

// Clear image cache
aiService.clearImageCache();
```

### Access Underlying Services

```typescript
// Get underlying Firebase service if needed
const firebaseService = aiService.getFirebaseService();
const firestore = firebaseService.getFirestore();
```

## Advanced Usage

### Custom File Processing

```typescript
// Process multiple files with different types
const files = [
  new File(['{"data": "value"}'], 'data.json', { type: 'application/json' }),
  new File(['Hello world'], 'text.txt', { type: 'text/plain' })
];

const response = await aiService.generateContent('data-analysis-workflow', [
  { role: 'user', content: 'Analyze these files' }
], files);
```

### Error Handling

```typescript
try {
  const response = await aiService.generateContent('workflow-id', messages);
} catch (error) {
  console.error('Failed to generate content:', error);
}
```

### Streaming with Error Handling

```typescript
try {
  for await (const chunk of aiService.streamContent('workflow-id', messages)) {
    // Process chunk
    console.log(chunk);
  }
} catch (error) {
  console.error('Streaming failed:', error);
}
```

## TypeScript Support

The package includes full TypeScript definitions:

```typescript
import { 
  AiFirebaseService, 
  WorkflowMessage,
  WorkflowResponse,
  WorkflowFile,
  StreamChunk,
  FetchUrlResponse,
  FirebaseServiceConfig
} from '@crewdle/ai-firebase-service';
```

## Requirements

- Node.js >= 16
- TypeScript >= 4.7
- Angular >= 15 (for Angular usage)
- @crewdle/firebase-service >= 1.0.0
- firebase >= 9.0.0

## License

MIT © Crewdle