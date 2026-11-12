import re
import json
from typing import Dict, Any, Optional, Tuple, List
from sqlalchemy.orm import Session
from .. import models

PHYSICS_MISCONCEPTION_TAXONOMY = {
    "MISC_ELEC_SERIES_PARALLEL_ADD": {
        "concept_id": "elec_parallel_circuits",
        "label": "Confusing series and parallel resistance behavior",
        "description": "Believing that connecting additional resistors in parallel increases equivalent resistance because 'more resistors means more resistance'.",
        "why_incorrect": "In parallel circuits, adding a resistor opens a new independent conductive branch for current flow. Total conductance increases, so the equivalent resistance (1/Req = 1/R1 + 1/R2) always decreases below the smallest individual resistance.",
        "scientific_explanation": "In a parallel arrangement, the potential difference across each resistor is identical. The total current is the sum of branch currents: I_total = I1 + I2 = V/R1 + V/R2 = V(1/R1 + 1/R2). Therefore, adding parallel pathways always reduces equivalent resistance.",
        "error_type": "Conceptual misunderstanding",
        "keywords": ["increase", "increases", "added", "more resistors", "sum", "greater", "adds up", "series formula"],
        "corrective_hint": "Think of highway toll booths: opening an additional toll lane in parallel never slows down overall traffic; it provides an extra path so overall resistance to traffic decreases.",
        "corrective_question": {
            "id": 901,
            "prompt": "If two identical 10 Ω resistors are connected in parallel across a 12 V battery, what is the equivalent resistance of the circuit?",
            "options": [
                {"id": "a", "text": "20 Ω (Resistors add up directly)"},
                {"id": "b", "text": "5 Ω (Equivalent resistance is halved)"},
                {"id": "c", "text": "10 Ω (Stays the same as one resistor)"},
                {"id": "d", "text": "0.1 Ω (Conductance value)"}
            ],
            "correct_answer": "b",
            "detailed_solution": "For two identical resistors in parallel: 1/Req = 1/10 + 1/10 = 2/10 = 1/5, so Req = 5 Ω.",
            "scaffolding_hint": "Use the reciprocal formula 1/Req = 1/R1 + 1/R2. Notice that 5 Ω is smaller than either 10 Ω resistor!"
        }
    },
    "MISC_ELEC_CURRENT_CONSUMED": {
        "concept_id": "elec_series_circuits",
        "label": "Current consumption fallacy in series circuits",
        "description": "Believing that electric current gets 'used up' or diminished as it passes through sequential components in a series loop.",
        "why_incorrect": "Charge is strictly conserved. Electrons do not vanish; they transfer electrical potential energy into thermal/light energy. The rate of charge flow (current) is identical at every point in a continuous series loop.",
        "scientific_explanation": "According to the principle of conservation of electric charge, the current leaving the battery terminal must equal the current returning to it. In series, I1 = I2 = ... = I_total everywhere.",
        "error_type": "Conceptual misunderstanding",
        "keywords": ["used up", "consumed", "gets less", "decreases along", "first bulb gets more", "absorbs current"],
        "corrective_hint": "Current is like a closed bicycle chain: every link moves at the exact same rate. Energy is transferred, but chain links (charges) are neither created nor destroyed.",
        "corrective_question": {
            "id": 902,
            "prompt": "Two light bulbs A and B are connected in series. An ammeter placed before bulb A reads 2.0 A. What will an ammeter placed after bulb B read?",
            "options": [
                {"id": "a", "text": "Less than 2.0 A because bulb A consumed current"},
                {"id": "b", "text": "Exactly 2.0 A because current is constant throughout a series loop"},
                {"id": "c", "text": "More than 2.0 A due to accumulated charge"},
                {"id": "d", "text": "0 A because the current has finished its work"}
            ],
            "correct_answer": "b",
            "detailed_solution": "Current is constant everywhere in a series circuit (I = 2.0 A). Bulbs dissipate electrical energy into light and heat, not charge.",
            "scaffolding_hint": "Remember: Charge cannot be destroyed or accumulated at any junction in a continuous loop."
        }
    },
    "MISC_LIGHT_FOCAL_DIAMETER": {
        "concept_id": "light_spherical_mirrors",
        "label": "Confusing mirror focal length with radius or physical aperture size",
        "description": "Assuming that cutting or covering half of a concave mirror changes its focal length.",
        "why_incorrect": "Focal length of a spherical mirror depends solely on its geometric radius of curvature (f = R / 2). Covering or masking part of the mirror reduces image brightness, not focal length.",
        "scientific_explanation": "The focal length f is determined geometrically by f = R/2. Covering half the aperture reduces the number of rays reflecting to form the image, causing lower intensity, but the focal point remains unchanged.",
        "error_type": "Formula confusion",
        "keywords": ["half focal length", "focal length halves", "focal changes", "depends on size", "aperture"],
        "corrective_hint": "Every section of a spherical mirror shares the exact same center of curvature C, hence f = R/2 is invariant.",
        "corrective_question": {
            "id": 903,
            "prompt": "The lower half of a concave mirror's reflecting surface is covered with an opaque black paper. What happens to the image of an object placed at 2F?",
            "options": [
                {"id": "a", "text": "Only the upper half of the object's image is formed"},
                {"id": "b", "text": "The complete image is formed, but with reduced brightness (intensity)"},
                {"id": "c", "text": "The focal length doubles and the image shifts to F"},
                {"id": "d", "text": "No image is formed because half the rays are blocked"}
            ],
            "correct_answer": "b",
            "detailed_solution": "Rays from every point of the object reflect off the uncovered upper half to produce a complete image; fewer rays reach the screen, so brightness is halved.",
            "scaffolding_hint": "Each point on an object emits infinite light rays in all directions toward every part of the mirror."
        }
    },
    "MISC_MAG_LINES_CROSS": {
        "concept_id": "mag_field_lines",
        "label": "Believing magnetic field lines can intersect",
        "description": "Thinking magnetic field lines can cross each other in strong magnetic fields or at magnetic poles.",
        "why_incorrect": "At any spatial point, the magnetic field vector B has a unique, unambiguous direction. If two lines crossed, a compass needle placed at that intersection would have to point in two directions simultaneously, which is physically impossible.",
        "scientific_explanation": "The tangent to a magnetic field line at any point indicates the direction of the net magnetic field. Since net field at any single point is unique, field lines can never cross or touch.",
        "error_type": "Conceptual misunderstanding",
        "keywords": ["lines cross", "intersect", "touch at poles", "cross in strong", "multiple directions"],
        "corrective_hint": "Place a miniature compass needle at the hypothetical intersection: can it point both North and East at once?",
        "corrective_question": {
            "id": 904,
            "prompt": "Why can two magnetic field lines never be found intersecting each other?",
            "options": [
                {"id": "a", "text": "Because field lines repel each other electrostatically"},
                {"id": "b", "text": "Because at the intersection, a compass needle would indicate two simultaneous directions of net field"},
                {"id": "c", "text": "Because field lines only exist outside a magnet"},
                {"id": "d", "text": "Because the magnetic field becomes zero between lines"}
            ],
            "correct_answer": "b",
            "detailed_solution": "The tangent indicates net field direction; a single physical point cannot possess two net field vectors simultaneously.",
            "scaffolding_hint": "Think about the vector nature of magnetic force."
        }
    }
}

