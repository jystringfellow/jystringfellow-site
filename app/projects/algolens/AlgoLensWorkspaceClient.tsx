'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import {
  SandpackConsole,
  SandpackLayout,
  SandpackProvider,
  SandpackTests,
} from '@codesandbox/sandpack-react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import type { AlgoLensWorkspaceTestCase } from './AlgoLensWorkspace';

type AlgoLensWorkspaceClientProps = {
  starterCode: string;
  initialFunctionName: string;
  testsStatus: 'idle' | 'generating' | 'ready' | 'running' | 'error';
  testsError: string;
  testCases: AlgoLensWorkspaceTestCase[];
  onRetryTests: () => void;
};

type TestSummary = {
  passed: number;
  failed: number;
  total: number;
  firstFailure: string;
};

type SandpackSpecLike = {
  tests?: Record<
    string,
    {
      status?: 'idle' | 'running' | 'pass' | 'fail';
      errors?: Array<{ message?: string }>;
    }
  >;
  describes?: Record<string, SandpackSpecLike>;
};

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        minHeight: 320,
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <Typography variant="body2" color="text.secondary">
        Loading Monaco Editor...
      </Typography>
    </Box>
  ),
});

function isValidIdentifier(name: string) {
  return /^[A-Za-z_$][\w$]*$/.test(name.trim());
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

  return 'solveChallenge';
}

function buildTestSummary(specMap: Record<string, SandpackSpecLike>) {
  const summary: TestSummary = {
    passed: 0,
    failed: 0,
    total: 0,
    firstFailure: '',
  };

  const visit = (node: SandpackSpecLike) => {
    Object.values(node.tests ?? {}).forEach((test) => {
      summary.total += 1;

      if (test.status === 'pass') {
        summary.passed += 1;
      } else if (test.status === 'fail') {
        summary.failed += 1;
        if (!summary.firstFailure && test.errors && test.errors.length > 0) {
          summary.firstFailure = test.errors[0]?.message ?? 'Test failed.';
        }
      }
    });

    Object.values(node.describes ?? {}).forEach((describe) => {
      visit(describe);
    });
  };

  Object.values(specMap).forEach((spec) => {
    visit(spec);
  });

  return summary;
}

function buildSandpackFiles(
  code: string,
  functionName: string,
  testCases: AlgoLensWorkspaceTestCase[],
  runToken: number,
) {
  const trimmedFunctionName = functionName.trim();
  const isFunctionNameValid = isValidIdentifier(trimmedFunctionName);

  const solutionFile = `${code}\n\nexport default ${
    isFunctionNameValid
      ? `(typeof ${trimmedFunctionName} !== 'undefined' ? ${trimmedFunctionName} : undefined)`
      : 'undefined'
  };\n`;

  const generatedTests = testCases
    .map((testCase, index) => {
      const description = JSON.stringify(testCase.description || `Test ${index + 1}`);
      const args = JSON.stringify(testCase.args);
      const expected = JSON.stringify(testCase.expected);
      return `it(${description}, () => {
  const actual = candidate(...${args});
  expect(actual).toEqual(${expected});
});`;
    })
    .join('\n\n');

  const testsFile = `import { describe, it, expect } from 'vitest';
import candidate from './solution';

const RUN_TOKEN = ${runToken};
console.info('Running AlgoLens tests', RUN_TOKEN);

describe('AlgoLens challenge', () => {
  it('exports a function', () => {
    expect(typeof candidate).toBe('function');
  });

${generatedTests || "it('has generated test cases', () => { expect(false).toBe(true); });"}
});
`;

  return {
    '/solution.ts': {
      code: solutionFile,
      active: true,
    },
    '/solution.test.ts': {
      code: testsFile,
      readOnly: true,
      hidden: false,
    },
  };
}

