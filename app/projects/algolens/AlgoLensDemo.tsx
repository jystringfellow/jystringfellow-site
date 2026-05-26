'use client';

import React from 'react';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BoltIcon from '@mui/icons-material/Bolt';
import CodeIcon from '@mui/icons-material/Code';
import ExploreIcon from '@mui/icons-material/Explore';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import LockIcon from '@mui/icons-material/Lock';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import LinearProgress from '@mui/material/LinearProgress';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AlgoLensWorkspace from './AlgoLensWorkspace';
import {
  AlgorithmId,
  Difficulty,
  algorithmPatterns,
  difficultyOptions,
  getAlgorithmPattern,
} from './algorithms';
import {
  GeneratedProblem,
  buildGenerationMessages,
  defaultModelId,
  modelOptions,
  parseGeneratedProblem,
  supportsBrowserLLM,
} from './generator';

type WebLLMEngine = {
  chat: {
    completions: {
      create: (request: {
        messages: ReturnType<typeof buildGenerationMessages>;
        temperature: number;
        max_tokens: number;
        stream?: boolean;
      }) => Promise<
        | { choices: { message: { content?: string } }[] }
        | AsyncIterable<{ choices: { delta?: { content?: string } }[] }>
      >;
    };
  };
  interruptGenerate: () => void;
};

type LoadStatus = 'idle' | 'loading' | 'ready' | 'unsupported' | 'error';
type GenerateStatus = 'idle' | 'generating' | 'complete' | 'error';
type RuntimeDiagnostics = {
  webGpu: boolean;
  secureContext: boolean;
  crossOriginIsolated: boolean;
  worker: boolean;
};

type ProblemTestCase = {
  description: string;
  args: unknown[];
  expected: unknown;
};

type TestsStatus = 'idle' | 'generating' | 'ready' | 'running' | 'error';
type HintStatus = 'idle' | 'generating' | 'error';
type AnswerStatus = 'idle' | 'generating' | 'error';

const generationMaxTokens = 1800;
const targetHintCount = 8;
const minimumTestCount = 4;

