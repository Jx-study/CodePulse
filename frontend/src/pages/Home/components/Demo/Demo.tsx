import styles from './Demo.module.scss';

const PYTHON_CODE = `def bubble_sort(collection):
    total_items = len(collection)

    for round in range(total_items - 1):
        has_swapped = False
        unsorted_range = total_items - 1 - round

        for index in range(unsorted_range):
            if collection[index] > collection[index + 1]:
                collection[index], collection[index + 1] = collection[index + 1], collection[index]
                has_swapped = True

        if not has_swapped:
            break

    return collection`;

const CODE_LINES = PYTHON_CODE.split('\n');

function Demo() {
  return (
    <section className={styles.demo} id="demo">
      <div className='container'>
        <div className={styles.demoPreview}>

          {/* Mac-style code window */}
          <div className={styles.macWindow}>
            <div className={styles.macChrome}>
              <div className={styles.trafficLights}>
                <span className={styles.tlRed} />
                <span className={styles.tlYellow} />
                <span className={styles.tlGreen} />
              </div>
              <span className={styles.windowTitle}>bubble_sort.py</span>
            </div>
            <div className={styles.codeBody}>
              {CODE_LINES.map((line, idx) => (
                <div key={idx} className={styles.codeLine}>
                  <span className={styles.lineNumber}>{idx + 1}</span>
                  <span className={styles.lineText}>{line || ' '}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Placeholder analysis box */}
          <div className={styles.analysisBox}>
            <strong>💡 分析：</strong> 準備開始...
          </div>

        </div>
      </div>
    </section>
  );
}

export default Demo;
