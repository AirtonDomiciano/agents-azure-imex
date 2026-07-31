import type { WorkItem } from "../azure/work-items.service.js";
import { WorkItemsService } from "../azure/work-items.service.js";
import { groupWorkItemsByStatus, type StatusGroup } from "./status-rules.js";

export type MonitorReport = {
  generatedAt: Date;
  groups: StatusGroup[];
};

export class MonitorService {
  constructor(
    private readonly workItemsService: WorkItemsService,
    private readonly flowStatuses: string[]
  ) {}

  async generateReport(): Promise<MonitorReport> {
    const workItems = await this.workItemsService.listCardsRelatedToUser();

    return {
      generatedAt: new Date(),
      groups: groupWorkItemsByStatus(workItems, this.flowStatuses)
    };
  }

  renderReport(report: MonitorReport): string {
    const lines = ["Azure IMEX Monitor", ""];

    for (const group of report.groups) {
      lines.push(group.status);

      if (group.items.length === 0) {
        lines.push("- Nenhum item encontrado");
      } else {
        lines.push(...group.items.map(renderWorkItem));
      }

      lines.push("");
    }

    return lines.join("\n").trimEnd();
  }
}

function renderWorkItem(workItem: WorkItem): string {
  return `- ${formatType(workItem.type)} ${workItem.id} — ${workItem.title}`;
}

function formatType(type: string): string {
  if (type.toLowerCase() === "user story") {
    return "US";
  }

  return type;
}
