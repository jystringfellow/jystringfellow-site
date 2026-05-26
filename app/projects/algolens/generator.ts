import { AlgorithmPattern, Difficulty } from './algorithms';

export type GeneratedProblem = {
  title: string;
  problemStatement: string;
  examples: string[];
  hints: string[];
  canonicalMapping: string[];
  starterCode: string;
};

export type GenerationRequest = {
  topic: string;
  algorithm: AlgorithmPattern;
  difficulty: Difficulty;
};

export const defaultModelId = 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC';

export const modelOptions = [
  {
    id: defaultModelId,
    label: 'Qwen2.5 0.5B Instruct',
    note: 'Fastest default for browser-side generation.',
  },
  {
    id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
    label: 'Llama 3.2 1B Instruct',
    note: 'Better quality, slower browser generation.',
  },
  {
    id: 'Llama-3.1-8B-Instruct-q4f16_1-MLC',
    label: 'Llama 3.1 8B Instruct',
    note: 'Higher quality, much heavier browser download.',
  },
];

export function supportsBrowserLLM() {
  return typeof window !== 'undefined' && 'gpu' in navigator;
}

export function buildGenerationMessages({
  topic,
  algorithm,
  difficulty,
}: GenerationRequest) {
  const cleanTopic = topic.trim() || 'music';
  const requiredStarterFunctionName = 'solveChallenge';

  return [
    {
      role: 'system' as const,
      content:
        'You are AlgoLens, an expert algorithms tutor. Generate concise original learning problems that map everyday interests to canonical CS algorithm patterns. Use the exact plain-text section headings requested. Keep the answer compact. Do not output JSON.',
    },
    {
      role: 'user' as const,
      content: `Create one personalized algorithm practice problem.

Interest/topic: ${cleanTopic}
Algorithm pattern: ${algorithm.label}
Algorithm family: ${algorithm.family}
Canonical concept: ${algorithm.canonicalConcept}
Difficulty: ${difficulty}

Return plain text exactly in this format. Do not use JSON, braces, or markdown fences:
TITLE:
one short title

PROBLEM:
one short paragraph with concrete inputs and goal

EXAMPLES:
- compact example with input and output
- compact example with input and output

HINTS:
- first hint
- second hint
- third hint

MAPPING:
- how the story data maps to the canonical input
- what the target output represents
- why ${algorithm.label} is the right pattern

STARTER_CODE:
valid JavaScript function scaffold, no markdown fence

The STARTER_CODE must follow all rules:
- Must be a function declaration named ${requiredStarterFunctionName}.
- Must include at least one parameter.
- Must include a return statement.
- Must be runnable JavaScript in a browser console.
- Must NOT include top-level variables/constants outside the function.
- Must NOT include prose like "no starter code required".

Use this exact shape (you may rename parameter, keep function name):
function ${requiredStarterFunctionName}(input) {
  // TODO: implement
  return input;
}

Constraints:
- Make the problem genuinely about the user's topic.
- Keep the canonical algorithm mapping explicit and technically correct.
- Avoid paid APIs, backend references, or pretending data was fetched.
- Keep starter code under 25 lines and runnable in a browser console.
- Use arrays/objects/grids/trees/lists as appropriate for the selected pattern.`,
    },
  ];
}

