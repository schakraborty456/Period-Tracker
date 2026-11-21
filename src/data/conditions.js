/**
 * conditions.js - Educational reference library for common period-related conditions.
 *
 * Requirements & Content Rules (Rules.md §5.3):
 * - Educational only: strictly no diagnosis, no "you have X" wording.
 * - Home care is framed strictly as "may help ease discomfort", never as a cure or treatment.
 * - Zero medicine names (no ibuprofen, paracetamol, mefenamic, metformin, aspirin, etc.).
 * - Zero supplement or herbal recommendations, zero dosages, zero iron tablets.
 * - Every condition includes: summary, symptoms, whenToSeeDoctor (red flags),
 *   homeComfort (food, sleep, stress, hydration, heatAndMovement), whatDoctorMayCheck,
 *   mythsVsFacts, relatedWorkoutIds, relatedRiskFlagId, and needsReview: true.
 * - All content is marked "Needs expert review".
 */

export const CONDITIONS_REVIEW_STATUS = 'Needs expert review';

export const CONDITIONS_DISCLAIMER =
  'This educational guide provides general information only and is not a medical diagnosis, cure, or treatment. If you experience severe pain, heavy bleeding, or missed cycles, please consult a qualified gynecologist or healthcare professional.';

export const CONDITION_CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'pain-discomfort', label: 'Pain & Discomfort' },
  { key: 'hormonal-systemic', label: 'Hormonal' },
  { key: 'flow-blood', label: 'Flow & Blood' },
  { key: 'cycle-irregularity', label: 'Cycle Changes' },
];

