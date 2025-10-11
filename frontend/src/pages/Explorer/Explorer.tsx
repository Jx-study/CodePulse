import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Explorer.module.scss';
import { D3Canvas } from "../../modules/core/Render/D3Canvas";
import { Node } from "../../modules/core/DataLogic/Node";
import { Box } from "../../modules/core/DataLogic/Box";

function Explorer() {
  const { t } = useTranslation();

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

  // n.addLink(n2);

  const b = new Box();
  b.id = "b1";
  b.moveTo(360, 220);
  b.width = 50;
  b.height = 50;
  b.setStatus("prepare");
  b.description = "我是矩形";
  return (
    <div className={styles.explorer}>
      <div className="container">
        <h1 className="section-title">{t('explorer')}</h1>
        <div className={styles.content}>
          <p>{t('explorerComingSoon')}</p>
        </div>
        {/* test */}
        <D3Canvas elements={[n, n2, b]} width={1000} height={800} />;
      </div>
    </div>
  );
}

export default Explorer;