import { useMemo } from "react";
import { getImplementation } from "@/data/implementations";
import {
  buildStatusColorMap,
  DEFAULT_STATUS_CONFIG,
} from "@/types/statusConfig";

export function useStatusConfig(implementationKey: string | null) {
  return useMemo(() => {
    const config = implementationKey
      ? (getImplementation(implementationKey)?.statusConfig ??
        DEFAULT_STATUS_CONFIG)
      : DEFAULT_STATUS_CONFIG;
    return {
      statusConfig: config,
      statusColorMap: buildStatusColorMap(config),
    };
  }, [implementationKey]);
}