class MisconceptionDetectionService:
    def analyze_reasoning(
        self,
        db: Session,
        question: models.Question,
        user_answer: str,
        student_reasoning: str,
        is_correct: bool
    ) -> Dict[str, Any]:
        """
        Deep analysis of student reasoning.
        Distinguishes:
        - Conceptual misunderstanding
        - Calculation error
        - Formula confusion
        - Reading mistake
        - Guessing
        - Correct reasoning with incorrect final answer
        - Insufficient reasoning (triggers clarifying follow-up)
        """
        raw_text = (student_reasoning or "").strip().lower()

        # Check for insufficient reasoning
        insufficient_phrases = ["i guessed", "guess", "idk", "not sure", "just picked", "dunno", "random", "no idea", "lucky"]
        if len(raw_text) < 12 or any(p in raw_text for p in insufficient_phrases):
            return {
                "detected": False,
                "is_insufficient": True,
                "error_type": "Guessing" if any(p in raw_text for p in insufficient_phrases) else "Insufficient Reasoning",
                "classification_confidence": 0.45,
                "reasoning_quality": 0.15,
                "explanation": "Your reasoning was too brief or indicated a guess. To help pinpoint your understanding, could you explain what rule or formula you considered?",
                "misconception_id": None,
                "misconception_label": None,
                "why_incorrect": "Scientific intuition requires articulating the physical relationship behind the answer.",
                "scientific_explanation": question.detailed_solution,
                "corrective_exercise": None,
                "short_intervention": "Try stating the formula or physical law governing this problem."
            }

        # Check for correct reasoning with incorrect final answer (e.g. calculation / sign slip)
        if not is_correct:
            # Check if student wrote correct formula/concepts
            correct_indicators = ["1/req = 1/r1 + 1/r2", "reciprocal", "conductance", "f = r/2", "tangent to field", "i = v/r"]
            if any(ind in raw_text for ind in correct_indicators):
                return {
                    "detected": False,
                    "is_insufficient": False,
                    "error_type": "Calculation error",
                    "classification_confidence": 0.88,
                    "reasoning_quality": 0.75,
                    "explanation": "Your conceptual reasoning is sound! You correctly identified the governing physical principle, but likely made an arithmetic or substitution slip in the final calculation.",
                    "misconception_id": None,
                    "misconception_label": "Arithmetic / Calculation Slip",
                    "why_incorrect": "The conceptual relationship chosen was correct, but the numerical computation resulted in the wrong option.",
                    "scientific_explanation": question.detailed_solution,
                    "corrective_exercise": None,
                    "short_intervention": "Double check your fraction addition and reciprocal step."
                }

        # Check known misconceptions in taxonomy matching question concept
        concept_id = question.concept_id
        matched_misc = None
        matched_conf = 0.0

        for m_id, m_data in PHYSICS_MISCONCEPTION_TAXONOMY.items():
            if m_data["concept_id"] == concept_id or concept_id in m_data["concept_id"]:
                # Check keyword overlap
                kw_matches = sum(1 for kw in m_data["keywords"] if kw in raw_text)
                if kw_matches > 0:
                    conf = min(0.96, 0.70 + (kw_matches * 0.10))
                    if conf > matched_conf:
                        matched_conf = conf
                        matched_misc = (m_id, m_data)

        # Fallback keyword match across all misconceptions
        if not matched_misc:
            for m_id, m_data in PHYSICS_MISCONCEPTION_TAXONOMY.items():
                kw_matches = sum(1 for kw in m_data["keywords"] if kw in raw_text)
                if kw_matches >= 2:
                    matched_conf = 0.85
                    matched_misc = (m_id, m_data)
                    break

        if matched_misc and not is_correct:
            m_id, m_data = matched_misc
            return {
                "detected": True,
                "is_insufficient": False,
                "error_type": m_data["error_type"],
                "classification_confidence": matched_conf,
                "reasoning_quality": 0.25,
                "explanation": f"Your answer was incorrect because you applied the {m_data['label'].lower()}.",
                "misconception_id": m_id,
                "misconception_label": m_data["label"],
                "why_incorrect": m_data["why_incorrect"],
                "scientific_explanation": m_data["scientific_explanation"],
                "corrective_exercise": m_data.get("corrective_question"),
                "short_intervention": m_data["corrective_hint"]
            }

        # If incorrect without specific taxonomy match
        if not is_correct:
            return {
                "detected": False,
                "is_insufficient": False,
                "error_type": "Formula confusion" if ("formula" in raw_text or "equation" in raw_text) else "Conceptual misunderstanding",
                "classification_confidence": 0.72,
                "reasoning_quality": 0.40,
                "explanation": "Your reasoning shows partial familiarity with the topic, but applies the wrong physical relationship for this configuration.",
                "misconception_id": None,
                "misconception_label": "Unclassified Conceptual Confusion",
                "why_incorrect": f"The reasoning states '{student_reasoning[:120]}...', which diverges from the standard physical laws for {question.concept_id}.",
                "scientific_explanation": question.detailed_solution,
                "corrective_exercise": None,
                "short_intervention": "Review the fundamental definitions and try setting up the relationship step by step."
            }

        # If answer is correct
        return {
            "detected": False,
            "is_insufficient": False,
            "error_type": "Correct reasoning with sound scientific basis",
            "classification_confidence": 0.94,
            "reasoning_quality": 0.90,
            "explanation": "Outstanding! Your explanation demonstrates clear conceptual understanding and rigorous physical reasoning.",
            "misconception_id": None,
            "misconception_label": None,
            "why_incorrect": None,
            "scientific_explanation": question.detailed_solution,
            "corrective_exercise": None,
            "short_intervention": "Keep maintaining this high level of explanatory precision."
        }

misconception_service = MisconceptionDetectionService()
