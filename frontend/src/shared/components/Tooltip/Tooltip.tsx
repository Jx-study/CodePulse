import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { TooltipProps } from '@/types';
import styles from './Tooltip.module.scss';

const Tooltip: React.FC<TooltipProps> = ({
  content,
  placement = 'top',
  trigger = 'hover',
  delay = 200,
  disabled = false,
  children,
  className = '',
  tooltipClassName = '',
  'aria-label': ariaLabel
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);

  const showTooltip = () => {
    if (disabled) return;

    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, delay);
    } else {
      setIsVisible(true);
    }
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const gap = 8;

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - gap;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + gap;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - gap;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + gap;
        break;
    }

    // Boundary checks
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < gap) left = gap;
    if (left + tooltipRect.width > viewportWidth - gap) {
      left = viewportWidth - tooltipRect.width - gap;
    }
    if (top < gap) top = gap;
    if (top + tooltipRect.height > viewportHeight - gap) {
      top = viewportHeight - tooltipRect.height - gap;
    }

    setPosition({ top, left });
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();

      const handleScroll = () => updatePosition();
      const handleResize = () => updatePosition();

      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isVisible]);

  const handleMouseEnter = () => {
    if (trigger === 'hover') showTooltip();
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') hideTooltip();
  };

  const handleClick = () => {
    if (trigger === 'click') {
      if (isVisible) {
        hideTooltip();
      } else {
        showTooltip();
      }
    }
  };

  const handleFocus = () => {
    if (trigger === 'focus') showTooltip();
  };

  const handleBlur = () => {
    if (trigger === 'focus') hideTooltip();
  };

  const tooltipClasses = [
    styles.tooltip,
    styles[placement],
    isVisible && styles.visible,
    tooltipClassName
  ].filter(Boolean).join(' ');

  // Merge refs properly
  const mergeRefs = useCallback((node: HTMLElement | null) => {
    triggerRef.current = node;

    const childRef = (children as any).ref;
    if (typeof childRef === 'function') {
      childRef(node);
    } else if (childRef) {
      childRef.current = node;
    }
  }, [children]);

  // Get child props safely
  const childProps = children.props as any;

  const clonedChild = React.cloneElement(children, {
    ref: mergeRefs,
    onMouseEnter: (e: React.MouseEvent) => {
      handleMouseEnter();
      childProps.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      handleMouseLeave();
      childProps.onMouseLeave?.(e);
    },
    onClick: (e: React.MouseEvent) => {
      handleClick();
      childProps.onClick?.(e);
    },
    onFocus: (e: React.FocusEvent) => {
      handleFocus();
      childProps.onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent) => {
      handleBlur();
      childProps.onBlur?.(e);
    },
    'aria-describedby': isVisible ? 'tooltip' : undefined,
    className: [childProps.className, className].filter(Boolean).join(' ')
  } as any);

  const tooltipPortal = isVisible && createPortal(
    <div
      ref={tooltipRef}
      className={tooltipClasses}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`
      }}
      role="tooltip"
      id="tooltip"
      aria-label={ariaLabel}
    >
      {content}
      <div className={styles.arrow} />
    </div>,
    document.body
  );

  return (
    <>
      {clonedChild}
      {tooltipPortal}
    </>
  );
};

export default React.memo(Tooltip);
