import type { AzureConfig } from "../config/env.js";
import { AzureClient } from "./azure-client.js";

export type WorkItem = {
  id: number;
  title: string;
  state: string;
  type: string;
  assignedTo?: string;
  url?: string;
};

type WiqlResponse = {
  workItems: Array<{
    id: number;
    url: string;
  }>;
};

type WorkItemsResponse = {
  value: AzureWorkItem[];
};

type AzureIdentityField =
  | string
  | {
      displayName?: string;
      uniqueName?: string;
      mailAddress?: string;
    };

type AzureWorkItem = {
  id: number;
  url?: string;
  fields: {
    "System.Title"?: string;
    "System.State"?: string;
    "System.WorkItemType"?: string;
    "System.AssignedTo"?: AzureIdentityField;
  };
};

const WORK_ITEM_FIELDS = [
  "System.Id",
  "System.Title",
  "System.State",
  "System.WorkItemType",
  "System.AssignedTo"
].join(",");

export class WorkItemsService {
  constructor(
    private readonly azureClient: AzureClient,
    private readonly config: AzureConfig
  ) {}

  async listCardsRelatedToUser(): Promise<WorkItem[]> {
    const ids = await this.findWorkItemIdsAssignedToUser();

    if (ids.length === 0) {
      return [];
    }

    return this.getWorkItems(ids);
  }

  private async findWorkItemIdsAssignedToUser(): Promise<number[]> {
    const query = `
      SELECT [System.Id]
      FROM WorkItems
      WHERE
        [System.TeamProject] = @project
        AND [System.AssignedTo] = '${escapeWiqlString(this.config.userEmail)}'
        AND [System.State] IN (${this.config.flowStatuses
          .map((status) => `'${escapeWiqlString(status)}'`)
          .join(", ")})
      ORDER BY [System.ChangedDate] DESC
    `;

    const response = await this.azureClient.request<WiqlResponse>(
      "/_apis/wit/wiql?api-version=7.1",
      {
        method: "POST",
        body: JSON.stringify({ query })
      }
    );

    return response.workItems.map((workItem) => workItem.id);
  }

  private async getWorkItems(ids: number[]): Promise<WorkItem[]> {
    const workItems: WorkItem[] = [];

    for (const idsChunk of chunk(ids, 200)) {
      workItems.push(...(await this.getWorkItemsChunk(idsChunk)));
    }

    return workItems;
  }

  private async getWorkItemsChunk(ids: number[]): Promise<WorkItem[]> {
    const searchParams = new URLSearchParams({
      ids: ids.join(","),
      fields: WORK_ITEM_FIELDS,
      "api-version": "7.1"
    });

    const response = await this.azureClient.request<WorkItemsResponse>(
      `/_apis/wit/workitems?${searchParams.toString()}`
    );

    return response.value.map(toWorkItem);
  }
}

function chunk<TItem>(items: TItem[], size: number): TItem[][] {
  const chunks: TItem[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function toWorkItem(workItem: AzureWorkItem): WorkItem {
  return {
    id: workItem.id,
    title: workItem.fields["System.Title"] ?? "Sem título",
    state: workItem.fields["System.State"] ?? "Sem status",
    type: workItem.fields["System.WorkItemType"] ?? "Work Item",
    assignedTo: formatAssignedTo(workItem.fields["System.AssignedTo"]),
    url: workItem.url
  };
}

function formatAssignedTo(value: AzureIdentityField | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  if (typeof value === "string") {
    return value;
  }

  return value.mailAddress ?? value.uniqueName ?? value.displayName;
}

function escapeWiqlString(value: string): string {
  return value.replaceAll("'", "''");
}
