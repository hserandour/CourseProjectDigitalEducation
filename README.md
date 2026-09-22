# Experiment Web Application

A multi-step experimental web application built with **Next.js App Router**, **Tailwind CSS**, **shadcn/ui**, and **Convex**.

The application guides participants through a fixed experimental workflow. Participants are assigned to either **condition A** or **condition B** on registration. The two conditions differ on page 4:

* **Condition A:** the participant reads a text.
* **Condition B:** the participant interacts with a chatbot.

All participant data and questionnaire responses are stored in Convex.

---

## Table of Contents

* [Overview](#overview)
* [Technology Stack](#technology-stack)
* [Experiment Flow](#experiment-flow)
* [Data Architecture](#data-architecture)
* [Project Structure](#project-structure)
* [Getting Started](#getting-started)
* [Environment Variables](#environment-variables)
* [Convex Setup](#convex-setup)
* [Questionnaires](#questionnaires)
* [Participant Flow](#participant-flow)
* [Chatbot](#chatbot)
* [Navigation and Page Completion](#navigation-and-page-completion)
* [Database Structure](#database-structure)
* [Development](#development)
* [Production Considerations](#production-considerations)

---

# Overview

The application implements the following participant workflow:

```text
Page 1
Registration
    │
    ▼
Page 2
Initial questionnaire
    │
    ▼
Page 3
Instructions
    │
    ▼
Page 4
Experimental task
    │
    ├── Condition A → Reading task
    │
    └── Condition B → Chatbot interaction
    │
    ▼
Page 5
Writing task
    │
    ▼
Page 6
Quiz
    │
    ▼
Page 7
Final questionnaire
    │
    ▼
Page 8
Thank you
```

Participants cannot proceed to the next page until they complete the current task.

---

# Technology Stack

## Frontend

* [Next.js](https://nextjs.org/)
* Next.js App Router
* React
* TypeScript
* Tailwind CSS
* shadcn/ui

## Backend

* [Convex](https://www.convex.dev/)
* Convex queries
* Convex mutations
* Convex actions

## Chatbot

The chatbot is implemented through a Convex action that communicates with an LLM API.

---

# Experiment Flow

## Page 1 — Registration

The participant enters:

* Pseudonym/name
* Experimental condition: `A` or `B`

A participant record is created in Convex.

Example:

```text
pseudonym: "Alice"
condition: "B"
```

The generated participant ID is stored locally in the browser and used to identify the participant throughout the experiment.

---

## Page 2 — Initial Questionnaire

The participant answers a dynamic questionnaire.

Supported question types:

* Open text
* Single choice
* Multiple choice

The number of questions is not fixed.

Answers are stored as:

```json
[
  {
    "questionId": "question-1",
    "answer": "My answer"
  },
  {
    "questionId": "question-2",
    "answer": "Option A"
  },
  {
    "questionId": "question-3",
    "answer": [
      "Option A",
      "Option C"
    ]
  }
]
```

---

## Page 3 — Instructions

The participant reads an instruction text.

Once the participant confirms that they have finished, they proceed to page 4.

---

## Page 4 — Experimental Task

The participant's condition determines what they see.

### Condition A

The participant reads an assigned text.

After finishing, they click:

```text
I've finished
```

The completion of page 4 is recorded.

### Condition B

The participant interacts with the chatbot.

The complete conversation is stored in Convex:

```text
user
assistant
user
assistant
...
```

Once the participant has finished interacting with the chatbot, they click:

```text
I've finished
```

---

## Page 5 — Writing Task

The participant writes a text response.

The text is stored in the participant record:

```text
page5Text
```

The participant must enter text before continuing.

---

## Page 6 — Quiz

The participant answers another dynamic questionnaire.

The same questionnaire component used on page 2 is reused.

Supported question types:

* Open
* Single choice
* Multiple choice

---

## Page 7 — Final Questionnaire

The participant answers the final questionnaire.

The answers use the same structure as pages 2 and 6.

---

## Page 8 — Thank You

The participant sees a final thank-you message.

No additional input is required.

---

# Data Architecture

The database is organized around a central `participants` record.

```text
participants
      │
      ├──────── initialAnswers
      │
      ├──────── quizAnswers
      │
      └──────── finalAnswers
```

The participant record contains information specific to the experimental session.

Questionnaire records contain variable-length answer arrays.

---

# Project Structure

```text
.
├── app/
│   ├── page.tsx
│   │
│   ├── questionnaire/
│   │   └── page.tsx
│   │
│   ├── instructions/
│   │   └── page.tsx
│   │
│   ├── task/
│   │   └── page.tsx
│   │
│   ├── writing/
│   │   └── page.tsx
│   │
│   ├── quiz/
│   │   └── page.tsx
│   │
│   ├── final-questionnaire/
│   │   └── page.tsx
│   │
│   ├── thanks/
│   │   └── page.tsx
│   │
│   ├── layout.tsx
│   └── providers.tsx
│
├── components/
│   ├── experiment/
│   │   ├── Chatbot.tsx
│   │   ├── PageNavigation.tsx
│   │   ├── ParticipantGuard.tsx
│   │   ├── ReadingTask.tsx
│   │   └── Questionnaire.tsx
│   │
│   └── ui/
│       └── shadcn components
│
├── convex/
│   ├── schema.ts
│   ├── participants.ts
│   ├── questionnaires.ts
│   ├── chatbot.ts
│   └── _generated/
│
├── lib/
│   ├── participant.ts
│   └── questions.ts
│
├── .env.local
├── package.json
└── README.md
```

---

# Getting Started

## 1. Clone the repository

```bash
git clone <repository-url>
cd <project-directory>
```

## 2. Install dependencies

Using npm:

```bash
npm install
```

Or using pnpm:

```bash
pnpm install
```

Or using yarn:

```bash
yarn install
```

---

# Convex Setup

If Convex has not yet been initialized:

```bash
npx convex dev
```

This will:

1. Connect the project to Convex.
2. Create/configure the Convex project.
3. Generate the Convex TypeScript API.
4. Watch for changes to files in `convex/`.

The generated files are located under:

```text
convex/_generated/
```

Do not manually edit the generated files.

---

# Environment Variables

Create a `.env.local` file for the Next.js application.

Example:

```env
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
```

The chatbot also requires an API key configured in the Convex environment.

For example:

```text
OPENAI_API_KEY=your-api-key
```

The API key should **not** be exposed to the browser.

It should be configured as a Convex environment variable.

---

# Running the Application

You normally need two development processes.

## Terminal 1 — Next.js

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:3000
```

## Terminal 2 — Convex

```bash
npx convex dev
```

Convex will monitor the backend files and regenerate its API when necessary.

---

# Questionnaires

Questionnaires are defined in:

```text
lib/questions.ts
```

The application uses a reusable `Question` type.

There are three supported question types.

---

## Open question

```ts
{
  id: "q1",
  type: "open",
  question: "What do you think about the task?",
  required: true,
}
```

The participant gets a text area.

---

## Single-choice question

```ts
{
  id: "q2",
  type: "single",
  question: "How difficult was the task?",
  options: [
    "Very easy",
    "Easy",
    "Moderate",
    "Difficult",
    "Very difficult",
  ],
  required: true,
}
```

The participant can select exactly one option.

---

## Multiple-choice question

```ts
{
  id: "q3",
  type: "mcq",
  question: "Which options apply?",
  options: [
    "Option A",
    "Option B",
    "Option C",
  ],
  required: true,
}
```

The participant can select multiple options.

---

# Adding Questions

To add a question, modify the corresponding array in:

```text
lib/questions.ts
```

For example:

```ts
export const initialQuestions: Question[] = [
  {
    id: "age",
    type: "open",
    question: "How old are you?",
    required: true,
  },

  {
    id: "experience",
    type: "single",
    question: "How experienced are you?",
    options: [
      "Beginner",
      "Intermediate",
      "Advanced",
    ],
    required: true,
  },
];
```

No changes to the database schema are required when the number of questions changes.

---

# Questionnaire Answer Format

All questionnaires store answers using the following structure:

```ts
type Answer = {
  questionId: string;
  answer: string | string[];
};
```

Examples:

```json
{
  "questionId": "q1",
  "answer": "Some text"
}
```

Single choice:

```json
{
  "questionId": "q2",
  "answer": "Option A"
}
```

Multiple choice:

```json
{
  "questionId": "q3",
  "answer": [
    "Option A",
    "Option C"
  ]
}
```

This approach means questionnaires can contain any number of questions without requiring database schema changes.

---

# Participant Data

The `participants` table contains:

```text
participants
├── pseudonym
├── condition
├── currentPage
├── completedPages
├── page4Text
├── page4ChatHistory
├── page5Text
├── createdAt
└── updatedAt
```

## Condition

The condition is either:

```text
A
```

or:

```text
B
```

---

# Page Tracking

The participant record contains:

```text
currentPage
```

and:

```text
completedPages
```

For example:

```json
{
  "currentPage": 5,
  "completedPages": [
    2,
    3,
    4
  ]
}
```

This allows the application to determine where the participant currently is in the experiment.

It can also be used to prevent participants from manually navigating to future pages before completing the required tasks.

---

# Navigation

Every task page has navigation controls.

The standard layout is:

```text
┌───────────────────────────────────────────┐
│                                           │
│                 TASK                      │
│                                           │
├───────────────────────────────────────────┤
│                                           │
│ ← Previous                     Continue → │
│                                           │
└───────────────────────────────────────────┘
```

The **Previous** button returns to the previous page.

The **Continue** button is disabled until the participant has completed the task.

---

# Chatbot

The chatbot is only available to participants assigned to condition `B`.

The flow is:

```text
Participant
     │
     │ message
     ▼
Next.js
     │
     ▼
Convex action
     │
     ▼
LLM API
     │
     ▼
Convex
     │
     ▼
Chat history
     │
     ▼
Participant
```

The conversation is stored in:

```text
participants.page4ChatHistory
```

Example:

```json
[
  {
    "role": "user",
    "content": "Hello",
    "timestamp": 123456789
  },
  {
    "role": "assistant",
    "content": "Hello! How can I help?",
    "timestamp": 123456790
  }
]
```

The conversation is saved as the participant interacts with the chatbot rather than only when the participant finishes.

This reduces the risk of losing the conversation if the browser is accidentally closed.

---

# Condition A vs Condition B

Page 4 checks the participant's condition:

```ts
if (participant.condition === "A") {
  return <ReadingTask />;
}

return <Chatbot />;
```

The rest of the experiment is identical.

```text
                 Page 4
                    │
           ┌────────┴────────┐
           │                 │
           ▼                 ▼
       Condition A       Condition B
           │                 │
        Reading           Chatbot
           │                 │
           └────────┬────────┘
                    │
                    ▼
                 Page 5
```

---

# Convex Database

The schema contains four main tables.

## `participants`

Stores participant/session information.

```text
participants
├── pseudonym
├── condition
├── currentPage
├── completedPages
├── page4Text
├── page4ChatHistory
└── page5Text
```

---

## `initialAnswers`

Stores the questionnaire from page 2.

```text
initialAnswers
├── participantId
├── pseudonym
├── answers
├── createdAt
└── updatedAt
```

---

## `quizAnswers`

Stores the questionnaire from page 6.

```text
quizAnswers
├── participantId
├── pseudonym
├── answers
├── createdAt
└── updatedAt
```

---

## `finalAnswers`

Stores the questionnaire from page 7.

```text
finalAnswers
├── participantId
├── pseudonym
├── answers
├── createdAt
└── updatedAt
```

---

# Convex Functions

## Participants

Located in:

```text
convex/participants.ts
```

Main functions:

```text
create
get
completePage
savePage4Text
savePage5Text
```

---

## Questionnaires

Located in:

```text
convex/questionnaires.ts
```

Main functions:

```text
getInitialAnswers
saveInitialAnswers

getQuizAnswers
saveQuizAnswers

getFinalAnswers
saveFinalAnswers
```

---

## Chatbot

Located in:

```text
convex/chatbot.ts
```

Main functions:

```text
getHistory
addMessage
sendMessage
```

Internal functions are used to retrieve participant data and save chatbot conversation turns.

---

# Data Relationship

All records are linked using:

```text
participantId
```

For example:

```text
Participant
ID: abc123
   │
   ├── initialAnswers
   │
   ├── quizAnswers
   │
   └── finalAnswers
```

This allows all experimental data belonging to a participant to be associated without duplicating the participant record.

---

# Development

Start Next.js:

```bash
npm run dev
```

Start Convex:

```bash
npx convex dev
```

When modifying:

```text
convex/schema.ts
```

Convex will regenerate the generated TypeScript API.

When adding a new Convex function, it will become available through:

```ts
api.<file>.<function>
```

For example:

```ts
api.participants.create
```

or:

```ts
api.questionnaires.saveQuizAnswers
```

---

# Adding a New Page

To add another experiment page:

1. Create the route in `app/`.
2. Add the page content.
3. Add a Convex mutation if data needs to be stored.
4. Update `currentPage`/`completedPages`.
5. Add the route to the page guard.
6. Add navigation from the previous page.

For example:

```text
app/new-task/page.tsx
```

Then update the flow:

```text
Page 5
   ↓
New Task
   ↓
Page 6
```

---

# Production Considerations

## Participant identification

The current implementation stores the participant ID in:

```text
localStorage
```

This is convenient for development but should not be considered a secure authentication mechanism.

A participant who deliberately modifies their browser storage could potentially replace the ID.

For a public production deployment, consider using:

* authentication,
* a secure participant token,
* a server-side session,
* or another participant identification mechanism appropriate for the experiment.

---

## Data privacy

If the application collects research participant data, carefully consider:

* what personal information is collected,
* whether pseudonyms can still identify participants,
* who can access Convex data,
* how long data is retained,
* whether chatbot conversations contain sensitive information,
* and the applicable research/data-protection requirements.

Do not expose Convex administrative credentials or LLM API keys to the browser.

---

## API keys

Never put:

```text
OPENAI_API_KEY
```

in:

```text
NEXT_PUBLIC_*
```

environment variables.

`NEXT_PUBLIC_*` variables can be exposed to browser code.

The LLM API key should remain in the Convex/server environment.

---

# Recommended Production Improvements

Before deploying the experiment to real participants, consider implementing:

### 1. Strong participant/session identification

Replace the basic localStorage participant ID with a secure participant/session mechanism.

### 2. Page access control

Prevent participants from accessing pages that they have not yet reached.

### 3. Automatic progress saving

Save questionnaire answers as the participant progresses if losing progress would be problematic.

### 4. Chatbot recovery

Restore the chatbot conversation from Convex if the participant refreshes the browser.

### 5. Admin/export functionality

Add an administrator interface or export mechanism for retrieving:

* participant information,
* conditions,
* questionnaire answers,
* writing responses,
* chatbot histories,
* timestamps.

### 6. Experiment configuration

For a larger study, move questionnaire definitions and experiment texts into a configuration/database rather than hard-coding them.

### 7. Error handling

Display a user-friendly error if:

* Convex is unavailable,
* the chatbot API fails,
* an answer cannot be saved,
* or the participant loses their session.

---

# Final Architecture

The application can be summarized as:

```text
                    Next.js
                       │
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
      Experiment UI             Convex
          │                         │
          │                  ┌──────┴──────┐
          │                  │             │
          │                  ▼             ▼
          │             Database       Actions
          │                                │
          │                                ▼
          │                              LLM
          │
          ▼
   Participant Flow

Page 1 → Registration
Page 2 → Questionnaire
Page 3 → Instructions
Page 4 → A: Reading / B: Chatbot
Page 5 → Writing
Page 6 → Quiz
Page 7 → Final questionnaire
Page 8 → Thanks
```

The main design principle is to keep **participant/session data**, **questionnaire data**, and **chatbot data** logically separated while linking everything through `participantId`.

This makes the application easier to maintain and allows the number and type of questionnaire questions to change without modifying the Convex database schema.