function formatValue(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function inferFunctionName(starterCode: string) {
  const functionMatch = starterCode.match(/function\s+([A-Za-z_$][\w$]*)\s*\(/);
  if (functionMatch?.[1]) {
    return functionMatch[1];
  }

  const constArrowMatch = starterCode.match(
    /const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\(/,
  );
  if (constArrowMatch?.[1]) {
    return constArrowMatch[1];
  }

  return '';
}

function sanitizeRunnableCode(source: string) {
  let code = source.replace(/\r/g, '').trim();

  const fenced = code.match(/```(?:js|javascript)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    code = fenced[1].trim();
  }

  code = code
    .replace(/^(?:STARTER_CODE|SOLUTION_CODE)\s*:\s*/gim, '')
    .replace(/^\s*code\s*$/gim, '')
    .trim();

  const firstFunctionIndex = code.search(/\bfunction\s+[A-Za-z_$][\w$]*\s*\(/);
  if (firstFunctionIndex > 0) {
    code = code.slice(firstFunctionIndex).trim();
  }

  // Keep only the first complete function block to avoid trailing model junk.
  const functionStart = code.search(/\bfunction\s+[A-Za-z_$][\w$]*\s*\(/);
  if (functionStart >= 0) {
    let depth = 0;
    let seenOpeningBrace = false;
    let endIndex = -1;

    for (let index = functionStart; index < code.length; index += 1) {
      const char = code[index];

      if (char === '{') {
        depth += 1;
        seenOpeningBrace = true;
      } else if (char === '}') {
        depth -= 1;
        if (seenOpeningBrace && depth === 0) {
          endIndex = index;
          break;
        }
      }
    }

    if (endIndex > functionStart) {
      code = code.slice(functionStart, endIndex + 1).trim();
    }
  }

  return code;
}

function parseLiteral(text: string) {
  try {
    return new Function(`return (${text});`)();
  } catch {
    const trimmed = text.trim();
    const arrayLike = trimmed.match(/^\[(.*)\]$/);
    if (arrayLike) {
      const rawParts = arrayLike[1]
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean);

      return rawParts.map((part) => {
        const numeric = Number(part);
        if (!Number.isNaN(numeric) && /^-?\d+(\.\d+)?$/.test(part)) {
          return numeric;
        }

        return part.replace(/^['"]|['"]$/g, '');
      });
    }

    return undefined;
  }
}

function inferTestsFromExamples(examples: string[]) {
  const tests: ProblemTestCase[] = [];

  for (const example of examples) {
    const inputMatch = example.match(/input\s*:\s*(.+?)(?=\s*output\s*:|$)/i);
    const outputMatch = example.match(/output\s*:\s*(.+)$/i);

    if (!inputMatch || !outputMatch) {
      continue;
    }

    const parsedInput = parseLiteral(inputMatch[1].trim());
    const parsedOutput = parseLiteral(outputMatch[1].trim());
    if (parsedInput === undefined || parsedOutput === undefined) {
      continue;
    }

    tests.push({
      description: `Example ${tests.length + 1}`,
      args: Array.isArray(parsedInput) ? [parsedInput] : [parsedInput],
      expected: parsedOutput,
    });
  }

  return tests.slice(0, 4);
}

async function readCompletionText(
  response:
    | { choices: { message: { content?: string } }[] }
    | AsyncIterable<{ choices: { delta?: { content?: string } }[] }>,
) {
  if (Symbol.asyncIterator in response) {
    let text = '';
    for await (const chunk of response) {
      text += chunk.choices[0]?.delta?.content ?? '';
    }
    return text;
  }

  return response.choices[0]?.message?.content ?? '';
}

function parseJsonArrayPayload(text: string) {
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  try {
    const parsed = JSON.parse(text.slice(start, end + 1)) as Array<{
      description?: unknown;
      args?: unknown;
      expected?: unknown;
    }>;
    return parsed
      .map((item, index) => ({
        description:
          typeof item.description === 'string'
            ? item.description
            : `Generated test ${index + 1}`,
        args: Array.isArray(item.args) ? item.args : [item.args],
        expected: item.expected,
      }))
      .filter(
        (item) =>
          item.args.every((arg: unknown) => arg !== undefined) &&
          item.expected !== undefined
      );
  } catch {
    return null;
  }
}

function parseLooseArrayPayload(text: string) {
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start === -1 || end === -1 || end <= start) {
    return [];
  }

  try {
    const evaluated = new Function(`return (${text.slice(start, end + 1)});`)();
    if (!Array.isArray(evaluated)) {
      return [];
    }

    return evaluated
      .map((item, index) => ({
        description:
          typeof item?.description === 'string'
            ? item.description
            : `Generated test ${index + 1}`,
        args: Array.isArray(item?.args) ? item.args : [item?.args],
        expected: item?.expected,
      }))
      .filter(
        (item) =>
          item.args.every((arg: unknown) => arg !== undefined) &&
          item.expected !== undefined
      );
  } catch {
    return [];
  }
}

function parseObjectBlocksPayload(text: string) {
  const objects = text.match(/\{[\s\S]*?\}/g) ?? [];
  const parsed: ProblemTestCase[] = [];

  for (let index = 0; index < objects.length; index += 1) {
    const block = objects[index];
    try {
      const item = new Function(`return (${block});`)();
      const args = Array.isArray(item?.args) ? item.args : [item?.args];
      if (
        args.some((arg: unknown) => arg === undefined) ||
        item?.expected === undefined
      ) {
        continue;
      }

      parsed.push({
        description:
          typeof item?.description === 'string'
            ? item.description
            : `Generated test ${index + 1}`,
        args,
        expected: item?.expected,
      });
    } catch {
      continue;
    }
  }

  return parsed;
}

function parseTestBundlePayload(text: string): {
  tests: ProblemTestCase[];
  referenceSolution: string;
} {
  const objectStart = text.indexOf('{');
  const objectEnd = text.lastIndexOf('}');
  if (objectStart === -1 || objectEnd === -1 || objectEnd <= objectStart) {
    return { tests: [], referenceSolution: '' };
  }

  try {
    const parsed = JSON.parse(text.slice(objectStart, objectEnd + 1)) as {
      tests?: Array<{ description?: unknown; args?: unknown; expected?: unknown }>;
      referenceSolution?: unknown;
    };

    const tests = (parsed.tests ?? [])
      .map((item, index) => ({
        description:
          typeof item.description === 'string'
            ? item.description
            : `Generated test ${index + 1}`,
        args: Array.isArray(item.args) ? item.args : [item.args],
        expected: item.expected,
      }))
      .filter(
        (item) =>
          item.args.every((arg) => arg !== undefined) &&
          item.expected !== undefined
      );

    return {
      tests,
      referenceSolution:
        typeof parsed.referenceSolution === 'string'
          ? parsed.referenceSolution.trim()
          : '',
    };
  } catch {
    return { tests: [], referenceSolution: '' };
  }
}

function buildTestsFromReferenceSolution(referenceSolution: string) {
  const code = sanitizeRunnableCode(referenceSolution);
  const fnName = inferFunctionName(code);
  if (!fnName) {
    return [] as ProblemTestCase[];
  }

  try {
    const fn = new Function(
      `${code}\n;return typeof ${fnName} !== 'undefined' ? ${fnName} : undefined;`
    )();
    if (typeof fn !== 'function') {
      return [];
    }

    const candidateArgs: unknown[][] = [
      [[]],
      [[1]],
      [[1, 2, 3]],
      [[3, 1, 2, 1]],
      [['a', 'b', 'a']],
      [[{ value: 1 }, { value: 2 }]],
      [0],
      [1],
      [[5, 4, 3, 2, 1]],
      [[2, 2, 2, 2]],
    ];

    const tests: ProblemTestCase[] = [];
    for (const args of candidateArgs) {
      if (tests.length >= minimumTestCount) {
        break;
      }

      try {
        const expected = fn(...args);
        if (expected === undefined) {
          continue;
        }
        tests.push({
          description: `Reference case ${tests.length + 1}`,
          args,
          expected,
        });
      } catch {
        continue;
      }
    }

    return tests;
  } catch {
    return [];
  }
}

function mergeAndNormalizeTests(
  baseTests: ProblemTestCase[],
  generatedTests: ProblemTestCase[]
) {
  const merged: ProblemTestCase[] = [];
  const seen = new Set<string>();

  for (const testCase of [...baseTests, ...generatedTests]) {
    const signature = `${formatValue(testCase.args)}|${formatValue(testCase.expected)}`;
    if (seen.has(signature)) {
      continue;
    }

    seen.add(signature);
    merged.push({
      description: testCase.description,
      args: Array.isArray(testCase.args) ? testCase.args : [testCase.args],
      expected: testCase.expected,
    });
  }

  if (merged.length === 0) {
    return merged;
  }

  return merged.slice(0, minimumTestCount);
}

function looksLowSignalTestSet(testCases: ProblemTestCase[]) {
  if (testCases.length === 0) {
    return true;
  }

  const expectedSignatures = new Set(
    testCases.map((testCase) => formatValue(testCase.expected))
  );
  const allExpectedDefaultLike = testCases.every((testCase) => {
    const expected = testCase.expected;
    return (
      expected === '' ||
      expected === null ||
      expected === 0 ||
      expected === false ||
      (Array.isArray(expected) && expected.length === 0) ||
      (typeof expected === 'object' &&
        expected !== null &&
        Object.keys(expected).length === 0)
    );
  });

  return expectedSignatures.size <= 1 && allExpectedDefaultLike;
}

function normalizeHintText(hint: string) {
  return hint
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[\-*_`"'.,:;!?()[\]{}]/g, '')
    .trim();
}

function dedupeHints(hints: string[]) {
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const hint of hints) {
    const cleaned = hint.trim();
    if (!cleaned) {
      continue;
    }

    const key = normalizeHintText(cleaned);
    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(cleaned);
  }

  return unique;
}

function waitForPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

function DetailList({ items }: { items: string[] }) {
  return (
    <Stack component="ul" spacing={1.25} sx={{ m: 0, pl: 2.5 }}>
      {items.map((item) => (
        <Typography
          key={item}
          component="li"
          variant="body2"
          color="text.secondary"
        >
          {item}
        </Typography>
      ))}
    </Stack>
  );
}

export default function AlgoLensDemo() {
  const engineRef = React.useRef<WebLLMEngine | null>(null);
  const workerRef = React.useRef<Worker | null>(null);
  const [topic, setTopic] = React.useState('music');
  const [algorithmId, setAlgorithmId] =
    React.useState<AlgorithmId>('sliding-window');
  const [difficulty, setDifficulty] = React.useState<Difficulty>('beginner');
  const [modelId, setModelId] = React.useState(defaultModelId);
  const [loadStatus, setLoadStatus] = React.useState<LoadStatus>('idle');
  const [generateStatus, setGenerateStatus] =
    React.useState<GenerateStatus>('idle');
  const [progressText, setProgressText] = React.useState(
    'Model not loaded yet.'
  );
  const [progressValue, setProgressValue] = React.useState(0);
  const [error, setError] = React.useState('');
  const [problem, setProblem] = React.useState<GeneratedProblem | null>(null);
  const [diagnostics, setDiagnostics] = React.useState<RuntimeDiagnostics>({
    webGpu: false,
    secureContext: false,
    crossOriginIsolated: false,
    worker: false,
  });
  const [runtimeLog, setRuntimeLog] = React.useState<string[]>([
    'Waiting for model load.',
  ]);
  const [solutionCode, setSolutionCode] = React.useState('');
  const [testCases, setTestCases] = React.useState<ProblemTestCase[]>([]);
  const [testsStatus, setTestsStatus] = React.useState<TestsStatus>('idle');
  const [testsError, setTestsError] = React.useState('');
  const [testGenerationAttempt, setTestGenerationAttempt] = React.useState(0);
  const [hintStatus, setHintStatus] = React.useState<HintStatus>('idle');
  const [answerStatus, setAnswerStatus] = React.useState<AnswerStatus>('idle');
  const [allHints, setAllHints] = React.useState<string[]>([]);
  const [visibleHintCount, setVisibleHintCount] = React.useState(0);
  const [answerText, setAnswerText] = React.useState('');

  const selectedAlgorithm = getAlgorithmPattern(algorithmId);
  const isBusy = loadStatus === 'loading' || generateStatus === 'generating';
  const canGenerate = loadStatus === 'ready' && !isBusy;
  const hasReachedHintLimit = visibleHintCount >= targetHintCount;
  const hasAnswer = Boolean(answerText.trim());

  const appendLog = React.useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setRuntimeLog((entries) =>
      [`${timestamp} - ${message}`, ...entries].slice(0, 8)
    );
  }, []);

  const refreshDiagnostics = React.useCallback(() => {
    setDiagnostics({
      webGpu: typeof navigator !== 'undefined' && 'gpu' in navigator,
      secureContext: typeof window !== 'undefined' && window.isSecureContext,
      crossOriginIsolated:
        typeof window !== 'undefined' && window.crossOriginIsolated,
      worker: typeof Worker !== 'undefined',
    });
  }, []);

  React.useEffect(() => {
    refreshDiagnostics();

    const handleWindowError = (event: ErrorEvent) => {
      appendLog(`Window error: ${event.message}`);
    };
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason =
        event.reason instanceof Error
          ? event.reason.message
          : String(event.reason);
      appendLog(`Unhandled rejection: ${reason}`);
    };

    window.addEventListener('error', handleWindowError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleWindowError);
      window.removeEventListener(
        'unhandledrejection',
        handleUnhandledRejection
      );
      workerRef.current?.terminate();
    };
  }, [appendLog, refreshDiagnostics]);

  React.useEffect(() => {
    if (!problem) {
      setSolutionCode('');
      setTestCases([]);
      setTestsError('');
      setTestsStatus('idle');
      setHintStatus('idle');
      setAnswerStatus('idle');
      setAnswerText('');
      setAllHints([]);
      setVisibleHintCount(0);
      return;
    }

    const inferredTests = inferTestsFromExamples(problem.examples);
    setSolutionCode(problem.starterCode);
    setHintStatus('idle');
    setAnswerStatus('idle');
    setAnswerText('');
    setAllHints(dedupeHints(problem.hints));
    setVisibleHintCount(0);
    setTestsError('');
    setTestCases(inferredTests);
    setTestsStatus('generating');

    let cancelled = false;

    const generateTestCases = async () => {
      if (!engineRef.current) {
        return;
      }

      try {
        appendLog('Generating runnable tests for the in-browser IDE.');
        const requestTestBundle = async (retryNote = '') => {
          const response = await engineRef.current!.chat.completions.create({
            messages: [
              {
                role: 'system' as const,
                content:
                  'You produce a reference JavaScript solution and high-quality tests. Return strict JSON only. No markdown fences.',
              },
              {
                role: 'user' as const,
                content: `Create a reference solution and exactly ${minimumTestCount} test cases for this coding problem.

TITLE: ${problem.title}
PROBLEM: ${problem.problemStatement}
EXAMPLES:
${problem.examples.map((example) => `- ${example}`).join('\n')}
STARTER_CODE:
${problem.starterCode}

Return one JSON object only with this exact shape:
{
  "referenceSolution": "function solveChallenge(input) { ... }",
  "tests": [
    {
      "description": "...",
      "args": [ ... ],
      "expected": ...
    }
  ]
}

Rules:
- Use JSON literals only (numbers, strings, booleans, arrays, objects).
- Never use bare identifiers like Song1; use quoted strings instead.
- Ensure each test has valid parseable args and expected value.
- Make tests varied enough to catch incorrect implementations.
- referenceSolution must be valid JavaScript function code.
${retryNote}

Do not include explanations.`,
              },
            ],
            temperature: 0.2,
            max_tokens: 620,
          });

          const text = await readCompletionText(response);
          const bundle = parseTestBundlePayload(text);
          const testsFromLooseParsers =
            parseJsonArrayPayload(text) ??
            parseLooseArrayPayload(text) ??
            parseObjectBlocksPayload(text);

          return {
            tests: mergeAndNormalizeTests(bundle.tests, testsFromLooseParsers),
            referenceSolution: bundle.referenceSolution,
          };
        };

        const requestRepairTests = async (
          existingTests: ProblemTestCase[],
          referenceSolution: string,
          retryNote = ''
        ) => {
          const response = await engineRef.current!.chat.completions.create({
            messages: [
              {
                role: 'system' as const,
                content:
                  'You repair weak test suites. Return strict JSON array only. No markdown fences.',
              },
              {
                role: 'user' as const,
                content: `The current tests are missing coverage or invalid. Create additional tests for this problem.

TITLE: ${problem.title}
PROBLEM: ${problem.problemStatement}
REFERENCE_SOLUTION:
${referenceSolution || 'not available'}
EXISTING_TESTS:
${existingTests.length > 0 ? existingTests.map((test) => `- ${test.description}: args=${formatValue(test.args)} expected=${formatValue(test.expected)}`).join('\n') : '- none'}

Return JSON array only, each item:
- description: string
- args: array
- expected: value

Rules:
- Return at least ${minimumTestCount} total-quality candidates.
- Do not duplicate existing tests.
- Include edge cases and non-trivial expected outputs.
${retryNote}

Do not include explanations.`,
              },
            ],
            temperature: 0.25,
            max_tokens: 520,
          });

          const text = await readCompletionText(response);
          return (
            parseJsonArrayPayload(text) ??
            parseLooseArrayPayload(text) ??
            parseObjectBlocksPayload(text)
          );
        };

        const buildCandidateTests = async (
          bundle: { tests: ProblemTestCase[]; referenceSolution: string }
        ) => {
          const referenceTests = buildTestsFromReferenceSolution(
            bundle.referenceSolution
          );

          let candidateTests = mergeAndNormalizeTests(
            [...inferredTests, ...referenceTests],
            bundle.tests
          );

          if (
            candidateTests.length < minimumTestCount ||
            looksLowSignalTestSet(candidateTests)
          ) {
            const repairedTests = await requestRepairTests(
              candidateTests,
              bundle.referenceSolution
            );
            candidateTests = mergeAndNormalizeTests(candidateTests, repairedTests);
          }

          return candidateTests;
        };

        // Silent retry cycle: full regenerate once before surfacing any error.
        for (let cycle = 0; cycle < 2; cycle += 1) {
          let bundle = await requestTestBundle(
            cycle === 0
              ? ''
              : `Previous cycle did not produce enough valid tests. Return stronger and more diverse tests.`
          );

          if (bundle.tests.length < minimumTestCount) {
            bundle = await requestTestBundle(
              `Previous attempt produced only ${bundle.tests.length} valid tests. Retry and return exactly ${minimumTestCount} valid tests plus a valid referenceSolution.`
            );
          }

          const finalTests = await buildCandidateTests(bundle);

          if (cancelled) {
            return;
          }

          if (
            finalTests.length >= minimumTestCount &&
            !looksLowSignalTestSet(finalTests)
          ) {
            setTestCases(finalTests);
            setTestsStatus('ready');
            appendLog(`Prepared ${finalTests.length} runnable tests.`);
            return;
          }
        }

        setTestsStatus('error');
        setTestsError('Could not prepare enough tests for this problem.');
        setError('Could not prepare enough tests for this problem.');
      } catch (caught) {
        if (cancelled) {
          return;
        }
        const message =
          caught instanceof Error
            ? caught.message
            : 'Could not generate runnable tests.';
        appendLog(`Test generation failed: ${message}`);
        const fallbackTests = mergeAndNormalizeTests(
          inferredTests,
          []
        );
        if (
          fallbackTests.length >= minimumTestCount &&
          !looksLowSignalTestSet(fallbackTests)
        ) {
          setTestCases(fallbackTests);
          setTestsStatus('ready');
          appendLog(`Using ${fallbackTests.length} fallback tests.`);
          return;
        }

        setTestsStatus('error');
        setTestsError(message);
      }
    };

    void generateTestCases();

    return () => {
      cancelled = true;
    };
  }, [appendLog, problem, testGenerationAttempt]);

  const handleAlgorithmChange = (event: SelectChangeEvent) => {
    setAlgorithmId(event.target.value as AlgorithmId);
  };

  const handleDifficultyChange = (event: SelectChangeEvent) => {
    setDifficulty(event.target.value as Difficulty);
  };

  const handleModelChange = (event: SelectChangeEvent) => {
    engineRef.current = null;
    workerRef.current?.terminate();
    workerRef.current = null;
    setModelId(event.target.value);
    setLoadStatus('idle');
    setProgressText('Model not loaded yet.');
    setProgressValue(0);
    setProblem(null);
  };

  const loadModel = async () => {
    setError('');
    setProblem(null);
    refreshDiagnostics();
    appendLog(`Load requested for ${modelId}.`);

    if (typeof Worker === 'undefined') {
      const message =
        'This browser does not support Web Workers, so WebLLM cannot start.';
      setLoadStatus('unsupported');
      setError(message);
      setProgressText(message);
      appendLog('Stopped: Worker support is unavailable.');
      return;
    }

    if (!window.isSecureContext) {
      const message =
        'WebLLM requires a secure context (HTTPS or localhost). Open this page on localhost or HTTPS and try again.';
      setLoadStatus('unsupported');
      setError(message);
      setProgressText(message);
      appendLog('Stopped: Page is not running in a secure context.');
      return;
    }

    if (!window.crossOriginIsolated) {
      const message =
        'WebLLM requires cross-origin isolation. Add Cross-Origin-Opener-Policy: same-origin and Cross-Origin-Embedder-Policy: require-corp headers for this page and static assets.';
      setLoadStatus('unsupported');
      setError(message);
      setProgressText(message);
      appendLog('Stopped: Page is not cross-origin isolated.');
      return;
    }

    if (!supportsBrowserLLM()) {
      const message =
        'This browser does not expose WebGPU, which WebLLM needs for local inference.';
      setLoadStatus('unsupported');
      setError(message);
      setProgressText(message);
      appendLog('Stopped: WebGPU is not available in this browser.');
      return;
    }

    try {
      setLoadStatus('loading');
      setProgressText('Starting WebLLM in this browser...');
      setProgressValue(2);
      appendLog('UI state updated; starting worker setup.');

      await waitForPaint();

      setProgressText('Starting WebLLM worker...');
      setProgressValue(6);

      const { CreateWebWorkerMLCEngine } = await import('@mlc-ai/web-llm');

      workerRef.current?.terminate();
      const worker = new Worker(
        new URL('./webllm.worker.ts', import.meta.url),
        {
          type: 'module',
        }
      );
      worker.addEventListener('error', (event) => {
        appendLog(`Worker error: ${event.message}`);
      });
      worker.addEventListener('messageerror', () => {
        appendLog(
          'Worker message error: browser could not deserialize a worker message.'
        );
      });
      workerRef.current = worker;
      appendLog('Worker created.');

      setProgressText(
        'Connecting the worker to WebGPU and preparing model cache...'
      );
      setProgressValue(10);

      const engine = await CreateWebWorkerMLCEngine(worker, modelId, {
        initProgressCallback: (report) => {
          setProgressText(report.text);
          setProgressValue(Math.max(10, Math.round(report.progress * 100)));
          if (report.text) {
            appendLog(report.text);
          }
        },
      });

      engineRef.current = engine as WebLLMEngine;
      setLoadStatus('ready');
      setProgressText('Local model ready. Generation now runs on this device.');
      setProgressValue(100);
      appendLog('Model ready.');
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : 'WebLLM failed to load the selected model.';
      setLoadStatus('error');
      setError(message);
      setProgressText(
        'Model load failed. Try a smaller model or a WebGPU-capable browser.'
      );
      appendLog(`Load failed: ${message}`);
    }
  };

  const generateProblem = async () => {
    if (!engineRef.current) {
      return;
    }

    try {
      setGenerateStatus('generating');
      setError('');
      setTestsError('');
      setProblem(null);
      appendLog(`Generating ${selectedAlgorithm.label} problem for ${topic}.`);
      const response = await engineRef.current.chat.completions.create({
        messages: buildGenerationMessages({
          topic,
          algorithm: selectedAlgorithm,
          difficulty,
        }),
        temperature: 0.7,
        max_tokens: generationMaxTokens,
        stream: false,
      });

      const content = await readCompletionText(response);
      setProblem(parseGeneratedProblem(content));
      setGenerateStatus('complete');
      appendLog('Problem generated.');
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : 'The local model could not generate a problem.';
      setGenerateStatus('error');
      setError(message);
      appendLog(`Generation failed: ${message}`);
    }
  };

  const retryTests = () => {
    if (!problem) {
      return;
    }

    setTestsError('');
    setError('');
    setTestGenerationAttempt((attempt) => attempt + 1);
    appendLog('Manual retry requested for test generation.');
  };

  const showNextHint = async () => {
    if (!problem) {
      return;
    }

    if (hasReachedHintLimit) {
      return;
    }

    if (visibleHintCount < allHints.length) {
      setVisibleHintCount((count) => count + 1);
      return;
    }

    if (!engineRef.current) {
      return;
    }

    setHintStatus('generating');

    try {
      appendLog('Generating an additional hint.');
      let generatedHint = '';

      for (let attempt = 0; attempt < 3; attempt += 1) {
        const response = await engineRef.current.chat.completions.create({
          messages: [
            {
              role: 'system' as const,
              content:
                'You are a concise coding coach. Return one short hint only. No numbering and no markdown.',
            },
            {
              role: 'user' as const,
              content: `Problem title: ${problem.title}
Problem statement: ${problem.problemStatement}
Algorithm: ${selectedAlgorithm.label}
Previously shown hints:
${allHints.length > 0 ? allHints.map((hint) => `- ${hint}`).join('\n') : '- none'}

Generate one new hint that is different from previous hints and reveals only the next small step.`,
            },
          ],
          temperature: 0.7,
          max_tokens: 110,
        });

        const candidate = (await readCompletionText(response)).trim();
        if (!candidate) {
          continue;
        }

        const candidateKey = normalizeHintText(candidate);
        const hasDuplicate = allHints.some(
          (hint) => normalizeHintText(hint) === candidateKey,
        );
        if (hasDuplicate) {
          continue;
        }

        generatedHint = candidate;
        break;
      }

      if (!generatedHint) {
        const fallbackHints = [
          'Write the smallest input that should pass, then step through it by hand.',
          `Track the exact state your ${selectedAlgorithm.label} pattern should update each iteration.`,
          'Define your loop invariant in one sentence before coding.',
          'Add a quick guard for empty or tiny input before the main loop.',
          'Log intermediate state for one test case to verify each transition.',
        ];

        generatedHint =
          fallbackHints.find(
            (hint) =>
              !allHints.some(
                (existingHint) =>
                  normalizeHintText(existingHint) === normalizeHintText(hint),
              ),
          ) ?? '';
      }

      if (!generatedHint) {
        throw new Error('Hint generation returned duplicate content repeatedly.');
      }

      setAllHints((hints) => dedupeHints([...hints, generatedHint]));
      setVisibleHintCount((count) => count + 1);
      setHintStatus('idle');
      appendLog('Additional hint generated.');
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : 'Could not generate hint.';
      setHintStatus('error');
      appendLog(`Hint generation failed: ${message}`);
      setError(message);
    }
  };

  const showAnswer = async () => {
    if (!problem || !engineRef.current) {
      return;
    }

    if (hasAnswer) {
      return;
    }

    setAnswerStatus('generating');

    try {
      appendLog('Generating full solution answer.');
      const response = await engineRef.current.chat.completions.create({
        messages: [
          {
            role: 'system' as const,
            content:
              'You are an algorithms tutor. Return concise plain text with two headings only: APPROACH and SOLUTION_CODE.',
          },
          {
            role: 'user' as const,
            content: `Problem title: ${problem.title}
Problem statement: ${problem.problemStatement}
Algorithm: ${selectedAlgorithm.label}
Starter code:
${problem.starterCode}

Return:
APPROACH:
short explanation of the algorithm and complexity

SOLUTION_CODE:
complete JavaScript function implementation (no markdown fences)`,
          },
        ],
        temperature: 0.2,
        max_tokens: 420,
      });

      const answer = (await readCompletionText(response)).trim();
      if (!answer) {
        throw new Error('Answer generation returned empty content.');
      }

      setAnswerText(answer);
      setAnswerStatus('idle');
      appendLog('Answer generated.');
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : 'Could not generate answer.';
      setAnswerStatus('error');
      setError(message);
      appendLog(`Answer generation failed: ${message}`);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: { xs: 5, md: 7 } }}>
        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
          sx={{ mb: 2 }}
        >
          <Chip icon={<LockIcon />} label="Browser-only LLM" size="small" />
          <Chip label="No backend" size="small" />
          <Chip label="No API key" size="small" />
          <Chip label="No paid calls" size="small" />
        </Stack>
        <Typography variant="h2" component="h1" gutterBottom>
          AlgoLens
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 860 }}>
          Learn algorithms through problems about things you actually care
          about.
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 860, mt: 2 }}
        >
          AlgoLens loads a small WebLLM model in the browser, then generates
          fresh algorithm practice prompts on the user&apos;s device. There is
          no backend endpoint, no secret key, and no metered LLM API behind the
          form.
        </Typography>
      </Box>

      <Grid container spacing={3.5} alignItems="stretch">
        <Grid item xs={12} md={4}>
          <Card
            variant="outlined"
            sx={{
              height: '100%',
              position: { md: 'sticky' },
              top: { md: 104 },
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Stack spacing={2.25}>
                <Box>
                  <Typography variant="h5" component="h2" gutterBottom>
                    Generate a challenge
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Load the local model once, then create fresh problems from
                    the selected topic and algorithm pattern.
                  </Typography>
                </Box>

                <TextField
                  label="Interest or topic"
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  placeholder="soccer, music, cooking, games"
                  fullWidth
                />

                <FormControl fullWidth>
                  <InputLabel id="algorithm-select-label">Algorithm</InputLabel>
                  <Select
                    labelId="algorithm-select-label"
                    value={algorithmId}
                    label="Algorithm"
                    onChange={handleAlgorithmChange}
                  >
                    {algorithmPatterns.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel id="difficulty-select-label">
                    Difficulty
                  </InputLabel>
                  <Select
                    labelId="difficulty-select-label"
                    value={difficulty}
                    label="Difficulty"
                    onChange={handleDifficultyChange}
                  >
                    {difficultyOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel id="model-select-label">Local model</InputLabel>
                  <Select
                    labelId="model-select-label"
                    value={modelId}
                    label="Local model"
                    onChange={handleModelChange}
                    disabled={isBusy}
                  >
                    {modelOptions.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Paper variant="outlined" sx={{ p: 1.75, borderRadius: 2 }}>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {loadStatus === 'loading' ? (
                        <CircularProgress size={18} />
                      ) : (
                        <AutoAwesomeIcon
                          color={loadStatus === 'ready' ? 'primary' : 'inherit'}
                        />
                      )}
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {loadStatus === 'ready'
                          ? 'WebLLM ready'
                          : 'WebLLM runtime'}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant={
                        loadStatus === 'loading' ? 'determinate' : 'determinate'
                      }
                      value={progressValue}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {progressText}
                    </Typography>
                  </Stack>
                </Paper>

                <Stack
                  direction={{ xs: 'column', sm: 'row', md: 'column' }}
                  spacing={1}
                >
                  <Button
                    variant="outlined"
                    startIcon={<BoltIcon />}
                    onClick={loadModel}
                    disabled={isBusy}
                    fullWidth
                  >
                    {loadStatus === 'loading'
                      ? 'Loading model...'
                      : loadStatus === 'ready'
                        ? 'Reload model'
                        : 'Load local model'}
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<AutoAwesomeIcon />}
                    onClick={generateProblem}
                    disabled={!canGenerate}
                    fullWidth
                  >
                    Generate problem
                  </Button>
                </Stack>

                {error && (
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.75,
                      borderRadius: 2,
                      borderColor: 'warning.main',
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <WarningAmberIcon color="warning" fontSize="small" />
                      <Typography variant="body2" color="text.secondary">
                        {error}
                      </Typography>
                    </Stack>
                  </Paper>
                )}

                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.75,
                    borderRadius: 2,
                    minHeight: 208,
                    maxHeight: 208,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                    Runtime diagnostics
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={0.75}
                    flexWrap="wrap"
                    useFlexGap
                    sx={{ mb: 1.25 }}
                  >
                    <Chip
                      label={`WebGPU ${diagnostics.webGpu ? 'yes' : 'no'}`}
                      size="small"
                      color={diagnostics.webGpu ? 'primary' : 'default'}
                    />
                    <Chip
                      label={`Isolated ${diagnostics.crossOriginIsolated ? 'yes' : 'no'}`}
                      size="small"
                      color={
                        diagnostics.crossOriginIsolated ? 'primary' : 'default'
                      }
                    />
                    <Chip
                      label={`Secure ${diagnostics.secureContext ? 'yes' : 'no'}`}
                      size="small"
                      color={diagnostics.secureContext ? 'primary' : 'default'}
                    />
                    <Chip
                      label={`Worker ${diagnostics.worker ? 'yes' : 'no'}`}
                      size="small"
                      color={diagnostics.worker ? 'primary' : 'default'}
                    />
                  </Stack>
                  <Stack
                    spacing={0.75}
                    sx={{
                      overflowY: 'auto',
                      pr: 0.75,
                      minHeight: 0,
                    }}
                  >
                    {runtimeLog.map((entry) => (
                      <Typography
                        key={entry}
                        variant="caption"
                        color="text.secondary"
                      >
                        {entry}
                      </Typography>
                    ))}
                  </Stack>
                </Paper>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            {generateStatus === 'generating' && (
              <Paper
                variant="outlined"
                sx={{
                  p: { xs: 3, sm: 4 },
                  borderRadius: 3,
                  minHeight: 280,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'radial-gradient(circle at 30% 20%, rgba(87, 243, 51, 0.18), rgba(9, 13, 25, 0.9) 60%)'
                      : 'radial-gradient(circle at 30% 20%, rgba(76, 195, 35, 0.2), rgba(245, 249, 255, 0.95) 62%)',
                }}
              >
                <Stack spacing={1.75} alignItems="center" textAlign="center">
                  <Box
                    sx={{
                      display: 'inline-flex',
                      p: 1.25,
                      borderRadius: '50%',
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(12, 18, 35, 0.8)'
                          : 'rgba(255, 255, 255, 0.92)',
                      animation: 'robotDance 900ms ease-in-out infinite',
                      '@keyframes robotDance': {
                        '0%': { transform: 'translateY(0px) rotate(-4deg) scale(1)' },
                        '25%': { transform: 'translateY(-6px) rotate(5deg) scale(1.05)' },
                        '50%': { transform: 'translateY(0px) rotate(0deg) scale(1.02)' },
                        '75%': { transform: 'translateY(-4px) rotate(-5deg) scale(1.05)' },
                        '100%': { transform: 'translateY(0px) rotate(-4deg) scale(1)' },
                      },
                    }}
                  >
                    <SmartToyIcon color="primary" sx={{ fontSize: 64 }} />
                  </Box>
                  <Typography variant="h5" component="h2">
                    Cooking up your next challenge...
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    The local model is generating your problem and IDE-ready test context.
                  </Typography>
                </Stack>
              </Paper>
            )}

            {!problem && generateStatus !== 'generating' && (
              <Paper
                variant="outlined"
                sx={{ p: { xs: 2.75, sm: 3.25 }, borderRadius: 3 }}
              >
                <Typography variant="h6" gutterBottom>
                  Your challenge appears here after generation.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Click Generate problem to start.
                </Typography>
                {generateStatus === 'error' && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={generateProblem}
                    disabled={!canGenerate}
                    sx={{ mt: 1.5 }}
                  >
                    Try generating problem again
                  </Button>
                )}
              </Paper>
            )}

            {problem && (
              <>
                <Paper
                  variant="outlined"
                  sx={{
                    p: { xs: 2.5, sm: 3 },
                    borderRadius: 3,
                    overflow: 'hidden',
                    position: 'relative',
                    background: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(87, 243, 51, 0.08), rgba(184, 109, 255, 0.08))'
                        : 'linear-gradient(135deg, rgba(99, 65, 226, 0.08), rgba(76, 195, 35, 0.08))',
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    useFlexGap
                    sx={{ mb: 2 }}
                  >
                    <Chip
                      label={selectedAlgorithm.label}
                      color="primary"
                      size="small"
                    />
                    <Chip label={selectedAlgorithm.family} size="small" />
                    <Chip label={topic.trim() || 'music'} size="small" />
                  </Stack>
                  <Typography variant="h4" component="h2" gutterBottom>
                    {problem.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {problem.problemStatement}
                  </Typography>
                </Paper>

                <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mb: 1.5 }}
                    >
                      <ExploreIcon color="primary" />
                      <Typography variant="h6" component="h3">
                        Examples
                      </Typography>
                    </Stack>
                    <DetailList items={problem.examples} />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mb: 1.5 }}
                    >
                      <LightbulbIcon color="primary" />
                      <Typography variant="h6" component="h3">
                        Hints
                      </Typography>
                    </Stack>
                    <Stack spacing={1.25}>
                        <Typography variant="body2" color="text.secondary">
                          Hints are hidden by default. Reveal up to {targetHintCount} one at a time, then unlock the full answer.
                        </Typography>
                        {!hasReachedHintLimit ? (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={showNextHint}
                            disabled={hintStatus === 'generating'}
                            sx={{ alignSelf: 'flex-start' }}
                          >
                            {hintStatus === 'generating'
                              ? 'Generating hint...'
                              : `Show me a hint (${Math.min(
                                  visibleHintCount + 1,
                                  targetHintCount,
                                )}/${targetHintCount})`}
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={showAnswer}
                            disabled={answerStatus === 'generating' || hasAnswer}
                            sx={{ alignSelf: 'flex-start' }}
                          >
                            {answerStatus === 'generating'
                              ? 'Generating answer...'
                              : hasAnswer
                                ? 'Answer revealed'
                                : 'Show me the answer'}
                          </Button>
                        )}
                        {visibleHintCount > 0 && (
                          <DetailList
                            items={allHints.slice(0, visibleHintCount)}
                          />
                        )}
                        {hasAnswer && (
                          <Box
                            component="pre"
                            sx={{
                              m: 0,
                              p: 1.25,
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor: 'divider',
                              whiteSpace: 'pre-wrap',
                              fontSize: 13,
                              lineHeight: 1.5,
                              bgcolor: (theme) =>
                                theme.palette.mode === 'dark'
                                  ? 'rgba(7, 10, 18, 0.72)'
                                  : 'rgba(242, 245, 251, 0.95)',
                            }}
                          >
                            {answerText}
                          </Box>
                        )}
                      </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Card variant="outlined">
              <CardContent>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mb: 1.5 }}
                >
                  <PsychologyIcon color="primary" />
                  <Typography variant="h5" component="h3">
                    Canonical algorithm mapping
                  </Typography>
                </Stack>
                <DetailList items={problem.canonicalMapping} />
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.25}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  sx={{ mb: 1.5 }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CodeIcon color="primary" />
                    <Typography variant="h5" component="h3">
                      Web IDE + tests
                    </Typography>
                  </Stack>
                  <Chip
                    size="small"
                    label={`Tests ${testCases.length}`}
                    color={testCases.length > 0 ? 'primary' : 'default'}
                  />
                </Stack>

                <Stack spacing={1.5}>
                    <AlgoLensWorkspace
                      starterCode={solutionCode}
                      initialFunctionName={inferFunctionName(solutionCode)}
                      testsStatus={testsStatus}
                      testsError={testsError}
                      testCases={testCases}
                      onRetryTests={retryTests}
                    />
                  </Stack>
              </CardContent>
            </Card>
              </>
            )}
          </Stack>
        </Grid>
      </Grid>

      <Divider sx={{ my: { xs: 5, md: 7 } }} />

      <Card variant="outlined">
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
            sx={{ mb: 1.5 }}
          >
            <Chip label="Architecture" color="secondary" size="small" />
            <Chip label="Graceful fallback" size="small" />
            <Chip label="Static hosting safe" size="small" />
          </Stack>
          <Typography variant="h4" component="h2" gutterBottom>
            Local-first generation
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 900 }}
          >
            WebLLM downloads model assets to the browser cache and runs
            inference with WebGPU. If a browser cannot support WebGPU or the
            model load fails, AlgoLens does not call a backend replacement. It
            simply explains the limitation and keeps the page usable without
            transmitting prompts, secrets, or user interests off-device.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}
