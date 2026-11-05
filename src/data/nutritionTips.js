/**
 * Nutrition and Self-Care Guide by Cycle Phase and Diet Preference.
 *
 * NOTE: As required by PRD.md, Rules.md, and Tasks.md, all health content
 * must be explicitly marked as "needs expert review" until reviewed by a qualified doctor or nutritionist.
 */

export const NUTRITION_METADATA = {
  version: '1.0.0',
  reviewStatus: 'needs expert review',
  reviewedBy: null,
  lastReviewedDate: null,
  disclaimer:
    'This nutrition guidance provides general dietary and lifestyle information only and is not medical advice. Individual needs vary. If you have severe symptoms, food allergies, or medical conditions, please consult a qualified doctor or clinical dietitian.',
};

export const NUTRITION_TIPS = {
  menstrual: {
    phaseName: 'Menstrual Phase',
    theme: 'Replenish & Restore',
    overview:
      'During your period, your body loses blood, iron, and minerals. Hormone levels are at their baseline and your energy naturally dips. Focus on warm, easily digestible foods, iron replenishment, and hydration.',
    diets: {
      'non-veg': {
        title: 'Iron Replenishment & Warming Comfort',
        focus: 'Replenish iron and zinc, support gut comfort, stay well-hydrated.',
        eat: [
          {
            food: 'Choto Macher Jhol (Small freshwater fish curry)',
            reason: 'Rich in easily absorbable heme iron, zinc, and anti-inflammatory omega-3 fatty acids.',
            icon: '🐟',
          },
          {
            food: 'Light Chicken or Mutton Shorba / Broth',
            reason: 'Provides warming collagen, amino acids, and minerals to soothe body aches and fatigue.',
            icon: '🍲',
          },
          {
            food: 'Palong Shak (Spinach) or Notey Shak with Lemon',
            reason: 'High in plant iron and folate. Vitamin C from lemon boosts iron absorption.',
            icon: '🥬',
          },
          {
            food: 'Gur (Jaggery) with Roasted Gram / Chana',
            reason: 'Traditional iron booster that helps combat tiredness without refined sugar crashes.',
            icon: '🍯',
          },
          {
            food: 'Til (Sesame seeds) or Til er Ladoo',
            reason: 'Packed with magnesium, calcium, and zinc to help ease uterine muscle cramping.',
            icon: '🌱',
          },
        ],
        avoid: [
          {
            item: 'Excessive Caffeine (Strong tea/coffee)',
            reason: 'Can constrict blood vessels and amplify menstrual cramps or breast tenderness.',
          },
          {
            item: 'Heavy, Deep-Fried Street Food (Singara, Puri)',
            reason: 'Digestion is slower during menstruation; heavy oil can cause indigestion and nausea.',
          },
          {
            item: 'Excess Salt & Salty Snacks (Chanachur, Chips)',
            reason: 'High sodium leads to water retention and uncomfortable abdominal bloating.',
          },
          {
            item: 'Carbonated Cold Drinks',
            reason: 'Can cause stomach distension, gas, and abdominal chilliness.',
          },
        ],
        selfCare:
          'Rest without guilt. Use a hot water bag on your lower abdomen, take warm showers, and do gentle pelvic stretches rather than high-intensity workouts.',
      },
      eggetarian: {
        title: 'Nutrient-Dense Protein & Mineral Replenishment',
        focus: 'Iron recovery, gentle warmth, electrolyte and magnesium balance.',
        eat: [
          {
            food: 'Boiled Egg or Dimer Patla Jhol',
            reason: 'Provides high-quality complete protein, choline, and bioavailable iron.',
            icon: '🥚',
          },
          {
            food: 'Masoor or Moong Dal with a Touch of Ghee',
            reason: 'Comforting, easily digested protein; ghee aids fat-soluble vitamin absorption.',
            icon: '🥣',
          },
          {
            food: 'Palong Shak (Spinach) or Methi Shak with Lemon',
            reason: 'Folate and non-heme iron paired with vitamin C for enhanced uptake.',
            icon: '🥬',
          },
          {
            food: 'Kolar Mocha (Banana blossom) or Raw Banana Curry',
            reason: 'Traditional Bengali foods naturally rich in iron, potassium, and digestive fiber.',
            icon: '🍌',
          },
          {
            food: 'Gur (Jaggery) with Til or Soaked Almonds',
            reason: 'Rich in magnesium and iron to support muscle relaxation and steady stamina.',
            icon: '🍯',
          },
        ],
        avoid: [
          {
            item: 'Excessive Caffeine',
            reason: 'May worsen uterine contractions and cause jittery fatigue.',
          },
          {
            item: 'Very Spicy or Oily Dishes',
            reason: 'Can aggravate stomach sensitivity and acid reflux.',
          },
          {
            item: 'High-Sodium Packaged Snacks',
            reason: 'Increases water retention, breast soreness, and puffiness.',
          },
          {
            item: 'Ice-Cold Beverages',
            reason: 'Warm fluids generally ease abdominal tension much better.',
          },
        ],
        selfCare:
          'Keep your abdomen and feet warm. Sip warm ginger or saunf (fennel) water throughout the day and get 8+ hours of restful sleep.',
      },
      veg: {
        title: 'Plant Iron, Minerals & Digestive Comfort',
        focus: 'Plant-based iron, magnesium, warm herbal teas, and smooth digestion.',
        eat: [
          {
            food: 'Moong or Masoor Dal with Jeera Tadka',
            reason: 'Gentle on the stomach, providing clean protein, iron, and potassium.',
            icon: '🥣',
          },
          {
            food: 'Palong Shak (Spinach) or Green Amaranth with Lemon',
            reason: 'Packed with iron and folate; always add lemon juice to maximize iron uptake.',
            icon: '🥬',
          },
          {
            food: 'Kolar Mocha (Banana flower) or Kanchkolar Jhol',
            reason: 'Time-tested remedy for menstrual weakness, packed with iron and gut-friendly fiber.',
            icon: '🍌',
          },
          {
            food: 'Gur (Jaggery) with Til or Peanuts',
            reason: 'Traditional mineral source supplying iron, magnesium, and warmth.',
            icon: '🍯',
          },
          {
            food: 'Kola (Ripe Banana)',
            reason: 'High in potassium and vitamin B6 to reduce water retention and cramping.',
            icon: '🍌',
          },
        ],
        avoid: [
          {
            item: 'Strong Tea or Coffee Immediately After Meals',
            reason: 'Tannins in tea and coffee inhibit plant-iron absorption by up to 60%. Wait 1 hour.',
          },
          {
            item: 'Deep-Fried Snacks (Pecan pakoras, singara)',
            reason: 'Can trigger gastrointestinal sluggishness and acidity.',
          },
          {
            item: 'Very Salty Foods & Pickles (Achaar)',
            reason: 'Promotes sodium-related bloating and fluid retention.',
          },
          {
            item: 'Cold Sugary Soft Drinks',
            reason: 'Causes blood sugar spikes followed by fatigue.',
          },
        ],
        selfCare:
          'Prioritize warmth and stillness. Gentle breathing exercises (Pranayama) and warm turmeric milk (haldi doodh) before bed promote restful sleep.',
      },
    },
  },

  follicular: {
    phaseName: 'Follicular Phase',
    theme: 'Energy & Renewal',
    overview:
      'As estrogen rises after your period ends, your energy, mental clarity, and metabolism begin to increase. Your body thrives on crisp, vibrant vegetables, clean proteins, and probiotic foods that support healthy estrogen metabolism.',
    diets: {
      'non-veg': {
        title: 'Clean Protein & Estrogen-Metabolizing Greens',
        focus: 'Probiotics, lean protein, crisp vegetables, and rising stamina.',
        eat: [
          {
            food: 'Grilled or Lightly Steamed Rui / Bhetki Fish',
            reason: 'Clean lean protein and omega-3s supporting the development of a healthy follicle.',
            icon: '🐟',
          },
          {
            food: 'Chicken Stew with Papaya, Carrots & Beans',
            reason: 'Easily digestible protein and colorful beta-carotenes for skin and hormonal balance.',
            icon: '🍲',
          },
          {
            food: 'Tok Doi (Plain Yogurt / Curd)',
            reason: 'Rich in gut-friendly probiotics which help your liver and gut process rising estrogen smoothly.',
            icon: '🥛',
          },
          {
            food: 'Sprouted Moong Salad with Lemon & Cucumber',
            reason: 'Crisp, refreshing, and loaded with enzymes, fiber, and vitamin C.',
            icon: '🥗',
          },
          {
            food: 'Tishi (Flaxseeds) & Pumpkin Seeds',
            reason: 'Contains lignans and zinc to naturally support follicular development.',
            icon: '🌱',
          },
        ],
        avoid: [
          {
            item: 'Heavy Creamy Gravies',
            reason: 'Can feel sluggish as your body naturally craves fresher, lighter meals.',
          },
          {
            item: 'Ultra-Processed Sweets & Pastries',
            reason: 'Avoid erratic insulin spikes while insulin sensitivity is optimal.',
          },
          {
            item: 'Excessive Alcohol',
            reason: 'Taxes the liver during a phase when it is busy metabolizing hormones.',
          },
        ],
        selfCare:
          'Your physical endurance is building! Great time for moderate workouts, brisk walks, cardio, and starting creative new tasks.',
      },
      eggetarian: {
        title: 'Fresh Vitality, Probiotics & Active Fuel',
        focus: 'Probiotic support, light proteins, fresh greens, and seed support.',
        eat: [
          {
            food: 'Poached or Boiled Eggs with Whole Grain Roti',
            reason: 'High biological value protein and B-complex vitamins for cellular renewal.',
            icon: '🥚',
          },
          {
            food: 'Tok Doi (Yogurt) with Flaxseed Powder',
            reason: 'Probiotic gut support paired with phytoestrogenic lignans.',
            icon: '🥛',
          },
          {
            food: 'Sprouted Chana & Moong Chaat with Coriander',
            reason: 'High-fiber, enzymatic breakfast or snack for steady all-day energy.',
            icon: '🥗',
          },
          {
            food: 'Bandhakopi (Cabbage), Broccoli or Cauliflower',
            reason: 'Cruciferous vegetables containing indole-3-carbinol to balance estrogen.',
            icon: '🥦',
          },
          {
            food: 'Fresh Seasonal Fruits (Papaya, Apple, Pomegranate)',
            reason: 'Loaded with polyphenols and natural hydration.',
            icon: '🍎',
          },
        ],
        avoid: [
          {
            item: 'Heavy, Stodgy Fast Foods',
            reason: 'Counteracts your natural energetic spring and causes sluggishness.',
          },
          {
            item: 'Excess Sugar-Sweetened Beverages',
            reason: 'Spikes blood glucose unnecessarily.',
          },
          {
            item: 'Stale Leftovers',
            reason: 'Prioritize fresh, live, crisp meals during the renewal phase.',
          },
        ],
        selfCare:
          'Take advantage of rising motivation. Try dynamic yoga, social outings, or aerobic exercises that get your heart rate up.',
      },
      veg: {
        title: 'Plant Enzymes, Probiotics & Vibrant Greens',
        focus: 'Cruciferous vegetables, sprouted legumes, probiotics, and seed cycling.',
        eat: [
          {
            food: 'Sprouted Moong Salad or Light Khichdi',
            reason: 'Easily assimilated plant protein rich in active enzymes and fiber.',
            icon: '🌱',
          },
          {
            food: 'Fresh Tok Doi (Curd) or Ghol (Buttermilk)',
            reason: 'Maintains optimal gut flora to aid healthy hormone clearance.',
            icon: '🥛',
          },
          {
            food: 'Cabbage, Cauliflower & Sajne Data (Drumstick)',
            reason: 'Cruciferous nutrients support phase-1 and phase-2 liver detoxification.',
            icon: '🥦',
          },
          {
            food: 'Tishi (Flaxseeds) & Pumpkin Seeds',
            reason: 'Provides essential fatty acids and lignans for the follicular phase.',
            icon: '✨',
          },
          {
            food: 'Carrot, Cucumber & Beetroot Salad',
            reason: 'Supports bile flow and delivers refreshing hydration.',
            icon: '🥕',
          },
        ],
        avoid: [
          {
            item: 'Excess Oily Gravies',
            reason: 'Heavy meals can dampen the fresh, vibrant energy of this phase.',
          },
          {
            item: 'Refined White Flour Products (Maida)',
            reason: 'Lacks fiber needed for clearing used hormones through the gut.',
          },
          {
            item: 'Sugary Carbonated Sodas',
            reason: 'Empty calories that lead to sudden afternoon energy crashes.',
          },
        ],
        selfCare:
          'Engage your mind and body. Enjoy outdoor activities, brisk morning walks, and starting challenging projects while cognitive focus is sharp.',
      },
    },
  },

  ovulation: {
    phaseName: 'Ovulation Phase',
    theme: 'Peak Vitality & Balance',
    overview:
      'Estrogen and luteinizing hormone reach their monthly peak as an egg is released. Your body temperature rises slightly, and social confidence and libido are typically highest. Focus on antioxidant-rich, anti-inflammatory foods and liver-supporting hydration.',
    diets: {
      'non-veg': {
        title: 'Antioxidant Power & Anti-Inflammatory Fuel',
        focus: 'Antioxidants, glutathione precursors, liver support, and cooling hydration.',
        eat: [
          {
            food: 'Freshwater Fish (Rui, Katla or Salmon)',
            reason: 'Omega-3 fatty acids regulate inflammation and support cellular membrane health.',
            icon: '🐟',
          },
          {
            food: 'Bedana (Pomegranate) or Seasonal Berries',
            reason: 'Rich in polyphenols and vitamin C that protect ovulatory cells from oxidative stress.',
            icon: '🫐',
          },
          {
            food: 'Steamed Greens with Garlic & Ginger',
            reason: 'Sulfur-rich foods that boost glutathione, the liver’s master detoxifier.',
            icon: '🧄',
          },
          {
            food: 'Daab (Tender Coconut Water)',
            reason: 'Natural electrolytes to keep the body cool during the slight basal temperature rise.',
            icon: '🥥',
          },
          {
            food: 'Sunflower & Pumpkin Seeds',
            reason: 'Rich in zinc and vitamin E which support healthy follicle release.',
            icon: '🌻',
          },
        ],
        avoid: [
          {
            item: 'Over-Spiced Hot Curries',
            reason: 'Internal temperature is slightly higher; excessive chili can trigger facial flushing and acidity.',
          },
          {
            item: 'Excess Refined Carbs (Maida naans, white bread)',
            reason: 'High glycemic index can cause sharp insulin spikes that affect ovulation hormones.',
          },
          {
            item: 'Artificial Sweeteners & Preservatives',
            reason: 'May stress the liver while it processes the estrogen surge.',
          },
        ],
        selfCare:
          'Channel your peak communication skills and confidence. High-intensity workouts, strength training, and collaborative activities feel most rewarding now.',
      },
      eggetarian: {
        title: 'Antioxidants & Glutathione Support',
        focus: 'Choline, zinc, vitamin E, and natural electrolyte hydration.',
        eat: [
          {
            food: 'Boiled Egg with Bell Peppers & Tomatoes',
            reason: 'High in choline, zinc, and lycopene—all essential for cellular and egg health.',
            icon: '🥚',
          },
          {
            food: 'Fresh Bedana (Pomegranate) or Guava (Peara)',
            reason: 'Packed with vitamin C and bioflavonoids to support ovarian tissue health.',
            icon: '🍈',
          },
          {
            food: 'Paneer or Tofu Stir-Fry with Colorful Veggies',
            reason: 'Light, clean protein with antioxidant-rich capsicum and zucchini.',
            icon: '🥗',
          },
          {
            food: 'Daab (Tender Coconut Water)',
            reason: 'Restores potassium and balances cellular hydration naturally.',
            icon: '🥥',
          },
          {
            food: 'Sunflower & Sesame Seeds',
            reason: 'Supplies zinc, selenium, and vitamin E to support the transition to the luteal phase.',
            icon: '🌻',
          },
        ],
        avoid: [
          {
            item: 'Excessive Red Chili & Heating Spices',
            reason: 'May trigger acne breakouts or heat sensation during peak estrogen.',
          },
          {
            item: 'Refined Bakery Goods',
            reason: 'Sudden insulin shifts can cause mood swings post-ovulation.',
          },
          {
            item: 'Over-Processed Salty Foods',
            reason: 'Can initiate premature premenstrual water retention.',
          },
        ],
        selfCare:
          'Peak physical performance window! Great time for HIIT workouts, weight lifting, social gatherings, or public speaking.',
      },
      veg: {
        title: 'Cooling Antioxidants, Zinc & High Fiber',
        focus: 'Liver support, cooling hydration, zinc, and plant polyphenols.',
        eat: [
          {
            food: 'Bedana (Pomegranate) or Peara (Guava)',
            reason: 'High in antioxidants and vitamin C that nourish hormonal balance.',
            icon: '🍎',
          },
          {
            food: 'Fresh Paneer or Soybean with Tomatoes & Dhania',
            reason: 'Clean plant protein paired with lycopene and cooling fresh coriander.',
            icon: '🧀',
          },
          {
            food: 'Daab (Tender Coconut Water) & Cucumber',
            reason: 'Naturally cooling, mineral-rich hydration to soothe mid-cycle temperature rise.',
            icon: '🥥',
          },
          {
            food: 'Sunflower Seeds & Almonds',
            reason: 'Excellent sources of vitamin E and zinc to nourish ovulatory balance.',
            icon: '🌻',
          },
          {
            food: 'Spinach & Methi Leaves Cooked with Garlic',
            reason: 'Provides sulfur compounds and magnesium to assist liver clearance.',
            icon: '🧄',
          },
        ],
        avoid: [
          {
            item: 'Excess Fried Savories',
            reason: 'Heavy fats tax liver capacity when processing estrogen peaks.',
          },
          {
            item: 'Refined Sugar Treats',
            reason: 'Sharp glycemic spikes can precipitate an energy crash as hormones shift.',
          },
          {
            item: 'Dehydrating Salty Snacks',
            reason: 'Proper cellular hydration is critical during ovulation.',
          },
        ],
        selfCare:
          'Embrace high energy and express your ideas. Keep a bottle of water or coconut water nearby, and enjoy social connections.',
      },
    },
  },

  luteal: {
    phaseName: 'Luteal Phase',
    theme: 'Grounding & PMS Relief',
    overview:
      'Progesterone rises after ovulation to prepare your body for a potential pregnancy or a new cycle. As progesterone peaks and then drops before your period, you might experience PMS, cravings, bloating, or mood shifts. Focus on magnesium, complex carbohydrates to stabilize serotonin, and herbal teas to relieve fluid retention.',
    diets: {
      'non-veg': {
        title: 'Magnesium, Serotonin Boosters & Anti-Bloat Foods',
        focus: 'Stabilize blood sugar, curb PMS cravings, support mood with magnesium.',
        eat: [
          {
            food: 'Ranga Alu (Sweet Potato) or Brown Rice',
            reason: 'Complex carbohydrates promote steady serotonin production, curbing PMS mood swings and carb cravings.',
            icon: '🍠',
          },
          {
            food: 'Magur or Rui Macher Patla Jhol with Ginger',
            reason: 'Comforting, easily digestible protein; ginger helps relieve premenstrual nausea and cramps.',
            icon: '🍲',
          },
          {
            food: 'Dark Chocolate (70%+) or Warm Cocoa',
            reason: 'Rich in magnesium and flavonoids to relax muscles and naturally uplift mood.',
            icon: '🍫',
          },
          {
            food: 'Kola (Ripe Banana) with Soaked Walnuts',
            reason: 'Vitamin B6, potassium, and magnesium work together to reduce fluid retention and breast soreness.',
            icon: '🍌',
          },
          {
            food: 'Saunf (Fennel) & Ada (Ginger) Infused Tea',
            reason: 'A gentle, traditional digestive aid that relieves gas and premenstrual abdominal puffiness.',
            icon: '☕',
          },
        ],
        avoid: [
          {
            item: 'Refined Sugar & Candy',
            reason: 'Triggers roller-coaster blood sugar spikes that worsen premenstrual anxiety and irritability.',
          },
          {
            item: 'Very Salty Foods, Pickles (Achaar) & Soy Sauce',
            reason: 'High sodium leads to uncomfortable water retention and breast tenderness.',
          },
          {
            item: 'Excessive Alcohol',
            reason: 'Depletes B vitamins and disrupts deep REM sleep during the vulnerable luteal phase.',
          },
          {
            item: 'Late Night Heavy Dinners',
            reason: 'Digestion slows before menstruation; late heavy meals impair sleep quality.',
          },
        ],
        selfCare:
          'Slow down your pace. Swap intense workouts for yoga, pilates, or gentle evening walks. Practice journaling and prioritize emotional comfort.',
      },
      eggetarian: {
        title: 'Steady Blood Sugar, Vitamin B6 & Muscle Relaxation',
        focus: 'Combat PMS cravings, sustain serotonin, reduce water retention.',
        eat: [
          {
            food: 'Omelette with Spinach & Mushrooms',
            reason: 'High in vitamin B6, choline, and vitamin D to support mood and reduce premenstrual fatigue.',
            icon: '🥚',
          },
          {
            food: 'Ranga Alu (Sweet Potato) Boiled with Chaat Masala',
            reason: 'Fiber-rich complex carb that prevents late-afternoon sugar cravings.',
            icon: '🍠',
          },
          {
            food: 'Dark Chocolate (70%+) & Almonds',
            reason: 'Delivers essential magnesium to prevent headaches, irritability, and muscle cramps.',
            icon: '🍫',
          },
          {
            food: 'Kola (Banana) & Tok Doi (Curd)',
            reason: 'Calcium, magnesium, and potassium harmonize to calm muscle tension and anxiety.',
            icon: '🍌',
          },
          {
            food: 'Warm Saunf (Fennel) and Chamomile Tea',
            reason: 'Relaxes smooth intestinal muscles, relieving bloating and supporting calm sleep.',
            icon: '☕',
          },
        ],
        avoid: [
          {
            item: 'Refined Sugar & Sweetened Pastries',
            reason: 'Aggravates PMS mood swings and leads to sudden fatigue.',
          },
          {
            item: 'Excess Salt & Packaged Chips',
            reason: 'Worsens fluid retention and feeling bloated in your clothes.',
          },
          {
            item: 'Late Afternoon Caffeine',
            reason: 'Progesterone naturally raises core temperature; caffeine can cause insomnia.',
          },
        ],
        selfCare:
          'Set healthy boundaries. Take warm epsom salt baths, read a comforting book, and embrace restorative self-care without pressure.',
      },
      veg: {
        title: 'Grounding Carbs, Magnesium & Calming Herbs',
        focus: 'Complex carbohydrates, magnesium, potassium, and gentle digestion.',
        eat: [
          {
            food: 'Ranga Alu (Sweet Potato) or Whole Wheat Khichdi',
            reason: 'Sustained energy release helps maintain serotonin and steady mood.',
            icon: '🍠',
          },
          {
            food: 'Moong Dal with Palong Shak & a Touch of Ghee',
            reason: 'Nourishing, grounding, and rich in magnesium to relax the nervous system.',
            icon: '🥣',
          },
          {
            food: 'Dark Chocolate or Warm Almond Milk with Cocoa',
            reason: 'Satisfies sweet cravings naturally while delivering essential magnesium.',
            icon: '🍫',
          },
          {
            food: 'Kola (Ripe Banana) with Roasted Til / Chikki',
            reason: 'Packed with vitamin B6, potassium, and calcium to counteract water retention.',
            icon: '🍌',
          },
          {
            food: 'Saunf (Fennel) & Jeera Tea',
            reason: 'Traditional carminative herbs that banish premenstrual bloating and gas.',
            icon: '☕',
          },
        ],
        avoid: [
          {
            item: 'White Sugar & Sweets (Mishti, Jalebi)',
            reason: 'Leads to severe insulin crashes that heighten premenstrual emotional sensitivity.',
          },
          {
            item: 'High-Sodium Pickles (Achaar) & Salty Namkeen',
            reason: 'Increases water retention, bloating, and swelling in fingers and ankles.',
          },
          {
            item: 'Large Quantities of Raw Cruciferous Veggies',
            reason: 'Raw cabbage or broccoli can cause excess gas; prefer them steamed or lightly sauteed.',
          },
          {
            item: 'Strong Coffee on an Empty Stomach',
            reason: 'Can spike cortisol and trigger anxiety or heart palpitations during the luteal phase.',
          },
        ],
        selfCare:
          'Be gentle with yourself. If your body asks for extra sleep, honor it. Practice restorative yoga poses (Child’s pose, Legs-up-the-wall) and warm herbal sips.',
      },
    },
  },
};

