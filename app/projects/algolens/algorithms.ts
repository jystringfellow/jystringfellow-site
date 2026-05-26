export type AlgorithmId =
  | 'sliding-window'
  | 'two-pointers'
  | 'fast-slow-pointers'
  | 'merge-intervals'
  | 'cyclic-sort'
  | 'linked-list-reversal'
  | 'tree-bfs'
  | 'tree-dfs'
  | 'two-heaps'
  | 'subsets'
  | 'modified-binary-search'
  | 'bitwise-xor'
  | 'top-k-elements'
  | 'k-way-merge'
  | 'zero-one-knapsack'
  | 'unbounded-knapsack'
  | 'fibonacci-numbers'
  | 'palindromic-subsequence'
  | 'longest-common-substring'
  | 'topological-sort'
  | 'trie-traversal'
  | 'number-of-islands'
  | 'trial-and-error'
  | 'union-find'
  | 'unique-paths';

export type Difficulty = 'beginner' | 'intermediate';

export type AlgorithmPattern = {
  id: AlgorithmId;
  label: string;
  family: string;
  canonicalConcept: string;
};

export const difficultyOptions: { value: Difficulty; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
];

export const algorithmPatterns: AlgorithmPattern[] = [
  {
    id: 'sliding-window',
    label: 'Sliding Window',
    family: 'arrays and strings',
    canonicalConcept:
      'Maintain a moving range while updating state incrementally.',
  },
  {
    id: 'two-pointers',
    label: 'Two Pointers',
    family: 'arrays and strings',
    canonicalConcept: 'Move two indexes toward a useful meeting point.',
  },
  {
    id: 'fast-slow-pointers',
    label: 'Fast & Slow Pointers',
    family: 'linked lists and cycles',
    canonicalConcept:
      'Advance pointers at different speeds to detect cycles or middles.',
  },
  {
    id: 'merge-intervals',
    label: 'Merge Intervals',
    family: 'intervals',
    canonicalConcept: 'Sort ranges, then combine overlaps as you scan.',
  },
  {
    id: 'cyclic-sort',
    label: 'Cyclic Sort',
    family: 'arrays',
    canonicalConcept: 'Place each value at the index where it belongs.',
  },
  {
    id: 'linked-list-reversal',
    label: 'In-place Reversal of a LinkedList',
    family: 'linked lists',
    canonicalConcept: 'Reverse pointers while walking the list once.',
  },
  {
    id: 'tree-bfs',
    label: 'Tree Breadth-First Search',
    family: 'trees',
    canonicalConcept: 'Use a queue to visit tree nodes level by level.',
  },
  {
    id: 'tree-dfs',
    label: 'Tree Depth First Search',
    family: 'trees',
    canonicalConcept:
      'Use recursion or a stack to follow paths before siblings.',
  },
  {
    id: 'two-heaps',
    label: 'Two Heaps',
    family: 'priority queues',
    canonicalConcept:
      'Balance a max heap and min heap around a median or split point.',
  },
  {
    id: 'subsets',
    label: 'Subsets',
    family: 'backtracking',
    canonicalConcept:
      'Build combinations by choosing to include or skip each item.',
  },
  {
    id: 'modified-binary-search',
    label: 'Modified Binary Search',
    family: 'search',
    canonicalConcept:
      'Adapt binary search to rotated, ranged, or answer-space problems.',
  },
  {
    id: 'bitwise-xor',
    label: 'Bitwise XOR',
    family: 'bit manipulation',
    canonicalConcept: 'Use XOR cancellation and bit masks to isolate values.',
  },
  {
    id: 'top-k-elements',
    label: "Top 'K' Elements",
    family: 'priority queues',
    canonicalConcept:
      'Keep only the most relevant K items with a heap or selection strategy.',
  },
  {
    id: 'k-way-merge',
    label: 'K-way Merge',
    family: 'priority queues',
    canonicalConcept:
      'Merge multiple sorted streams by repeatedly taking the next best item.',
  },
  {
    id: 'zero-one-knapsack',
    label: '0/1 Knapsack',
    family: 'dynamic programming',
    canonicalConcept:
      'Choose each item at most once under a capacity constraint.',
  },
  {
    id: 'unbounded-knapsack',
    label: 'Unbounded Knapsack',
    family: 'dynamic programming',
    canonicalConcept:
      'Choose items repeatedly while optimizing under a capacity constraint.',
  },
  {
    id: 'fibonacci-numbers',
    label: 'Fibonacci Numbers',
    family: 'dynamic programming',
    canonicalConcept:
      'Reuse overlapping subproblem results instead of recomputing them.',
  },
  {
    id: 'palindromic-subsequence',
    label: 'Palindromic Subsequence',
    family: 'dynamic programming',
    canonicalConcept:
      'Compare both ends of a sequence while solving inner ranges.',
  },
  {
    id: 'longest-common-substring',
    label: 'Longest Common Substring',
    family: 'dynamic programming',
    canonicalConcept: 'Track contiguous matches across two sequences.',
  },
  {
    id: 'topological-sort',
    label: 'Topological Sort',
    family: 'graphs',
    canonicalConcept:
      'Order directed dependencies so prerequisites come first.',
  },
  {
    id: 'trie-traversal',
    label: 'Trie Traversal',
    family: 'tries',
    canonicalConcept: 'Walk character-by-character through prefix nodes.',
  },
  {
    id: 'number-of-islands',
    label: 'Number of Island',
    family: 'graphs and grids',
    canonicalConcept: 'Flood-fill connected grid cells and count components.',
  },
  {
    id: 'trial-and-error',
    label: 'Trial & Error',
    family: 'backtracking',
    canonicalConcept:
      'Try choices, reject invalid partial states, and backtrack.',
  },
  {
    id: 'union-find',
    label: 'Union Find',
    family: 'graphs',
    canonicalConcept: 'Maintain disjoint sets with find and union operations.',
  },
  {
    id: 'unique-paths',
    label: 'Unique Paths',
    family: 'dynamic programming',
    canonicalConcept:
      'Count ways to reach each cell from previously solved cells.',
  },
];

export function getAlgorithmPattern(id: AlgorithmId) {
  return (
    algorithmPatterns.find((pattern) => pattern.id === id) ??
    algorithmPatterns[0]
  );
}
