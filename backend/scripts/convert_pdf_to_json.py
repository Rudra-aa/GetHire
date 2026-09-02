import json
import uuid
import re
try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None
from pathlib import Path

# Common stop words to filter out when generating keywords
STOP_WORDS = {
    "what", "is", "are", "and", "or", "the", "a", "an", "of", "for", "to", "in", 
    "on", "at", "by", "with", "about", "against", "between", "into", "through", 
    "during", "before", "after", "above", "below", "from", "up", "down", "in", 
    "out", "over", "under", "again", "further", "then", "once", "here", "there", 
    "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", 
    "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", 
    "so", "than", "too", "very", "can", "will", "just", "should", "now", "which",
    "that", "this", "these", "those", "their", "them", "they", "your", "its",
    "who", "whose", "whom", "have", "has", "had", "having", "do", "does", "did",
    "doing", "would", "could", "should", "been", "was", "were", "be", "must",
    "difference", "explain", "describe", "example", "using", "used", "define"
}

def clean_and_extract_words(text: str) -> list[str]:
    """Tokenizes and extracts clean technical keywords from text."""
    cleaned = re.sub(r"[^\w\s\-]", " ", text.lower())
    words = cleaned.split()
    unique_words = []
    for w in words:
        w_clean = w.strip("-")
        if (
            len(w_clean) >= 3 
            and w_clean not in STOP_WORDS 
            and not w_clean.isdigit() 
            and w_clean not in unique_words
        ):
            unique_words.append(w_clean)
    return unique_words[:12]  # Cap keywords

def extract_expected_concepts(question: str, explanation: str) -> list[str]:
    """Generates simple expected concept phrases from question and explanation."""
    words = clean_and_extract_words(explanation)
    concepts = []
    q_words = clean_and_extract_words(question)
    for qw in q_words:
        if qw in words and qw not in concepts:
            concepts.append(qw)
    
    for w in words:
        if w not in concepts:
            concepts.append(w)
            if len(concepts) >= 5:
                break
    return concepts[:5]

def parse_pdf_text(text: str) -> list[dict]:
    """Parses Python MCQ questions from the raw text extracted from PDF."""
    questions = []
    current_q = None
    
    lines = text.split('\n')
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue
        
        # Check for Question
        q_match = re.match(r"^Question \d+:\s*(.*)", line)
        if q_match:
            if current_q:
                questions.append(current_q)
            current_q = {
                "question": q_match.group(1),
                "options": {},
                "correct_answer": "",
                "explanation": "",
                "difficulty": "medium",
                "topic": "general"
            }
            i += 1
            # Continue reading question text if it spans multiple lines
            while i < len(lines) and not any(lines[i].strip().startswith(prefix) for prefix in ["A)", "B)", "C)", "D)", "Correct Answer:", "Explanation:", "Difficulty:", "Topic:", "Question"]):
                if lines[i].strip():
                    current_q["question"] += " " + lines[i].strip()
                i += 1
            continue
        
        if current_q:
            # Check for Options
            opt_match = re.match(r"^([A-D])\)\s*(.*)", line)
            if opt_match:
                opt_letter = opt_match.group(1)
                opt_text = opt_match.group(2)
                current_q["options"][opt_letter] = opt_text
                i += 1
                # Continue reading option text if it spans multiple lines
                while i < len(lines) and not any(lines[i].strip().startswith(prefix) for prefix in ["A)", "B)", "C)", "D)", "Correct Answer:", "Explanation:", "Difficulty:", "Topic:", "Question"]):
                    if lines[i].strip():
                        current_q["options"][opt_letter] += " " + lines[i].strip()
                    i += 1
                continue
            
            # Check for Correct Answer
            if line.startswith("Correct Answer:"):
                current_q["correct_answer"] = line.replace("Correct Answer:", "").strip()
                i += 1
                continue
            
            # Check for Explanation
            if line.startswith("Explanation:"):
                current_q["explanation"] = line.replace("Explanation:", "").strip()
                i += 1
                # Continue reading explanation text if it spans multiple lines
                while i < len(lines) and not any(lines[i].strip().startswith(prefix) for prefix in ["A)", "B)", "C)", "D)", "Correct Answer:", "Explanation:", "Difficulty:", "Topic:", "Question"]):
                    if lines[i].strip():
                        current_q["explanation"] += " " + lines[i].strip()
                    i += 1
                continue
            
            # Check for Difficulty
            if line.startswith("Difficulty:"):
                current_q["difficulty"] = line.replace("Difficulty:", "").strip().lower()
                i += 1
                continue
            
            # Check for Topic
            if line.startswith("Topic:"):
                current_q["topic"] = line.replace("Topic:", "").strip().lower()
                i += 1
                continue

        i += 1
        
    if current_q:
        questions.append(current_q)
        
    return questions

def run_pdf_conversion():
    pdf_path = Path("backend/data/raw/python.pdf")
    output_dir = Path("backend/data/processed")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    if not pdf_path.exists():
        print(f"PDF file not found at: {pdf_path}")
        return

    print(f"Extracting text from {pdf_path}...")
    doc = fitz.open(str(pdf_path))
    pages_text = []
    for page in doc:
        pages_text.append(page.get_text("text"))
    doc.close()
    
    full_text = "\n".join(pages_text)
    raw_qs = parse_pdf_text(full_text)
    print(f"Parsed {len(raw_qs)} questions from PDF. Converting to standard schema...")

    processed = []
    for idx, rq in enumerate(raw_qs):
        question_text = rq["question"]
        question_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, question_text))
        
        # Generate keywords & expected concepts
        combined_text = f"{question_text} {rq['explanation']}"
        keywords = clean_and_extract_words(combined_text)
        expected_concepts = extract_expected_concepts(question_text, combined_text)
        
        processed.append({
            "id": question_id,
            "domain": "Python",
            "subcategory": "Core Language",
            "topic": rq["topic"],
            "difficulty": rq["difficulty"],
            "question": question_text,
            "options": rq["options"],
            "correct_answer": rq["correct_answer"],
            "explanation": rq["explanation"],
            "expected_concepts": expected_concepts,
            "keywords": keywords,
            "source": "python.json"
        })

    output_file = output_dir / "python.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(processed, f, indent=2)
        
    print(f"Saved {len(processed)} questions to {output_file}")

if __name__ == "__main__":
    run_pdf_conversion()
