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
    id: "Age",
    type: "open",
    question:
      "How old are you?",
    required: false,
  },

  {
    id: "Gender",
    type: "single",
    question:
      "What gender do you identify as?",
    options: [
      "Female",
      "Male",
      "Non-binary",
      "Prefer not to say",
    ],
    required: false,
  },

  {
    id: "Divergent-creativity",
    type: "open",
    question:
      "Name 10 nouns that are as different to each other as possible. Try not to take more than 1.5 minutes. Seperate them by ,",
    required: true,
  },

  {
    id: "Chatbot-usage-frequency",
    type: "single",
    question:
      "How often do you use AI chatbots for writing (e.g. emails, homework)?",
    options: [
      "Daily",
      "Multiple times a week",
      "Once a week",
      "Once per month",
      "Less often than once per month"
    ],
    required: true,
  },

  {
    id: "Prior-knowledge-skanderbeg",
    type: "single",
    question:
      "How much do you think you know about Skanderbeg/İskender Bey?",
    options: [
      "Nothing at all",
      "A little",
      "Somewhat",
      "Quite a bit",
      "A lot"
    ],
    required: true,
  },

  {
    id: "Prior-knowledge-balkans",
    type: "single",
    question:
      "How much do you think you know about the 14th century Balkans?",
    options: [
      "Nothing at all",
      "A little",
      "Somewhat",
      "Quite a bit",
      "A lot"
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