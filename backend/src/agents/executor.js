const listEmails = require('../tools/listEmails');
const readEmail = require('../tools/readEmail');
const sendEmail = require('../tools/sendEmail');
const replyEmail = require('../tools/replyEmail');
const searchEmails = require('../tools/searchEmails');

// Tool registry
const TOOL_REGISTRY = {
  listEmails,
  readEmail,
  sendEmail,
  replyEmail,
  searchEmails,
};

/**
 * Executes a plan (array of steps) sequentially.
 * @param {Object} user - Authenticated user
 * @param {Array} plan - Array of { tool, args } from the planner
 * @returns {Array} - Results of each step
 */
async function executorAgent(user, plan) {
  const results = [];

  for (const step of plan) {
    const { tool, args } = step;

    // Handle "none" tool (informational responses)
    if (tool === 'none') {
      results.push({
        tool: 'none',
        result: { message: args.message || 'Done.' },
      });
      continue;
    }

    const toolFn = TOOL_REGISTRY[tool];
    if (!toolFn) {
      results.push({
        tool,
        error: `Tool "${tool}" is not registered`,
      });
      continue;
    }

    try {
      console.log(`⚙️  Executing tool: ${tool}`, args);
      const result = await toolFn(user, args);
      results.push({ tool, result });
    } catch (err) {
      console.error(`❌ Tool "${tool}" failed:`, err.message);
      results.push({ tool, error: err.message });
    }
  }

  return results;
}

module.exports = { executorAgent };
