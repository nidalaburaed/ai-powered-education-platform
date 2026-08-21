import json
import base64
import httpx
from pathlib import Path
from anthropic import Anthropic
from app.core.config import settings
from app.models.schemas import ExtractedContent

client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)

EXTRACTION_PROMPT = """Analyze this homework image/document carefully. Extract all content and return a JSON object with this exact structure:

{
  "subject": "Mathematics|Physics|Chemistry|Biology|History|Geography|Economics|Computer Science|Philosophy|Language|Other",
  "grade_level": "Primary|Middle School|High School|University",
  "topics": ["list of specific topics covered, e.g., 'Quadratic Equations', 'Photosynthesis'"],
  "questions": ["list of questions or problems found in the homework, verbatim"],
  "equations": ["list of mathematical/scientific equations found, using LaTeX notation if applicable"],
  "key_concepts": ["list of key concepts, terms, or principles mentioned"],
  "raw_text": "full verbatim text extracted from the document"
}

Be precise and comprehensive. If it is a math problem, extract each step shown. If it's an essay question, include the full question text."""


def extract_content_from_image(image_path: str) -> ExtractedContent:
    """Use Claude Vision to extract structured content from a homework image."""
    suffix = Path(image_path).suffix.lower()
    media_type_map = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
    }
    media_type = media_type_map.get(suffix, "image/jpeg")

    with open(image_path, "rb") as f:
        image_data = base64.standard_b64encode(f.read()).decode("utf-8")

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": image_data,
                        },
                    },
                    {"type": "text", "text": EXTRACTION_PROMPT},
                ],
            }
        ],
    )

    text = response.content[0].text
    # Strip markdown code fences if present
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0].strip()
    elif "```" in text:
        text = text.split("```")[1].split("```")[0].strip()

    data = json.loads(text)
    return ExtractedContent(**data)


def extract_content_from_pdf_url(file_url: str) -> ExtractedContent:
    """Download a PDF and extract content using Claude."""
    response_data = httpx.get(file_url, timeout=30)
    response_data.raise_for_status()
    pdf_data = base64.standard_b64encode(response_data.content).decode("utf-8")

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "document",
                        "source": {
                            "type": "base64",
                            "media_type": "application/pdf",
                            "data": pdf_data,
                        },
                    },
                    {"type": "text", "text": EXTRACTION_PROMPT},
                ],
            }
        ],
    )

    text = response.content[0].text
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0].strip()
    elif "```" in text:
        text = text.split("```")[1].split("```")[0].strip()

    data = json.loads(text)
    return ExtractedContent(**data)
