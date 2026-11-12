import math
from datetime import datetime, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from .. import models

class SpacedRepetitionService:
    def update_schedule(
        self,
        db: Session,
        user_id: int,
        concept_id: str,
        is_correct: bool,
        reasoning_quality: float = 0.5,
        confidence: float = 0.5
    ) -> models.RevisionSchedule:
        """
        SM-2 algorithmic schedule update.
        Quality score q (0-5) computed from correctness, reasoning quality, and confidence.
        """
        if is_correct:
            if reasoning_quality >= 0.8 and confidence >= 0.7:
                q = 5
            elif reasoning_quality >= 0.5:
                q = 4
            else:
                q = 3
        else:
            if reasoning_quality >= 0.6:  # calculation slip
                q = 2
            elif reasoning_quality >= 0.3:
                q = 1
            else:  # conceptual misconception / blind guess
                q = 0

        schedule = db.query(models.RevisionSchedule).filter(
            models.RevisionSchedule.user_id == user_id,
            models.RevisionSchedule.concept_id == concept_id
        ).first()

        now = datetime.utcnow()

        if not schedule:
            schedule = models.RevisionSchedule(
                user_id=user_id,
                concept_id=concept_id,
                scheduled_date=now + timedelta(days=1),
                repetition_number=0,
                interval_days=1.0,
                ease_factor=2.5,
                forgetting_prob=0.2,
                status="pending",
                last_reviewed_at=now
            )
            db.add(schedule)
            db.flush()

        ef = schedule.ease_factor
        rep = schedule.repetition_number
        interval = schedule.interval_days

        # SM-2 calculation
        if q >= 3:
            if rep == 0:
                interval = 1.0
            elif rep == 1:
                interval = 6.0
            else:
                interval = round(interval * ef, 1)
            rep += 1
        else:
            rep = 0
            interval = 1.0  # Reset interval on failure/misconception

        # Update Ease Factor
        ef = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
        ef = max(1.3, round(ef, 2))

        schedule.repetition_number = rep
        schedule.interval_days = interval
        schedule.ease_factor = ef
        schedule.last_reviewed_at = now
        schedule.scheduled_date = now + timedelta(days=interval)
        schedule.status = "pending"
        schedule.forgetting_prob = round(1.0 - math.exp(-interval / (interval * 1.5)), 3)

        db.commit()
        db.refresh(schedule)
        return schedule

    def get_user_revision_dashboard(self, db: Session, user_id: int) -> Dict[str, Any]:
        """
        Retrieves personalized revision calendar: Today's, Upcoming, Overdue, and High-Risk.
        """
        now = datetime.utcnow()
        today_start = datetime(now.year, now.month, now.day)
        today_end = today_start + timedelta(days=1)

        schedules = db.query(models.RevisionSchedule).filter(
            models.RevisionSchedule.user_id == user_id
        ).all()

        today_list = []
        upcoming_list = []
        overdue_list = []
        high_risk_list = []

        for s in schedules:
            concept = db.query(models.Concept).filter(models.Concept.id == s.concept_id).first()
            if not concept:
                continue

            chapter = concept.chapter
            mastery = db.query(models.LearnerMastery).filter(
                models.LearnerMastery.user_id == user_id,
                models.LearnerMastery.concept_id == s.concept_id
            ).first()
            mastery_prob = mastery.mastery_prob if mastery else 0.1

            # Recalculate dynamic forgetting risk based on time elapsed
            days_since = (now - s.last_reviewed_at).total_seconds() / 86400.0 if s.last_reviewed_at else 0.0
            stability = max(1.0, s.interval_days * (0.5 + mastery_prob))
            current_retention = math.exp(-days_since / stability)
            current_risk = round(1.0 - current_retention, 3)

            item = {
                "id": s.id,
                "concept_id": s.concept_id,
                "concept_title": concept.title,
                "chapter_title": chapter.title if chapter else "Class 10 Physics",
                "scheduled_date": s.scheduled_date.strftime("%Y-%m-%d"),
                "status": "due_today" if (s.scheduled_date <= today_end and s.scheduled_date >= today_start)
                          else ("overdue" if s.scheduled_date < today_start else "upcoming"),
                "repetition_number": s.repetition_number,
                "interval_days": s.interval_days,
                "forgetting_risk": current_risk,
                "mastery_prob": mastery_prob
            }

            if s.scheduled_date < today_start:
                overdue_list.append(item)
            elif s.scheduled_date <= today_end:
                today_list.append(item)
            else:
                upcoming_list.append(item)

            if current_risk >= 0.40:
                high_risk_list.append(item)

        return {
            "today_revisions": today_list,
            "upcoming_revisions": upcoming_list,
            "overdue_revisions": overdue_list,
            "high_risk_concepts": sorted(high_risk_list, key=lambda x: x["forgetting_risk"], reverse=True),
            "total_completed": len([s for s in schedules if s.repetition_number >= 3]),
            "streak_days": 5
        }

spaced_repetition_service = SpacedRepetitionService()
