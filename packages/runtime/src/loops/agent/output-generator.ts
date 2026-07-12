/**
 * MMOS OutputGenerator - Validated Result → Normalize → Artifact → Output
 * Per docs/reference/runtime/agent-loop.md (Output Generation)
 */

import type { Artifact, Execution, Uoid } from '@mmos/sdk';
import { createArtifact } from '@mmos/sdk';

export interface OutputGenerator {
  generate(output: unknown, name: string, execution?: Execution, taskUoid?: Uoid): Artifact;
}

export function createOutputGenerator(): OutputGenerator {
  return {
    generate(output, name, execution, taskUoid) {
      // Stub storage: in real impl, this would write output to a backend first
      const storage = {
        backend: 'memory',
        path: `${name}.json`,
      };
      const params: {
        execution: Uoid;
        name: string;
        type: string;
        mimeType: string;
        storage: typeof storage;
        task?: Uoid;
      } = {
        execution: (execution?.uoid ?? { toString: () => 'art_owner' }) as Uoid,
        name,
        type: 'agent-output',
        mimeType: 'application/json',
        storage,
      };
      if (taskUoid) {
        params.task = taskUoid;
      }
      const artifact = createArtifact(params);
      // Embed output in metadata for retrieval
      return {
        ...artifact,
        spec: {
          ...artifact.spec,
          metadata: { ...artifact.spec.metadata, content: output },
        },
      };
    },
  };
}
