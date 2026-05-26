import type { Metadata } from 'next';
import AlgoLensDemo from './AlgoLensDemo';

export const metadata: Metadata = {
  title: 'AlgoLens | Jacob Stringfellow',
  description:
    'A browser-only WebLLM demo for generating personalized algorithm learning problems on-device.',
};

export default function AlgoLensPage() {
  return <AlgoLensDemo />;
}
