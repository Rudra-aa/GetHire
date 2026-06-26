"""
evaluator_service.py
--------------------
Rule-Based Answer Evaluation Engine for GetHire.

WHY RULE-BASED (not LLM):
    - Works without any API keys or external services
    - Zero latency (no network hop to Ollama)
    - Deterministic and testable
    - Swap path: replace _evaluate_with_rules() with Ollama call
      when local LLM server is available

EVALUATION STRATEGY:
    1. Keyword extraction — does the answer contain expected technical terms?
    2. Depth scoring — is the answer detailed enough?
    3. Structure scoring — does it show reasoning (because, therefore, example)?
    4. Penalty for very short answers
    5. Communication score — sentence variety, clarity markers

KNOWN LIMITATIONS:
    - Cannot catch wrong answers that use the right keywords
    - Cannot evaluate code snippets
    - Communication score is heuristic, not semantic
    These are acceptable for v1 and will be improved with LLM integration.
"""

import re
from dataclasses import dataclass

# Pull keywords from DatasetLoader



# ---------------------------------------------------------------------------
# Keyword database per skill / topic
# ---------------------------------------------------------------------------

SKILL_KEYWORDS: dict[str, list[str]] = {
    "Python": [
        "list", "tuple", "dict", "set", "comprehension", "generator", "iterator",
        "decorator", "lambda", "closure", "gil", "thread", "async", "await",
        "class", "inheritance", "polymorphism", "mro", "metaclass", "descriptor",
        "reference counting", "garbage collection", "mutable", "immutable",
        "args", "kwargs", "typing", "dataclass", "pep",
    ],
    "SQL": [
        "select", "join", "inner join", "left join", "where", "having", "group by",
        "order by", "index", "primary key", "foreign key", "transaction", "acid",
        "normalization", "1nf", "2nf", "3nf", "subquery", "cte", "window function",
        "row_number", "rank", "partition", "explain", "query plan", "shard",
        "aggregate", "count", "sum", "avg",
    ],
    "Machine Learning": [
        "supervised", "unsupervised", "classification", "regression", "clustering",
        "overfitting", "underfitting", "bias", "variance", "cross-validation",
        "precision", "recall", "f1", "roc", "auc", "gradient descent", "loss",
        "regularization", "l1", "l2", "feature", "training", "test", "validation",
        "model", "epoch", "batch", "learning rate",
    ],
    "Deep Learning": [
        "neural network", "layer", "activation", "relu", "sigmoid", "tanh",
        "backpropagation", "gradient", "cnn", "rnn", "lstm", "gru", "transformer",
        "attention", "embedding", "dropout", "batch normalization", "transfer learning",
        "pretrained", "fine-tuning", "epoch", "loss function",
    ],
    "FastAPI": [
        "router", "endpoint", "pydantic", "validation", "async", "await",
        "depends", "dependency injection", "middleware", "cors", "openapi",
        "swagger", "starlette", "uvicorn", "path parameter", "query parameter",
        "request body", "response model", "status code",
    ],
    "React": [
        "component", "props", "state", "hook", "usestate", "useeffect",
        "virtual dom", "jsx", "render", "lifecycle", "context", "redux",
        "memo", "usecallback", "usememo", "ref", "useref", "router",
        "key", "reconciliation", "fiber",
    ],
    "Java": [
        "jvm", "jdk", "jre", "class", "interface", "abstract", "inheritance",
        "polymorphism", "encapsulation", "generics", "collection", "arraylist",
        "hashmap", "thread", "synchronized", "stream", "lambda", "optional",
        "garbage collection", "heap", "stack", "jit",
    ],
    "C++": [
        "pointer", "reference", "memory", "heap", "stack", "constructor",
        "destructor", "raii", "smart pointer", "unique_ptr", "shared_ptr",
        "virtual", "vtable", "template", "stl", "move semantics", "rvalue",
        "copy", "rule of five", "const", "namespace",
    ],
    "DSA": [
        "array", "linked list", "stack", "queue", "tree", "graph", "hash",
        "binary search", "sorting", "recursion", "dynamic programming",
        "memoization", "tabulation", "bfs", "dfs", "greedy", "divide and conquer",
        "time complexity", "space complexity", "big-o", "o(n)", "o(log n)",
    ],
}

# Generic quality markers
REASONING_MARKERS = [
    "because", "therefore", "which means", "this happens", "for example",
    "in other words", "specifically", "the reason", "as a result", "due to",
    "when", "unlike", "compared to", "the difference", "however", "whereas",
    "on the other hand", "in contrast", "this allows", "this prevents",
]

VAGUE_MARKERS = [
    "i think", "maybe", "i'm not sure", "i don't know", "kind of", "sort of",
    "something like", "i guess", "probably",
]


