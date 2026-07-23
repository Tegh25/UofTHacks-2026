/**
 * Lightweight, deterministic autofill suggestions extracted from the
 * patient's own symptom description. These are suggestions only — the
 * patient always has final control over every field.
 */

/**
 * Try to extract an age the patient mentioned in their description,
 * e.g. "I'm 34", "34 years old", "age 34".
 */
export function suggestAgeFromText(text: string): number | null {
  const patterns = [
    /\b(?:i(?:'|’)?m|i am)\s+(\d{1,3})\b/i,
    /\b(\d{1,3})\s*(?:years?|yrs?)\s*old\b/i,
    /\bage\s*(?:is\s*)?(\d{1,3})\b/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const age = Number(match[1]);
      if (age >= 1 && age <= 110) return age;
    }
  }
  return null;
}

/**
 * Conditions mentioned in the symptom description, used to highlight
 * (never pre-select) items on the medical history screen.
 */
export function suggestConditionsFromText(
  text: string,
  knownConditions: string[]
): string[] {
  const lower = text.toLowerCase();

  const keywordMap: Record<string, string[]> = {
    'High blood pressure': ['blood pressure', 'hypertension'],
    Diabetes: ['diabetes', 'diabetic', 'blood sugar'],
    Asthma: ['asthma', 'inhaler'],
    'Heart disease': ['heart disease', 'heart condition', 'heart problem'],
    Allergies: ['allergy', 'allergies', 'allergic'],
    Arthritis: ['arthritis', 'joint pain'],
    'Anxiety or depression': ['anxiety', 'depression', 'panic'],
    'Chronic pain': ['chronic pain'],
  };

  return knownConditions.filter((condition) =>
    (keywordMap[condition] ?? [condition.toLowerCase()]).some((kw) =>
      lower.includes(kw)
    )
  );
}
