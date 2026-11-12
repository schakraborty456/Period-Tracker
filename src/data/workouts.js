/**
 * workouts.js - Phase- and symptom-tailored home workout routines.
 *
 * Designed for home practice with 10–20 minute durations and Easy/Medium levels.
 * Non-curative lifestyle support (movement, stretching, mobility).
 * All content is marked "needs expert review".
 */

export const WORKOUT_REVIEW_STATUS = 'Needs expert review';

export const WORKOUT_SAFETY_NOTICE =
  'Listen to your body. Move gently within your comfortable range of motion. Never push through sharp pain. These routines are gentle self-care exercises, not medical treatment.';

export const WORKOUT_ROUTINES = [
  {
    id: 'cramps-relief',
    title: 'Cramps & Pelvic Tension Relief',
    phase: 'menstrual',
    symptomTag: 'cramps',
    level: 'Easy',
    durationMinutes: 12,
    icon: '⚡',
    color: '#E85D75',
    reviewStatus: WORKOUT_REVIEW_STATUS,
    summary:
      'Gentle restorative stretches to soothe menstrual cramps, open pelvic space, and ease lower back tightness.',
    benefits: [
      'Relaxes lower abdominal and uterine muscle tension',
      'Encourages healthy pelvic blood flow without exhaustion',
      'Decompresses lumbar spine stiffness from cramps',
    ],
    poses: [
      {
        name: 'Child’s Pose (Balasana)',
        duration: '3 minutes',
        icon: '🧘‍♀️',
        benefit: 'Gently stretches lower back and releases pelvic floor tightness.',
        instructions:
          'Kneel on a soft mat with big toes touching and knees comfortably wide. Fold forward, resting your torso between your thighs and forehead on the mat. Extend arms forward and breathe deeply into your lower belly and back.',
      },
      {
        name: 'Cat-Cow Stretch (Marjaryasana-Bitilasana)',
        duration: '3 minutes',
        icon: '🐈',
        benefit: 'Mobilizes the spine and relieves pelvic congestion.',
        instructions:
          'Come to hands and knees with wrists under shoulders. Inhale as you gently drop your belly and lift your chest (Cow). Exhale as you round your spine toward the ceiling, tucking your chin and tailbone (Cat). Move slowly with your breath for 8–10 gentle cycles.',
      },
      {
        name: 'Reclining Butterfly Pose (Supta Baddha Konasana)',
        duration: '3 minutes',
        icon: '🦋',
        benefit: 'Gently opens inner thighs and softens pelvic contractions.',
        instructions:
          'Lie flat on your back. Bring the soles of your feet together and let your knees fall open to the sides. Place a pillow under each knee for gentle support if needed. Rest your hands softly over your lower abdomen and breathe slowly.',
      },
      {
        name: 'Supine Gentle Spinal Twist (Supta Matsyendrasana)',
        duration: '3 minutes',
        icon: '🌀',
        benefit: 'Relieves lower back stiffness and calms the nervous system.',
        instructions:
          'Lie on your back, hug both knees into your chest, then gently guide both knees over to the right side while keeping both shoulders grounded. Extend your arms in a T-shape. Hold for 1.5 minutes, then switch sides.',
      },
    ],
  },

  {
    id: 'pcos-rhythm',
    title: 'PCOS Rhythm & Gentle Strength',
    phase: 'all',
    symptomTag: 'pcos',
    level: 'Medium',
    durationMinutes: 18,
    icon: '🌸',
    color: '#F5A524',
    reviewStatus: WORKOUT_REVIEW_STATUS,
    summary:
      'Moderate rhythmic movement and bodyweight resistance to support insulin sensitivity, energy balance, and regular cycles.',
    benefits: [
      'Activates large muscle groups to support natural glucose uptake',
      'Moderate cadence to keep cortisol balanced without overtraining',
      'Boosts cardiovascular stamina and pelvic stability',
    ],
    poses: [
      {
        name: 'Brisk Stepping & Arm Swings',
        duration: '3 minutes',
        icon: '🚶‍♀️',
        benefit: 'Warms up joints and stimulates lymphatic circulation.',
        instructions:
          'March in place or take brisk steps back and forth in your room. Swing your arms rhythmically, keeping your chest tall and core lightly engaged. Breathe evenly.',
      },
      {
        name: 'Surya Namaskar (Sun Salutations)',
        duration: '5 minutes',
        icon: '☀️',
        benefit: 'Synchronizes breath with full-body functional mobility.',
        instructions:
          'Stand tall at the top of your mat. Inhale arms up, exhale fold forward, step back to plank, lower down gently, inhale into gentle cobra, exhale back into downward dog. Step forward and rise. Perform 3–4 gentle, controlled rounds.',
      },
      {
        name: 'Bodyweight Squats & Chair Holds',
        duration: '4 minutes',
        icon: '🦵',
        benefit: 'Builds quad and glute strength for insulin sensitivity.',
        instructions:
          'Stand with feet shoulder-width apart. Lower your hips back and down as if sitting in a chair, keeping knees aligned over toes. Push through heels to stand. Perform 10–12 slow reps, followed by a gentle 15-second chair hold.',
      },
      {
        name: 'Glute Bridges & Pelvic Lifts',
        duration: '3 minutes',
        icon: '🌉',
        benefit: 'Strengthens posterior chain and stabilizes pelvic basin.',
        instructions:
          'Lie on your back with knees bent and feet flat on the floor hip-width apart. Press into heels to lift your hips until your body forms a straight line from knees to shoulders. Squeeze glutes at the top for 2 seconds, then slowly lower. Repeat for 12–15 reps.',
      },
      {
        name: 'Diaphragmatic Breathing & Cool-down',
        duration: '3 minutes',
        icon: '🌿',
        benefit: 'Calms adrenal response and aids nervous system recovery.',
        instructions:
          'Sit comfortably with legs crossed or lie flat. Place one hand on your chest and one on your belly. Inhale through the nose for 4 seconds, feeling your belly expand. Exhale slowly for 6 seconds. Repeat for 3 minutes.',
      },
    ],
  },

  {
    id: 'follicular-mobility',
    title: 'Fresh Start Mobility & Flow',
    phase: 'follicular',
    symptomTag: null,
    level: 'Easy',
    durationMinutes: 15,
    icon: '🌱',
    color: '#6CC299',
    reviewStatus: WORKOUT_REVIEW_STATUS,
    summary:
      'Light, energizing dynamic mobility to match your rising estrogen and natural energy in the follicular phase.',
    benefits: [
      'Opens chest and shoulders for upright daily posture',
      'Mobilizes hip flexors tightened by desk work',
      'Provides an uplifting natural energy boost',
    ],
    poses: [
      {
        name: 'Standing Side Reach & Body Lengthener',
        duration: '2 minutes',
        icon: '🧍‍♀️',
        benefit: 'Stretches intercostal muscles and opens lung capacity.',
        instructions:
          'Stand tall with feet hip-width apart. Inhale both arms overhead, clasp your left wrist with right hand, and gently lean to the right. Hold for 5 deep breaths, then switch sides.',
      },
      {
        name: 'Low Lunge Hip Flexor Opener',
        duration: '3 minutes',
        icon: '🏃‍♀️',
        benefit: 'Releases tight hip flexors and psoas muscles.',
        instructions:
          'Step your right foot forward into a lunge, lowering your left knee softly onto the mat. Place hands on right knee and gently shift hips forward until you feel a comfortable stretch in the left front hip. Hold 1.5 minutes, then switch legs.',
      },
      {
        name: 'Standing Forward Fold & Half-Lift Flow',
        duration: '3 minutes',
        icon: '🌊',
        benefit: 'Decompresses spine and gently warms hamstrings.',
        instructions:
          'From standing, exhale and hinge at the hips to fold forward with soft knees. Inhale, press hands to shins and lift halfway with a flat back. Exhale fold down again. Repeat for 8–10 fluid cycles.',
      },
      {
        name: 'Bird-Dog Core Balance',
        duration: '4 minutes',
        icon: '🐕',
        benefit: 'Enhances core stability and neuromuscular coordination.',
        instructions:
          'Start on all fours. Extend your right arm forward and left leg straight back at hip height. Hold for 3 seconds with a steady core, then lower. Switch to left arm and right leg. Complete 8 alternating repetitions per side.',
      },
      {
        name: 'Centering Mountain Pose with Deep Inhalations',
        duration: '3 minutes',
        icon: '⛰️',
        benefit: 'Cultivates grounded confidence and clear focus.',
        instructions:
          'Stand tall with feet rooted firmly into the earth. Roll your shoulders back and down. Close your eyes and take 10 slow, deep breaths, visualizing fresh energy filling your body.',
      },
    ],
  },

  {
    id: 'ovulation-sculpt',
    title: 'Peak Energy & Core Sculpt',
    phase: 'ovulation',
    symptomTag: null,
    level: 'Medium',
    durationMinutes: 20,
    icon: '✨',
    color: '#F7C948',
    reviewStatus: WORKOUT_REVIEW_STATUS,
    summary:
      'Channeling peak ovulation stamina with moderate bodyweight strength, balance, and posture exercises.',
    benefits: [
      'Capitalizes on peak stamina and coordination during ovulation',
      'Strengthens lower body and core stabilizer muscles',
      'Promotes circulation and metabolic vitality',
    ],
    poses: [
      {
        name: 'Dynamic Step-Jacks or Gentle Jumping Jacks',
        duration: '3 minutes',
        icon: '⭐',
        benefit: 'Warms up muscles and elevates cardiovascular rhythm.',
        instructions:
          'Step out to the side while raising arms overhead, or perform low-impact jumping jacks. Keep a brisk, joyful pace while breathing steadily.',
      },
      {
        name: 'Warrior II & Reverse Warrior Flow',
        duration: '5 minutes',
        icon: '⚔️',
        benefit: 'Builds lower-body stamina and opens heart space.',
        instructions:
          'Step feet wide apart. Turn right toes forward and bend right knee to 90 degrees. Extend arms parallel to the floor (Warrior II). Inhale and reach right arm up and back (Reverse Warrior). Hold each for 5 breaths, then repeat on the opposite side.',
      },
      {
        name: 'Plie Squats with Heel Lifts',
        duration: '4 minutes',
        icon: '🩰',
        benefit: 'Strengthens inner thighs, glutes, and ankle stabilizers.',
        instructions:
          'Stand wide with toes pointed outward at 45 degrees. Lower your hips down into a wide squat while keeping your torso upright. Pulse gently, or lift alternating heels. Perform 12 controlled reps.',
      },
      {
        name: 'Modified Forearm Plank & Side Holds',
        duration: '4 minutes',
        icon: '📏',
        benefit: 'Activates deep transverse abdominis and shoulder girdle.',
        instructions:
          'Place forearms on the mat, stepping back into a modified knee plank or full plank. Keep your spine in one straight line without letting your hips sag. Hold for 30–45 seconds, rest, then turn to each side for a 20-second side plank.',
      },
      {
        name: 'Tree Pose (Vrikshasana) & Stillness',
        duration: '4 minutes',
        icon: '🌳',
        benefit: 'Tests equilibrium, enhances focus, and centers energy.',
        instructions:
          'Shift weight onto your left foot. Place the sole of your right foot against your inner calf or thigh (avoid the knee). Bring palms together at heart center. Find a fixed focal point and hold for 10 steady breaths, then switch legs.',
      },
    ],
  },

  {
    id: 'luteal-grounding',
    title: 'Luteal Grounding & PMS Soother',
    phase: 'luteal',
    symptomTag: 'fatigue',
    level: 'Easy',
    durationMinutes: 15,
    icon: '🌙',
    color: '#9B8AE0',
    reviewStatus: WORKOUT_REVIEW_STATUS,
    summary:
      'Grounding, calming movement to ease premenstrual irritability, heavy legs, and nervous tension as progesterone rises.',
    benefits: [
      'Counters premenstrual water retention and leg heaviness',
      'Relieves tension held in the neck, jaw, and shoulders',
      'Prepares the body and mind for restorative sleep',
    ],
    poses: [
      {
        name: 'Seated Neck, Shoulder & Wrist Rolls',
        duration: '3 minutes',
        icon: '💆‍♀️',
        benefit: 'Releases stress held in the upper cervical spine.',
        instructions:
          'Sit comfortably with a straight back. Drop your right ear toward your right shoulder for 3 breaths, then roll chin to chest and to the left. Roll shoulders in large, slow circles backward, then roll wrists.',
      },
      {
        name: 'Seated Butterfly with Gentle Forward Fold',
        duration: '3 minutes',
        icon: '🦋',
        benefit: 'Softens groin and inner hip tension.',
        instructions:
          'Sit with soles of feet together. Hold your feet with both hands, lengthen your spine on an inhale, and gently fold forward on an exhale as far as comfortable without forcing. Breathe into your lower back.',
      },
      {
        name: 'Cat-Cow with Hip Circles',
        duration: '3 minutes',
        icon: '🌀',
        benefit: 'Frees up tight hip joints and sacral stiffness.',
        instructions:
          'On hands and knees, combine cat-cow spinal flexion with slow circular hip motions, drawing big imaginary circles with your pelvis. Switch direction after 1.5 minutes.',
      },
      {
        name: 'Legs-Up-the-Wall (Viparita Karani)',
        duration: '4 minutes',
        icon: '🧱',
        benefit: 'Reduces leg swelling and promotes parasympathetic calm.',
        instructions:
          'Bring your hips close to a wall and swing your legs up so they rest vertically against the wall while your back rests flat on the floor. Rest arms by your sides with palms facing up. Close your eyes and breathe gently.',
      },
      {
        name: 'Savasana with Abdominal Warmth',
        duration: '2 minutes',
        icon: '🛌',
        benefit: 'Deep total-body integration and peace.',
        instructions:
          'Lie flat, legs relaxed and feet falling naturally outward. Place one hand on your heart and one on your belly. Feel your body sinking heavily into the mat with each soothing breath.',
      },
    ],
  },

  {
    id: 'bloat-relief',
    title: 'Digestive Ease & Bloat Relief',
    phase: 'all',
    symptomTag: 'bloating',
    level: 'Easy',
    durationMinutes: 10,
    icon: '🫧',
    color: '#6CC299',
    reviewStatus: WORKOUT_REVIEW_STATUS,
    summary:
      'Gentle compression and twisting postures to relieve abdominal fullness, trapped gas, and pre-period bloating.',
    benefits: [
      'Gently massages abdominal organs to encourage sluggish digestion',
      'Relieves trapped gas and tightness in the digestive tract',
      'Calms gut sensitivity via diaphragmatic breathing',
    ],
    poses: [
      {
        name: 'Wind-Relieving Pose (Pavanamuktasana)',
        duration: '3 minutes',
        icon: '💨',
        benefit: 'Provides direct gentle compression across the colon.',
        instructions:
          'Lie on your back. Inhale, then exhale as you hug your right knee into your chest, keeping your left leg straight or bent. Hold for 1 minute while taking deep belly breaths. Repeat with your left knee, then hug both knees together for 1 minute.',
      },
      {
        name: 'Seated Spinal Twist (Ardha Matsyendrasana)',
        duration: '3 minutes',
        icon: '🪑',
        benefit: 'Aids intestinal motility through gentle rotation.',
        instructions:
          'Sit tall with legs extended. Bend right knee and place right foot on the floor outside the left thigh. Hug the right knee with your left arm and gently rotate torso to the right. Hold for 1.5 minutes with soft breaths, then switch sides.',
      },
      {
        name: 'Puppy Pose (Uttana Shishosana)',
        duration: '2 minutes',
        icon: '🐶',
        benefit: 'Opens mid-back and creates space in the upper abdomen.',
        instructions:
          'From all fours, walk your hands forward while keeping hips stacked directly above knees. Lower your chest toward the mat and rest your forehead down. Breathe into your side ribs.',
      },
      {
        name: 'Gentle Pelvic Rocking with Belly Breathing',
        duration: '2 minutes',
        icon: '🌊',
        benefit: 'Relaxes abdominal wall muscles and calms enteric nerves.',
        instructions:
          'Lie on your back with knees bent and feet flat. Gently rock your pelvis backward (flattening lower back) and forward (creating a slight arch). Let your belly rise and fall softly with each rock.',
      },
    ],
  },

  {
    id: 'lower-back-soother',
    title: 'Lower Back & Sacrum Soother',
    phase: 'all',
    symptomTag: 'back_pain',
    level: 'Easy',
    durationMinutes: 14,
    icon: '🧘',
    color: '#9B8AE0',
    reviewStatus: WORKOUT_REVIEW_STATUS,
    summary:
      'Targeted gentle decompression for lower back ache, pelvic stiffness, and sacral pressure.',
    benefits: [
      'Releases deep gluteal and piriformis muscle tension',
      'Relieves compression on the sacroiliac (SI) joints',
      'Restores comfortable lower spine mobility',
    ],
    poses: [
      {
        name: 'Supine Pelvic Tilts',
        duration: '3 minutes',
        icon: '⚖️',
        benefit: 'Mobilizes lumbar joints and engages gentle core stabilizers.',
        instructions:
          'Lie comfortably on your back with knees bent. Inhale to relax. As you exhale, gently tilt your pelvis so your lower back presses flush against the mat. Hold for 3 seconds, then release. Repeat for 12–15 mindful cycles.',
      },
      {
        name: 'Knees-to-Chest Gentle Rocking (Apanasana)',
        duration: '3 minutes',
        icon: '🛶',
        benefit: 'Massages lumbar paraspinal muscles against the floor.',
        instructions:
          'Hug both knees into your chest, holding your shins with your hands. Gently rock from side to side in a soothing, slow rhythm to massage the muscles around your sacrum and lower back.',
      },
      {
        name: 'Sphinx Pose',
        duration: '4 minutes',
        icon: '🦁',
        benefit: 'Provides gentle passive extension for lower lumbar disks.',
        instructions:
          'Lie on your stomach with legs hip-width apart. Prop yourself up on forearms with elbows directly under shoulders and palms flat. Relax your glutes and gently pull your chest forward through your arms. Hold for 3–4 minutes with calm breathing.',
      },
      {
        name: 'Reclining Figure-4 Stretch',
        duration: '4 minutes',
        icon: '🔢',
        benefit: 'Releases deep piriformis tightness that pulls on the sacrum.',
        instructions:
          'Lie on your back with knees bent. Cross your right ankle over your left thigh. Reach through and clasp behind your left hamstring, gently drawing the left knee toward your chest. Keep right foot flexed. Hold 2 minutes, then switch sides.',
      },
    ],
  },
];

