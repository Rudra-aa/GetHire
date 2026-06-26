import json
import subprocess
import uuid
import re
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
    # Remove code snippets, punctuation, numbers
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
    # Pick top words or phrases
    concepts = []
    # If question mentions specific terms, add them
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

def get_difficulty(index: int, total: int) -> str:
    """Assign difficulty using a 30% Easy, 50% Medium, 20% Hard distribution."""
    pct = (index / total) * 100
    if pct < 30:
        return "easy"
    elif pct < 80:
        return "medium"
    else:
        return "hard"

def process_questions(raw_questions: list, domain: str) -> list:
    """Converts raw parsed questions into standard JSON format with UUIDs."""
    processed = []
    total = len(raw_questions)
    for idx, rq in enumerate(raw_questions):
        # Extract fields depending on format
        question_text = rq.get("q") or rq.get("question") or ""
        answer_text = rq.get("a") or rq.get("answer") or ""
        explanation_text = rq.get("exp") or rq.get("explanation") or rq.get("explanation_text") or ""
        
        if not question_text:
            continue

        # Subcategory mapping
        subcategory = rq.get("section") or rq.get("subcategory") or rq.get("category") or "General"
        
        # Determine topic from subcategory or question
        topic = subcategory.lower().replace(" ", "-")

        # Generate deterministic UUIDv5 using namespace DNS and question text
        question_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, question_text))

        # Generate keywords & concepts
        combined_text = f"{question_text} {answer_text} {explanation_text}"
        keywords = clean_and_extract_words(combined_text)
        expected_concepts = extract_expected_concepts(question_text, combined_text)

        # Append source
        source_filename = f"{domain.lower().replace(' ', '_')}.json"

        processed.append({
            "id": question_id,
            "domain": domain,
            "subcategory": subcategory,
            "topic": topic,
            "difficulty": rq.get("difficulty") or get_difficulty(idx, total),
            "question": question_text,
            "options": None, # open-ended
            "correct_answer": answer_text,
            "explanation": explanation_text or answer_text,
            "expected_concepts": expected_concepts,
            "keywords": keywords,
            "source": source_filename
        })
    return processed

def run_js_conversion():
    raw_dir = Path("backend/data/raw")
    processed_dir = Path("backend/data/processed")
    processed_dir.mkdir(parents=True, exist_ok=True)

    files_mapping = {
        "oop.js": "OOP",
        "databases.js": "Databases",
        "dbms.js": "DBMS",
        "os.js": "OS",
        "cn.js": "CN"
    }

    # Write a temporary JS runner file in backend/scripts
    temp_runner = Path("backend/scripts/temp_runner.js")
    runner_code = """
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function(id) {
  if (id === 'docx') {
    const mock = function() { return {}; };
    return new Proxy(mock, {
      get: (target, prop) => {
        if (prop === 'Packer') {
          return { toBuffer: () => Promise.resolve(Buffer.from([])) };
        }
        return mock;
      }
    });
  }
  return originalRequire.apply(this, arguments);
};

const fs = require('fs');
fs.writeFileSync = () => {};

const fileToRun = process.argv[2];
const domain = process.argv[3];

const code = fs.readFileSync(fileToRun, 'utf8');
const suffix = domain === 'CN' ? '\\nglobal.chapters = chapters;' : '\\nglobal.questions = questions;';
eval(code + suffix);

if (domain === 'CN') {
  console.log(JSON.stringify(global.chapters));
} else {
  console.log(JSON.stringify(global.questions));
}
"""
    with open(temp_runner, "w", encoding="utf-8") as rf:
        rf.write(runner_code)

    try:
        for filename, domain in files_mapping.items():
            filepath = raw_dir / filename
            if not filepath.exists():
                print(f"File {filepath} not found, skipping.")
                continue

            print(f"Processing {filename} for domain {domain}...")
            
            res = subprocess.run(
                ["node", str(temp_runner), str(filepath), domain],
                capture_output=True,
                text=True
            )
            
            if res.returncode != 0:
                print(f"Node execution failed for {filename}: {res.stderr}")
                continue
            
            # Node might output extra status lines. Only load the line that is valid JSON.
            lines = res.stdout.strip().split('\n')
            json_line = next(line for line in lines if line.startswith('[') or line.startswith('{'))
            raw_qs = json.loads(json_line)

            # Handle cn.js list representation
            if filename == "cn.js":
                reformatted_qs = []
                for ch in raw_qs:
                    ch_title = ch.get("title", "Computer Networks")
                    for q_tuple in ch.get("qs", []):
                        if len(q_tuple) >= 2:
                            reformatted_qs.append({
                                "subcategory": ch_title,
                                "q": q_tuple[0],
                                "a": q_tuple[1],
                                "exp": q_tuple[2] if len(q_tuple) > 2 else ""
                            })
                raw_qs = reformatted_qs

            processed = process_questions(raw_qs, domain)
            
            output_file = processed_dir / f"{domain.lower().replace(' ', '_')}.json"
            with open(output_file, "w", encoding="utf-8") as out_f:
                json.dump(processed, out_f, indent=2)
            
            print(f"Saved {len(processed)} questions to {output_file}")
            
    finally:
        if temp_runner.exists():
            temp_runner.unlink()

if __name__ == "__main__":
    run_js_conversion()
