import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Explorer.module.scss';
import { D3Canvas, D3CanvasRef } from "../../modules/core/Render/D3Canvas";
import { Node } from "../../modules/core/DataLogic/Node";
import { Box } from "../../modules/core/DataLogic/Box";
import { LinkManager } from "../../modules/core/DataLogic/LinkManager";
import type { Link } from "../../modules/core/Render/D3Renderer";
import { animateConnect } from "../../modules/core/Render/D3Renderer";

function Explorer() {
  const { t } = useTranslation();
  const [links, setLinks] = useState<Link[]>([]);
  const canvasRef = useRef<D3CanvasRef>(null);

  // test
  const n = new Node();
  n.id = "n1";
  n.moveTo(150, 120);
  n.radius = 32;
  n.setStatus("target");
  n.description = "我是圓形";

  const n2 = new Node();
  n2.id = "n2";
  n2.moveTo(300, 140);
  n2.radius = 32;
  n2.setStatus("target");
  n2.description = "我是圓形2";

  const b = new Box();
  b.id = "b1";
  b.moveTo(360, 220);
  b.width = 50;
  b.height = 50;
  b.setStatus("prepare");
  b.description = "我是矩形";

  // 建立 LinkManager 並連線
  const elements = [n, n2, b];
  const manager = new LinkManager(elements);

  const triggerLink = useCallback(async () => {
    const svgEl = canvasRef.current?.getSVGElement();
    if (!svgEl) return;
    
    await animateConnect(svgEl, elements, manager, "n1", "n2", 800);
    setLinks(manager.links);
  }, [elements, manager]);

  const clearLink = useCallback(() => {
    setLinks([]);
  }, []);

  return (
    <div className={styles.explorer}>
      <div className="container">
        <h1 className="section-title">{t('explorer')}</h1>
        <div className={styles.content}>
          <p>{t('explorerComingSoon')}</p>
        </div>
        <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
          <button onClick={triggerLink}>{t('connect') || 'Connect n1->n2'}</button>
          <button onClick={clearLink}>{t('clear') || 'Clear'}</button>
        </div>
        <D3Canvas ref={canvasRef} elements={elements} links={links} width={1000} height={800} />
      </div>
    </div>
  );
}

export default Explorer;