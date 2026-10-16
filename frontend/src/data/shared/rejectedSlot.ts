import { Box } from "@/modules/core/DataLogic/Box";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import {
  DEFAULT_STATUS_CONFIG,
  type StatusConfig,
} from "@/types/statusConfig";

export const REJECTED_STATUS = "rejected" as Status;
const REJECTED_COLOR = "#ef4444";

export const statusConfigWithRejected: StatusConfig = {
  ...DEFAULT_STATUS_CONFIG,
  statuses: [
    ...DEFAULT_STATUS_CONFIG.statuses,
    {
      key: REJECTED_STATUS,
      label: "statusLegend.rejected",
      color: REJECTED_COLOR,
    },
  ],
};

export function markRejected(box: Box): Box {
  box.setStatus(REJECTED_STATUS);
  return box;
}

interface GuardSlotOptions {
  id: string;
  index: number;
  startX: number;
  startY: number;
  gap: number;
  rejected: boolean;
  label?: string;
}

export function createGuardSlot({
  id,
  index,
  startX,
  startY,
  gap,
  rejected,
  label,
}: GuardSlotOptions): Box {
  const slot = new Box();
  slot.id = id;
  slot.value = label ?? (rejected ? "✕" : "?");
  slot.width = 60;
  slot.height = 60;
  slot.moveTo(startX + index * gap, startY);
  slot.description = String(index);
  slot.borderStyle = "dashed";
  if (rejected) {
    markRejected(slot);
  } else {
    slot.setStatus(Status.Inactive);
  }
  return slot;
}