export const CONDITIONS = [
  {
    id: 'pcos',
    title: 'PCOS / PCOD (Polycystic Ovary Syndrome)',
    shortName: 'PCOS',
    category: 'hormonal-systemic',
    categoryLabel: 'Hormonal & Systemic',
    summary:
      'Polycystic Ovary Syndrome (PCOS), frequently also referred to as PCOD (Polycystic Ovarian Disease), is a common hormonal pattern where ovaries may develop small follicles and cycles become irregular. It is linked with variations in hormone balance, insulin response, and cycle regularity.',
    symptoms: [
      'Irregular, delayed, or missed menstrual cycles',
      'Persistent acne or oily skin, particularly along the jawline',
      'Excess hair growth on the face, chest, or abdomen',
      'Hair thinning or shedding on the scalp',
      'Darkened skin patches around the neck, underarms, or groin',
      'Weight changes that feel challenging to manage',
    ],
    whenToSeeDoctor: [
      'No menstrual period for 90 or more days (3 months) when not pregnant',
      'Bleeding that lasts longer than 7 consecutive days',
      'Unusually heavy bleeding that soaks through a pad or tampon every hour',
      'Severe, sudden, or unmanageable pelvic pain',
      'Unexplained dizziness, extreme fatigue, or fainting',
    ],
    homeComfort: {
      food:
        'Prioritizing balanced meals with complex carbohydrates (such as brown rice, whole wheat roti, oats, and dal), fiber-rich greens (shak), and protein (egg, fish like mach, or lentils) may help ease discomfort by supporting steady daily energy.',
      sleep:
        'Maintaining 7 to 8 hours of quiet, regular nighttime rest may help ease discomfort and support natural metabolic rhythms.',
      stress:
        'Gentle breathing practices, quiet time outdoors, and low-stimulation evenings may help ease discomfort caused by everyday tension.',
      hydration:
        'Drinking 8 to 10 glasses of clean water throughout the day may help ease discomfort and maintain general hydration.',
      heatAndMovement:
        'Applying a gentle warm heating pad on the lower abdomen along with daily brisk walking and light bodyweight movements may help ease discomfort in the pelvic area.',
    },
    whatDoctorMayCheck: [
      'Pelvic ultrasound to visualize the ovaries and uterine lining',
      'Hormonal blood panels (such as LH, FSH, androgen, and prolactin levels)',
      'Fasting blood sugar or insulin screening to evaluate metabolic health',
      'Thyroid screening to check for overlapping cycle influences',
      'Review of cycle history, lifestyle factors, and symptom timelines',
    ],
    mythsVsFacts: [
      {
        myth: 'Myth: Having PCOS means a person cannot have children.',
        fact:
          'Fact: Many individuals with PCOS conceive naturally or with standard clinical guidance; it is a manageable hormonal pattern, not an absolute barrier.',
      },
      {
        myth: 'Myth: Only individuals with higher body weight develop PCOS.',
        fact:
          'Fact: PCOS affects people of every body shape and size, including those with lean body types.',
      },
      {
        myth: 'Myth: An irregular cycle always indicates PCOS.',
        fact:
          'Fact: Irregular cycles can also be influenced by thyroid variations, nutrition changes, acute stress, or illness; only a doctor can evaluate the true cause.',
      },
    ],
    relatedWorkoutIds: ['pcos-rhythm', 'follicular-mobility'],
    relatedRiskFlagId: 'pcos_possible',
    needsReview: true,
  },

  {
    id: 'pms',
    title: 'PMS (Premenstrual Syndrome)',
    shortName: 'PMS',
    category: 'pain-discomfort',
    categoryLabel: 'Pain & Discomfort',
    summary:
      'Premenstrual Syndrome (PMS) refers to a cluster of physical and emotional shifts that many people experience during the luteal phase, typically 7 to 10 days before menstrual bleeding begins. These shifts usually resolve within a few days after bleeding starts.',
    symptoms: [
      'Abdominal bloating and temporary water retention',
      'Breast tenderness or sensitivity',
      'Mild pelvic cramps or lower back ache before bleeding',
      'Mood swings, emotional sensitivity, or feelings of irritability',
      'Temporary fatigue and changes in daytime energy',
      'Mild headaches or food cravings',
    ],
    whenToSeeDoctor: [
      'Severe emotional distress, hopelessness, or panic that disrupts school, work, or relationships',
      'Severe physical pain that prevents everyday activities',
      'Symptoms that continue all month long without easing once a period begins',
    ],
    homeComfort: {
      food:
        'Enjoying potassium- and magnesium-rich foods like bananas (kola), roasted sesame seeds (til), lentils (dal), and spinach (shak) while moderating excess sodium may help ease discomfort from bloating and fatigue.',
      sleep:
        'Creating an unhurried bedtime routine in a cool, dark room may help ease discomfort from premenstrual sleep restlessness.',
      stress:
        'Light journaling, listening to calming music, and taking quiet screen-free breaks may help ease discomfort and emotional irritability.',
      hydration:
        'Drinking steady amounts of water throughout the day may help ease discomfort by encouraging balanced fluid retention.',
      heatAndMovement:
        'Resting a warm water pack on the lower belly and practicing gentle restorative yoga (such as child’s pose or butterfly stretch) may help ease discomfort in the back and pelvis.',
    },
    whatDoctorMayCheck: [
      'Review of a detailed symptom diary tracked across two or more consecutive cycles',
      'Thyroid blood tests to rule out underlying hormone fluctuations that mirror PMS',
      'Evaluation for Premenstrual Dysphoric Disorder (PMDD) if emotional symptoms are intense',
      'General physical evaluation and blood counts',
    ],
    mythsVsFacts: [
      {
        myth: 'Myth: PMS is purely psychological and not a real physical occurrence.',
        fact:
          'Fact: PMS is connected to measurable cyclic hormonal fluctuations and nervous system responses during the luteal phase.',
      },
      {
        myth: 'Myth: Intense, overwhelming emotional distress is just standard PMS.',
        fact:
          'Fact: Severe emotional disruption that stops normal daily life may be PMDD, an accepted medical condition that doctors can help evaluate.',
      },
    ],
    relatedWorkoutIds: ['luteal-grounding', 'bloat-relief'],
    relatedRiskFlagId: null,
    needsReview: true,
  },

  {
    id: 'dysmenorrhea',
    title: 'Period Cramps (Dysmenorrhea)',
    shortName: 'Period Cramps',
    category: 'pain-discomfort',
    categoryLabel: 'Pain & Discomfort',
    summary:
      'Dysmenorrhea is the medical term for menstrual cramps and pelvic pain occurring before or during a period. Primary dysmenorrhea occurs naturally as the uterine muscles contract under the influence of prostaglandins. Secondary dysmenorrhea involves cramping linked to an underlying pelvic condition.',
    symptoms: [
      'Throbbing or aching pelvic pain that starts just before or on the first day of bleeding',
      'Dull ache radiating to the lower back and upper thighs',
      'Mild nausea or loose stools during peak flow hours',
      'Feelings of sluggishness or light fatigue while cramping',
    ],
    whenToSeeDoctor: [
      'Severe or unbearable pelvic pain that does not respond to rest or gentle self-care',
      'Pain scores of 7 to 10 logged repeatedly across multiple cycles',
      'Pelvic pain that begins days before bleeding and continues long after bleeding stops',
      'Pain accompanied by fever, chills, or unusual foul-smelling vaginal discharge',
      'Sudden, sharp, or worsening pelvic pain that feels different from your typical cycle',
    ],
    homeComfort: {
      food:
        'Warm, easily digestible meals like moong dal khichdi, cooked vegetables, and gentle fruits like bananas (kola) while avoiding ice-cold foods may help ease discomfort in the abdomen.',
      sleep:
        'Sleeping in the fetal position with a supportive pillow between the knees may help ease discomfort by relaxing abdominal muscles.',
      stress:
        'Slow, rhythmic abdominal breathing (inhaling gently for 4 seconds, exhaling for 6 seconds) may help ease discomfort by easing muscle tension.',
      hydration:
        'Sipping warm water or warm soups at regular intervals may help ease discomfort and avoid dehydration-triggered muscle tightening.',
      heatAndMovement:
        'Placing a warm water bag or heating pad on the lower tummy or lower back and moving gently through cat-cow and child’s pose stretches may help ease discomfort effectively.',
    },
    whatDoctorMayCheck: [
      'Targeted pelvic examination to evaluate uterine or pelvic tenderness',
      'Pelvic ultrasound to check for anatomical factors like fibroids, polyps, or cysts',
      'Discussion of pain intensity, timing, and impact on school, work, or daily life',
      'Clinical assessment for potential secondary causes, such as endometriosis',
    ],
    mythsVsFacts: [
      {
        myth:
          'Myth: Severe period pain that confines you to bed is normal and must just be tolerated.',
        fact:
          'Fact: While mild cramping is common, severe pain that stops you from attending school or work warrants a professional clinical evaluation.',
      },
      {
        myth: 'Myth: Period cramps will always go away permanently after having a baby.',
        fact:
          'Fact: Childbirth can sometimes change uterine dynamics, but cramps may still continue for many individuals.',
      },
    ],
    relatedWorkoutIds: ['cramps-relief', 'lower-back-soother'],
    relatedRiskFlagId: 'severe_pain_possible',
    needsReview: true,
  },

  {
    id: 'heavy-periods',
    title: 'Heavy Periods (Menorrhagia)',
    shortName: 'Heavy Periods',
    category: 'flow-blood',
    categoryLabel: 'Flow & Blood',
    summary:
      'Heavy menstrual bleeding (clinically called menorrhagia) refers to periods with unusually high blood loss or bleeding that lasts longer than 7 consecutive days. While individual flow varies, consistently heavy bleeding can deplete physical stamina and bodily iron stores over time.',
    symptoms: [
      'Needing to change a sanitary pad or tampon every 1 to 2 hours for consecutive hours',
      'Passing blood clots larger than a coin (approx 2.5 cm across)',
      'Needing double sanitary protection (such as two pads at once) to avoid leaks',
      'Waking up during the night to change sanitary products',
      'Persistent fatigue, weakness, or short breath during or after bleeding days',
    ],
    whenToSeeDoctor: [
      'Soaking through one or more sanitary pads or tampons every hour for 2 or more consecutive hours',
      'Bleeding that continues for more than 7 consecutive days',
      'Experiencing dizziness, lightheadedness, or sudden fainting',
      'Passing large blood clots frequently throughout your period',
      'Bleeding between periods or after intimate contact',
    ],
    homeComfort: {
      food:
        'Eating iron-supportive meals featuring lentils (dal), green leafy vegetables (shak like palong or lal shak), jaggery (gur), sesame seeds (til), eggs, and fish (mach) alongside vitamin C foods like lemon or amla may help ease discomfort and nourish daily stamina.',
      sleep:
        'Allowing for extra rest and sleeping with elevated legs or a supportive side posture may help ease discomfort and physical fatigue on heavy flow days.',
      stress:
        'Taking quiet downtime and postponing demanding chores during peak bleeding hours may help ease discomfort caused by bodily strain.',
      hydration:
        'Drinking plenty of clean water, coconut water, or warm broths may help ease discomfort by maintaining adequate fluid volume.',
      heatAndMovement:
        'Resting with a warm compress on the lower pelvis and choosing slow, unhurried walking rather than intense workouts may help ease discomfort.',
    },
    whatDoctorMayCheck: [
      'Complete blood count (CBC) and serum ferritin test to evaluate iron levels',
      'Pelvic ultrasound to inspect the uterus for polyps, fibroids, or adenomyosis',
      'Thyroid and reproductive hormone panels to investigate cycle regularity',
      'Pap smear and cervical evaluation when clinically appropriate',
      'Discussion of bleeding duration, pad counts, and cycle history',
    ],
    mythsVsFacts: [
      {
        myth: 'Myth: Bleeding through clothes and soaking a pad every hour is just a normal heavy flow.',
        fact:
          'Fact: Extremely heavy flow that disrupts daily life or soaks pads hourly is not typical and warrants clinical evaluation by a healthcare provider.',
      },
      {
        myth: 'Myth: Heavy periods always indicate a dangerous or irreversible condition.',
        fact:
          'Fact: Many heavy periods are caused by common, manageable factors like hormone shifts, polyps, or fibroids that a doctor can assess and guide.',
      },
    ],
    relatedWorkoutIds: ['cramps-relief', 'lower-back-soother'],
    relatedRiskFlagId: 'anemia_possible',
    needsReview: true,
  },

  {
    id: 'anemia',
    title: 'Anemia (Iron Deficiency & Menstrual Health)',
    shortName: 'Anemia',
    category: 'flow-blood',
    categoryLabel: 'Flow & Blood',
    summary:
      'Anemia occurs when the body does not have enough healthy red blood cells or hemoglobin to carry oxygen to tissues. In people who menstruate, repeated blood loss from heavy periods is a frequent factor. A clinical blood test ordered by a doctor is the only definitive way to determine if anemia is present.',
    symptoms: [
      'Persistent tiredness, low stamina, or feeling drained even after full sleep',
      'Unusual pale skin, pale inner eyelids, or pale nail beds',
      'Dizziness, lightheadedness, or feeling faint when standing',
      'Cold hands and feet, or increased sensitivity to chilly temperatures',
      'Shortness of breath during mild activities like climbing stairs',
      'Occasional mild headaches or difficulty concentrating',
    ],
    whenToSeeDoctor: [
      'Soaking through one or more sanitary pads or tampons every hour',
      'Experiencing sudden fainting, severe dizziness, or chest discomfort',
      'Extreme exhaustion that makes it difficult to get out of bed or carry out daily work',
      'Rapid or fluttering heartbeat (palpitations) during ordinary movement',
      'Noticeably pale lips, tongue, or inner eyelids alongside fatigue',
    ],
    homeComfort: {
      food:
        'Consuming naturally iron-rich dietary sources like lentils (masoor and moong dal), dark green leafy vegetables (shak), sesame seeds (til), jaggery (gur), eggs, fish (mach), and meat for non-vegetarians paired with citrus fruits (lemon, amla) may help ease discomfort by supporting balanced daily nutrition.',
      sleep:
        'Prioritizing an unhurried 8 hours of sleep and taking short afternoon pauses when fatigued may help ease discomfort and restore physical stamina.',
      stress:
        'Pacing daily responsibilities and practicing slow, relaxed breathing may help ease discomfort by reducing physical strain on low-energy days.',
      hydration:
        'Drinking plenty of clean water throughout the day may help ease discomfort and maintain healthy blood volume.',
      heatAndMovement:
        'Wearing warm clothing and cozy layers along with gentle stretching or unhurried strolls may help ease discomfort from cold extremities and sluggishness.',
    },
    whatDoctorMayCheck: [
      'Complete Blood Count (CBC) to measure hemoglobin levels and red blood cell count',
      'Serum ferritin and iron profile to evaluate iron stores in the body',
      'Underlying menstrual blood loss assessment and pelvic review',
      'Dietary and medical history discussion to guide clinical recommendations',
    ],
    mythsVsFacts: [
      {
        myth: 'Myth: You can easily diagnose anemia just by looking at pale skin.',
        fact:
          'Fact: While paleness can be an observable sign, a standard blood test performed by a doctor is the only definitive way to confirm low iron levels.',
      },
      {
        myth: 'Myth: Feeling tired all the time is just part of having a period.',
        fact:
          'Fact: Persistent fatigue that limits daily life is not typical and may be linked to low iron or other health factors that a doctor can examine.',
      },
    ],
    relatedWorkoutIds: ['follicular-mobility', 'luteal-grounding'],
    relatedRiskFlagId: 'anemia_possible',
    needsReview: true,
  },

  {
    id: 'endometriosis',
    title: 'Endometriosis',
    shortName: 'Endometriosis',
    category: 'pain-discomfort',
    categoryLabel: 'Pain & Discomfort',
    summary:
      'Endometriosis is a condition where tissue similar to the lining of the uterus grows outside the uterus, such as on the ovaries, fallopian tubes, or pelvic lining. This tissue behaves like uterine lining—thickening and breaking down with each menstrual cycle—which can cause pelvic inflammation and discomfort.',
    symptoms: [
      'Deep, chronic pelvic pain that may begin days before a period and last throughout bleeding',
      'High menstrual pain scores (often rated 7 to 10) that do not respond to ordinary comfort care',
      'Pain during or after intimate contact',
      'Discomfort or pain during bowel movements or urination, particularly during periods',
      'Lower back pain and fatigue that worsens cyclically with periods',
      'Digestive symptoms such as bloating, nausea, or loose stools around menstruation',
    ],
    whenToSeeDoctor: [
      'Pelvic pain that is severe, disabling, or keeps you from attending school or work',
      'High pain scores (7 to 10) occurring consistently month after month',
      'Painful urination or painful bowel movements during bleeding days',
      'Pelvic pain that worsens progressively over successive cycles',
      'Sudden, acute, or unmanageable pelvic pain accompanied by dizziness or fever',
    ],
    homeComfort: {
      food:
        'Choosing comforting foods like turmeric-spiced dal, colorful vegetables (shak, carrots), fresh fruits (kola), and nutritious whole foods while limiting heavy fried items may help ease discomfort in the pelvic area.',
      sleep:
        'Sleeping in a restorative side-lying position with a pillow supporting the abdomen and knees may help ease discomfort and relieve spinal tension.',
      stress:
        'Practicing gentle diaphragmatic breathing, body-scan relaxation, and restful quiet time may help ease discomfort by calming pelvic tension.',
      hydration:
        'Staying consistently hydrated with warm water and comforting broths throughout the day may help ease discomfort by supporting smooth digestion.',
      heatAndMovement:
        'Using a warm water bottle or heating pad on the lower abdomen and practicing gentle restorative yoga (such as child’s pose, butterfly stretch, and cat-cow) may help ease discomfort and soften pelvic floor tightness.',
    },
    whatDoctorMayCheck: [
      'Comprehensive pelvic examination to check for pelvic tenderness or tissue nodules',
      'Specialized pelvic ultrasound or MRI to assess pelvic organs and deep tissue deposits',
      'In-depth discussion of pain patterns, cycle history, and symptom impact on everyday life',
      'Consultation with an experienced gynecologist regarding diagnostic pathways',
    ],
    mythsVsFacts: [
      {
        myth: 'Myth: Having endometriosis is just normal period pain and is all in the head.',
        fact:
          'Fact: Endometriosis is a recognized physical condition involving real tissue outside the uterus, and its pain is genuine.',
      },
      {
        myth: 'Myth: A routine standard ultrasound will always detect endometriosis.',
        fact:
          'Fact: Standard ultrasounds may show certain cysts but can miss smaller or superficial tissue deposits; specialist clinical evaluation is essential.',
      },
    ],
    relatedWorkoutIds: ['cramps-relief', 'lower-back-soother'],
    relatedRiskFlagId: 'severe_pain_possible',
    needsReview: true,
  },

  {
    id: 'thyroid',
    title: 'Thyroid Problems & Cycle Changes',
    shortName: 'Thyroid Changes',
    category: 'hormonal-systemic',
    categoryLabel: 'Hormonal & Systemic',
    summary:
      'The thyroid is a small gland at the base of the neck that produces hormones controlling metabolism and energy. Because thyroid hormones interact closely with reproductive hormones, variations in thyroid function can noticeably alter cycle timing, flow volume, and daily stamina.',
    symptoms: [
      'Menstrual cycles that suddenly become much longer, irregular, or missed',
      'Menstrual flow that becomes unusually heavy (often with low thyroid activity) or unusually light (often with elevated thyroid activity)',
      'Unexplained, persistent tiredness or lethargy despite sleeping well',
      'Unexplained changes in body weight without changes in diet',
      'Sensitivity to temperature (feeling unusually cold or unusually overheated)',
      'Dry skin, brittle nails, or diffuse hair thinning',
    ],
    whenToSeeDoctor: [
      'Menstrual periods that have stopped for 90 or more days (3 months) when not pregnant',
      'Periods that have become highly erratic or unpredictably spaced over several cycles',
      'Excessively heavy bleeding or bleeding lasting longer than 7 consecutive days',
      'Persistent exhaustion, rapid heartbeat, or extreme sensitivity to cold or heat',
      'A visible swelling or fullness at the base of the neck',
    ],
    homeComfort: {
      food:
        'Eating balanced meals with adequate protein (lentils/dal, eggs, fish/mach), fiber-rich vegetables (shak), and whole grains while avoiding erratic skipping of meals may help ease discomfort by supporting steady metabolic energy.',
      sleep:
        'Maintaining consistent sleep and wake hours in a calm, dark environment may help ease discomfort and help manage daytime fatigue.',
      stress:
        'Daily gentle walking, calming breathwork, and reducing demanding physical overexertion may help ease discomfort from metabolic strain.',
      hydration:
        'Drinking adequate water throughout the day and choosing warm fluids when feeling chilly may help ease discomfort and keep digestion regular.',
      heatAndMovement:
        'Dressing in comfortable warm layers when cold and engaging in light morning stretching or gentle walking may help ease discomfort and maintain circulation.',
    },
    whatDoctorMayCheck: [
      'Thyroid blood panel (TSH, Free T3, and Free T4) to evaluate thyroid hormone function',
      'Thyroid antibody tests (such as anti-TPO) to check for autoimmune thyroid patterns',
      'Complete blood count and lipid profile',
      'Physical examination of the neck and thyroid gland',
      'Review of cycle logs, weight changes, and family thyroid history',
    ],
    mythsVsFacts: [
      {
        myth: 'Myth: Thyroid issues only cause neck swelling and have nothing to do with periods.',
        fact:
          'Fact: Thyroid hormones directly interact with the ovaries and pituitary gland, making cycle irregularity or flow changes a common sign.',
      },
      {
        myth: 'Myth: You can balance thyroid hormones solely through diet or lifestyle at home.',
        fact:
          'Fact: While balanced nutrition supports general wellness, true thyroid imbalances require clinical evaluation and guidance by a medical doctor.',
      },
    ],
    relatedWorkoutIds: ['pcos-rhythm', 'luteal-grounding'],
    relatedRiskFlagId: 'thyroid_possible',
    needsReview: true,
  },

  {
    id: 'irregular-periods',
    title: 'Irregular or Missed Periods',
    shortName: 'Irregular Periods',
    category: 'cycle-irregularity',
    categoryLabel: 'Cycle Irregularity',
    summary:
      'An irregular period is one that falls outside the typical cycle range of 21 to 35 days, varies by more than 7 days from month to month, or is absent altogether (amenorrhea). A missed period can have many potential causes—such as significant stress, rapid weight or dietary shifts, thyroid changes, PCOS, intense athletic training, or pregnancy, which should always be considered if sexually active.',
    symptoms: [
      'Cycles that arrive unpredictably (for example, 22 days one month, then 42 days the next)',
      'Cycles that consistently exceed 35 days or occur more frequently than every 21 days',
      'Periods that stop completely for several months',
      'Varying flow volume (very light spotting one month, heavy bleeding the next)',
      'Unpredictable timing of ovulation signs and fertile windows',
    ],
    whenToSeeDoctor: [
      'No period for 90 or more days (3 months) when not pregnant',
      'Periods that suddenly stop after having been regular for years',
      'Bleeding that lasts longer than 7 consecutive days or bleeding between periods',
      'Severe abdominal or pelvic pain accompanied by a missed period',
      'Any missed period when pregnancy is possible, to receive early medical guidance',
    ],
    homeComfort: {
      food:
        'Eating regular, nourishing meals with sufficient calories, healthy fats, complex carbs (rice, roti, dal), and greens (shak) while avoiding restrictive diets may help ease discomfort by providing reliable fuel for the body.',
      sleep:
        'Going to bed at consistent hours and securing 7 to 9 hours of restorative rest may help ease discomfort and support healthy hormone signalling.',
      stress:
        'Lowering daily mental overload through unhurried walks, breathing techniques, and making space for relaxation may help ease discomfort from stress-induced cycle delays.',
      hydration:
        'Drinking 8 to 10 glasses of water daily may help ease discomfort and maintain general hydration.',
      heatAndMovement:
        'Choosing moderate, enjoyable movements like walking, swimming, or restorative yoga rather than exhausting overtraining may help ease discomfort and nourish hormonal rhythm.',
    },
    whatDoctorMayCheck: [
      'Pregnancy test (urine or serum hCG) as an initial evaluation if sexually active',
      'Hormonal blood panel (prolactin, FSH, LH, estrogen, and androgens)',
      'Thyroid blood panel (TSH, Free T4) to investigate metabolic factors',
      'Pelvic ultrasound to visualize the uterus and ovaries',
      'Detailed discussion of recent stress, weight fluctuations, and lifestyle changes',
    ],
    mythsVsFacts: [
      {
        myth: 'Myth: Every woman must have a period exactly every 28 days for it to be normal.',
        fact:
          'Fact: Natural cycle lengths typically range anywhere from 21 to 35 days; moderate variation of a few days between cycles is common.',
      },
      {
        myth: 'Myth: If a period is missed, it always indicates an incurable medical problem.',
        fact:
          'Fact: Missed periods are frequently triggered by temporary factors like travel, acute emotional stress, illness, or diet changes, which a doctor can help evaluate.',
      },
    ],
    relatedWorkoutIds: ['follicular-mobility', 'pcos-rhythm'],
    relatedRiskFlagId: 'see_doctor_soon',
    needsReview: true,
  },

  {
    id: 'fibroids',
    title: 'Uterine Fibroids (Leiomyomas)',
    shortName: 'Fibroids',
    category: 'flow-blood',
    categoryLabel: 'Flow & Blood',
    summary:
      'Uterine fibroids are common non-cancerous growths of smooth muscle and fibrous tissue that develop within or around the muscular walls of the uterus. Many people have fibroids without any noticeable symptoms, while others may experience heavier menstrual bleeding, prolonged bleeding, or a feeling of pelvic pressure.',
    symptoms: [
      'Heavy menstrual bleeding that may include blood clots',
      'Periods that last longer than usual (more than 7 days)',
      'A feeling of pelvic fullness, heaviness, or lower abdominal pressure',
      'Frequent urge to urinate due to pressure on the bladder',
      'Lower back ache or dull aching in the pelvic region',
      'Fatigue or sluggishness related to noticeable blood loss',
    ],
    whenToSeeDoctor: [
      'Bleeding so heavy that you soak through a pad or tampon every hour for two or more consecutive hours',
      'Menstrual bleeding that continues for more than 7 consecutive days',
      'Feeling faint, unusually dizzy, lightheaded, or short of breath with bleeding',
      'Severe, sharp, or sudden pelvic pain that does not settle',
      'Difficulty emptying your bladder or persistent lower abdominal swelling',
    ],
    homeComfort: {
      food:
        'Eating balanced meals rich in natural dietary iron (such as lentils, dal, dark leafy greens like shak, eggs, and fish) along with citrus fruits may help ease discomfort by supporting energy and natural blood building.',
      sleep:
        'Resting in comfortable positions, such as sleeping on your side with a small pillow between your knees, may help ease discomfort from pelvic and lower back pressure.',
      stress:
        'Calm breathing exercises, quiet rest, and soothing evening routines may help ease discomfort caused by daily physical tension.',
      hydration:
        'Sipping warm water, clear broths, and staying well-hydrated throughout the day may help ease discomfort and maintain gentle circulation.',
      heatAndMovement:
        'Applying a warm heating pad to the lower abdomen or lower back, along with gentle walking and light stretching, may help ease discomfort in the pelvis.',
    },
    whatDoctorMayCheck: [
      'Pelvic ultrasound (abdominal or transvaginal) to examine the size, number, and location of any fibroids',
      'Complete Blood Count (CBC) to screen for low red blood cells or anemia caused by blood loss',
      'Pelvic examination to assess the size and contour of the uterus',
      'Discussion of symptom history, bleeding patterns, and personalized care options',
    ],
    mythsVsFacts: [
      {
        myth: 'Myth: Fibroids are cancerous and always dangerous.',
        fact:
          'Fact: Uterine fibroids are benign (non-cancerous) growths and are very common; they do not increase the risk of uterine cancer.',
      },
      {
        myth: 'Myth: Having fibroids always requires major surgery.',
        fact:
          'Fact: Many fibroids need no intervention at all if they cause no symptoms, and doctors offer a range of non-surgical and monitoring approaches.',
      },
      {
        myth: 'Myth: Every person with fibroids experiences heavy bleeding.',
        fact:
          'Fact: Many individuals with small or non-intrusive fibroids have completely normal cycles and may only discover them during a routine checkup.',
      },
    ],
    relatedWorkoutIds: ['lower-back-soother', 'cramps-relief'],
    relatedRiskFlagId: 'anemia_possible',
    needsReview: true,
  },

  {
    id: 'adenomyosis',
    title: 'Adenomyosis',
    shortName: 'Adenomyosis',
    category: 'pain-discomfort',
    categoryLabel: 'Pain & Discomfort',
    summary:
      'Adenomyosis occurs when tissue that normally lines the inside of the uterus (the endometrium) grows into the surrounding muscular wall of the uterus (the myometrium). This displaced tissue continues to thicken, break down, and bleed during each menstrual cycle, which can cause an enlarged uterus, painful cramps, and heavier flow.',
    symptoms: [
      'Intense, sharp, or throbbing pelvic cramps during menstruation',
      'Heavy menstrual bleeding or passing noticeable blood clots',
      'Prolonged menstrual periods lasting more than a week',
      'Pelvic tenderness, pressure, or a feeling of a swollen, heavy lower abdomen',
      'Deep aching in the lower back and radiating down the thighs',
    ],
    whenToSeeDoctor: [
      'Pelvic pain that is severe, disabling, or stops you from performing normal daily activities',
      'Bleeding so heavy that you need to change a pad or tampon every hour for several consecutive hours',
      'Bleeding or spotting that continues beyond 7 consecutive days',
      'Sudden, worsening pelvic pain or unmanageable cramping',
      'Extreme dizziness, lightheadedness, or feeling faint alongside bleeding',
    ],
    homeComfort: {
      food:
        'Enjoying warm, home-cooked meals featuring antioxidant-rich vegetables, lentils, dal, seasonal fruits, and warm ginger or turmeric broths may help ease discomfort during painful days.',
      sleep:
        'Prioritizing 8 hours of quiet nighttime rest in a curled fetal position with a pillow supporting the abdomen may help ease discomfort in the lower pelvic muscles.',
      stress:
        'Mindful deep breathing, gentle guided relaxation, and quiet pauses throughout the day may help ease discomfort by calming the nervous system.',
      hydration:
        'Drinking plenty of warm water and warm decaffeinated fluids throughout the day may help ease discomfort and reduce feelings of abdominal bloat.',
      heatAndMovement:
        'Placing a warm water bottle or heating pad on the lower abdomen, accompanied by restorative resting poses like child’s pose, may help ease discomfort from uterine contractions.',
    },
    whatDoctorMayCheck: [
      'High-resolution pelvic ultrasound to evaluate the thickness and texture of the uterine muscular wall',
      'Pelvic MRI scan, which can provide clear imaging of the junctional zone between the lining and muscle',
      'Complete Blood Count (CBC) to screen for anemia from heavy menstrual bleeding',
      'Review of menstrual history, pain severity timelines, and physical pelvic examination',
    ],
    mythsVsFacts: [
      {
        myth: 'Myth: Adenomyosis and endometriosis are the exact same condition.',
        fact:
          'Fact: While both involve endometrial-like tissue, in adenomyosis the tissue grows inside the muscular wall of the uterus, whereas in endometriosis it grows outside the uterus on other pelvic organs.',
      },
      {
        myth: 'Myth: Severe period pain that keeps you in bed is just normal menstrual cramping.',
        fact:
          'Fact: Menstrual pain so severe that it interrupts daily life or school is not something you must simply endure; a gynecologist can evaluate for underlying factors like adenomyosis.',
      },
      {
        myth: 'Myth: Adenomyosis only happens after multiple pregnancies.',
        fact:
          'Fact: Although it is frequently identified in women in their 30s and 40s who have had children, it can also occur in individuals who have never been pregnant.',
      },
    ],
    relatedWorkoutIds: ['cramps-relief', 'lower-back-soother'],
    relatedRiskFlagId: 'severe_pain_possible',
    needsReview: true,
  },

  {
    id: 'pmdd',
    title: 'PMDD (Premenstrual Dysphoric Disorder)',
    shortName: 'PMDD',
    category: 'hormonal-systemic',
    categoryLabel: 'Hormonal & Systemic',
    summary:
      'Premenstrual Dysphoric Disorder (PMDD) is a severe, recognized cyclical health condition where noticeable emotional and physical symptoms appear during the luteal phase (usually 7 to 10 days before bleeding) and improve shortly after menstruation starts. It is understood as a heightened neurological sensitivity to normal monthly hormonal changes.',
    symptoms: [
      'Intense irritability, sudden anger, or heightened tension before periods',
      'Deep sadness, tearfulness, or feelings of despair that lift after bleeding begins',
      'Marked anxiety, feeling overwhelmed, or being unable to cope with daily tasks',
      'Severe physical fatigue, low stamina, or difficulty concentrating (brain fog)',
      'Sleep disturbances, including insomnia or excessive daytime sleepiness',
      'Physical discomforts such as breast tenderness, headaches, joint aches, or bloating',
    ],
    whenToSeeDoctor: [
      'Emotional or mood symptoms that feel severe, unmanageable, or cause intense distress before your period',
      'Experiencing feelings of hopelessness or thoughts of self-harm',
      'Mood changes that severely disrupt your daily relationships, work, or ability to function',
      'Symptoms that do not improve within a few days after your period starts',
    ],
    homeComfort: {
      food:
        'Consuming regular, balanced meals with complex carbohydrates (such as oats, brown rice, whole wheat roti, and dal) to support steady blood sugar and daily energy may help ease discomfort.',
      sleep:
        'Maintaining a calm, consistent sleep schedule and creating a quiet, dark bedroom environment may help ease discomfort associated with premenstrual fatigue and restlessness.',
      stress:
        'Scheduling quieter days in the late luteal phase, engaging in gentle mindfulness, journaling, and stepping back from high-pressure commitments may help ease discomfort.',
      hydration:
        'Drinking regular glasses of clean water throughout the day and limiting high-salt snacks may help ease discomfort from fluid retention and premenstrual headaches.',
      heatAndMovement:
        'Gentle restorative yoga, slow outdoor walks in natural light, and quiet stretching may help ease discomfort by boosting calming brain signals without physical strain.',
    },
    whatDoctorMayCheck: [
      'Symptom tracking calendar across at least two consecutive cycles to confirm the luteal timing of symptoms',
      'Thyroid screening blood tests to rule out overlapping endocrine factors',
      'Evaluation using standardized clinical diagnostic criteria (such as DSM-5 criteria for PMDD)',
      'Discussion of personal and family mental wellness history alongside cycle timelines',
    ],
    mythsVsFacts: [
      {
        myth: 'Myth: PMDD is just standard PMS or moodiness that someone should just get over.',
        fact:
          'Fact: PMDD is a recognized medical condition involving real biological sensitivity to hormone shifts, causing severe distress that deserves clinical validation and support.',
      },
      {
        myth: 'Myth: People with PMDD experience symptoms all month long.',
        fact:
          'Fact: PMDD is strictly cyclical; symptoms occur in the luteal window and resolve completely within a few days after menstrual bleeding begins, leaving symptom-free weeks.',
      },
      {
        myth: 'Myth: There are no clinical options for PMDD.',
        fact:
          'Fact: Qualified healthcare providers have established clinical guidelines and evidence-informed support plans to help manage PMDD effectively.',
      },
    ],
    relatedWorkoutIds: ['luteal-grounding', 'bloat-relief'],
    relatedRiskFlagId: null,
    needsReview: true,
  },
];

