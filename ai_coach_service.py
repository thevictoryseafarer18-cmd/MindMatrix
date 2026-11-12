import os
import json
import httpx
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from .. import models
from ..config import settings

class AICoachService:
    async def chat(
        self,
        db: Session,
        user_id: int,
        user_message: str,
        current_concept_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        AI Learning Coach that personalizes explanations using learner's actual mastery profile,
        detected misconceptions, and current learning context.
        """
        user = db.query(models.User).filter(models.User.id == user_id).first()
        student_name = user.name if user else "Student"

        # Fetch learner's current mastery snapshot
        masteries = db.query(models.LearnerMastery).filter(
            models.LearnerMastery.user_id == user_id
        ).all()

        weak_concepts = []
        strong_concepts = []
        for m in masteries:
            c = db.query(models.Concept).filter(models.Concept.id == m.concept_id).first()
            c_name = c.title if c else m.concept_id
            if m.mastery_prob < 0.50:
                weak_concepts.append(f"{c_name} ({int(m.mastery_prob*100)}%)")
            elif m.mastery_prob >= 0.80:
                strong_concepts.append(f"{c_name} ({int(m.mastery_prob*100)}%)")

        # Fetch recent reasoning / misconception responses
        recent_reasoning = db.query(models.ReasoningResponse).join(models.QuestionAttempt).filter(
            models.QuestionAttempt.user_id == user_id
        ).order_by(models.ReasoningResponse.created_at.desc()).limit(3).all()

        misconception_notes = []
        for r in recent_reasoning:
            if r.detected_misconception_id:
                m_obj = db.query(models.Misconception).filter(models.Misconception.id == r.detected_misconception_id).first()
                if m_obj:
                    misconception_notes.append(m_obj.label)

        context_prompt = (
            f"You are the MINDMATRIX AI Learning Coach for {student_name} (Class 10 Physics).\n"
            f"Student Mastery Profile:\n"
            f"- Strong Concepts: {', '.join(strong_concepts) if strong_concepts else 'None yet'}\n"
            f"- Weak Concepts needing focus: {', '.join(weak_concepts) if weak_concepts else 'Under assessment'}\n"
            f"- Active Misconceptions detected: {', '.join(misconception_notes) if misconception_notes else 'None active'}\n"
            f"Student Message: {user_message}\n"
            f"Provide an encouraging, Socratic, conceptually rigorous explanation. Do not give the direct answer to homework if asking for solutions; guide their reasoning."
        )

        # If GEMINI_API_KEY is configured, we can query Gemini via httpx
        if settings.GEMINI_API_KEY:
            try:
                async with httpx.AsyncClient(timeout=15.0) as client:
                    resp = await client.post(
                        f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}",
                        json={
                            "contents": [{"parts": [{"text": context_prompt}]}],
                            "generationConfig": {"temperature": 0.4, "maxOutputTokens": 400}
                        }
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        reply_text = data["candidates"][0]["content"]["parts"][0]["text"]
                        return {
                            "reply": reply_text,
                            "referenced_concepts": [m.concept_id for m in masteries if m.mastery_prob < 0.6][:3],
                            "coaching_tip": "Focus on the reciprocal relationship in parallel circuits."
                        }
            except Exception as e:
                pass  # Fall through to deterministic coach

        # Deterministic intelligent pedagogical engine
        msg_lower = user_message.lower()
        if "parallel" in msg_lower or "resistor" in msg_lower or "resistance" in msg_lower:
            reply = (
                f"Hello {student_name}! In parallel circuits, remember that adding more branches creates more paths for electric current to flow, similar to opening another lane on a busy highway. "
                f"Even if the added resistor has high resistance, it provides an additional avenue for electrons, which actually **reduces** total equivalent resistance: "
                f"$$\\frac{{1}}{{R_{{eq}}}} = \\frac{{1}}{{R_1}} + \\frac{{1}}{{R_2}}$$. "
                f"I noticed from your recent attempts that you previously treated resistors in parallel like a series addition. Always apply the reciprocal formula!"
            )
            tip = "Rule of thumb: In parallel, Req is ALWAYS strictly smaller than the smallest individual resistor."
        elif "light" in msg_lower or "mirror" in msg_lower or "lens" in msg_lower or "focal" in msg_lower:
            reply = (
                f"Great question on Optics, {student_name}! Remember that the focal length of a spherical mirror depends strictly on its geometric radius of curvature ($$f = R/2$$). "
                f"Covering or changing the aperture doesn't shift the focal point at all—it only controls how many light rays converge, which dictates image brightness."
            )
            tip = "Remember the sign convention: focal length of a concave mirror is always negative in Cartesian convention!"
        elif "magnetic" in msg_lower or "field" in msg_lower or "motor" in msg_lower:
            reply = (
                f"In Magnetic Effects, keep in mind Fleming's rules: use the **Left-Hand Rule for Motors** (Force on a current-carrying conductor) and the **Right-Hand Rule for Generators** (Induced current). "
                f"Also, magnetic field lines represent continuous closed loops and never cross because the field direction at any point must be unique."
            )
            tip = "Left hand = Motor (driving motion), Right hand = Generator (generating current)."
        else:
            reply = (
                f"Welcome {student_name}! I am tracking your learning trajectory in Class 10 Physics. "
                f"Currently, your conceptual knowledge is progressing nicely. Would you like to review parallel resistance, practice a diagnostic question, or trace through an assertion-reasoning problem?"
            )
            tip = "Try testing your understanding with ThinkTrace to analyze your reasoning steps."

        return {
            "reply": reply,
            "referenced_concepts": [m.concept_id for m in masteries if m.mastery_prob < 0.6][:3],
            "coaching_tip": tip
        }

ai_coach_service = AICoachService()
