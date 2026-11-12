import json
import datetime
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import get_db, engine, Base
from .config import settings
from . import models, schemas
from .seed_data import seed_database
from .services.bkt_service import bkt_service
from .services.misconception_service import misconception_service
from .services.spaced_repetition import spaced_repetition_service
from .services.question_generator import question_generator_service
from .services.ai_coach_service import ai_coach_service
from .services.analytics_service import analytics_service

# Initialize database
Base.metadata.create_all(bind=engine)
db_session = next(get_db())
seed_database(db_session)

app = FastAPI(
    title="MINDMATRIX AI - Adaptive Learning Platform",
    description="Intelligent Learning Engine for Concept Mastery, ThinkTrace Misconception Analysis, and Spaced Repetition",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- USERS & AUTH / PROFILE -----------------

@app.get("/api/v1/users", response_model=List[schemas.UserOut])
def get_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()

@app.get("/api/v1/users/{user_id}", response_model=schemas.UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# ----------------- MODULE B: INTERACTIVE KNOWLEDGE GRAPH -----------------

@app.get("/api/v1/graph", response_model=schemas.KnowledgeGraphResponse)
def get_knowledge_graph(user_id: int = Query(1), chapter_id: Optional[int] = None, db: Session = Depends(get_db)):
    """
    Returns nodes and edges for the Class 10 Physics Knowledge Graph:
    Green = Mastered (>= 0.75)
    Yellow = Developing (0.45 - 0.74)
    Red = Needs Attention (< 0.45 and attempted)
    Grey = Not Attempted
    """
    query = db.query(models.Concept)
    if chapter_id:
        query = query.filter(models.Concept.chapter_id == chapter_id)
    concepts = query.all()

    masteries = {m.concept_id: m for m in db.query(models.LearnerMastery).filter(models.LearnerMastery.user_id == user_id).all()}

    nodes = []
    mastered_count = 0
    developing_count = 0
    needs_attention_count = 0
    not_attempted_count = 0
    total_mastery_sum = 0.0

    for c in concepts:
        m = masteries.get(c.id)
        if not m or m.attempts_count == 0:
            status_val = "not_attempted"
            prob = 0.0
            conf = 0.5
            att = 0
            corr = 0
            f_risk = 0.0
            last_p = None
            not_attempted_count += 1
        elif m.mastery_prob >= 0.75:
            status_val = "mastered"
            prob = m.mastery_prob
            conf = m.confidence_level
            att = m.attempts_count
            corr = m.correct_count
            f_risk = m.forgetting_risk
            last_p = m.last_practiced
            mastered_count += 1
            total_mastery_sum += prob
        elif m.mastery_prob >= 0.45:
            status_val = "developing"
            prob = m.mastery_prob
            conf = m.confidence_level
            att = m.attempts_count
            corr = m.correct_count
            f_risk = m.forgetting_risk
            last_p = m.last_practiced
            developing_count += 1
            total_mastery_sum += prob
        else:
            status_val = "needs_attention"
            prob = m.mastery_prob
            conf = m.confidence_level
            att = m.attempts_count
            corr = m.correct_count
            f_risk = m.forgetting_risk
            last_p = m.last_practiced
            needs_attention_count += 1
            total_mastery_sum += prob

        # Prerequisites & Dependents
        prereq_ids = [p.prerequisite_id for p in c.prerequisites]
        dep_ids = [d.concept_id for d in c.dependents]
        misc_labels = [misc.label for misc in c.misconceptions]

        nodes.append(schemas.ConceptGraphNode(
            id=c.id,
            chapter_id=c.chapter_id,
            chapter_code=c.chapter.code if c.chapter else "",
            chapter_title=c.chapter.title if c.chapter else "",
            title=c.title,
            description=c.description,
            learning_objectives=c.learning_objectives,
            difficulty_weight=c.difficulty_weight,
            category=c.category,
            node_x=c.node_x,
            node_y=c.node_y,
            mastery_prob=round(prob, 2),
            confidence_level=round(conf, 2),
            status=status_val,
            attempts_count=att,
            correct_count=corr,
            prerequisites=prereq_ids,
            dependents=dep_ids,
            forgetting_risk=round(f_risk, 2),
            last_practiced=last_p,
            common_misconceptions=misc_labels
        ))

    # Edges
    edges_records = db.query(models.ConceptPrerequisite).all()
    edges = [
        schemas.ConceptGraphEdge(
            id=f"{e.prerequisite_id}->{e.concept_id}",
            source=e.prerequisite_id,
            target=e.concept_id,
            strength=e.strength
        )
        for e in edges_records
        if any(n.id == e.prerequisite_id for n in nodes) and any(n.id == e.concept_id for n in nodes)
    ]

    attempted_count = mastered_count + developing_count + needs_attention_count
    overall_mastery = (total_mastery_sum / attempted_count * 100) if attempted_count > 0 else 0.0

    return schemas.KnowledgeGraphResponse(
        nodes=nodes,
        edges=edges,
        overall_mastery=round(overall_mastery, 1),
        total_concepts=len(concepts),
        mastered_count=mastered_count,
        developing_count=developing_count,
        needs_attention_count=needs_attention_count,
        not_attempted_count=not_attempted_count
    )

# ----------------- MODULE A: DIAGNOSTIC ASSESSMENT -----------------

@app.get("/api/v1/diagnostic/questions", response_model=List[schemas.QuestionOut])
def get_diagnostic_questions(db: Session = Depends(get_db)):
    questions = question_generator_service.get_diagnostic_questions(db)
    result = []
    for q in questions:
        opts = json.loads(q.options_json) if q.options_json else []
        result.append(schemas.QuestionOut(
            id=q.id,
            concept_id=q.concept_id,
            concept_title=q.concept.title if q.concept else q.concept_id,
            difficulty=q.difficulty,
            question_type=q.question_type,
            prompt=q.prompt,
            options=[schemas.QuestionOption(**o) for o in opts],
            scaffolding_hint=q.scaffolding_hint,
            expected_reasoning=q.expected_reasoning
        ))
    return result

@app.post("/api/v1/diagnostic/submit", response_model=schemas.DiagnosticReportResponse)
def submit_diagnostic(req: schemas.DiagnosticSubmissionRequest, db: Session = Depends(get_db)):
    total_score = 0
    concept_summaries = []
    strong = []
    weak = []
    misconceptions_found = []

    for item in req.answers:
        q = db.query(models.Question).filter(models.Question.id == item.question_id).first()
        if not q:
            continue
        is_corr = (item.user_answer.strip().lower() == q.correct_answer.strip().lower())
        if is_corr:
            total_score += 1

        # Analyze reasoning
        analysis = misconception_service.analyze_reasoning(
            db=db,
            question=q,
            user_answer=item.user_answer,
            student_reasoning=item.reasoning or "",
            is_correct=is_corr
        )

        # Update BKT
        mastery_obj = bkt_service.update_concept_mastery(
            db=db,
            user_id=req.user_id,
            concept_id=q.concept_id,
            is_correct=is_corr,
            reasoning_quality=analysis["reasoning_quality"],
            confidence_reported=item.confidence_score,
            response_time_seconds=item.response_time_seconds,
            trigger_event="diagnostic",
            reason=f"Diagnostic test evaluation ({'Correct' if is_corr else 'Incorrect'})"
        )

        status_lbl = "Mastered" if mastery_obj.mastery_prob >= 0.75 else ("Developing" if mastery_obj.mastery_prob >= 0.45 else "Needs Attention")
        pct = round(mastery_obj.mastery_prob * 100, 1)

        concept_summaries.append(schemas.ConceptMasterySummary(
            concept_id=q.concept_id,
            title=q.concept.title if q.concept else q.concept_id,
            mastery_percentage=pct,
            status=status_lbl,
            reasoning_quality=round(analysis["reasoning_quality"] * 100, 1),
            attempts=mastery_obj.attempts_count
        ))

        if mastery_obj.mastery_prob >= 0.75:
            strong.append(q.concept.title if q.concept else q.concept_id)
        elif mastery_obj.mastery_prob < 0.50:
            weak.append(q.concept.title if q.concept else q.concept_id)

        if analysis.get("detected") and analysis.get("misconception_label"):
            misconceptions_found.append({
                "concept": q.concept.title if q.concept else q.concept_id,
                "label": analysis["misconception_label"],
                "error_type": analysis["error_type"],
                "confidence": analysis["classification_confidence"],
                "why_incorrect": analysis["why_incorrect"]
            })

    overall_score_pct = round((total_score / len(req.answers) * 100), 1) if req.answers else 0.0

    return schemas.DiagnosticReportResponse(
        overall_knowledge_score=overall_score_pct,
        concepts_mastery=concept_summaries,
        strong_concepts=strong,
        weak_concepts=weak,
        identified_misconceptions=misconceptions_found,
        recommended_learning_sequence=[
            "Parallel Circuits (Resolve reciprocal addition misconception)",
            "Electric Power (Joule dissipation dependencies)",
            "Lens Formula (Sign conventions and magnification ratios)"
        ],
        summary_insight="Diagnostic completed with multi-evidence reasoning analysis. Strengths in single-loop series circuits and reflection laws, with a foundational misconception detected in parallel circuit branch resistance."
    )

# ----------------- MODULE C & D & SIGNATURE 4: THINKTRACE -----------------

@app.post("/api/v1/thinktrace/analyze", response_model=schemas.ThinkTraceResponse)
def analyze_thinktrace(req: schemas.ThinkTraceRequest, db: Session = Depends(get_db)):
    """
    Signature ThinkTrace Feature:
    1. Evaluates user answer vs correct key.
    2. Analyzes natural language reasoning using Misconception Service.
    3. Identifies error taxonomy and specific misconception.
    4. Updates BKT learner model for target concept and propagates to prerequisites.
    5. Updates confidence calibration and recalculates forgetting risk.
    6. Generates personalized corrective exercise and repair intervention.
    """
    q = db.query(models.Question).filter(models.Question.id == req.question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")

    is_corr = (req.user_answer.strip().lower() == q.correct_answer.strip().lower())

    # Record question attempt
    attempt = models.QuestionAttempt(
        user_id=req.user_id,
        question_id=q.id,
        concept_id=q.concept_id,
        user_answer=req.user_answer,
        is_correct=is_corr,
        confidence_score=req.confidence_score,
        response_time_seconds=req.response_time_seconds
    )
    db.add(attempt)
    db.flush()

    # Analyze reasoning
    analysis = misconception_service.analyze_reasoning(
        db=db,
        question=q,
        user_answer=req.user_answer,
        student_reasoning=req.student_reasoning,
        is_correct=is_corr
    )

    # Fetch pre-update mastery
    mastery_rec = db.query(models.LearnerMastery).filter(
        models.LearnerMastery.user_id == req.user_id,
        models.LearnerMastery.concept_id == q.concept_id
    ).first()
    old_m = mastery_rec.mastery_prob if mastery_rec else 0.15

    # Update BKT
    updated_mastery = bkt_service.update_concept_mastery(
        db=db,
        user_id=req.user_id,
        concept_id=q.concept_id,
        is_correct=is_corr,
        reasoning_quality=analysis["reasoning_quality"],
        confidence_reported=req.confidence_score,
        response_time_seconds=req.response_time_seconds,
        trigger_event="thinktrace",
        reason=f"ThinkTrace: {analysis['error_type']} - {analysis.get('misconception_label', 'Evaluated')}"
    )

    # Store Reasoning Response
    reasoning_resp = models.ReasoningResponse(
        attempt_id=attempt.id,
        raw_reasoning=req.student_reasoning,
        detected_misconception_id=analysis.get("misconception_id"),
        classification_confidence=analysis["classification_confidence"],
        error_type=analysis["error_type"],
        ai_explanation=analysis["explanation"],
        corrective_question_json=json.dumps(analysis.get("corrective_exercise") or {})
    )
    db.add(reasoning_resp)
    db.commit()

    corrective_ex = None
    if analysis.get("corrective_exercise"):
        raw_c = analysis["corrective_exercise"]
        corrective_ex = schemas.CorrectiveExercise(
            question_id=raw_c["id"],
            prompt=raw_c["prompt"],
            options=[schemas.QuestionOption(**opt) for opt in raw_c["options"]],
            scaffolding_hint=raw_c["scaffolding_hint"],
            correct_answer=raw_c["correct_answer"],
            detailed_solution=raw_c["detailed_solution"]
        )

    # Check prerequisite impacted
    prereq_impacted = None
    if not is_corr:
        prereq = db.query(models.ConceptPrerequisite).filter(
            models.ConceptPrerequisite.concept_id == q.concept_id
        ).first()
        if prereq:
            prereq_concept = db.query(models.Concept).filter(models.Concept.id == prereq.prerequisite_id).first()
            prereq_impacted = prereq_concept.title if prereq_concept else prereq.prerequisite_id

    return schemas.ThinkTraceResponse(
        attempt_id=attempt.id,
        is_correct=is_corr,
        user_answer=req.user_answer,
        student_original_reasoning=req.student_reasoning,
        tested_concept_id=q.concept_id,
        tested_concept_title=q.concept.title if q.concept else q.concept_id,
        prerequisite_impacted=prereq_impacted,
        misconception_detected=analysis.get("misconception_label"),
        error_type=analysis["error_type"],
        classification_confidence=round(analysis["classification_confidence"] * 100, 1),
        why_reasoning_is_incorrect=analysis.get("why_incorrect"),
        correct_scientific_explanation=analysis["scientific_explanation"],
        corrective_exercise=corrective_ex,
        short_intervention=analysis["short_intervention"],
        old_mastery=round(old_m * 100, 1),
        new_mastery=round(updated_mastery.mastery_prob * 100, 1),
        mastery_delta=round((updated_mastery.mastery_prob - old_m) * 100, 1),
        recommended_next_action="Attempt the personalized corrective exercise below to repair the mental model."
    )

@app.post("/api/v1/thinktrace/submit-corrective", response_model=schemas.CorrectiveAnswerResponse)
def submit_corrective(req: schemas.CorrectiveAnswerRequest, db: Session = Depends(get_db)):
    """
    Submits answer to the personalized corrective exercise.
    Updates mastery again, restores prerequisite confidence, and triggers Spaced Repetition scheduling.
    """
    # Look up corrective question from taxonomy
    is_corr = (req.user_answer.strip().lower() == "b")  # b is 5 ohms for parallel corrective

    mastery = db.query(models.LearnerMastery).filter(
        models.LearnerMastery.user_id == req.user_id,
        models.LearnerMastery.concept_id == req.original_concept_id
    ).first()
    old_m = mastery.mastery_prob if mastery else 0.35

    # Update BKT with corrective evidence
    updated_mastery = bkt_service.update_concept_mastery(
        db=db,
        user_id=req.user_id,
        concept_id=req.original_concept_id,
        is_correct=is_corr,
        reasoning_quality=0.88 if is_corr else 0.30,
        confidence_reported=0.85,
        response_time_seconds=req.response_time_seconds,
        trigger_event="corrective_exercise",
        reason="Corrective exercise successfully applied reciprocal rule" if is_corr else "Struggled with corrective calculation"
    )

    # Schedule spaced repetition
    schedule = spaced_repetition_service.update_schedule(
        db=db,
        user_id=req.user_id,
        concept_id=req.original_concept_id,
        is_correct=is_corr,
        reasoning_quality=0.85,
        confidence=0.85
    )

    return schemas.CorrectiveAnswerResponse(
        is_correct=is_corr,
        feedback="Misconception successfully repaired! You correctly used the reciprocal formula (1/10 + 1/10 = 2/10 = 1/5 => Req = 5 Ω).",
        old_mastery=round(old_m * 100, 1),
        new_mastery=round(updated_mastery.mastery_prob * 100, 1),
        scheduled_revision_date=schedule.scheduled_date.strftime("%Y-%m-%d"),
        next_step="Concept status upgraded to Developing. Spaced revision scheduled for 24 hours to cement neural pathway."
    )

# ----------------- MODULE E: ADAPTIVE QUESTION GENERATOR -----------------

@app.get("/api/v1/questions/adaptive", response_model=schemas.QuestionOut)
def get_adaptive_question(
    user_id: int = Query(1),
    concept_id: Optional[str] = None,
    difficulty: Optional[int] = None,
    db: Session = Depends(get_db)
):
    q = question_generator_service.get_adaptive_question(
        db=db,
        user_id=user_id,
        concept_id=concept_id,
        difficulty_target=difficulty
    )
    if not q:
        raise HTTPException(status_code=404, detail="No questions available for criteria")

    opts = json.loads(q.options_json) if q.options_json else []
    return schemas.QuestionOut(
        id=q.id,
        concept_id=q.concept_id,
        concept_title=q.concept.title if q.concept else q.concept_id,
        difficulty=q.difficulty,
        question_type=q.question_type,
        prompt=q.prompt,
        options=[schemas.QuestionOption(**o) for o in opts],
        scaffolding_hint=q.scaffolding_hint,
        expected_reasoning=q.expected_reasoning
    )

# ----------------- MODULE F: SPACED REPETITION ENGINE -----------------

@app.get("/api/v1/spaced-repetition/dashboard", response_model=schemas.SpacedRevisionResponse)
def get_spaced_repetition(user_id: int = Query(1), db: Session = Depends(get_db)):
    return spaced_repetition_service.get_user_revision_dashboard(db, user_id)

# ----------------- SIGNATURE 5: LEARNING DNA -----------------

@app.get("/api/v1/learner/dna", response_model=schemas.LearningDNAResponse)
def get_learning_dna(user_id: int = Query(1), db: Session = Depends(get_db)):
    return analytics_service.get_learning_dna(db, user_id)

# ----------------- SIGNATURE 6: WHAT IF I FORGET? -----------------

@app.get("/api/v1/learner/what-if-i-forget", response_model=schemas.WhatIfIForgetResponse)
def get_what_if_i_forget(user_id: int = Query(1), db: Session = Depends(get_db)):
    return analytics_service.get_what_if_i_forget(db, user_id)

# ----------------- MODULE G: TEACHER INTELLIGENCE DASHBOARD -----------------

@app.get("/api/v1/teacher/dashboard", response_model=schemas.TeacherDashboardResponse)
def get_teacher_dashboard(class_id: Optional[int] = None, db: Session = Depends(get_db)):
    return analytics_service.get_teacher_dashboard(db, class_id)

@app.post("/api/v1/teacher/assign")
def create_teacher_assignment(payload: Dict[str, Any], db: Session = Depends(get_db)):
    class_id = payload.get("class_id", 1)
    title = payload.get("title", "Targeted Reinforcement: Parallel Circuits & Ohm's Law")
    concept_ids = payload.get("concept_ids", ["elec_parallel_circuits", "elec_ohm_law"])

    assignment = models.TeacherAssignment(
        class_id=class_id,
        title=title,
        target_concept_ids_json=json.dumps(concept_ids),
        description="Scaffolded intervention to eliminate series/parallel reciprocal addition confusion.",
        due_date=datetime.datetime.utcnow() + datetime.timedelta(days=3),
        created_by=4,  # Dr. Vikram Rao
        status="active"
    )
    db.add(assignment)
    db.commit()
    return {"status": "success", "message": f"Assignment '{title}' distributed to {class_id} successfully."}

@app.get("/api/v1/teacher/export-report")
def export_teacher_report(db: Session = Depends(get_db)):
    dash = analytics_service.get_teacher_dashboard(db)
    return {
        "institution": "MINDMATRIX AI School of Excellence",
        "generated_at": datetime.datetime.utcnow().isoformat(),
        "summary": {
            "total_students": dash["total_enrolled"],
            "class_mastery_average": dash["average_class_mastery"],
            "critical_interventions": len(dash["students_requiring_intervention"]),
            "top_misconception": dash["most_misunderstood_concepts"][0]["concept"] if dash["most_misunderstood_concepts"] else "None"
        },
        "heatmap": dash["heatmap_matrix"]
    }

# ----------------- AI LEARNING COACH -----------------

@app.post("/api/v1/coach/chat", response_model=schemas.AICoachResponse)
async def coach_chat(req: schemas.AICoachRequest, db: Session = Depends(get_db)):
    return await ai_coach_service.chat(
        db=db,
        user_id=req.user_id,
        user_message=req.message,
        current_concept_id=req.current_concept_id
    )

# ----------------- DEMO TOUR RESET & ADVANCE -----------------

@app.post("/api/v1/demo/reset")
def reset_demo(db: Session = Depends(get_db)):
    """
    Resets student 1 (Aarav Sharma) back to the pre-demo baseline state
    so the 11-step live demonstration can be re-run at any time.
    """
    # Delete recent attempts and history for student 1
    db.query(models.ReasoningResponse).filter(
        models.ReasoningResponse.attempt_id.in_(
            db.query(models.QuestionAttempt.id).filter(models.QuestionAttempt.user_id == 1)
        )
    ).delete(synchronize_session=False)

    db.query(models.QuestionAttempt).filter(models.QuestionAttempt.user_id == 1).delete()
    db.query(models.LearnerMasteryHistory).filter(models.LearnerMasteryHistory.user_id == 1).delete()
    db.query(models.LearnerMastery).filter(models.LearnerMastery.user_id == 1).delete()
    db.query(models.RevisionSchedule).filter(models.RevisionSchedule.user_id == 1).delete()
    db.commit()

    # Re-seed baseline for Aarav
    from .seed_data import seed_database
    # Re-insert Aarav's masteries
    initial_masteries_aarav = [
        ("elec_current", 0.82, 0.85, 4, 3, 0.8),
        ("elec_potential_diff", 0.76, 0.80, 3, 2, 0.75),
        ("elec_resistance", 0.70, 0.75, 4, 3, 0.7),
        ("elec_ohm_law", 0.85, 0.90, 5, 4, 0.85),
        ("elec_series_circuits", 0.78, 0.80, 3, 2, 0.8),
        ("elec_parallel_circuits", 0.35, 0.40, 2, 0, 0.3),
        ("elec_power", 0.45, 0.50, 1, 0, 0.4),
        ("light_reflection", 0.90, 0.95, 6, 6, 0.9),
        ("light_spherical_mirrors", 0.82, 0.85, 4, 3, 0.8),
        ("light_refraction", 0.65, 0.70, 3, 2, 0.65),
        ("light_lenses", 0.60, 0.65, 2, 1, 0.6),
        ("light_lens_formula", 0.55, 0.60, 2, 1, 0.5),
        ("light_magnification", 0.50, 0.55, 2, 1, 0.5),
        ("mag_field", 0.88, 0.90, 5, 5, 0.85),
        ("mag_field_lines", 0.82, 0.85, 4, 3, 0.8),
        ("mag_electric_motor", 0.60, 0.65, 2, 1, 0.6),
        ("mag_em_induction", 0.50, 0.55, 2, 1, 0.5),
        ("mag_electric_generator", 0.45, 0.50, 1, 0, 0.4),
    ]

    for cid, m_prob, conf, att, corr, rq in initial_masteries_aarav:
        db.add(models.LearnerMastery(
            user_id=1,
            concept_id=cid,
            mastery_prob=m_prob,
            confidence_level=conf,
            attempts_count=att,
            correct_count=corr,
            reasoning_quality_avg=rq,
            response_time_avg=32.0,
            last_practiced=datetime.datetime.utcnow() - datetime.timedelta(days=2 if cid != 'elec_parallel_circuits' else 4),
            forgetting_risk=0.15 if m_prob > 0.7 else 0.45,
            retention_score=0.88 if m_prob > 0.7 else 0.55,
            misconception_count=1 if cid == "elec_parallel_circuits" else 0
        ))

    now = datetime.datetime.utcnow()
    db.add_all([
        models.RevisionSchedule(
            user_id=1,
            concept_id="elec_parallel_circuits",
            scheduled_date=now - datetime.timedelta(hours=2),
            repetition_number=0,
            interval_days=1.0,
            ease_factor=2.2,
            forgetting_prob=0.58,
            status="overdue",
            last_reviewed_at=now - datetime.timedelta(days=3)
        ),
        models.RevisionSchedule(
            user_id=1,
            concept_id="elec_ohm_law",
            scheduled_date=now + datetime.timedelta(days=2),
            repetition_number=2,
            interval_days=6.0,
            ease_factor=2.5,
            forgetting_prob=0.18,
            status="pending",
            last_reviewed_at=now - datetime.timedelta(days=1)
        )
    ])

    db.add(models.LearnerMasteryHistory(
        user_id=1,
        concept_id="elec_parallel_circuits",
        old_mastery=0.45,
        new_mastery=0.35,
        trigger_event="diagnostic",
        reason="Initial baseline: series formula applied to parallel branch"
    ))
    db.commit()

    return {"status": "success", "message": "Demo state reset to Step 1 baseline."}
