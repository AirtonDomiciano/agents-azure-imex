import { AzureClient } from "./azure-client.js";

export type PullRequestSummary = {
  id: number;
  title: string;
  status: string;
  repositoryName: string;
  createdBy?: string;
};

type PullRequestsResponse = {
  value: Array<{
    pullRequestId: number;
    title: string;
    status: string;
    repository?: {
      name?: string;
    };
    createdBy?: {
      displayName?: string;
      uniqueName?: string;
    };
  }>;
};

export class PullRequestsService {
  constructor(private readonly azureClient: AzureClient) {}

  async listActivePullRequests(): Promise<PullRequestSummary[]> {
    const response = await this.azureClient.request<PullRequestsResponse>(
      "/_apis/git/pullrequests?searchCriteria.status=active&api-version=7.1"
    );

    return response.value.map((pullRequest) => ({
      id: pullRequest.pullRequestId,
      title: pullRequest.title,
      status: pullRequest.status,
      repositoryName: pullRequest.repository?.name ?? "Repositório não identificado",
      createdBy:
        pullRequest.createdBy?.uniqueName ?? pullRequest.createdBy?.displayName
    }));
  }
}
