'use strict';

class CORTEX {
  classify(task = '') {
    const text = String(task).toLowerCase();

    const capabilities = [];

    if (
      /code|program|javascript|python|typescript|debug|software|api/.test(text)
    ) {
      capabilities.push('coding');
    }

    if (
      /research|study|paper|investigate|analyze|evidence/.test(text)
    ) {
      capabilities.push('research');
    }

    if (
      /math|calculate|equation|statistics|probability/.test(text)
    ) {
      capabilities.push('mathematics');
    }

    if (
      /image|photo|vision|visual|ocr|document/.test(text)
    ) {
      capabilities.push('vision');
    }

    if (
      /audio|speech|voice|transcribe/.test(text)
    ) {
      capabilities.push('audio');
    }

    if (
      /agent|automate|workflow|execute|tool/.test(text)
    ) {
      capabilities.push('agentic');
    }

    if (
      /science|physics|chemistry|biology/.test(text)
    ) {
      capabilities.push('science');
    }

    if (capabilities.length === 0) {
      capabilities.push('general_reasoning');
    }

    return {
      task,
      capabilities,
      complexity: this.estimateComplexity(text),
      routing_policy: 'capability_first'
    };
  }

  estimateComplexity(text) {
    const words = text.trim().split(/\s+/).filter(Boolean).length;

    if (words > 500) return 'frontier';
    if (words > 150) return 'high';
    if (words > 50) return 'medium';

    return 'standard';
  }
}

module.exports = CORTEX;
