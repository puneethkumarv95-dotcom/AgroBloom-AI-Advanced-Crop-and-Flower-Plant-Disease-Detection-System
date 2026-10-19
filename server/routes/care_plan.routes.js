const express = require('express');
const router = express.Router();
const PlantCarePlan = require('../models/PlantCarePlan');
const DiseaseKnowledge = require('../models/DiseaseKnowledge');
const { protect } = require('../middleware/auth');

// GET /api/care-plans - List user's active care plans
router.get('/', protect, async (req, res) => {
  try {
    const plans = await PlantCarePlan.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json({ success: true, count: plans.length, plans });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/care-plans - Create or auto-generate care plan from disease
router.post('/', protect, async (req, res) => {
  try {
    const { plantName, diseaseName, detection, customTasks, notes } = req.body;

    if (!plantName || !diseaseName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both plantName and diseaseName'
      });
    }

    let tasks = customTasks || [];
    let obsSchedule = 'Inspect foliage every 3 to 5 days.';
    let expertAdv = 'Consult local agricultural extension if lesions exceed 25% of canopy.';

    // Check if we can populate tasks from DiseaseKnowledge
    const knowledge = await DiseaseKnowledge.findOne({
      plant: new RegExp(plantName, 'i'),
      disease: new RegExp(diseaseName, 'i')
    });

    if (knowledge) {
      obsSchedule = knowledge.observationInterval || obsSchedule;
      expertAdv = knowledge.whenToConsultExpert || expertAdv;

      if (!customTasks || customTasks.length === 0) {
        tasks = [];
        // Add cultural task
        if (knowledge.recommendations.cultural?.length) {
          tasks.push({
            title: knowledge.recommendations.cultural[0],
            category: 'cultural',
            frequency: 'Immediate / Once'
          });
        }
        // Add organic task
        if (knowledge.recommendations.organic?.length) {
          tasks.push({
            title: knowledge.recommendations.organic[0],
            category: 'organic',
            frequency: 'Every 7-10 Days'
          });
        }
        // Add chemical protectant if diseased
        if (knowledge.condition !== 'healthy' && knowledge.recommendations.chemical?.length) {
          tasks.push({
            title: knowledge.recommendations.chemical[0],
            category: 'chemical',
            frequency: 'At first sign of disease spread'
          });
        }
        // Add observation task
        tasks.push({
          title: `Foliar scouting: ${obsSchedule}`,
          category: 'observation',
          frequency: 'Twice Weekly'
        });
        // Add prevention task
        if (knowledge.recommendations.prevention?.length) {
          tasks.push({
            title: knowledge.recommendations.prevention[0],
            category: 'prevention',
            frequency: 'Seasonal'
          });
        }
      }
    } else if (!tasks.length) {
      tasks = [
        { title: 'Inspect lower leaf canopy for lesion progression', category: 'observation', frequency: 'Twice Weekly' },
        { title: 'Ensure direct drip irrigation to keep foliage dry', category: 'cultural', frequency: 'Ongoing' }
      ];
    }

    const plan = await PlantCarePlan.create({
      user: req.user._id,
      plantName,
      diseaseName,
      detection: detection || null,
      tasks,
      observationSchedule: obsSchedule,
      expertAdvisory: expertAdv,
      notes: notes || '',
      status: 'active'
    });

    res.status(201).json({ success: true, plan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/care-plans/:id - Get specific care plan
router.get('/:id', protect, async (req, res) => {
  try {
    const plan = await PlantCarePlan.findOne({ _id: req.params.id, user: req.user._id });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plant care plan not found' });
    }
    res.json({ success: true, plan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/care-plans/:id/tasks/:taskIndex - Toggle task completion
router.patch('/:id/tasks/:taskIndex', protect, async (req, res) => {
  try {
    const plan = await PlantCarePlan.findOne({ _id: req.params.id, user: req.user._id });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Care plan not found' });
    }

    const taskIndex = parseInt(req.params.taskIndex, 10);
    if (isNaN(taskIndex) || taskIndex < 0 || taskIndex >= plan.tasks.length) {
      return res.status(400).json({ success: false, message: 'Invalid task index' });
    }

    const task = plan.tasks[taskIndex];
    task.isCompleted = !task.isCompleted;
    task.completedAt = task.isCompleted ? new Date() : null;

    // If all tasks completed, update plan status
    const allDone = plan.tasks.every((t) => t.isCompleted);
    if (allDone) {
      plan.status = 'completed';
    } else if (plan.status === 'completed') {
      plan.status = 'active';
    }

    await plan.save();
    res.json({ success: true, plan, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/care-plans/:id - Delete care plan
router.delete('/:id', protect, async (req, res) => {
  try {
    const plan = await PlantCarePlan.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Care plan not found' });
    }
    res.json({ success: true, message: 'Care plan deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

