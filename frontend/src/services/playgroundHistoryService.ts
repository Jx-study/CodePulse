import apiService from "@/api/api";
import type { PlaygroundHistoryRecord } from "@/types/playgroundHistory";

export async function listHistory(): Promise<PlaygroundHistoryRecord[]> {
  const res = await apiService.get<PlaygroundHistoryRecord[]>("/api/explore/history");
  return res.data;
}

export async function deleteHistory(id: number): Promise<void> {
  await apiService.delete(`/api/explore/history/${id}`);
}
