import React, { useState } from "react";
import Button from "../../../../shared/components/Button/Button";
import styles from "./DataActionBar.module.scss";

export interface DataActionBarProps {
  onAddNode: (value: number) => void;
  onDeleteNode: (value: number) => void;
}

export const DataActionBar: React.FC<DataActionBarProps> = ({
  onAddNode,
  onDeleteNode,
}) => {
  const [inputValue, setInputValue] = useState<string>("");

  const handleAdd = () => {
    const val = Number(inputValue);
    if (!isNaN(val)) {
      onAddNode(val);
      setInputValue("");
    }
  };

  const handleDelete = () => {
    const val = Number(inputValue);
    if (!isNaN(val)) {
      onDeleteNode(val);
      setInputValue("");
    }
  };

  return (
    <div
      className={styles.actionGroup}
      style={{
        marginBottom: "1rem",
        display: "flex",
        gap: "8px",
        padding: "20px",
        background: "#333",
        borderRadius: "8px",
        border: "1px solid #555",
      }}
    >
      <input
        type="number"
        placeholder="輸入數值"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className={styles.input}
      />
      <Button size="sm" onClick={handleAdd}>
        Add Node
      </Button>
      <Button variant="ghost" size="sm" onClick={handleDelete}>
        Delete Node
      </Button>
    </div>
  );
};

export default DataActionBar;