/**
 * Helper: Find condition by ID slug.
 * @param {string} id
 * @returns {object|undefined}
 */
export function getConditionById(id) {
  if (!id) return undefined;
  return CONDITIONS.find((c) => c.id.toLowerCase() === id.toLowerCase());
}

/**
 * Helper: Get conditions filtered by category.
 * @param {string} category - Category key or 'all'
 * @returns {Array}
 */
export function getConditionsByCategory(category) {
  if (!category || category === 'all') {
    return CONDITIONS;
  }
  return CONDITIONS.filter((c) => c.category === category);
}

/**
 * Helper: Search conditions by keyword across title, shortName, summary, symptoms, and myths.
 * @param {string} query
 * @returns {Array}
 */
export function searchConditions(query) {
  if (!query || typeof query !== 'string' || !query.trim()) {
    return CONDITIONS;
  }
  const q = query.trim().toLowerCase();
  return CONDITIONS.filter((c) => {
    const titleMatch = c.title.toLowerCase().includes(q);
    const shortNameMatch = c.shortName.toLowerCase().includes(q);
    const summaryMatch = c.summary.toLowerCase().includes(q);
    const symptomMatch = c.symptoms.some((s) => s.toLowerCase().includes(q));
    const redFlagMatch = c.whenToSeeDoctor?.some((rf) => rf.toLowerCase().includes(q));
    const mythMatch = c.mythsVsFacts.some(
      (m) => m.myth.toLowerCase().includes(q) || m.fact.toLowerCase().includes(q)
    );
    return titleMatch || shortNameMatch || summaryMatch || symptomMatch || redFlagMatch || mythMatch;
  });
}