# ---------------------------------------------------------------------------
# Result model
# ---------------------------------------------------------------------------

@dataclass
class EvaluationResult:
    technical_score: float
    communication_score: float
    feedback: str
    strengths: list[str]
    improvements: list[str]
    keywords_matched: list[str]


# ---------------------------------------------------------------------------
# Core evaluation logic
# ---------------------------------------------------------------------------

def evaluate_answer(
    question: str,
    answer: str,
    skill: str,
    difficulty: str,
) -> EvaluationResult:
    """
    Evaluate a candidate's answer using rule-based heuristics.

    Args:
        question:   The interview question text.
        answer:     The candidate's answer text.
        skill:      Canonical skill name (e.g., "Python").
        difficulty: "easy" | "medium" | "hard"

    Returns:
        EvaluationResult with scores and structured feedback.
    """
    answer_lower = answer.lower().strip()

    if not answer_lower or len(answer_lower) < 10:
        return EvaluationResult(
            technical_score=0.0,
            communication_score=0.0,
            feedback="No answer provided or answer too short to evaluate.",
            strengths=[],
            improvements=["Provide a detailed answer to demonstrate your knowledge."],
            keywords_matched=[],
        )

    # --- Technical scoring ---
    tech_score, keywords_matched = _score_technical(answer_lower, question, skill, difficulty)

    # --- Communication scoring ---
    comm_score = _score_communication(answer_lower)

    # --- Build feedback ---
    strengths, improvements, feedback = _build_feedback(
        tech_score, comm_score, keywords_matched, skill, difficulty, answer_lower
    )

    return EvaluationResult(
        technical_score=round(tech_score, 1),
        communication_score=round(comm_score, 1),
        feedback=feedback,
        strengths=strengths,
        improvements=improvements,
        keywords_matched=keywords_matched,
    )


def _score_technical(answer_lower: str, question: str, skill: str, difficulty: str) -> tuple[float, list[str]]:
    """
    Score technical accuracy using keyword matching.

    Design rationale:
    - Pull keywords from the DatasetLoader for the specific question.
    - If question is not found in the dataset, fall back to global SKILL_KEYWORDS.
    """
    from backend.services.dataset_loader import get_loader
    dataset_q = get_loader().get_question_by_text(question)
    if dataset_q and dataset_q.keywords:
        keywords = dataset_q.keywords
    else:
        keywords = SKILL_KEYWORDS.get(skill, [])

    matched = [kw for kw in keywords if kw in answer_lower]
    match_count = len(matched)

    # Keyword bonus: each matched keyword contributes (non-linear — first few keywords
    # give more credit since they show topic relevance)
    if match_count == 0:
        keyword_bonus = 0
    elif match_count == 1:
        keyword_bonus = 15
    elif match_count == 2:
        keyword_bonus = 25
    elif match_count <= 4:
        keyword_bonus = 30 + (match_count - 2) * 4
    else:
        keyword_bonus = min(38 + (match_count - 4) * 2, 45)

    # Base score (credit for attempting to answer at all with enough words)
    word_count = len(answer_lower.split())
    if word_count >= 80:
        base = 45
        depth_bonus = 20
    elif word_count >= 50:
        base = 40
        depth_bonus = 15
    elif word_count >= 30:
        base = 35
        depth_bonus = 10
    elif word_count >= 15:
        base = 25
        depth_bonus = 5
    else:
        base = 10
        depth_bonus = 0

    # Reasoning bonus — uses connective reasoning words
    reasoning_count = sum(1 for m in REASONING_MARKERS if m in answer_lower)
    reasoning_bonus = min(reasoning_count * 4, 20)

    # Vagueness penalty
    vague_count = sum(1 for v in VAGUE_MARKERS if v in answer_lower)
    vague_penalty = vague_count * 5

    score = base + keyword_bonus + depth_bonus + reasoning_bonus - vague_penalty

    # Difficulty scaling — easy questions: higher floor; hard: higher keyword bar
    if difficulty == "easy":
        score = max(score, base + depth_bonus)  # at least base credit for attempting
    elif difficulty == "hard" and match_count == 0:
        score *= 0.6   # Hard question with no keywords = poor answer

    return max(0.0, min(100.0, score)), matched


