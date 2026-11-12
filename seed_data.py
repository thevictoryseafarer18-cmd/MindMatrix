import json
import datetime
from sqlalchemy.orm import Session
from . import models
from .database import engine, Base

def seed_database(db: Session):
    # Ensure tables created
    Base.metadata.create_all(bind=engine)

    # Check if already seeded
    if db.query(models.User).first():
        return

    # 1. Seed Users
    student1 = models.User(
        id=1,
        name="Aarav Sharma",
        email="aarav@mindmatrix.edu",
        role="student",
        grade="Class 10",
        avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
    )
    student2 = models.User(
        id=2,
        name="Priya Patel",
        email="priya@mindmatrix.edu",
        role="student",
        grade="Class 10",
        avatar="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80"
    )
    student3 = models.User(
        id=3,
        name="Dev Mehta",
        email="dev@mindmatrix.edu",
        role="student",
        grade="Class 10",
        avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
    )
    teacher = models.User(
        id=4,
        name="Dr. Vikram Rao",
        email="vikram.rao@mindmatrix.edu",
        role="teacher",
        grade="Faculty of Physics",
        avatar="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"
    )
    admin = models.User(
        id=5,
        name="Elena Vance",
        email="admin@mindmatrix.edu",
        role="admin",
        grade="Curriculum Director",
        avatar="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
    )
    db.add_all([student1, student2, student3, teacher, admin])
    db.flush()

    # 2. Seed Class & Enrollments
    classroom = models.ClassRoom(
        id=1,
        name="Grade 10 - Newton Section A",
        code="PHYS-10A",
        subject="Physics (Science)",
        grade="Class 10",
        teacher_id=teacher.id
    )
    db.add(classroom)
    db.flush()

    db.add_all([
        models.Enrollment(user_id=student1.id, class_id=classroom.id),
        models.Enrollment(user_id=student2.id, class_id=classroom.id),
        models.Enrollment(user_id=student3.id, class_id=classroom.id),
    ])

    # 3. Seed Syllabus & Chapters
    syllabus = models.Syllabus(
        id=1,
        title="Class 10 Science - Physics Core",
        board="NCERT / CBSE Unified",
        grade="Class 10",
        description="Comprehensive foundations of Electricity, Optics, and Electromagnetism."
    )
    db.add(syllabus)
    db.flush()

    ch_elec = models.Chapter(
        id=1,
        syllabus_id=syllabus.id,
        code="CH_ELEC",
        title="Electricity",
        sequence_order=1,
        description="Electric charges, potential difference, Ohm's law, circuit topologies, and Joule heating.",
        icon="Zap"
    )
    ch_light = models.Chapter(
        id=2,
        syllabus_id=syllabus.id,
        code="CH_LIGHT",
        title="Light - Reflection & Refraction",
        sequence_order=2,
        description="Ray optics, spherical mirrors, refractive index, lenses, and optical magnification.",
        icon="Eye"
    )
    ch_mag = models.Chapter(
        id=3,
        syllabus_id=syllabus.id,
        code="CH_MAG",
        title="Magnetic Effects of Electric Current",
        sequence_order=3,
        description="Magnetic field lines, electromagnetism, Lorentz force, motor principle, and electromagnetic induction.",
        icon="Compass"
    )
    db.add_all([ch_elec, ch_light, ch_mag])
    db.flush()

    # 4. Seed Concepts
    concepts_data = [
        # Electricity
        {"id": "elec_current", "chapter_id": 1, "title": "Electric Current", "desc": "Rate of flow of electric charges through a conductor (I = Q/t).", "x": 100, "y": 80},
        {"id": "elec_potential_diff", "chapter_id": 1, "title": "Potential Difference", "desc": "Work done in moving unit positive charge between two points (V = W/Q).", "x": 280, "y": 80},
        {"id": "elec_resistance", "chapter_id": 1, "title": "Resistance", "desc": "Opposition offered by a substance to charge flow (R = ρL/A).", "x": 190, "y": 180},
        {"id": "elec_ohm_law", "chapter_id": 1, "title": "Ohm's Law", "desc": "Current is directly proportional to potential difference at constant temperature (V = IR).", "x": 280, "y": 280},
        {"id": "elec_series_circuits", "chapter_id": 1, "title": "Series Circuits", "desc": "Single loop configuration where current is constant and resistances add up directly.", "x": 140, "y": 380},
        {"id": "elec_parallel_circuits", "chapter_id": 1, "title": "Parallel Circuits", "desc": "Multiple branch configuration where voltage is constant and equivalent resistance decreases.", "x": 420, "y": 380},
        {"id": "elec_power", "chapter_id": 1, "title": "Electric Power", "desc": "Rate of electrical energy dissipation (P = VI = I²R = V²/R).", "x": 280, "y": 480},

        # Light
        {"id": "light_reflection", "chapter_id": 2, "title": "Reflection of Light", "desc": "Bouncing back of light into the same medium obeying laws of reflection.", "x": 620, "y": 80},
        {"id": "light_spherical_mirrors", "chapter_id": 2, "title": "Spherical Mirrors", "desc": "Concave and convex mirrors, focal point, and center of curvature (f = R/2).", "x": 620, "y": 200},
        {"id": "light_refraction", "chapter_id": 2, "title": "Refraction of Light", "desc": "Bending of light rays when crossing boundaries between optical media (Snell's Law).", "x": 840, "y": 80},
        {"id": "light_lenses", "chapter_id": 2, "title": "Lenses (Convex & Concave)", "desc": "Transparent optical elements converging or diverging transmitted rays.", "x": 840, "y": 200},
        {"id": "light_lens_formula", "chapter_id": 2, "title": "Lens Formula", "desc": "Relationship between focal length, object distance, and image distance: 1/f = 1/v - 1/u.", "x": 730, "y": 320},
        {"id": "light_magnification", "chapter_id": 2, "title": "Optical Magnification", "desc": "Ratio of image height to object height (m = h'/h = v/u).", "x": 730, "y": 440},

        # Magnetic Effects
        {"id": "mag_field", "chapter_id": 3, "title": "Magnetic Field", "desc": "Region around a magnet or current-carrying conductor where magnetic forces are exerted.", "x": 1050, "y": 80},
        {"id": "mag_field_lines", "chapter_id": 3, "title": "Magnetic Field Lines", "desc": "Continuous closed loops showing magnetic field direction and strength; lines never intersect.", "x": 1050, "y": 200},
        {"id": "mag_electric_motor", "chapter_id": 3, "title": "Electric Motor", "desc": "Device converting electrical energy to mechanical work using Fleming's Left-Hand Rule.", "x": 1050, "y": 340},
        {"id": "mag_em_induction", "chapter_id": 3, "title": "Electromagnetic Induction", "desc": "Production of induced current in a conductor moving through changing magnetic flux.", "x": 1250, "y": 200},
        {"id": "mag_electric_generator", "chapter_id": 3, "title": "Electric Generator", "desc": "Device converting mechanical work to electrical energy using Fleming's Right-Hand Rule.", "x": 1250, "y": 340},
    ]

    for c in concepts_data:
        concept_obj = models.Concept(
            id=c["id"],
            chapter_id=c["chapter_id"],
            title=c["title"],
            description=c["desc"],
            learning_objectives="Master core equations, conceptual boundaries, and real-world circuit behaviors.",
            difficulty_weight=1.0,
            category="Physics",
            node_x=c["x"],
            node_y=c["y"]
        )
        db.add(concept_obj)
    db.flush()

    # 5. Seed Prerequisites
    prereqs = [
        ("elec_resistance", "elec_current", 0.7),
        ("elec_resistance", "elec_potential_diff", 0.7),
        ("elec_ohm_law", "elec_resistance", 0.9),
        ("elec_series_circuits", "elec_ohm_law", 0.85),
        ("elec_parallel_circuits", "elec_ohm_law", 0.90),
        ("elec_parallel_circuits", "elec_resistance", 0.85),
        ("elec_power", "elec_series_circuits", 0.75),
        ("elec_power", "elec_parallel_circuits", 0.75),
        ("light_spherical_mirrors", "light_reflection", 0.85),
        ("light_lenses", "light_refraction", 0.85),
        ("light_lens_formula", "light_lenses", 0.9),
        ("light_magnification", "light_lens_formula", 0.8),
        ("light_magnification", "light_spherical_mirrors", 0.8),
        ("mag_field_lines", "mag_field", 0.9),
        ("mag_electric_motor", "mag_field_lines", 0.85),
        ("mag_electric_generator", "mag_em_induction", 0.9),
    ]
    for target, prereq, weight in prereqs:
        db.add(models.ConceptPrerequisite(concept_id=target, prerequisite_id=prereq, strength=weight))
    db.flush()

    # 6. Seed Misconceptions
    from .services.misconception_service import PHYSICS_MISCONCEPTION_TAXONOMY
    for m_id, m_data in PHYSICS_MISCONCEPTION_TAXONOMY.items():
        db.add(models.Misconception(
            id=m_id,
            concept_id=m_data["concept_id"],
            label=m_data["label"],
            description=m_data["description"],
            why_incorrect=m_data["why_incorrect"],
            scientific_explanation=m_data["scientific_explanation"],
            error_type=m_data["error_type"],
            corrective_hint=m_data["corrective_hint"]
        ))
    db.flush()

    # 7. Seed Questions (including Diagnostic, ThinkTrace, Numericals, Conceptual, Assertion-Reasoning)
    questions = [
        # ThinkTrace signature question for Parallel Circuits
        models.Question(
            id=101,
            concept_id="elec_parallel_circuits",
            difficulty=3,
            question_type="reasoning",
            prompt="Two resistors of resistance R1 and R2 are connected in parallel. What happens to the overall equivalent resistance of the circuit when a third resistor R3 is added in parallel?",
            options_json=json.dumps([
                {"id": "a", "text": "The equivalent resistance increases because another resistor is added to the system."},
                {"id": "b", "text": "The equivalent resistance decreases because an additional branch allows more total current to flow."},
                {"id": "c", "text": "The equivalent resistance remains unchanged because individual voltages are identical."},
                {"id": "d", "text": "The equivalent resistance becomes infinite due to branch cancellation."}
            ]),
            correct_answer="b",
            detailed_solution="In a parallel circuit, 1/Req = 1/R1 + 1/R2 + 1/R3. Adding another parallel path increases the total conductance (sum of reciprocals), which strictly decreases the net equivalent resistance.",
            expected_reasoning="Adding a parallel branch creates an alternative path for current, increasing conductance and lowering total resistance.",
            misconception_tags_json=json.dumps(["MISC_ELEC_SERIES_PARALLEL_ADD"]),
            scaffolding_hint="Recall that in parallel, 1/Req = 1/R1 + 1/R2. What happens to the reciprocal sum when another positive fraction is added?",
            is_diagnostic=True
        ),

        # Diagnostic Question 2: Series Circuits (Conceptual & Misconception)
        models.Question(
            id=102,
            concept_id="elec_series_circuits",
            difficulty=2,
            question_type="conceptual",
            prompt="Three identical light bulbs are connected in series across a 9V battery. How does the current passing through the third bulb compare with the first bulb?",
            options_json=json.dumps([
                {"id": "a", "text": "It is much less because the first two bulbs consume current."},
                {"id": "b", "text": "It is identical because electric current is conserved and equal throughout a single loop."},
                {"id": "c", "text": "It is greater because electrical potential accumulates toward the negative terminal."},
                {"id": "d", "text": "It depends on the wattage rating of the connecting wires."}
            ]),
            correct_answer="b",
            detailed_solution="In a series circuit, there is only one pathway for charge flow. By conservation of charge, the rate of electron flow (current) is strictly identical at all points: I1 = I2 = I3.",
            expected_reasoning="Charge is conserved; current is identical at all points in a series loop.",
            misconception_tags_json=json.dumps(["MISC_ELEC_CURRENT_CONSUMED"]),
            scaffolding_hint="Consider whether electric charge can disappear inside a bulb filament.",
            is_diagnostic=True
        ),

        # Diagnostic Question 3: Ohm's Law (Numerical Problem)
        models.Question(
            id=103,
            concept_id="elec_ohm_law",
            difficulty=2,
            question_type="numerical",
            prompt="A potential difference of 24 V is applied across a conductor of resistance 8 Ω. What is the magnitude of electric current passing through it?",
            options_json=json.dumps([
                {"id": "a", "text": "3.0 A"},
                {"id": "b", "text": "192 A"},
                {"id": "c", "text": "0.33 A"},
                {"id": "d", "text": "16 A"}
            ]),
            correct_answer="a",
            detailed_solution="According to Ohm's Law, V = I * R. Therefore, I = V / R = 24 V / 8 Ω = 3.0 A.",
            expected_reasoning="Direct application of Ohm's Law I = V/R.",
            is_diagnostic=True
        ),

        # Diagnostic Question 4: Light - Spherical Mirrors (Assertion & Reasoning)
        models.Question(
            id=104,
            concept_id="light_spherical_mirrors",
            difficulty=3,
            question_type="assertion_reason",
            prompt="Assertion (A): The focal length of a concave mirror depends on its radius of curvature as f = R / 2.\nReason (R): When the lower half of the mirror is covered with black paper, its focal length is halved.",
            options_json=json.dumps([
                {"id": "a", "text": "Both (A) and (R) are true and (R) is the correct explanation of (A)."},
                {"id": "b", "text": "Both (A) and (R) are true but (R) is not the correct explanation of (A)."},
                {"id": "c", "text": "(A) is true, but (R) is false."},
                {"id": "d", "text": "Both (A) and (R) are false."}
            ]),
            correct_answer="c",
            detailed_solution="Assertion is true (f = R/2). Reason is false: covering half the mirror reduces image brightness, but the focal length remains completely unchanged.",
            expected_reasoning="Focal length depends solely on geometric curvature radius, not the aperture surface exposed.",
            misconception_tags_json=json.dumps(["MISC_LIGHT_FOCAL_DIAMETER"]),
            is_diagnostic=True
        ),

        # Diagnostic Question 5: Magnetic Field Lines (Conceptual)
        models.Question(
            id=105,
            concept_id="mag_field_lines",
            difficulty=2,
            question_type="conceptual",
            prompt="Which of the following statements regarding magnetic field lines is scientifically FALSE?",
            options_json=json.dumps([
                {"id": "a", "text": "They emerge from North pole and enter South pole outside a bar magnet."},
                {"id": "b", "text": "They form continuous closed concentric curves."},
                {"id": "c", "text": "Two magnetic field lines can cross each other where the magnetic field is very strong."},
                {"id": "d", "text": "The relative degree of closeness of lines indicates field strength."}
            ]),
            correct_answer="c",
            detailed_solution="Two field lines can never intersect because the net magnetic field vector at any point is unique.",
            expected_reasoning="Tangents show unique field direction; lines cannot intersect.",
            misconception_tags_json=json.dumps(["MISC_MAG_LINES_CROSS"]),
            is_diagnostic=True
        ),

        # Diagnostic Question 6: Lens Formula (Numerical)
        models.Question(
            id=106,
            concept_id="light_lens_formula",
            difficulty=4,
            question_type="numerical",
            prompt="A convex lens has a focal length of +15 cm. An object is placed at a distance of 30 cm in front of the lens (u = -30 cm). Where is the image formed?",
            options_json=json.dumps([
                {"id": "a", "text": "+30 cm behind the lens (at 2F)"},
                {"id": "b", "text": "-15 cm in front of the lens"},
                {"id": "c", "text": "+10 cm behind the lens"},
                {"id": "d", "text": "+45 cm behind the lens"}
            ]),
            correct_answer="a",
            detailed_solution="Using Lens Formula 1/f = 1/v - 1/u => 1/15 = 1/v - 1/(-30) => 1/v = 1/15 - 1/30 = 1/30. So v = +30 cm.",
            expected_reasoning="Application of lens formula with Cartesian sign conventions.",
            is_diagnostic=True
        ),

        # Electric Motor / Magnetic Effects (Application)
        models.Question(
            id=107,
            concept_id="mag_electric_motor",
            difficulty=3,
            question_type="mcq",
            prompt="In an electric motor, the split-ring commutator serves what critical role?",
            options_json=json.dumps([
                {"id": "a", "text": "It increases the resistance of the coil."},
                {"id": "b", "text": "It reverses the direction of current in the armature coil every half-rotation to ensure continuous rotation."},
                {"id": "c", "text": "It grounds excess static charge on the motor axle."},
                {"id": "d", "text": "It generates a secondary magnetic field opposing the permanent magnet."}
            ]),
            correct_answer="b",
            detailed_solution="The split-ring commutator acts as a mechanical inverter, reversing current flow every 180 degrees so torque remains unidirectional.",
            expected_reasoning="Continuous unidirectional rotation requires torque to maintain the same rotational sense.",
            is_diagnostic=False
        ),

        # Electric Power
        models.Question(
            id=108,
            concept_id="elec_power",
            difficulty=3,
            question_type="numerical",
            prompt="An electric heater rated at 1000 W operates on a 220 V supply. What is the current drawn by the heater?",
            options_json=json.dumps([
                {"id": "a", "text": "4.55 A"},
                {"id": "b", "text": "0.22 A"},
                {"id": "c", "text": "22 A"},
                {"id": "d", "text": "45.5 A"}
            ]),
            correct_answer="a",
            detailed_solution="Power P = V * I. Therefore I = P / V = 1000 W / 220 V = 4.545 A ≈ 4.55 A.",
            expected_reasoning="Direct use of P = V * I.",
            is_diagnostic=False
        )
    ]
    db.add_all(questions)
    db.flush()

    # 8. Seed Initial Learner Mastery for sample students
    # Aarav Sharma: moderate across board, electricity in development
    initial_masteries_aarav = [
        ("elec_current", 0.82, 0.85, 4, 3, 0.8),
        ("elec_potential_diff", 0.76, 0.80, 3, 2, 0.75),
        ("elec_resistance", 0.70, 0.75, 4, 3, 0.7),
        ("elec_ohm_law", 0.85, 0.90, 5, 4, 0.85),
        ("elec_series_circuits", 0.78, 0.80, 3, 2, 0.8),
        ("elec_parallel_circuits", 0.35, 0.40, 2, 0, 0.3),  # Intentionally low for the demo!
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
            user_id=student1.id,
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

    # Priya Patel (strong student)
    for c in concepts_data:
        db.add(models.LearnerMastery(
            user_id=student2.id,
            concept_id=c["id"],
            mastery_prob=0.88,
            confidence_level=0.92,
            attempts_count=5,
            correct_count=5,
            reasoning_quality_avg=0.85,
            response_time_avg=24.0,
            last_practiced=datetime.datetime.utcnow() - datetime.timedelta(days=1),
            forgetting_risk=0.10,
            retention_score=0.92,
            misconception_count=0
        ))

    # Dev Mehta (struggling student)
    for c in concepts_data:
        db.add(models.LearnerMastery(
            user_id=student3.id,
            concept_id=c["id"],
            mastery_prob=0.38,
            confidence_level=0.45,
            attempts_count=3,
            correct_count=1,
            reasoning_quality_avg=0.40,
            response_time_avg=45.0,
            last_practiced=datetime.datetime.utcnow() - datetime.timedelta(days=5),
            forgetting_risk=0.55,
            retention_score=0.48,
            misconception_count=3
        ))

    # Seed Initial Revision Schedules
    now = datetime.datetime.utcnow()
    db.add_all([
        models.RevisionSchedule(
            user_id=student1.id,
            concept_id="elec_parallel_circuits",
            scheduled_date=now - datetime.timedelta(hours=2),  # Overdue / due today
            repetition_number=0,
            interval_days=1.0,
            ease_factor=2.2,
            forgetting_prob=0.58,
            status="overdue",
            last_reviewed_at=now - datetime.timedelta(days=3)
        ),
        models.RevisionSchedule(
            user_id=student1.id,
            concept_id="elec_ohm_law",
            scheduled_date=now + datetime.timedelta(days=2),
            repetition_number=2,
            interval_days=6.0,
            ease_factor=2.5,
            forgetting_prob=0.18,
            status="pending",
            last_reviewed_at=now - datetime.timedelta(days=1)
        ),
        models.RevisionSchedule(
            user_id=student1.id,
            concept_id="light_spherical_mirrors",
            scheduled_date=now + datetime.timedelta(days=4),
            repetition_number=3,
            interval_days=14.0,
            ease_factor=2.6,
            forgetting_prob=0.12,
            status="pending",
            last_reviewed_at=now - datetime.timedelta(days=2)
        )
    ])

    # Initial history record
    db.add(models.LearnerMasteryHistory(
        user_id=student1.id,
        concept_id="elec_parallel_circuits",
        old_mastery=0.45,
        new_mastery=0.35,
        trigger_event="diagnostic",
        reason="Initial baseline: series formula applied to parallel branch"
    ))

    db.commit()

