import type { WorkItem } from "../azure/work-items.service.js";

export type StatusGroup = {
  status: string;
  items: WorkItem[];
};

export function groupWorkItemsByStatus(
  workItems: WorkItem[],
  statuses: string[]
): StatusGroup[] {
  return statuses.map((status) => ({
    status,
    items: workItems.filter((workItem) => workItem.state === status)
  }));
}
