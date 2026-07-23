/**
 * Seed script: inserts a few fully-processed demo patients so the dashboard
 * has data to show immediately. Run with: npm run seed
 *
 * Seeded records mirror exactly what the live pipeline produces.
 */

import { connectMongo, createPatientRecord, isUsingMemoryStore } from './mongo.js';

function minutesAgo(mins) {
  return new Date(Date.now() - mins * 60_000).toISOString();
}

function completedAgentStates(baseMinsAgo, outputs) {
  const roles = ['intakeStructuring', 'urgencyClassification', 'guardrails', 'clinicianSummary'];
  return roles.map((agentRole, i) => ({
    agentRole,
    status: 'completed',
    startedAt: minutesAgo(baseMinsAgo - i * 0.05),
    completedAt: minutesAgo(baseMinsAgo - i * 0.05 - 0.03),
    output: outputs[agentRole],
  }));
}

const demoPatients = [
  {
    entryCategory: 'pain',
    symptomExplanation:
      "I've been having chest pain and some shortness of breath for the last hour. It gets worse when I walk.",
    vitals: { heartRate: 118, respirationRate: 24, captured: true },
    basicInfo: { name: 'Margaret Chen', age: 71, sexAtBirth: 'female', preferredLanguage: 'English' },
    preExistingConditions: ['High blood pressure', 'Diabetes'],
    minsAgo: 12,
    structuredIntake: {
      primarySymptoms: ['chest pain', 'shortness of breath'],
      symptomDuration: 'about 1 hour',
      redFlags: ['chest pain', 'shortness of breath'],
      structuredSummary:
        'Patient reports chest pain with shortness of breath for approximately one hour, worsening with exertion.',
    },
    urgencyClassification: {
      urgencyLevel: 'High',
      confidence: 0.82,
      rationale: [
        'Chest pain with dyspnea reported',
        'Symptoms worsen with exertion',
        'Elevated heart and respiratory rate from passive vitals',
      ],
    },
    guardrailResult: {
      finalUrgencyLevel: 'Critical',
      appliedGuardrails: [
        'Age-based escalation to at least Medium',
        'Red flag symptom present → at least High',
        'Elevated vitals → at least High',
      ],
    },
    clinicianSummary: {
      clinicianReport:
        '71-year-old female presenting with chest pain and shortness of breath for ~1 hour, exertional worsening. Self-reported history of hypertension and diabetes. Passive vitals show elevated heart rate (118 bpm) and respiratory rate (24/min).',
      suggestedNextSteps: [
        'Recommended immediate clinician assessment',
        'Consider priority vitals and cardiac monitoring per protocol',
        'Verify symptom onset and progression directly with patient',
      ],
      flags: ['Multiple red flags present', 'Guardrails escalated urgency to Critical'],
    },
  },
  {
    entryCategory: 'injured',
    symptomExplanation:
      'I twisted my ankle playing soccer this morning. It is swollen and hurts to put weight on it.',
    vitals: { heartRate: 76, respirationRate: 15, captured: true },
    basicInfo: { name: 'Jordan Alvarez', age: 24, sexAtBirth: 'male', preferredLanguage: 'Spanish' },
    preExistingConditions: [],
    minsAgo: 25,
    structuredIntake: {
      primarySymptoms: ['ankle swelling', 'pain on weight-bearing'],
      symptomDuration: 'since this morning',
      redFlags: [],
      structuredSummary:
        'Patient reports a twisted ankle from sports activity this morning with swelling and pain when bearing weight.',
    },
    urgencyClassification: {
      urgencyLevel: 'Low',
      confidence: 0.78,
      rationale: [
        'Localized musculoskeletal complaint',
        'No systemic symptoms or red flags reported',
        'Vitals within normal range',
      ],
    },
    guardrailResult: { finalUrgencyLevel: 'Low', appliedGuardrails: [] },
    clinicianSummary: {
      clinicianReport:
        '24-year-old male with an ankle injury sustained during sports this morning. Reports swelling and pain on weight-bearing. No red flags identified; vitals within normal range. Preferred language: Spanish.',
      suggestedNextSteps: [
        'Recommended to assess ankle range of motion and swelling',
        'Consider standard injury imaging pathway if clinically indicated',
        'Spanish-language support may improve communication',
      ],
      flags: [],
    },
  },
  {
    entryCategory: 'unwell',
    symptomExplanation:
      "I've had a fever and a bad cough for the past three days, and I feel very weak and tired.",
    vitals: { heartRate: null, respirationRate: null, captured: false },
    basicInfo: { name: 'Amara Okafor', age: 68, sexAtBirth: 'female', preferredLanguage: 'English' },
    preExistingConditions: ['Asthma'],
    minsAgo: 40,
    structuredIntake: {
      primarySymptoms: ['fever', 'cough', 'weakness', 'fatigue'],
      symptomDuration: 'past three days',
      redFlags: [],
      structuredSummary:
        'Patient reports fever and productive cough for three days with generalized weakness and fatigue.',
    },
    urgencyClassification: {
      urgencyLevel: 'Medium',
      confidence: 0.55,
      rationale: [
        'Multi-day febrile illness with respiratory symptoms',
        'History of asthma noted',
        'No vitals available — confidence lowered',
      ],
    },
    guardrailResult: {
      finalUrgencyLevel: 'Medium',
      appliedGuardrails: [
        'Low confidence — clinician review recommended',
        'Age-based escalation to at least Medium',
      ],
    },
    clinicianSummary: {
      clinicianReport:
        '68-year-old female reporting fever and cough for three days with weakness and fatigue. Self-reported history of asthma. Passive vitals were not captured; confidence in automated urgency estimate is reduced.',
      suggestedNextSteps: [
        'Recommended clinician review due to low automated confidence',
        'Consider measuring full vitals on arrival',
        'Assess respiratory status given reported asthma history',
      ],
      flags: ['Vitals not captured at kiosk', 'Low confidence — clinician review recommended'],
    },
  },
];

async function seed() {
  await connectMongo();

  if (isUsingMemoryStore()) {
    // eslint-disable-next-line no-console
    console.error(
      'Seeding requires a reachable MongoDB — the in-memory fallback only lives inside the API server process. Fix Atlas access and retry.'
    );
    process.exit(1);
  }

  for (const p of demoPatients) {
    const { minsAgo, structuredIntake, urgencyClassification, guardrailResult, clinicianSummary, ...base } = p;
    const record = await createPatientRecord({
      ...base,
      createdAt: minutesAgo(minsAgo),
      structuredIntake,
      urgencyClassification,
      guardrailResult,
      clinicianSummary,
      triageStatus: 'completed',
      agentStates: completedAgentStates(minsAgo, {
        intakeStructuring: { ...structuredIntake, generatedVia: 'seed-data' },
        urgencyClassification: { ...urgencyClassification, generatedVia: 'seed-data' },
        guardrails: { ...guardrailResult, generatedVia: 'deterministic-rules' },
        clinicianSummary: { ...clinicianSummary, generatedVia: 'seed-data' },
      }),
    });
    // eslint-disable-next-line no-console
    console.log(`Seeded patient ${record.id} (${base.basicInfo.name})`);
  }

  // eslint-disable-next-line no-console
  console.log(`Done — seeded ${demoPatients.length} demo patients.`);
  process.exit(0);
}

seed().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', error);
  process.exit(1);
});
