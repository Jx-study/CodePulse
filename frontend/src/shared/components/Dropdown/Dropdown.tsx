import React, { useState, useRef, useEffect } from "react";
import type { DropdownItem, DropdownProps } from "@/types";
import styles from "./Dropdown.module.scss";
import Icon from "../Icon";

const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  placement = "bottom-right",
  closeOnSelect = true,
  disabled = false,
  showChevron = false,
  className = "",
  menuClassName = "",
  triggerClassName = "",
  onSelect,
  "aria-label": ariaLabel,
  ...restProps
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const enabledItems = items.filter((item) => !item.disabled && !item.divider);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
      setFocusedIndex(-1);
    }
  };

  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled || item.divider) return;

    item.onClick?.();
    onSelect?.(item.key);

    if (closeOnSelect) {
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        break;

      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) => {
          const nextIndex = prev + 1;
          return nextIndex >= enabledItems.length ? 0 : nextIndex;
        });
        break;

      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => {
          const nextIndex = prev - 1;
          return nextIndex < 0 ? enabledItems.length - 1 : nextIndex;
        });
        break;

      case "Enter":
      case " ":
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < enabledItems.length) {
          handleItemClick(enabledItems[focusedIndex]);
        }
        break;

      case "Home":
        e.preventDefault();
        setFocusedIndex(0);
        break;

      case "End":
        e.preventDefault();
        setFocusedIndex(enabledItems.length - 1);
        break;

      default:
        break;
    }
  };

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && menuRef.current) {
      const itemElements = menuRef.current.querySelectorAll(
        '[role="menuitem"]:not([aria-disabled="true"])',
      );
      const focusedElement = itemElements[focusedIndex] as HTMLElement;
      focusedElement?.focus();
    }
  }, [isOpen, focusedIndex]);

  const containerClasses = [
    styles.dropdown,
    disabled && styles.disabled,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const menuClasses = [
    styles.menu,
    styles[placement],
    isOpen && styles.open,
    menuClassName,
  ]
    .filter(Boolean)
    .join(" ");

  const triggerClasses = [styles.trigger, triggerClassName]
    .filter(Boolean)
    .join(" ");

  let enabledItemIndex = -1;

  // 如果需要顯示 chevron，則將其新增至 trigger 內部
  const triggerWithChevron =
    showChevron && React.isValidElement(trigger)
      ? React.cloneElement(trigger as React.ReactElement<any>, {
          className:
            `${(trigger as any).props.className || ""} ${styles.triggerWithChevron}`.trim(),
          children: (
            <>
              {(trigger as any).props.children}
              <Icon
                name={isOpen ? "chevron-down" : "chevron-right"}
                size="sm"
                className={styles.chevronIcon}
              />
            </>
          ),
        })
      : trigger;

  return (
    <div
      ref={dropdownRef}
      className={containerClasses}
      onKeyDown={handleKeyDown}
      {...restProps}
    >
      <div
        className={triggerClasses}
        onClick={handleToggle}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        aria-disabled={disabled}
      >
        {triggerWithChevron}
      </div>

      {isOpen && (
        <div
          ref={menuRef}
          className={menuClasses}
          role="menu"
          aria-orientation="vertical"
        >
          {items.map((item, index) => {
            if (item.divider) {
              return (
                <div
                  key={item.key || `divider-${index}`}
                  className={styles.divider}
                />
              );
            }

            if (!item.disabled) {
              enabledItemIndex++;
            }

            const isFocused =
              !item.disabled && enabledItemIndex === focusedIndex;

            const itemClasses = [
              styles.item,
              item.disabled && styles.itemDisabled,
              isFocused && styles.itemFocused,
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <div
                key={item.key}
                className={itemClasses}
                role="menuitem"
                tabIndex={item.disabled ? -1 : 0}
                aria-disabled={item.disabled}
                onClick={() => handleItemClick(item)}
              >
                {item.icon && (
                  <span className={styles.itemIcon}>{item.icon}</span>
                )}
                <span className={styles.itemLabel}>{item.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default React.memo(Dropdown);