function ensureStarterFunction(starterCode: string, problemTitle: string) {
  const hasFunctionDeclaration = /\bfunction\s+[A-Za-z_$][\w$]*\s*\(/.test(
    starterCode
  );
  const hasReturnStatement = /\breturn\b/.test(starterCode);
  const startsWithFunction = /^\s*function\b/.test(starterCode);
  const isSyntaxValid = (() => {
    try {
      // Parse-only check; does not execute the function body.
      // If malformed tokens like stray `]` appear, this throws.
      new Function(`${starterCode}\nreturn true;`);
      return true;
    } catch {
      return false;
    }
  })();

  if (
    hasFunctionDeclaration &&
    hasReturnStatement &&
    startsWithFunction &&
    isSyntaxValid
  ) {
    return starterCode;
  }

  return `function solveChallenge(input) {
  // TODO: implement ${problemTitle.toLowerCase()}
  return input;
}`;
}

function cleanInlineMarkdown(text: string) {
  return text
    .replace(/\*\*/g, '')
    .replace(/^[-#\s]+/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function normalizeTitleText(text: string) {
  const singleLine = cleanInlineMarkdown(text)
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean) ?? '';
  return singleLine.replace(/\s*[-:|]+\s*$/, '').trim();
}

function normalizeProblemBody(text: string) {
  return text
    .replace(/\*\*/g, '')
    .replace(/\n\s*[-]{3,}\s*\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function parseGeneratedProblem(raw: string): GeneratedProblem {
  const trimmed = raw.trim();
  const normalized = trimmed.replace(/\r/g, '');

  const sectionPattern =
    /(?:\*\*)?\b(TITLE|PROBLEM|EXAMPLES|HINTS|MAPPING|STARTER_CODE)\b(?:\*\*)?\s*:\s*/gi;
  const sectionMatches = [...normalized.matchAll(sectionPattern)];
  const sectionContent: Record<string, string> = {
    TITLE: '',
    PROBLEM: '',
    EXAMPLES: '',
    HINTS: '',
    MAPPING: '',
    STARTER_CODE: '',
  };

  for (let index = 0; index < sectionMatches.length; index += 1) {
    const match = sectionMatches[index];
    const sectionName = (match[1] ?? '').toUpperCase();
    const contentStart = (match.index ?? 0) + match[0].length;
    const nextStart =
      index + 1 < sectionMatches.length
        ? (sectionMatches[index + 1].index ?? normalized.length)
        : normalized.length;

    if (sectionName in sectionContent) {
      sectionContent[sectionName] = normalized
        .slice(contentStart, nextStart)
        .replace(/^[-\s]+|[-\s]+$/g, '')
        .trim();
    }
  }
  const jsonStart = trimmed.indexOf('{');
  const jsonEnd = trimmed.lastIndexOf('}');

  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    try {
      const parsed = JSON.parse(
        trimmed.slice(jsonStart, jsonEnd + 1)
      ) as Partial<GeneratedProblem>;

      if (
        parsed.title &&
        parsed.problemStatement &&
        Array.isArray(parsed.examples) &&
        Array.isArray(parsed.hints) &&
        Array.isArray(parsed.canonicalMapping) &&
        parsed.starterCode
      ) {
        return {
          title: normalizeTitleText(parsed.title),
          problemStatement: normalizeProblemBody(parsed.problemStatement),
          examples: parsed.examples.map(String).slice(0, 4),
          hints: parsed.hints.map(String).slice(0, 5),
          canonicalMapping: parsed.canonicalMapping.map(String).slice(0, 5),
          starterCode: parsed.starterCode,
        };
      }
    } catch {
      // Small browser models often emit JSON-like prose even when asked for sections.
      // Fall through to the section parser instead of failing the generation.
    }
  }

  const readSection = (name: keyof typeof sectionContent) =>
    sectionContent[name].trim();

  const readList = (name: keyof typeof sectionContent) =>
    readSection(name)
      .split(/\n|(?=\s[-*]\s)/)
      .map((line) => line.replace(/^[-*]\s*/, '').trim())
      .map((line) => line.replace(/^\*\*|\*\*$/g, '').trim())
      .filter(Boolean);

  const extractStarterCode = () => {
    const section = readSection('STARTER_CODE');
    if (!section) {
      return '';
    }

    const fenceMatch = section.match(/```(?:js|javascript)?\s*([\s\S]*?)```/i);
    if (fenceMatch?.[1]) {
      return fenceMatch[1].trim();
    }

    return section.replace(/^```(?:js|javascript)?|```$/g, '').trim();
  };

  const title =
    normalizeTitleText(readSection('TITLE')) ||
    normalizeTitleText(trimmed.match(/title\s*:\s*(.+)$/im)?.[1]?.trim() ?? '') ||
    'Generated algorithm challenge';
  const problemStatement =
    normalizeProblemBody(readSection('PROBLEM')) ||
    normalizeProblemBody(trimmed.match(/problem\s*:\s*([\s\S]{20,500})/im)?.[1]?.trim() ?? '') ||
    'Use the selected algorithm pattern to solve this generated challenge.';
  const examples = readList('EXAMPLES');
  const hints = readList('HINTS');
  const canonicalMapping = readList('MAPPING');
  const starterCode =
    extractStarterCode() ||
    `function solve(input) {\n  // TODO: implement ${title.toLowerCase()}\n  return input;\n}`;
  const safeStarterCode = ensureStarterFunction(starterCode, title);

  return {
    title,
    problemStatement,
    examples: examples.slice(0, 4),
    hints:
      hints.length > 0
        ? hints.slice(0, 5)
        : ['Start by writing a tiny brute-force version to confirm the expected output.'],
    canonicalMapping:
      canonicalMapping.length > 0
        ? canonicalMapping.slice(0, 5)
        : ['Map the story entities to a canonical algorithm input and output shape.'],
    starterCode: safeStarterCode,
  };
}