def _score_communication(answer_lower: str) -> float:
    """Score communication quality heuristically."""
    sentences = re.split(r'[.!?]+', answer_lower)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 5]

    if not sentences:
        return 10.0

    # Sentence variety bonus
    lengths = [len(s.split()) for s in sentences]
    avg_len = sum(lengths) / len(lengths) if lengths else 0
    variety = len(set(len(s.split()) for s in sentences))

    score = 50.0

    # Good average sentence length (10–25 words)
    if 10 <= avg_len <= 25:
        score += 20
    elif 5 <= avg_len < 10:
        score += 10

    # Multiple sentences shows structured thinking
    if len(sentences) >= 3:
        score += 15
    elif len(sentences) >= 2:
        score += 8

    # Sentence length variety shows natural writing
    if variety >= 3:
        score += 10

    # Reasoning markers = good communication
    reasoning_count = sum(1 for m in REASONING_MARKERS if m in answer_lower)
    score += min(reasoning_count * 3, 15)

    # Vagueness penalty
    vague_count = sum(1 for v in VAGUE_MARKERS if v in answer_lower)
    score -= vague_count * 8

    return max(10.0, min(100.0, score))


def _build_feedback(
    tech_score: float,
    comm_score: float,
    keywords_matched: list[str],
    skill: str,
    difficulty: str,
    answer_lower: str,
) -> tuple[list[str], list[str], str]:
    """Build human-readable strengths, improvements, and overall feedback."""
    strengths = []
    improvements = []

    # Technical feedback
    if tech_score >= 75:
        strengths.append(f"Strong command of {skill} concepts with accurate technical terminology.")
    elif tech_score >= 50:
        strengths.append(f"Shows working knowledge of {skill}.")
        improvements.append(f"Include more specific {skill} technical details and terminology.")
    else:
        improvements.append(f"Answer lacks core {skill} concepts. Review fundamentals before the interview.")

    if keywords_matched:
        strengths.append(f"Correctly used: {', '.join(keywords_matched[:5])}{'...' if len(keywords_matched) > 5 else ''}.")

    # Communication feedback
    if comm_score >= 75:
        strengths.append("Clear, well-structured response with good reasoning.")
    elif comm_score >= 50:
        improvements.append("Use transitional phrases (e.g., 'because', 'which means') to improve clarity.")
    else:
        improvements.append("Work on structuring your answers: state the concept, explain it, give an example.")

    # Word count
    word_count = len(answer_lower.split())
    if word_count < 20:
        improvements.append("Expand your answer — aim for at least 3–5 sentences for technical questions.")

    # Overall feedback
    overall = tech_score * 0.7 + comm_score * 0.3
    if overall >= 80:
        feedback = f"Excellent answer demonstrating strong {skill} knowledge with clear communication."
    elif overall >= 65:
        feedback = f"Good answer with solid {skill} understanding. Minor gaps in depth or terminology."
    elif overall >= 50:
        feedback = f"Adequate answer, but key {skill} concepts are missing or under-explained."
    else:
        feedback = f"Answer needs improvement. Focus on reviewing core {skill} concepts and providing structured responses."

    return strengths, improvements, feedback


# ---------------------------------------------------------------------------
# Follow-up question generator
# ---------------------------------------------------------------------------

_FOLLOW_UP_TEMPLATES: dict[str, list[str]] = {
    "shallow": [
        "Can you elaborate on that? Please go deeper into the concept.",
        "Can you explain {skill} concept you just mentioned in more detail?",
        "You touched on it briefly — can you walk me through how that works step by step?",
    ],
    "deep": [
        "Great! Can you now think of a real-world scenario where you'd apply this in production?",
        "Excellent! What are the performance implications of the approach you described?",
        "Good answer! What are the common pitfalls engineers face with this in {skill}?",
    ],
    "clarify": [
        "Interesting. How would you handle edge cases in that approach?",
        "Could you compare that to an alternative approach and explain the tradeoffs?",
        "How would you test the code/logic you just described?",
    ],
}


def generate_follow_up(question: str, answer: str, skill: str) -> str:
    """
    Generate a contextual follow-up question based on answer quality.
    
    Args:
        question: The original interview question.
        answer: The candidate's answer.
        skill: The skill being tested.
        
    Returns:
        A follow-up question string.
    """
    import random
    answer_lower = answer.lower()
    word_count = len(answer_lower.split())

    from backend.services.dataset_loader import get_loader
    dataset_q = get_loader().get_question_by_text(question)
    if dataset_q and dataset_q.keywords:
        keywords = dataset_q.keywords
    else:
        keywords = SKILL_KEYWORDS.get(skill, [])
    matched = sum(1 for kw in keywords if kw in answer_lower)

    # Choose follow-up type based on answer quality
    if word_count < 30 or matched < 2:
        templates = _FOLLOW_UP_TEMPLATES["shallow"]
    elif matched >= 5:
        templates = _FOLLOW_UP_TEMPLATES["deep"]
    else:
        templates = _FOLLOW_UP_TEMPLATES["clarify"]

    template = random.choice(templates)
    return template.format(skill=skill, question=question[:50])
