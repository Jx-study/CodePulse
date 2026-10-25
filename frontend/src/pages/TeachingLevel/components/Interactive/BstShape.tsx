import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/shared/components/Button';
import StatCard from './StatCard';
import styles from './Interactive.module.scss';

interface BstNode {
  key: number;
  left: BstNode | null;
  right: BstNode | null;
}

const SEQUENCES = {
  balanced: [30, 20, 40, 10, 25, 35, 45],
  sorted: [10, 20, 30, 40, 50, 60, 70],
  shuffled: [30, 10, 50, 20, 40, 60, 70],
} as const;

type SequenceName = keyof typeof SEQUENCES;

const NODE_GAP = 38;
const LEVEL_GAP = 36;
const RADIUS = 14;

export function insertKey(root: BstNode | null, key: number): BstNode {
  if (!root) return { key, left: null, right: null };
  return key < root.key
    ? { ...root, left: insertKey(root.left, key) }
    : { ...root, right: insertKey(root.right, key) };
}

export function treeHeight(root: BstNode | null): number {
  return root ? 1 + Math.max(treeHeight(root.left), treeHeight(root.right)) : 0;
}

interface Point {
  x: number;
  y: number;
}

interface Layout {
  nodes: (Point & { key: number })[];
  edges: { from: Point; to: Point; key: number }[];
}

/** x follows the in-order position, y the depth */
export function layoutTree(root: BstNode | null): Layout {
  const at = new Map<number, Point>();
  let column = 0;
  const place = (node: BstNode | null, depth: number) => {
    if (!node) return;
    place(node.left, depth + 1);
    at.set(node.key, { x: column * NODE_GAP, y: depth * LEVEL_GAP });
    column += 1;
    place(node.right, depth + 1);
  };
  place(root, 0);

  const edges: Layout['edges'] = [];
  const link = (node: BstNode | null) => {
    if (!node) return;
    for (const child of [node.left, node.right]) {
      if (!child) continue;
      edges.push({ from: at.get(node.key)!, to: at.get(child.key)!, key: child.key });
      link(child);
    }
  };
  link(root);

  return { nodes: [...at].map(([key, point]) => ({ key, ...point })), edges };
}

export default function BstShape() {
  const { t } = useTranslation('lessons');
  const [name, setName] = useState<SequenceName>('sorted');
  const [inserted, setInserted] = useState(0);

  const keys = SEQUENCES[name];
  const root = keys.slice(0, inserted).reduce<BstNode | null>((tree, key) => insertKey(tree, key), null);
  const height = treeHeight(root);
  const { nodes, edges } = layoutTree(root);

  const width = (keys.length - 1) * NODE_GAP + RADIUS * 2 + 4;
  const svgHeight = (keys.length - 1) * LEVEL_GAP + RADIUS * 2 + 4;
  const offset = RADIUS + 2;

  const hint = () => {
    if (inserted === 0) return t('visuals.bstShape.hintStart');
    if (inserted >= 4 && height === inserted) return t('visuals.bstShape.degenerate', { height });
    return t('visuals.bstShape.shallow', { height });
  };

  return (
    <div className={styles.panel} role="group" aria-label={t('visuals.bstShape.ariaLabel')}>
      <div className={styles.actions}>
        {(Object.keys(SEQUENCES) as SequenceName[]).map((option) => (
          <Button
            key={option}
            variant={option === name ? 'primaryOutline' : 'secondary'}
            size="sm"
            aria-pressed={option === name}
            onClick={() => {
              setName(option);
              setInserted(0);
            }}
          >
            {t(`visuals.bstShape.${option}`)}
          </Button>
        ))}
      </div>

      <p className={styles.prompt}>
        {keys.map((key, i) => (
          <span key={key} className={i < inserted ? styles.keyDone : i === inserted ? styles.keyNext : styles.keyTodo}>
            {key}
            {i < keys.length - 1 ? ', ' : ''}
          </span>
        ))}
      </p>

      <svg
        className={styles.bstSvg}
        viewBox={`0 0 ${width} ${svgHeight}`}
        style={{ maxWidth: width }}
        role="img"
        aria-label={t('visuals.bstShape.ariaLabel')}
      >
        <g transform={`translate(${offset},${offset})`}>
          {edges.map(({ from, to, key }) => (
            <line key={`e${key}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} className={styles.bstEdge} />
          ))}
          {nodes.map((p) => (
            <g key={p.key}>
              <circle cx={p.x} cy={p.y} r={RADIUS} className={styles.bstNode} />
              <text x={p.x} y={p.y + 4} textAnchor="middle" className={styles.bstText}>
                {p.key}
              </text>
            </g>
          ))}
        </g>
      </svg>

      <div className={styles.stats}>
        <StatCard inline label={t('visuals.bstShape.inserted')} value={`${inserted} / ${keys.length}`} />
        <StatCard inline label={t('visuals.bstShape.height')} value={height} />
      </div>

      <div className={styles.actions}>
        <Button size="sm" disabled={inserted === keys.length} onClick={() => setInserted(inserted + 1)}>
          {t('visuals.bstShape.next')}
        </Button>
        <Button variant="secondary" size="sm" disabled={inserted === keys.length} onClick={() => setInserted(keys.length)}>
          {t('visuals.bstShape.all')}
        </Button>
        <Button variant="secondary" size="sm" disabled={inserted === 0} onClick={() => setInserted(0)}>
          {t('visuals.bstShape.reset')}
        </Button>
      </div>

      <p className={styles.hint} aria-live="polite">
        {hint()}
      </p>
    </div>
  );
}
