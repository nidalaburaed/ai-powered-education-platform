import React from "react";
import { Composition } from "remotion";
import { HomeworkPodcast } from "./HomeworkPodcast";
import type { HomeworkPodcastProps } from "./types";
import { FPS, getDurationInFrames } from "./utils/duration";

const DEFAULT_PROPS: HomeworkPodcastProps = {
  title: "Understanding Quadratic Equations",
  subject: "Mathematics",
  grade_level: "High School",
  audio_url: "",
  lines: [
    {
      speaker: "HOST_ALEX",
      text: "Have you ever wondered how a ball follows a curve when you throw it?",
      visual_cue: "show_text",
      audio_start: 0,
      audio_duration: 4,
    },
    {
      speaker: "HOST_SAM",
      text: "Yeah! Like when you shoot a basketball — it goes up then comes down.",
      visual_cue: "show_text",
      audio_start: 4,
      audio_duration: 3.5,
    },
    {
      speaker: "HOST_ALEX",
      text: "Exactly! That curve is described by a quadratic equation. The general form is ax squared plus bx plus c equals zero.",
      visual_cue: "show_equation",
      equation: "ax^2 + bx + c = 0",
      audio_start: 7.5,
      audio_duration: 6,
    },
  ],
  flashcards: [
    {
      question: "What is the standard form of a quadratic equation?",
      answer: "ax² + bx + c = 0",
    },
  ],
  quiz: [
    {
      question: "In the quadratic formula, what is inside the square root?",
      options: ["b² - 4ac", "b² + 4ac", "2ac - b", "-b/2a"],
      correct: 0,
      explanation: "The discriminant b² - 4ac determines the nature of the roots.",
    },
  ],
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="HomeworkPodcast"
      component={HomeworkPodcast}
      durationInFrames={getDurationInFrames(DEFAULT_PROPS.lines, FPS)}
      fps={FPS}
      width={1280}
      height={720}
      defaultProps={DEFAULT_PROPS}
      calculateMetadata={({ props }) => ({
        durationInFrames: getDurationInFrames(props.lines, FPS),
      })}
    />
  );
};
