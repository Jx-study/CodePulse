import React from 'react';
import styles from './Slider.module.scss';

export interface SliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  showValue?: boolean;
  formatValue?: (value: number) => string;  // 數值格式化函數（預設顯示 1 位小數）
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

function Slider({
  min,
  max,
  step,
  value,
  onChange,
  showValue = false,
  formatValue = (v) => v.toFixed(1),
  disabled = false,
  className = '',
  ariaLabel = 'Slider',
}: SliderProps) {
  // 計算進度百分比（用於進度條填充效果）
  const progress = ((value - min) / (max - min)) * 100;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
  };

  return (
    <div className={`${styles.sliderContainer} ${className}`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={styles.slider}
        style={
          {
            '--slider-progress': `${progress}%`,
          } as React.CSSProperties
        }
        aria-label={ariaLabel}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
      />
      {showValue && (
        <span className={styles.valueDisplay}>{formatValue(value)}</span>
      )}
    </div>
  );
}

export default Slider;
