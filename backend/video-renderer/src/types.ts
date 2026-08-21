export interface ScriptLine {
  speaker: "HOST_ALEX" | "HOST_SAM";
  text: string;
  visual_cue: "show_text" | "show_equation" | "show_chart" | "show_list";
  equation?: string | null;
  chart_data?: {
    type: "bar" | "line";
    labels: string[];
    values: number[];
    title?: string;
  } | null;
  bullet_points?: string[] | null;
  audio_start?: number | null;
  audio_duration?: number | null;
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface HomeworkPodcastProps extends Record<string, unknown> {
  title: string;
  subject: string;
  grade_level: string;
  audio_url: string;
  lines: ScriptLine[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
}
