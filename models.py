import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text, ForeignKey, DateTime
)
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    role = Column(String(20), default="student")  # 'student', 'teacher', 'admin'
    grade = Column(String(20), default="Class 10")
    avatar = Column(String(255), default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    enrollments = relationship("Enrollment", back_populates="user", cascade="all, delete-orphan")
    attempts = relationship("QuestionAttempt", back_populates="user")
    masteries = relationship("LearnerMastery", back_populates="user", cascade="all, delete-orphan")
    revision_schedules = relationship("RevisionSchedule", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("LearningSession", back_populates="user")


class ClassRoom(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    code = Column(String(50), unique=True, index=True, nullable=False)
    subject = Column(String(100), default="Science / Physics")
    grade = Column(String(20), default="Class 10")
    teacher_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    enrollments = relationship("Enrollment", back_populates="classroom", cascade="all, delete-orphan")
    assignments = relationship("TeacherAssignment", back_populates="classroom")


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    enrolled_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="enrollments")
    classroom = relationship("ClassRoom", back_populates="enrollments")


class Syllabus(Base):
    __tablename__ = "syllabi"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    board = Column(String(50), default="CBSE / NCERT")
    grade = Column(String(20), default="Class 10")
    description = Column(Text, default="")

    chapters = relationship("Chapter", back_populates="syllabus", cascade="all, delete-orphan")


class Chapter(Base):
    __tablename__ = "chapters"

    id = Column(Integer, primary_key=True, index=True)
    syllabus_id = Column(Integer, ForeignKey("syllabi.id"), nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    title = Column(String(150), nullable=False)
    sequence_order = Column(Integer, default=1)
    description = Column(Text, default="")
    icon = Column(String(50), default="Zap")

    syllabus = relationship("Syllabus", back_populates="chapters")
    concepts = relationship("Concept", back_populates="chapter", cascade="all, delete-orphan")


class Concept(Base):
    __tablename__ = "concepts"

    id = Column(String(50), primary_key=True, index=True)  # e.g., 'elec_ohm_law'
    chapter_id = Column(Integer, ForeignKey("chapters.id"), nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text, default="")
    learning_objectives = Column(Text, default="")
    difficulty_weight = Column(Float, default=1.0)
    category = Column(String(50), default="Physics")
    node_x = Column(Float, default=0.0)
    node_y = Column(Float, default=0.0)

    chapter = relationship("Chapter", back_populates="concepts")
    questions = relationship("Question", back_populates="concept")
    misconceptions = relationship("Misconception", back_populates="concept")
    prerequisites = relationship(
        "ConceptPrerequisite",
        foreign_keys="[ConceptPrerequisite.concept_id]",
        back_populates="concept"
    )
    dependents = relationship(
        "ConceptPrerequisite",
        foreign_keys="[ConceptPrerequisite.prerequisite_id]",
        back_populates="prerequisite"
    )


class ConceptPrerequisite(Base):
    __tablename__ = "concept_prerequisites"

    id = Column(Integer, primary_key=True, index=True)
    concept_id = Column(String(50), ForeignKey("concepts.id"), nullable=False)
    prerequisite_id = Column(String(50), ForeignKey("concepts.id"), nullable=False)
    strength = Column(Float, default=0.8)  # influence weight in BKT propagation

    concept = relationship("Concept", foreign_keys=[concept_id], back_populates="prerequisites")
    prerequisite = relationship("Concept", foreign_keys=[prerequisite_id], back_populates="dependents")


class Misconception(Base):
    __tablename__ = "misconceptions"

    id = Column(String(50), primary_key=True, index=True)  # e.g., 'MISC_SERIES_PARALLEL_ADD'
    concept_id = Column(String(50), ForeignKey("concepts.id"), nullable=False)
    label = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    why_incorrect = Column(Text, nullable=False)
    scientific_explanation = Column(Text, nullable=False)
    error_type = Column(String(50), default="Conceptual misunderstanding")
    corrective_hint = Column(Text, default="")

    concept = relationship("Concept", back_populates="misconceptions")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    concept_id = Column(String(50), ForeignKey("concepts.id"), nullable=False)
    difficulty = Column(Integer, default=2)  # 1: Beginner, 2: Easy, 3: Intermediate, 4: Advanced, 5: Challenge
    question_type = Column(String(50), default="mcq")  # mcq, numerical, conceptual, assertion_reason, reasoning
    prompt = Column(Text, nullable=False)
    options_json = Column(Text, default="[]")  # JSON list of options
    correct_answer = Column(Text, nullable=False)
    detailed_solution = Column(Text, nullable=False)
    expected_reasoning = Column(Text, default="")
    misconception_tags_json = Column(Text, default="[]")
    rubric_json = Column(Text, default="{}")
    scaffolding_hint = Column(Text, default="")
    is_diagnostic = Column(Boolean, default=False)

    concept = relationship("Concept", back_populates="questions")
    attempts = relationship("QuestionAttempt", back_populates="question")


class QuestionAttempt(Base):
    __tablename__ = "question_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    concept_id = Column(String(50), ForeignKey("concepts.id"), nullable=False)
    user_answer = Column(Text, nullable=False)
    is_correct = Column(Boolean, nullable=False)
    confidence_score = Column(Float, default=0.5)  # 0.0 to 1.0 (student self-reported or inferred)
    response_time_seconds = Column(Float, default=30.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="attempts")
    question = relationship("Question", back_populates="attempts")
    reasoning_response = relationship("ReasoningResponse", back_populates="attempt", uselist=False, cascade="all, delete-orphan")


class ReasoningResponse(Base):
    __tablename__ = "reasoning_responses"

    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("question_attempts.id"), nullable=False, unique=True)
    raw_reasoning = Column(Text, nullable=False)
    detected_misconception_id = Column(String(50), ForeignKey("misconceptions.id"), nullable=True)
    classification_confidence = Column(Float, default=0.0)
    error_type = Column(String(50), default="Conceptual misunderstanding")  # Conceptual, Calculation, Formula, Reading, Guessing, Correct Reasoning Wrong Final
    ai_explanation = Column(Text, default="")
    corrective_question_json = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    attempt = relationship("QuestionAttempt", back_populates="reasoning_response")
    misconception = relationship("Misconception")


class LearnerMastery(Base):
    __tablename__ = "learner_masteries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    concept_id = Column(String(50), ForeignKey("concepts.id"), nullable=False)
    mastery_prob = Column(Float, default=0.1)  # 0.0 to 1.0
    confidence_level = Column(Float, default=0.5)  # 0.0 to 1.0
    attempts_count = Column(Integer, default=0)
    correct_count = Column(Integer, default=0)
    reasoning_quality_avg = Column(Float, default=0.5)  # 0.0 to 1.0
    response_time_avg = Column(Float, default=45.0)
    last_practiced = Column(DateTime, default=datetime.datetime.utcnow)
    forgetting_risk = Column(Float, default=0.0)  # 0.0 to 1.0
    retention_score = Column(Float, default=1.0)
    misconception_count = Column(Integer, default=0)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="masteries")
    concept = relationship("Concept")


class LearnerMasteryHistory(Base):
    __tablename__ = "learner_mastery_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    concept_id = Column(String(50), ForeignKey("concepts.id"), nullable=False)
    old_mastery = Column(Float, nullable=False)
    new_mastery = Column(Float, nullable=False)
    trigger_event = Column(String(50), default="question_attempt")  # 'diagnostic', 'thinktrace', 'practice', 'decay'
    reason = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class RevisionSchedule(Base):
    __tablename__ = "revision_schedules"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    concept_id = Column(String(50), ForeignKey("concepts.id"), nullable=False)
    scheduled_date = Column(DateTime, nullable=False)
    repetition_number = Column(Integer, default=0)
    interval_days = Column(Float, default=1.0)
    ease_factor = Column(Float, default=2.5)  # SM-2 EF standard
    forgetting_prob = Column(Float, default=0.2)
    status = Column(String(20), default="pending")  # 'pending', 'completed', 'overdue'
    last_reviewed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="revision_schedules")
    concept = relationship("Concept")


class TeacherAssignment(Base):
    __tablename__ = "teacher_assignments"

    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    title = Column(String(150), nullable=False)
    target_concept_ids_json = Column(Text, default="[]")
    description = Column(Text, default="")
    due_date = Column(DateTime, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(20), default="active")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    classroom = relationship("ClassRoom", back_populates="assignments")


class LearningSession(Base):
    __tablename__ = "learning_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_type = Column(String(50), default="practice")  # 'diagnostic', 'thinktrace', 'spaced_revision', 'free_practice'
    score = Column(Float, default=0.0)
    questions_attempted = Column(Integer, default=0)
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="sessions")
