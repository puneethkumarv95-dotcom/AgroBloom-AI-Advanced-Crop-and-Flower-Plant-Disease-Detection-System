const express = require('express');
const router = express.Router();
const Plant = require('../models/Plant');
const Disease = require('../models/Disease');
const DiseaseKnowledge = require('../models/DiseaseKnowledge');
const { protect } = require('../middleware/auth');

// GET /api/plants
router.get('/plants', async (req, res) => {
  try {
    const plants = await Plant.find().populate('commonDiseases');
    res.json({ success: true, count: plants.length, plants });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/plants
router.post('/plants', protect, async (req, res) => {
  try {
    const plant = await Plant.create(req.body);
    res.status(201).json({ success: true, plant });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/diseases
router.get('/diseases', async (req, res) => {
  try {
    let diseases = await Disease.find().populate('hostPlants');
    if (!diseases || diseases.length === 0) {
      // Fallback to rich DiseaseKnowledge collection
      const knowledge = await DiseaseKnowledge.find().sort({ plant: 1, disease: 1 });
      diseases = knowledge.map(k => ({
        _id: k._id,
        name: `${k.plant} - ${k.disease}`,
        category: k.diseaseCategory,
        pathogen: k.causalAgent,
        symptoms: k.symptoms,
        severityRisk: k.severityRisk,
        type: k.type,
        plant: k.plant,
        recommendations: k.recommendations,
        sources: k.sources
      }));
    }
    res.json({ success: true, count: diseases.length, diseases });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/diseases/search
router.get('/diseases/search', async (req, res) => {
  try {
    const { q, type, category, page = 1, limit = 12, suggest } = req.query;
    const filter = {};

    if (type && type !== 'all' && type !== 'All') {
      filter.type = type.toLowerCase();
    }

    if (category && category !== 'all' && category !== 'All') {
      filter.diseaseCategory = category.toLowerCase();
    }

    if (q && q.trim()) {
      const term = q.trim();
      const regex = new RegExp(term, 'i');
      filter.$or = [
        { plant: regex },
        { disease: regex },
        { symptoms: regex },
        { causalAgent: regex },
        { possibleCauses: regex },
        { classKey: regex }
      ];
    }

    // Auto-complete suggestions mode
    if (suggest === 'true') {
      const suggestions = await DiseaseKnowledge.find(filter)
        .select('plant disease classKey type diseaseCategory')
        .limit(8);
      return res.json({
        success: true,
        suggestions: suggestions.map(s => ({
          label: `${s.plant} - ${s.disease}`,
          plant: s.plant,
          disease: s.disease,
          classKey: s.classKey,
          type: s.type
        }))
      });
    }

    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 50);
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (parsedPage - 1) * parsedLimit;

    const [results, total] = await Promise.all([
      DiseaseKnowledge.find(filter)
        .sort({ plant: 1, disease: 1 })
        .skip(skip)
        .limit(parsedLimit),
      DiseaseKnowledge.countDocuments(filter)
    ]);

    res.json({
      success: true,
      count: results.length,
      total,
      page: parsedPage,
      totalPages: Math.ceil(total / parsedLimit) || 1,
      results
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/diseases
router.post('/diseases', protect, async (req, res) => {
  try {
    const disease = await Disease.create(req.body);
    res.status(201).json({ success: true, disease });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/diseases/guidance (query by plant / disease / classKey)
router.get('/diseases/guidance', async (req, res) => {
  try {
    const { classKey, plant, disease } = req.query;
    let query = {};

    if (classKey) {
      query.classKey = classKey;
    } else if (plant && disease) {
      query = {
        plant: new RegExp(plant, 'i'),
        disease: new RegExp(disease, 'i')
      };
    } else if (disease) {
      query.disease = new RegExp(disease, 'i');
    }

    const guidance = await DiseaseKnowledge.findOne(query);
    if (!guidance) {
      return res.status(404).json({
        success: false,
        message: 'No verified agricultural extension guidance found for the specified plant/disease.'
      });
    }

    res.json({ success: true, guidance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/diseases/:id/guidance (by MongoDB ObjectId or classKey)
router.get('/diseases/:id/guidance', async (req, res) => {
  try {
    const { id } = req.params;
    let guidance = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      guidance = await DiseaseKnowledge.findById(id);
      if (!guidance) {
        // Also check if id is a legacy Disease model id
        const dis = await Disease.findById(id);
        if (dis) {
          guidance = await DiseaseKnowledge.findOne({ disease: new RegExp(dis.name, 'i') });
        }
      }
    } else {
      guidance = await DiseaseKnowledge.findOne({ classKey: id });
    }

    if (!guidance) {
      return res.status(404).json({
        success: false,
        message: 'Verified agricultural extension guidance record not found.'
      });
    }

    res.json({ success: true, guidance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/diseases/knowledge/all - All structured knowledge base records
router.get('/diseases/knowledge/all', async (req, res) => {
  try {
    const records = await DiseaseKnowledge.find().sort({ plant: 1, disease: 1 });
    res.json({ success: true, count: records.length, records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
