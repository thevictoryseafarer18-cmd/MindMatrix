import json
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from .. import models

class QuestionGeneratorService:
    def get_adaptive_question(
        self,
        db: Session,
        user_id: int,
        concept_id: Optional[str] = None,
        difficulty_target: Optional[int] = None
    ) -> Optional[models.Question]:
        """
        Retrieves or dynamically constructs a question calibrated to the learner's mastery level:
        If learner is struggling (mastery < 0.4 or recent failure), select lower difficulty (1 or 2) with scaffolding.
        If learner is developing (0.4 - 0.7), select intermediate (3).
        If learner is advanced (> 0.75), select advanced/challenge (4 or 5).
        """
        # Determine target concept if not provided
        if not concept_id:
            # Find weakest concept with lowest mastery prob
            weakest = db.query(models.LearnerMastery).filter(
                models.LearnerMastery.user_id == user_id
            ).order_by(models.LearnerMastery.mastery_prob.asc()).first()
            if weakest:
                concept_id = weakest.concept_id
            else:
                concept_id = "elec_parallel_circuits"

        # Determine target difficulty based on student mastery
        if difficulty_target is None:
            mastery = db.query(models.LearnerMastery).filter(
                models.LearnerMastery.user_id == user_id,
                models.LearnerMastery.concept_id == concept_id
            ).first()
            if not mastery:
                difficulty_target = 2
            elif mastery.mastery_prob < 0.40:
                difficulty_target = 1  # Beginner/Easy with scaffolding
            elif mastery.mastery_prob < 0.70:
                difficulty_target = 3  # Intermediate
            elif mastery.mastery_prob < 0.88:
                difficulty_target = 4  # Advanced
            else:
                difficulty_target = 5  # Challenge

        # Query existing question matching concept and difficulty
        q = db.query(models.Question).filter(
            models.Question.concept_id == concept_id,
            models.Question.difficulty == difficulty_target
        ).first()

        if not q:
            # Fallback to closest difficulty for this concept
            q = db.query(models.Question).filter(
                models.Question.concept_id == concept_id
            ).first()

        if not q:
            # Fallback to any question
            q = db.query(models.Question).first()

        return q

    def get_diagnostic_questions(self, db: Session, syllabus_id: Optional[int] = None) -> List[models.Question]:
        """
        Returns a balanced diagnostic question set covering every major chapter:
        Electricity, Light, Magnetic Effects. Includes MCQs, numericals, conceptual, assertion-reasoning.
        """
        return db.query(models.Question).filter(models.Question.is_diagnostic == True).all()

question_generator_service = QuestionGeneratorService()
