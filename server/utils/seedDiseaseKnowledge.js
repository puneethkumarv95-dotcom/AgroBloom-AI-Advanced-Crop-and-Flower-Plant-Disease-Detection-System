const fs = require('fs');
const path = require('path');
const DiseaseKnowledge = require('../models/DiseaseKnowledge');

async function seedDiseaseKnowledge() {
  try {
    const count = await DiseaseKnowledge.countDocuments();
    if (count >= 20) {
      return;
    }

    const kbPath = path.join(__dirname, '..', 'data', 'knowledge_base.json');
    if (!fs.existsSync(kbPath)) {
      return;
    }

    const data = JSON.parse(fs.readFileSync(kbPath, 'utf8'));
    const records = Object.entries(data).map(([classKey, item]) => ({
      classKey,
      plant: item.plant,
      plantSpecies: item.plantSpecies || '',
      type: item.type,
      disease: item.disease,
      diseaseCategory: item.diseaseCategory || 'fungal',
      causalAgent: item.causalAgent,
      condition: item.condition || 'diseased',
      symptoms: item.symptoms,
      possibleCauses: item.possibleCauses || '',
      conditions: item.conditions || '',
      severityRisk: item.severityRisk || 'Moderate',
      observationInterval: item.observationInterval || 'Inspect foliage weekly.',
      whenToConsultExpert: item.whenToConsultExpert || '',
      recommendations: item.recommendations || { organic: [], chemical: [], cultural: [], prevention: [] },
      sources: item.sources || [],
      lastReviewed: item.lastReviewed || '2026-03-20',
      kn: item.kn || {},
      hi: item.hi || {}
    }));

    for (const record of records) {
      await DiseaseKnowledge.findOneAndUpdate(
        { classKey: record.classKey },
        record,
        { upsert: true, new: true }
      );
    }
    console.log(`[Database Seed] Successfully verified ${records.length} extension knowledge records.`);
  } catch (err) {
    console.error('[Database Seed Warning]:', err.message);
  }
}

module.exports = seedDiseaseKnowledge;

