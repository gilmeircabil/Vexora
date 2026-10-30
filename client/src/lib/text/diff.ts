import * as Diff from 'diff';

export interface DiffPart {
  value: string;
  added?: boolean;
  removed?: boolean;
  lineNumber?: number;
}

export function computeTextDiff(original: string, modified: string): DiffPart[] {
  const changes = Diff.diffLines(original, modified);
  return changes.map((c) => ({
    value: c.value,
    added: c.added,
    removed: c.removed,
  }));
}