/**
 * Retrieves the nutrition tips for a specific cycle phase and diet preference.
 *
 * @param {'menstrual'|'follicular'|'ovulation'|'luteal'} phase
 * @param {'veg'|'non-veg'|'eggetarian'} [dietPreference='non-veg']
 * @returns {object} Phase-specific nutrition and self-care guide
 */
export function getNutritionTips(phase, dietPreference = 'non-veg') {
  const cleanPhase = phase && NUTRITION_TIPS[phase] ? phase : 'menstrual';
  const phaseData = NUTRITION_TIPS[cleanPhase];

  const cleanDiet =
    dietPreference && phaseData.diets[dietPreference]
      ? dietPreference
      : 'non-veg';

  const dietTips = phaseData.diets[cleanDiet];

  return {
    phase: cleanPhase,
    phaseName: phaseData.phaseName,
    theme: phaseData.theme,
    overview: phaseData.overview,
    dietPreference: cleanDiet,
    metadata: NUTRITION_METADATA,
    ...dietTips,
  };
}

/**
 * Returns all phase data with metadata for the Tips explorer page.
 *
 * @param {'menstrual'|'follicular'|'ovulation'|'luteal'} phase
 * @returns {object}
 */
export function getPhaseOverview(phase) {
  const cleanPhase = phase && NUTRITION_TIPS[phase] ? phase : 'menstrual';
  return {
    ...NUTRITION_TIPS[cleanPhase],
    metadata: NUTRITION_METADATA,
  };
}
