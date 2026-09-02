"""
app/services/keyword_engine.py
------------------------------
Keyword & Synonym Matching Engine for GetHire.
Performs semantic normalization, synonym resolution, compound splitting, and concept matching.
Never relies on rigid single-word exact matching.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Set, Tuple


SYNONYM_MAP: Dict[str, List[str]] = {
    "idempotency": ["idempotent", "deduplication", "repeatable", "safe retry", "replay attack", "at least once"],
    "concurrency": ["async", "await", "coroutine", "thread", "goroutine", "event loop", "multithreading", "mutex", "lock", "parallelism"],
    "caching": ["redis", "memcached", "cache-aside", "write-through", "ttl", "invalidation", "cache stampede", "lru", "cache"],
    "scalability": ["horizontal scale", "vertical scale", "sharding", "partition", "load balancer", "throughput", "low latency", "microservice", "microservices", "scale", "scaling"],
    "rate limiting": ["token bucket", "leaky bucket", "sliding window", "fixed window", "throttle", "rate limit", "rate limiter"],
    "reliability": ["fault tolerant", "circuit breaker", "retry", "fallback", "high availability", "failover", "dead-letter queue", "dlq"],
    "database": ["mongodb", "postgresql", "postgres", "mysql", "indexing", "b-tree", "query optimization", "acid", "normalization", "transactions", "nosql", "sql"],
    "security": ["jwt", "oauth", "bcrypt", "hashing", "encryption", "sanitization", "xss", "csrf", "rate limit", "rbac", "bearer token"],
    "star method": ["situation", "task", "action", "result", "metric", "outcome", "impact", "delivered", "reduced", "improved", "increased", "%", "percent", "optimized"],
    "architecture": ["tradeoff", "tradeoffs", "component", "data flow", "separation of concerns", "monolith", "event-driven", "pub/sub", "kafka", "rabbitmq", "distributed", "system architecture", "fastapi", "envoy", "websocket", "websockets"],
    "problem statement": ["challenge", "problem", "bottleneck", "issue", "requirement", "difficulty", "obstacle"],
    "technical solution": ["built", "implemented", "designed", "architected", "developed", "deployed", "used", "created", "engineered"],
    "impact metrics": ["throughput", "latency", "%", "percent", "reduced", "improved", "increased", "40%", "boosted", "metrics", "ms", "qps", "rps"],
    "key tradeoffs": ["tradeoff", "tradeoffs", "consistency", "availability", "partition", "latency", "cost", "complexity", "overhead", "trade-off", "trade-offs"],
    "backend": ["fastapi", "python", "node", "django", "flask", "api", "rest", "graphql", "microservices"],
    "distributed systems": ["distributed", "microservice", "microservices", "kafka", "redis", "pub/sub", "cluster", "consensus", "partitioning"],
}


@dataclass
class KeywordMatchResult:
    """Detailed matching metrics returned by KeywordEngine."""
    match_ratio: float
    matched_concepts: List[str] = field(default_factory=list)
    missing_concepts: List[str] = field(default_factory=list)
    matched_keywords: List[str] = field(default_factory=list)
    synonym_hits: Dict[str, str] = field(default_factory=list)
    raw_term_density: float = 0.0


def normalize_text(text: str) -> str:
    """Lowercases, strips punctuation, and standardizes spacing."""
    if not text:
        return ""
    cleaned = re.sub(r"[^\w\s\-\.]", " ", text.lower())
    return " ".join(cleaned.split())


def _check_concept_presence(normalized_answer: str, concept: str) -> Tuple[bool, Optional[str]]:
    """
    Check if a concept or any of its known synonyms or compound parts exists in the normalized answer.
    """
    norm_concept = normalize_text(concept)
    if not norm_concept:
        return False, None

    # 1. Exact phrase substring check
    if norm_concept in normalized_answer:
        return True, norm_concept

    # 2. Check compound splits (e.g. "Cache-Aside / Write-Through pattern" -> ["cache aside", "write through", "pattern"])
    sub_parts = [p.strip() for p in re.split(r"[/,&|-]|\bor\b|\band\b", concept) if p.strip()]
    for part in sub_parts:
        norm_part = normalize_text(part)
        if len(norm_part) > 2 and norm_part in normalized_answer:
            return True, norm_part

    # 3. Tokenized significant word overlap check (excluding generic stop words)
    stop_words = {"and", "or", "the", "in", "for", "with", "pattern", "strategy", "algorithm", "statement", "approach", "key"}
    sig_words = [w for w in norm_concept.split() if len(w) > 2 and w not in stop_words]
    if sig_words and any(w in normalized_answer for w in sig_words):
        matched_word = next(w for w in sig_words if w in normalized_answer)
        return True, matched_word

    # 4. Synonym map query
    for key_concept, synonyms in SYNONYM_MAP.items():
        if key_concept in norm_concept or norm_concept in key_concept:
            for syn in synonyms:
                if syn in normalized_answer:
                    return True, syn

    # 5. Check if any synonym keyword appears anywhere in the concept
    for syn_key, syn_list in SYNONYM_MAP.items():
        if any(w in syn_key for w in sig_words):
            for syn in syn_list:
                if syn in normalized_answer:
                    return True, syn

    return False, None


def evaluate_keywords_and_concepts(
    answer_text: str,
    expected_concepts: List[str],
    supplemental_keywords: Optional[List[str]] = None,
) -> KeywordMatchResult:
    """
    Evaluate candidate answer against expected concepts and keywords.
    """
    if not answer_text or not answer_text.strip():
        return KeywordMatchResult(
            match_ratio=0.0,
            missing_concepts=list(expected_concepts),
        )

    norm_ans = normalize_text(answer_text)
    matched_concepts: List[str] = []
    missing_concepts: List[str] = []
    synonym_hits: Dict[str, str] = {}
    matched_keywords: Set[str] = set()

    # 1. Match expected concepts
    for concept in expected_concepts:
        found, hit_term = _check_concept_presence(norm_ans, concept)
        if found:
            matched_concepts.append(concept)
            if hit_term:
                synonym_hits[concept] = hit_term
                matched_keywords.add(hit_term)
        else:
            missing_concepts.append(concept)

    # 2. Match supplemental keywords if provided
    if supplemental_keywords:
        for kw in supplemental_keywords:
            if not kw:
                continue
            norm_kw = normalize_text(kw)
            if norm_kw and (norm_kw in norm_ans or any(w in norm_ans for w in norm_kw.split() if len(w) > 3)):
                matched_keywords.add(norm_kw)

    total_expected = max(1, len(expected_concepts))
    match_ratio = round(len(matched_concepts) / total_expected, 3)

    # Also reward technical term breadth from global vocabulary
    for key, syns in SYNONYM_MAP.items():
        for s in syns:
            if len(s) > 3 and s in norm_ans:
                matched_keywords.add(s)

    # Compute raw tech term density
    words = norm_ans.split()
    total_words = max(1, len(words))
    density = round(len(matched_keywords) / total_words, 3)

    # Calibrate match ratio if candidate demonstrated high domain technical depth
    if density >= 0.08 and match_ratio < 0.75:
        match_ratio = max(match_ratio, min(1.0, match_ratio + 0.35))

    return KeywordMatchResult(
        match_ratio=match_ratio,
        matched_concepts=matched_concepts,
        missing_concepts=missing_concepts,
        matched_keywords=sorted(list(matched_keywords)),
        synonym_hits=synonym_hits,
        raw_term_density=density,
    )
