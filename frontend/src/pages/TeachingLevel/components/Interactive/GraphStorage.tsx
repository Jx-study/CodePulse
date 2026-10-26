import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Slider from '@/shared/components/Slider';
import StatCard from './StatCard';
import styles from './Interactive.module.scss';

const MIN_V = 3;
const MAX_V = 12;

/** Directed edges in a fixed order: a path through all vertices first, then the rest row by row */
export function edgeCells(vertices: number, edges: number): Set<number> {
  const order: number[] = [];
  for (let i = 0; i < vertices - 1; i++) order.push(i * vertices + i + 1);
  for (let i = 0; i < vertices; i++) {
    for (let j = 0; j < vertices; j++) {
      const cell = i * vertices + j;
      if (i !== j && j !== i + 1) order.push(cell);
    }
  }
  return new Set(order.slice(0, edges));
}

export default function GraphStorage() {
  const { t, i18n } = useTranslation('lessons');
  const [vertices, setVertices] = useState(8);
  const [rawEdges, setRawEdges] = useState(10);

  const maxEdges = vertices * (vertices - 1);
  const edges = Math.min(Math.max(rawEdges, vertices - 1), maxEdges);
  const filled = edgeCells(vertices, edges);

  const matrixCells = vertices * vertices;
  const listCells = vertices + edges;
  const sparse = listCells <= matrixCells * 0.6;

  return (
    <div className={styles.panel} role="group" aria-label={t('visuals.graphStorage.ariaLabel')}>
      <div className={styles.controlRow}>
        <span className={styles.controlLabel}>{t('visuals.graphStorage.vLabel')}</span>
        <Slider
          min={MIN_V}
          max={MAX_V}
          step={1}
          value={vertices}
          onChange={setVertices}
          showValue
          formatValue={String}
          ariaLabel={t('visuals.graphStorage.vLabel')}
          className={styles.slider}
        />
      </div>
      <div className={styles.controlRow}>
        <span className={styles.controlLabel}>{t('visuals.graphStorage.eLabel')}</span>
        <Slider
          min={vertices - 1}
          max={maxEdges}
          step={1}
          value={edges}
          onChange={setRawEdges}
          showValue
          formatValue={String}
          ariaLabel={t('visuals.graphStorage.eLabel')}
          className={styles.slider}
        />
      </div>

      <div className={styles.matrixRow}>
        <div
          className={styles.matrix}
          style={{ gridTemplateColumns: `repeat(${vertices}, 1fr)` }}
          aria-hidden="true"
        >
          {Array.from({ length: matrixCells }, (_, i) => (
            <span key={i} className={`${styles.matrixCell} ${filled.has(i) ? styles.matrixCellOn : ''}`} />
          ))}
        </div>
        <div className={styles.matrixStats}>
          <StatCard
            label={t('visuals.graphStorage.matrix')}
            value={t('visuals.graphStorage.matrixFormula', { value: matrixCells.toLocaleString(i18n.language) })}
          />
          <StatCard
            label={t('visuals.graphStorage.list')}
            value={t('visuals.graphStorage.listFormula', { value: listCells.toLocaleString(i18n.language) })}
          />
        </div>
      </div>

      <p className={styles.hint} aria-live="polite">
        {`${t(sparse ? 'visuals.graphStorage.sparse' : 'visuals.graphStorage.dense')}\n${t('visuals.graphStorage.hint')}`}
      </p>
    </div>
  );
}
