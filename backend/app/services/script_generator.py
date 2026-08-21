import json
from anthropic import Anthropic
from app.core.config import settings
from app.models.schemas import ExtractedContent, PodcastScript

client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)

SCRIPT_PROMPT = """You are writing an educational podcast script for a student based on their homework.

Homework content:
{content}

Create an engaging 2-host podcast script:
- HOST_ALEX: Experienced, enthusiastic teacher (explains clearly, uses analogies)
- HOST_SAM: Curious student (asks clarifying questions, makes it relatable, occasionally gets confused — then gets it)

Structure the podcast with these segments in order:
1. "hook" — 2-3 exchanges. Start with a real-world hook. Why does this topic matter?
2. "concept" — 4-6 exchanges per major concept. Build from basics up.
3. "example" — 3-5 exchanges. Work through the actual homework problems step by step.
4. "mistake" — 2-3 exchanges. Cover the most common mistakes students make.
5. "recap" — 2-3 exchanges. Quick summary of key takeaways.

For visual_cue, choose one of:
- "show_text" — general text/dialogue
- "show_equation" — when stating a formula or equation (provide "equation" field in LaTeX)
- "show_chart" — when describing data/relationships (provide chart_data)
- "show_list" — when listing points (provide bullet_points array)

Return ONLY valid JSON with this structure:
{{
  "title": "Podcast episode title",
  "subject": "{subject}",
  "grade_level": "{grade_level}",
  "duration_estimate": "X minutes",
  "segments": [
    {{
      "id": "seg_1",
      "type": "hook",
      "lines": [
        {{
          "speaker": "HOST_ALEX",
          "text": "...",
          "visual_cue": "show_text",
          "equation": null,
          "chart_data": null,
          "bullet_points": null
        }}
      ]
    }}
  ],
  "flashcards": [
    {{"question": "...", "answer": "..."}}
  ],
  "quiz": [
    {{
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correct": 0,
      "explanation": "..."
    }}
  ]
}}"""


def generate_podcast_script(extracted: ExtractedContent) -> PodcastScript:
    """Generate a 2-host podcast script from extracted homework content."""
    content_summary = f"""Subject: {extracted.subject}
Grade Level: {extracted.grade_level}
Topics: {', '.join(extracted.topics)}
Key Concepts: {', '.join(extracted.key_concepts)}
Questions/Problems: {chr(10).join(f'- {q}' for q in extracted.questions)}
Equations: {', '.join(extracted.equations) if extracted.equations else 'None'}
Raw Text: {extracted.raw_text[:3000]}"""

    prompt = SCRIPT_PROMPT.format(
        content=content_summary,
        subject=extracted.subject,
        grade_level=extracted.grade_level,
    )

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=8000,
        messages=[{"role": "user", "content": prompt}],
    )

    text = response.content[0].text
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0].strip()
    elif "```" in text:
        text = text.split("```")[1].split("```")[0].strip()

    data = json.loads(text)
    return PodcastScript(**data)
