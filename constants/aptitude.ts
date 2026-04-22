export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index of the correct option
  explanation: string;
}

export interface AptitudeCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  questions: Question[];
}

export const aptitudeData: Record<string, AptitudeCategory> = {
  verbal: {
    id: "verbal",
    title: "Verbal Reasoning",
    description: "Test your understanding and reasoning using concepts framed in words.",
    icon: "BookOpen",
    color: "from-blue-500/20 to-blue-500/5",
    questions: [
      {
        id: "v1",
        question: "Select the word that is most opposite in meaning to 'OBSTINATE'.",
        options: ["Stubborn", "Flexible", "Firm", "Resolute"],
        correctAnswer: 1,
        explanation: "'Obstinate' means stubbornly refusing to change one's opinion or chosen course of action, despite attempts to persuade one to do so. The opposite is 'Flexible'."
      },
      {
        id: "v2",
        question: "Read the following sentences: 1. The sun 'rose' in the east. 2. He gave her a beautiful red 'rose'. What is the relationship between the word 'rose' in both sentences?",
        options: ["Synonyms", "Antonyms", "Homographs", "Homophones"],
        correctAnswer: 2,
        explanation: "Homographs are words that are spelled the same but have different meanings and sometimes different pronunciations. 'Rose' (verb, past tense of rise) and 'Rose' (noun, a flower) are homographs."
      },
      {
        id: "v3",
        question: "Find the correctly spelt word.",
        options: ["Accomodation", "Accommodation", "Acommodation", "Acomodation"],
        correctAnswer: 1,
        explanation: "'Accommodation' is the correct spelling. It has double 'c' and double 'm'."
      },
      {
        id: "v4",
        question: "Choose the correct alternative: 'He is ________ honest man.'",
        options: ["a", "an", "the", "none"],
        correctAnswer: 1,
        explanation: "The word 'honest' begins with a vowel sound (silent 'h'), so the article 'an' should be used."
      },
      {
        id: "v5",
        question: "What does the idiom 'To bite the bullet' mean?",
        options: ["To eat something hard", "To endure a painful or difficult situation courageously", "To attack someone", "To fail miserably"],
        correctAnswer: 1,
        explanation: "The idiom 'To bite the bullet' means to force yourself to do something difficult or unpleasant, or to be brave in a difficult situation."
      }
    ]
  },
  quantitative: {
    id: "quantitative",
    title: "Quantitative Maths",
    description: "Evaluate your numerical ability and mathematical skills.",
    icon: "Calculator",
    color: "from-green-500/20 to-green-500/5",
    questions: [
      {
        id: "q1",
        question: "If a shirt costs $40 after a 20% discount, what was its original price?",
        options: ["$48", "$50", "$60", "$45"],
        correctAnswer: 1,
        explanation: "Let the original price be x. After a 20% discount, the price is 80% of x. So, 0.8x = 40 => x = 40 / 0.8 = 50."
      },
      {
        id: "q2",
        question: "A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?",
        options: ["120 meters", "180 meters", "324 meters", "150 meters"],
        correctAnswer: 3,
        explanation: "Speed = 60 km/hr = 60 * (5/18) m/s = 50/3 m/s. Distance (length of train) = Speed * Time = (50/3) * 9 = 150 meters."
      },
      {
        id: "q3",
        question: "If A is twice as fast as B, and B completes a job in 12 days, how long will they take working together?",
        options: ["4 days", "6 days", "8 days", "3 days"],
        correctAnswer: 0,
        explanation: "If B takes 12 days, B's work rate is 1/12 per day. A is twice as fast, so A takes 6 days, and A's rate is 1/6 per day. Together: 1/12 + 1/6 = 3/12 = 1/4 per day. It takes them 4 days."
      },
      {
        id: "q4",
        question: "What is the next number in the series: 3, 7, 15, 31, ... ?",
        options: ["63", "61", "59", "64"],
        correctAnswer: 0,
        explanation: "The pattern is (previous number * 2) + 1. (3*2+1=7), (7*2+1=15), (15*2+1=31), (31*2+1=63)."
      },
      {
        id: "q5",
        question: "The average of 5 consecutive numbers is 20. What is the largest number?",
        options: ["20", "22", "24", "18"],
        correctAnswer: 1,
        explanation: "Let the numbers be x, x+1, x+2, x+3, x+4. Their sum is 5x+10. Average = (5x+10)/5 = x+2 = 20. Thus x = 18. The largest is x+4 = 22."
      }
    ]
  },
  logical: {
    id: "logical",
    title: "Logical Reasoning",
    description: "Analyze your problem-solving capability and logical deduction.",
    icon: "BrainCircuit",
    color: "from-purple-500/20 to-purple-500/5",
    questions: [
      {
        id: "l1",
        question: "Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?",
        options: ["(1/3)", "(1/8)", "(2/8)", "(1/16)"],
        correctAnswer: 1,
        explanation: "This is a simple division series; each number is one-half of the previous number."
      },
      {
        id: "l2",
        question: "SCD, TEF, UGH, ____, WKL",
        options: ["CMN", "UJI", "VIJ", "IJT"],
        correctAnswer: 2,
        explanation: "The first letters are in alphabetical order: S, T, U, V, W. The second and third letters are pairs in alphabetical order: CD, EF, GH, IJ, KL."
      },
      {
        id: "l3",
        question: "If 'M' denotes 'x', 'R' denotes '/', 'T' denotes '-', and 'K' denotes '+', then: 20 R 4 M 3 K 2 T 1 = ?",
        options: ["16", "20", "15", "18"],
        correctAnswer: 0,
        explanation: "Substitute the symbols: 20 / 4 x 3 + 2 - 1. Apply BODMAS: (20/4) x 3 + 2 - 1 = 5 x 3 + 2 - 1 = 15 + 2 - 1 = 16."
      },
      {
        id: "l4",
        question: "Pointing to a photograph of a boy, Suresh said, 'He is the son of the only son of my mother.' How is Suresh related to that boy?",
        options: ["Brother", "Uncle", "Cousin", "Father"],
        correctAnswer: 3,
        explanation: "'The only son of my mother' is Suresh himself. Therefore, the boy is the son of Suresh. So, Suresh is the father of the boy."
      },
      {
        id: "l5",
        question: "All squares are rectangles. Some rectangles are circles. Conclusion I: Some squares are circles. Conclusion II: No square is a circle.",
        options: ["Only II follows", "Only I follows", "Either I or II follows", "Neither I nor II follows"],
        correctAnswer: 2,
        explanation: "We do not know the exact relationship between squares and circles. It's either they overlap (Some are circles) or they don't (No square is a circle). Thus, Either I or II follows."
      }
    ]
  }
};
