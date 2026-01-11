# Gemini API Migration Specification (Gemini 3.0 Flash)

This document serves as the implementation specification for migrating the application's AI features from Anthropic Claude to Google Gemini 3.0 Flash.

## 1. Overview
Replace the existing Anthropic Claude API integration with Google's Gemini API, specifically using the **Gemini 3.0 Flash** model. This change aims to improve response speed and cost-efficiency while maintaining high-quality task extraction and review capabilities.

## 2. Technical Stack
- **AI Model**: `gemini-3.0-flash`
- **SDK**: `@google/generative-ai` (Google AI JavaScript SDK)
- **Environment**: Vite + React

## 3. Environment Configuration
**Security Note**: The API key provided by the user must NOT be hardcoded in the source code. It must be stored in the `.env` file.

### [.env] (User Local Environment)
Create or update the `.env` file in the project root:
```ini
# Replace the existing ANTHROPIC key or just add this new one
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### [MODIFY] [.env.example]
Update the template for future reference.
- **Change**: `VITE_ANTHROPIC_API_KEY` -> `VITE_GEMINI_API_KEY`

## 4. Detailed Implementation Changes

### 4.1 Dependency Management
- **Action**: Uninstall Anthropic SDK and install Google Generative AI SDK.
- **Commands**:
    ```bash
    npm uninstall @anthropic-ai/sdk
    npm install @google/generative-ai
    ```

### 4.2 Entry Point Configuration
#### [MODIFY] [src/main.jsx](file:///c:/Users/kg_zk/OneDrive/%E3%83%89%E3%82%AD%E3%83%A5%E3%83%A1%E3%83%B3%E3%83%88/GitHub/todo_app/src/main.jsx)
- **Change**: Retrieve `import.meta.env.VITE_GEMINI_API_KEY` instead of `VITE_ANTHROPIC_API_KEY`.
- **Pass Context**: Pass this key to the `App` component as the `apiKey` prop.

### 4.3 App Logic Refactoring
#### [MODIFY] [src/App.jsx](file:///c:/Users/kg_zk/OneDrive/%E3%83%89%E3%82%AD%E3%83%A5%E3%83%A1%E3%83%B3%E3%83%88/GitHub/todo_app/src/App.jsx)

**A. Initialization**
- **Import**: `import { GoogleGenerativeAI } from "@google/generative-ai";`
- **Constant**: Define `const GEN_AI_MODEL = 'gemini-3.0-flash';`

**B. Feature: Task Extraction (`extractTasks`)**
- **Goal**: Convert unstructured text into a JSON array of tasks.
- **Implementation Details**:
    1.  Initialize `genAI` with `apiKey`.
    2.  Get model: `genAI.getGenerativeModel({ model: GEN_AI_MODEL, generationConfig: { responseMimeType: "application/json" } })`.
    3.  **Prompt Engineering**: Keep the existing detailed system prompt but ensure it adheres to Gemini's preferred context format.
    4.  **Execution**: Call `model.generateContent(prompt)`.
    5.  **Output Processing**: Parse `response.text()` as JSON. Handle potential markdown code blocks (` ```json ... ``` `) if Gemini is not in strict JSON mode (though `responseMimeType` should handle this).

**C. Feature: Daily Review (`generateReview`)**
- **Goal**: Generate a text summary of completed tasks and productivity.
- **Implementation Details**:
    1.  Initialize model (same as above).
    2.  **Prompt**: "Analyze the following task data for the period [Period]..."
    3.  **Execution**: Call `model.generateContent(prompt)`.
    4.  **Output**: Display the generated text directly.

**D. Key Validation**
- Update the `useEffect` that checks `apiKey` to log "Gemini API Key detected" instead of Claude.

## 5. Verification Plan

### Manual Testing Protocol
1.  **Setup**:
    - Add the provided API key to `.env`.
    - Run `npm install` and `npm run dev`.
2.  **Test Case 1: Task Extraction**
    - **Input**: "明日10時にミーティング。あと牛乳を買う。"
    - **Expected**: Task list updates with "ミーティング" (Start 10:00 in memo) and "牛乳購入".
    - **Check**: No JSON parse errors in console.
3.  **Test Case 2: Review Generation**
    - **Action**: Open Review tab -> Click "Generate AI Review".
    - **Expected**: A coherent Japanese summary starts streaming or appears after a few seconds.

## 6. Rollback Strategy
- If `gemini-3.0-flash` is unavailable or unstable, change the constant `GEN_AI_MODEL` to `gemini-1.5-flash` or `gemini-2.0-flash-exp`.