/**
 * Helper: Find condition matching a risk screening flag ID (first match).
 * @param {string} riskFlagId
 * @returns {object|undefined}
 */
export function getConditionForRiskFlag(riskFlagId) {
  if (!riskFlagId) return undefined;
  return CONDITIONS.find((c) => c.relatedRiskFlagId === riskFlagId);
}

/**
 * Helper: Get all conditions matching a risk screening flag ID.
 * @param {string} riskFlagId
 * @returns {Array}
 */
export function getConditionsForRiskFlag(riskFlagId) {
  if (!riskFlagId) return [];
  return CONDITIONS.filter((c) => c.relatedRiskFlagId === riskFlagId);
}

/**
 * Helper: Combined filter by category and search query.
 * @param {object} params
 * @param {string} [params.category='all']
 * @param {string} [params.query='']
 * @returns {Array}
 */
export function filterConditions({ category = 'all', query = '' } = {}) {
  let list = CONDITIONS;
  if (category && category !== 'all') {
    list = list.filter((c) => c.category === category);
  }
  if (query && typeof query === 'string' && query.trim()) {
    const q = query.trim().toLowerCase();
    list = list.filter((c) => {
      const titleMatch = c.title.toLowerCase().includes(q);
      const shortNameMatch = c.shortName.toLowerCase().includes(q);
      const summaryMatch = c.summary.toLowerCase().includes(q);
      const symptomMatch = c.symptoms.some((s) => s.toLowerCase().includes(q));
      const redFlagMatch = c.whenToSeeDoctor?.some((rf) => rf.toLowerCase().includes(q));
      const mythMatch = c.mythsVsFacts.some(
        (m) => m.myth.toLowerCase().includes(q) || m.fact.toLowerCase().includes(q)
      );
      return titleMatch || shortNameMatch || summaryMatch || symptomMatch || redFlagMatch || mythMatch;
    });
  }
  return list;
}

/**
 * Helper: Return all conditions.
 * @returns {Array}
 */
export function getAllConditions() {
  return CONDITIONS;
}
