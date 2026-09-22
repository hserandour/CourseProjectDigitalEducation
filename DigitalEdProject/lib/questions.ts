export type Question =
  | {
      id: string;
      type: "open";
      question: string;
      required?: boolean;
    }
  | {
      id: string;
      type: "single";
      question: string;
      options: string[];
      required?: boolean;
    }
  | {
      id: string;
      type: "mcq";
      question: string;
      options: string[];
      required?: boolean;
    };

export const initialQuestions: Question[] = [
  {
    id: "initial-q1",
    type: "open",
    question:
      "What is your first impression of the task?",
    required: true,
  },

  {
    id: "initial-q2",
    type: "single",
    question:
      "How familiar are you with this subject?",
    options: [
      "Not at all",
      "Slightly",
      "Moderately",
      "Very",
    ],
    required: true,
  },

  {
    id: "initial-q3",
    type: "mcq",
    question:
      "Which of the following apply to you?",
    options: [
      "Option A",
      "Option B",
      "Option C",
      "Option D",
    ],
    required: true,
  },
];

export const quizQuestions: Question[] = [
  {
    id: "quiz-q1",
    type: "single",
    question:
      "What was the main idea?",
    options: [
      "Answer A",
      "Answer B",
      "Answer C",
      "Answer D",
    ],
    required: true,
  },

  {
    id: "quiz-q2",
    type: "mcq",
    question:
      "Which statements are correct?",
    options: [
      "Statement A",
      "Statement B",
      "Statement C",
    ],
    required: true,
  },

  {
    id: "quiz-q3",
    type: "open",
    question:
      "Explain your answer.",
    required: true,
  },
];

export const finalQuestions: Question[] = [
  {
    id: "final-q1",
    type: "single",
    question:
      "How difficult did you find the task?",
    options: [
      "Very easy",
      "Easy",
      "Moderate",
      "Difficult",
      "Very difficult",
    ],
    required: true,
  },

  {
    id: "final-q2",
    type: "open",
    question:
      "Do you have any additional comments?",
    required: false,
  },
];