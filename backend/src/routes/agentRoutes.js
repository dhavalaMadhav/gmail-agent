const express = require('express');
const { plannerAgent } = require('../agents/planner');
const { executorAgent } = require('../agents/executor');
const router = express.Router();

// Middleware: require authentication
function requireAuth(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

/**
 * POST /agent/run
 * Body: { instruction: string, context?: object }
 * Runs the full planner → executor pipeline
 */
router.post('/run', requireAuth, async (req, res) => {
  const { instruction, context = {} } = req.body;

  if (!instruction || instruction.trim() === '') {
    return res.status(400).json({ error: 'instruction is required' });
  }

  try {
    console.log(`🧠 Planner received: "${instruction}"`);

    // Step 1: Plan
    const plan = await plannerAgent(instruction, context);
    console.log('📋 Plan:', JSON.stringify(plan, null, 2));

    // Step 2: Execute
    const results = await executorAgent(req.user, plan);
    console.log('✅ Execution complete');

    res.json({
      instruction,
      plan,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Agent run error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