export function AlgoLensWorkspaceClient({
  starterCode,
  initialFunctionName,
  testsStatus,
  testsError,
  testCases,
  onRetryTests,
}: AlgoLensWorkspaceClientProps) {
  const [draftCode, setDraftCode] = React.useState(starterCode);
  const [runtimeCode, setRuntimeCode] = React.useState(starterCode);
  const [functionName, setFunctionName] = React.useState(
    initialFunctionName || inferFunctionName(starterCode),
  );
  const [showTestsFile, setShowTestsFile] = React.useState(false);
  const [runToken, setRunToken] = React.useState(1);
  const [hasRunOnce, setHasRunOnce] = React.useState(false);
  const [isRunning, setIsRunning] = React.useState(false);
  const [summary, setSummary] = React.useState<TestSummary | null>(null);

  React.useEffect(() => {
    const inferredFunctionName =
      initialFunctionName || inferFunctionName(starterCode);
    setDraftCode(starterCode);
    setRuntimeCode(starterCode);
    setFunctionName(inferredFunctionName);
    setShowTestsFile(false);
    setRunToken(1);
    setHasRunOnce(false);
    setIsRunning(false);
    setSummary(null);
  }, [initialFunctionName, starterCode]);

  const sandpackFiles = React.useMemo(
    () => buildSandpackFiles(runtimeCode, functionName, testCases, runToken),
    [runtimeCode, functionName, testCases, runToken],
  );

  const handleRunTests = () => {
    if (!isValidIdentifier(functionName)) {
      setSummary({
        passed: 0,
        failed: 1,
        total: 1,
        firstFailure: 'Enter a valid JavaScript function name before running tests.',
      });
      return;
    }

    setRuntimeCode(draftCode);
    setRunToken((value) => value + 1);
    setHasRunOnce(true);
    setIsRunning(true);
    setSummary(null);
  };

  const handleResetCode = () => {
    const inferredFunctionName = inferFunctionName(starterCode);
    setDraftCode(starterCode);
    setRuntimeCode(starterCode);
    setFunctionName(inferredFunctionName);
    setHasRunOnce(false);
    setIsRunning(false);
    setSummary(null);
  };

  const testStatusText = isRunning
    ? 'Running tests...'
    : summary
      ? `${summary.passed}/${summary.total} tests passed`
      : 'Tests not run yet';

  const testStatusColor = isRunning
    ? 'default'
    : summary && summary.failed === 0 && summary.total > 0
      ? 'success'
      : summary && summary.failed > 0
        ? 'warning'
        : 'default';

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        <TextField
          label="Function name to test"
          value={functionName}
          onChange={(event) => setFunctionName(event.target.value)}
          size="small"
          sx={{ maxWidth: { xs: '100%', sm: 280 } }}
        />
        <Chip size="small" label={testStatusText} color={testStatusColor} />
        <Button
          variant="outlined"
          size="small"
          onClick={() => setShowTestsFile((value) => !value)}
          sx={{ ml: { sm: 'auto' } }}
        >
          {showTestsFile ? 'Hide test file' : 'Show test file'}
        </Button>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', lg: '1.15fr 0.85fr' },
          alignItems: 'stretch',
        }}
      >
        <Paper
          variant="outlined"
          sx={{
            overflow: 'hidden',
            borderRadius: 2,
            minHeight: { xs: 320, lg: 560 },
          }}
        >
          <MonacoEditor
            height="100%"
            defaultLanguage="typescript"
            language="typescript"
            theme="vs-dark"
            value={draftCode}
            onChange={(nextValue) => setDraftCode(nextValue ?? '')}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              smoothScrolling: true,
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true,
            }}
          />
        </Paper>

        <Stack spacing={1.25} sx={{ minHeight: { lg: 560 } }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              variant="contained"
              onClick={handleRunTests}
              disabled={testsStatus === 'generating' || testCases.length === 0}
            >
              {isRunning ? 'Running tests...' : 'Run tests'}
            </Button>
            <Button variant="outlined" onClick={handleResetCode}>
              Reset code
            </Button>
          </Stack>

          {testsStatus === 'generating' && (
            <Typography variant="body2" color="text.secondary">
              Building runnable tests from the generated problem...
            </Typography>
          )}

          {testsStatus === 'error' && (
            <Stack spacing={1}>
              <Typography variant="body2" color="warning.main">
                {testsError || 'Test generation failed for this problem.'}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={onRetryTests}
                sx={{ alignSelf: 'flex-start' }}
              >
                Retry tests only
              </Button>
            </Stack>
          )}

          {summary?.failed ? (
            <Typography variant="body2" color="warning.main">
              {summary.firstFailure || 'One or more tests failed.'}
            </Typography>
          ) : null}

          <Paper
            variant="outlined"
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(7, 10, 18, 0.65)'
                  : 'rgba(242, 245, 251, 0.8)',
            }}
          >
            {!hasRunOnce ? (
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Press Run tests to execute your code inside Sandpack.
                </Typography>
              </Box>
            ) : (
              <SandpackProvider
                key={`algolens-sandpack-${runToken}`}
                template="test-ts"
                files={sandpackFiles}
                options={{
                  autorun: true,
                  autoReload: false,
                  recompileMode: 'delayed',
                  recompileDelay: 400,
                  activeFile: '/solution.ts',
                  visibleFiles: showTestsFile
                    ? ['/solution.ts', '/solution.test.ts']
                    : ['/solution.ts'],
                }}
              >
                <SandpackLayout>
                  <Box sx={{ p: 1.25 }}>
                    <Typography variant="caption" color="text.secondary">
                      Test output
                    </Typography>
                    <SandpackTests
                      verbose
                      watchMode={false}
                      showWatchButton={false}
                      onComplete={(specs) => {
                        setSummary(buildTestSummary(specs));
                        setIsRunning(false);
                      }}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1, display: 'block' }}
                    >
                      Console
                    </Typography>
                    <SandpackConsole
                      showHeader={false}
                      showResetConsoleButton
                      maxMessageCount={120}
                    />
                  </Box>
                </SandpackLayout>
              </SandpackProvider>
            )}
          </Paper>
        </Stack>
      </Box>

      {testCases.length > 0 && (
        <Stack spacing={0.75}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            Generated test cases
          </Typography>
          {testCases.map((testCase, index) => (
            <Typography
              key={`${testCase.description}-${index}`}
              variant="caption"
              color="text.secondary"
            >
              {testCase.description}: args={JSON.stringify(testCase.args)} expected={JSON.stringify(testCase.expected)}
            </Typography>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
