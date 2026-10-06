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
      "Name 10 nouns that are as different to each other as possible. Try not to take more than 1.5 minutes. Seperate them by a comma (e.g. noun1, noun2)",
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
      "What was Skanderbegs full name?",
    options: [
      "Alexj Gratoriski",
      "Arber Çela",
      "Flamur Hoxha",
      "Gjergj Kastrioti",
    ],
    required: true,
  },

  {
    id: "quiz-q2",
    type: "single",
    question:
      "Which historical figure was Skanderbegs nickname by the Ottomans modelled after?",
    options: [
      "Alexander the Great",
      "Julius Ceasar",
      "Hannibal Barkas",
      "Leonidas I"
    ],
    required: true,
  },

  {
    id: "quiz-q3",
    type: "single",
    question:
      "Which of the following statements is true about Skanerbeg?",
    options: [
      "Skanderbeg was born into a peasant family and taken to the Ottaman empire as a child",
      "In his early life Skanderbeg was granted lands by the Ottaman sultan for his service",
      "Skanerbeg had no siblings which made him father even more mad when the Ottamans took him",
      "Skanerbeg deserted the Ottaman empire only after a few battles thought as an Ottaman comander"
    ],
    required: true,
  },

  {
    id: "quiz-q4",
    type: "single",
    question:
      "According to folklore what was on the flag that Skanderbeg raised after he deserted the Ottaman empire?",
    options: [
      "A red cross on a white background",
      "A black single-headed bear on a red background",
      "A golden single-headed lion on a red background",
      "A black double-headed eagle on a red background"
    ],
    required: true,
  },

  {
    id: "quiz-q5",
    type: "single",
    question:
      "Which statement is true about Skanderbegs religion?",
    options: [
      "Skanederbeg was never Muslim during his life",
      "Skanderbeg was never Christian orthodox during his life",
      "Skanderbeg was never Christian catholic during his life",
      "Skanderbeg was never Christian protestant during his life"
    ],
    required: true,
  },

  {
    id: "quiz-q6",
    type: "single",
    question:
      "How large were the forces that Skanderbeg commanded when leading the war against the Ottamans?",
    options: [
      "Less than 500 men",
      "500-2000 men",
      "2000-6000 men",
      "More than 6000 men"
    ],
    required: true,
  },

  {
    id: "quiz-q7",
    type: "single",
    question:
      "Which tactic did Skanderbeg follow during his war against the Ottamans?",
    options: [
      "Building a strong archer battalion and mainly fighting from fortresses",
      "Guerrilla war with mainly horseback riders",
      "Heavily raiding enemy lands and enslaving a large amount of the local population",
      "Forcing all Muslims in his land to fight for him on the account of death"
    ],
    required: true,
  },

  {
    id: "quiz-q8",
    type: "single",
    question:
      "With whom did Skanderbeg never fight?",
    options: [
      "The Hungarian empire",
      "Serbia",
      "The Rebublic of Venice",
      "The Kingom of Naples"
    ],
    required: true,
  },

  {
    id: "quiz-q9",
    type: "single",
    question:
      "What was Skanderbegs relationship with the Pope?",
    options: [
      "It shifted constantly with the Pope sometimes calling him an enemy of Christ and sometimes a defender of the faith",
      "Skanderbegs role on the international stage was not important enough for the Pope to attend to",
      "The pope praised his fight against the Ottamans",
      "The pope opposed him, since he changed religion multiple times during his life"
    ],
    required: true,
  },

  {
    id: "quiz-q10",
    type: "single",
    question:
      "How did Skanderbeg die?",
    options: [
      "He died in battle against the Ottamans",
      "He died in battle against the Kingdom of Naples",
      "He died of an illness",
      "He was assassinated"
    ],
    required: true,
  },

  {
    id: "quiz-q11",
    type: "single",
    question:
      "How was Skanderbeg remembered by his enemies?",
    options: [
      "They made jewlery out of his bones, believing it might bring courage",
      "They destroyed his grave when they came upon it, which was only later rebuilt without his body",
      "They forbid to speak of him of fear it might distill new rebellions",
      "They honored him as a great fighter and even build statues to remember his military genius"
    ],
    required: true,
  },

  {
    id: "quiz-q12",
    type: "single",
    question:
      "How is Skanderbeg remembered today in Albania?",
    options: [
      "As a military commander who brought death and destruction on the country",
      "As a Christian nationalist, so he is increasingly seen negative as most of modern Albanians are Muslim",
      "As a national hero, who has multiple poems and movies made about him",
      "He is largely forgotten, given the time he lived was so long ago "
    ],
    required: true,
  },
];

export const finalQuestions: Question[] = [

  {
    id: "final-q2",
    type: "open",
    question:
      "What did you think of your format of learning (reading text, intearcting with chatbot) about Skanderbeg?",
    required: false,
  },

  {
    id: "final-q2",
    type: "open",
    question:
      "If you read a text, would you have preferred to interact with a chatbot roleplying as Skanderbeg instead? If you interacted with the AI, would you have preffered to read a text instead? Why? Why not?",
    required: false,
  },
];