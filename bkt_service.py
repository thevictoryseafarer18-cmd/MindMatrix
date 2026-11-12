import math
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from .. import models

# Standard BKT Default Parameters for Physics concepts
DEFAULT_P_L0 = 0.15   # Initial knowledge prior
DEFAULT_P_T = 0.20    # Probability of transit / learning
DEFAULT_P_G = 0.20    # Probability of guess
DEFAULT_P_S = 0.10    # Probability of slip

class BayesianKnowledgeTracingService:
    def __init__(self):
        self.p_l0 = DEFAULT_P_L0
        self.p_t = DEFAULT_P_T
        self.p_g = DEFAULT_P_G
        self.p_s = DEFAULT_P_S

    def update_concept_mastery(
        self,
        db: Session,
        user_id: int,
        concept_id: str,
        is_correct: bool,
        reasoning_quality: float = 0.5,
        confidence_reported: float = 0.5,
        response_time_seconds: float = 30.0,
        trigger_event: str = "question_attempt",
        reason: str = ""
    ) -> models.LearnerMastery:
        """
        Bayesian Knowledge Tracing (BKT) update enhanced with reasoning quality factor.
        """
        mastery = db.query(models.LearnerMastery).filter(
            models.LearnerMastery.user_id == user_id,
            models.LearnerMastery.concept_id == concept_id
        ).first()

        if not mastery:
            mastery = models.LearnerMastery(
                user_id=user_id,
                concept_id=concept_id,
                mastery_prob=self.p_l0,
                confidence_level=confidence_reported,
                attempts_count=0,
                correct_count=0,
                reasoning_quality_avg=reasoning_quality,
                response_time_avg=response_time_seconds,
                last_practiced=datetime.utcnow(),
                forgetting_risk=0.05,
                retention_score=0.95,
                misconception_count=0
            )
            db.add(mastery)
            db.flush()

        old_mastery = mastery.mastery_prob

        # Calibrate Slip and Guess based on reasoning quality:
        # If student has strong reasoning but slipped on calculation, P(Slip) is higher
        # If student guessed with no reasoning, P(Guess) is higher
        calibrated_slip = self.p_s
        calibrated_guess = self.p_g

        if reasoning_quality > 0.7:
            # Good reasoning: lower probability that a correct answer was a lucky guess
            calibrated_guess = max(0.05, calibrated_guess - 0.10)
            if not is_correct:
                # Likely an arithmetic or slip error rather than complete misconception
                calibrated_slip = min(0.35, calibrated_slip + 0.15)
        elif reasoning_quality < 0.3:
            # Poor/flawed reasoning: higher probability of guessing if correct
            calibrated_guess = min(0.40, calibrated_guess + 0.15)
            calibrated_slip = max(0.05, calibrated_slip - 0.05)

        # Standard BKT conditional update
        p_prev = old_mastery
        if is_correct:
            num = p_prev * (1.0 - calibrated_slip)
            den = num + (1.0 - p_prev) * calibrated_guess
            p_evidence = num / (den if den > 0 else 1.0)
        else:
            num = p_prev * calibrated_slip
            den = num + (1.0 - p_prev) * (1.0 - calibrated_guess)
            p_evidence = num / (den if den > 0 else 1.0)

        # Transition to new mastery state
        new_mastery = p_evidence + (1.0 - p_evidence) * self.p_t
        # Bound between 0.02 and 0.99
        new_mastery = max(0.02, min(0.99, new_mastery))

        # Update stats
        mastery.attempts_count += 1
        if is_correct:
            mastery.correct_count += 1
        else:
            if reasoning_quality < 0.4:
                mastery.misconception_count += 1

        # Exponential moving average for reasoning quality and response time
        alpha = 0.3
        mastery.reasoning_quality_avg = (1 - alpha) * mastery.reasoning_quality_avg + alpha * reasoning_quality
        mastery.response_time_avg = (1 - alpha) * mastery.response_time_avg + alpha * response_time_seconds
        mastery.confidence_level = (1 - alpha) * mastery.confidence_level + alpha * confidence_reported
        mastery.mastery_prob = round(new_mastery, 4)
        mastery.last_practiced = datetime.utcnow()
        mastery.forgetting_risk = 0.05  # reset immediately after practice
        mastery.retention_score = 0.98

        # Record history audit log
        history_entry = models.LearnerMasteryHistory(
            user_id=user_id,
            concept_id=concept_id,
            old_mastery=round(old_mastery, 4),
            new_mastery=round(new_mastery, 4),
            trigger_event=trigger_event,
            reason=reason or f"{'Correct' if is_correct else 'Incorrect'} attempt (rq={reasoning_quality:.2f})"
        )
        db.add(history_entry)

        # Prerequisite Propagation:
        # If student failed a complex concept due to misconception, also propagate small weakness to prerequisites
        # If student mastered a complex concept, slightly boost prerequisite confidence
        if not is_correct and reasoning_quality < 0.4:
            prereqs = db.query(models.ConceptPrerequisite).filter(
                models.ConceptPrerequisite.concept_id == concept_id
            ).all()
            for p in prereqs:
                p_mastery = db.query(models.LearnerMastery).filter(
                    models.LearnerMastery.user_id == user_id,
                    models.LearnerMastery.concept_id == p.prerequisite_id
                ).first()
                if p_mastery:
                    p_old = p_mastery.mastery_prob
                    # Dampened backward decay
                    p_new = max(0.05, p_old - (0.08 * p.strength))
                    p_mastery.mastery_prob = round(p_new, 4)
                    db.add(models.LearnerMasteryHistory(
                        user_id=user_id,
                        concept_id=p.prerequisite_id,
                        old_mastery=p_old,
                        new_mastery=p_new,
                        trigger_event="prerequisite_propagation",
                        reason=f"Deficit propagated from dependent concept '{concept_id}'"
                    ))

        db.commit()
        db.refresh(mastery)
        return mastery

    def recalculate_decay_and_forgetting(self, db: Session, user_id: int):
        """
        Computes Ebbinghaus decay risk based on days since practice and stability.
        """
        masteries = db.query(models.LearnerMastery).filter(
            models.LearnerMastery.user_id == user_id
        ).all()

        now = datetime.utcnow()
        for m in masteries:
            if not m.last_practiced:
                continue
            days_elapsed = (now - m.last_practiced).total_seconds() / 86400.0
            # Stability factor S scales with mastery probability and attempts
            stability_days = max(1.0, (m.mastery_prob * 14.0) * (1.0 + (m.attempts_count * 0.2)))
            # Retention R(t) = e^(-t / S)
            retention = math.exp(-days_elapsed / stability_days)
            forgetting_risk = 1.0 - retention

            m.retention_score = round(retention, 3)
            m.forgetting_risk = round(forgetting_risk, 3)

        db.commit()

bkt_service = BayesianKnowledgeTracingService()