/**
 * Returns all workout routines.
 * @returns {Array<object>}
 */
export function getAllWorkouts() {
  return WORKOUT_ROUTINES;
}

/**
 * Returns a workout routine by its unique ID.
 * @param {string} id
 * @returns {object|null}
 */
export function getWorkoutById(id) {
  if (!id) return null;
  return WORKOUT_ROUTINES.find((w) => w.id === id) || null;
}

/**
 * Filters workouts by cycle phase.
 * If phase is provided, returns workouts matching that phase OR phase === 'all'.
 *
 * @param {string} phase - 'menstrual' | 'follicular' | 'ovulation' | 'luteal' | 'all'
 * @returns {Array<object>}
 */
export function getWorkoutsByPhase(phase) {
  if (!phase || phase === 'all') {
    return WORKOUT_ROUTINES;
  }
  return WORKOUT_ROUTINES.filter((w) => w.phase === phase || w.phase === 'all');
}

/**
 * Filters workouts by symptom tag.
 *
 * @param {string} symptomTag - 'cramps' | 'pcos' | 'bloating' | 'fatigue' | 'back_pain'
 * @returns {Array<object>}
 */
export function getWorkoutsBySymptom(symptomTag) {
  if (!symptomTag) return WORKOUT_ROUTINES;
  return WORKOUT_ROUTINES.filter((w) => w.symptomTag === symptomTag);
}

