"""
app/services/benchmark_engine.py
---------------------------------
Industry peer benchmarking engine for GetHire.
Calibrates candidate HireScore against standardized Junior, Mid, Senior,
and Staff engineering hiring baselines.
"""

from __future__ import annotations

from typing import Dict, Optional
from app.models.hirescore import BenchmarkDetails

# Standardized peer averages across engineering levels
INDUSTRY_LEVEL_BENCHMARKS: Dict[str, int] = {
    "Junior": 58,
    "Mid": 72,
    "Senior": 84,
    "Staff": 93,
}


def calculate_industry_benchmark(
    hirescore: int,
    target_role: Optional[str] = None,
    experience_level: Optional[str] = None,
) -> BenchmarkDetails:
    """
    Computes comparative industry percentile, band, and relative position.
    """
    # Normalize level
    level_map = {
        "entry": "Junior",
        "junior": "Junior",
        "mid": "Mid",
        "senior": "Senior",
        "staff": "Staff",
        "principal": "Staff",
    }
    normalized_level = level_map.get((experience_level or "mid").lower(), "Mid")
    baseline = INDUSTRY_LEVEL_BENCHMARKS.get(normalized_level, 72)

    # 1. Percentile Calculation via Normal Distribution Approximation
    # Baseline standard deviation = 10
    diff = hirescore - baseline
    if diff >= 15:
        percentile = min(99, 90 + int((diff - 15) * 0.6))
    elif diff >= 8:
        percentile = min(89, 78 + int((diff - 8) * 1.5))
    elif diff >= 0:
        percentile = min(77, 50 + int(diff * 3.5))
    elif diff >= -10:
        percentile = max(20, 50 + int(diff * 3.0))
    else:
        percentile = max(5, 20 + int((diff + 10) * 1.5))

    # 2. Hiring Band Assignment
    if percentile >= 85:
        band = "Top Tier"
    elif percentile >= 65:
        band = "Above Average"
    elif percentile >= 40:
        band = "Average"
    else:
        band = "Below Average"

    # 3. Relative Hiring Position Summary
    if hirescore >= INDUSTRY_LEVEL_BENCHMARKS["Staff"]:
        relative_position = "Staff Engineer Bar Exceeded"
    elif hirescore >= INDUSTRY_LEVEL_BENCHMARKS["Senior"]:
        relative_position = "Senior Ready"
    elif hirescore >= INDUSTRY_LEVEL_BENCHMARKS["Mid"]:
        relative_position = "Mid-Level Confirmed"
    elif hirescore >= INDUSTRY_LEVEL_BENCHMARKS["Junior"]:
        relative_position = "Junior Ready"
    else:
        relative_position = "Developing Foundational Rigor"

    return BenchmarkDetails(
        target_level=normalized_level,
        percentile=percentile,
        band=band,
        relative_position=relative_position,
        peer_averages=dict(INDUSTRY_LEVEL_BENCHMARKS),
    )
