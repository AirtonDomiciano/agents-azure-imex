import type { AzureConfig } from "../config/env.js";

export class AzureClient {
  private readonly baseUrl: string;
  private readonly authorization: string;

  constructor(config: AzureConfig) {
    this.baseUrl = `https://dev.azure.com/${encodeURIComponent(
      config.organization
    )}/${encodeURIComponent(config.project)}/`;
    this.authorization = `Basic ${Buffer.from(`:${config.pat}`).toString("base64")}`;
  }

  async request<TResponse>(
    path: string,
    options: RequestInit = {}
  ): Promise<TResponse> {
    const url = new URL(path.replace(/^\/+/, ""), this.baseUrl);
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: this.authorization,
        Accept: "application/json",
        "Content-Type": "application/json",
        ...options.headers
      }
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Azure DevOps respondeu ${response.status} ${response.statusText}: ${body}`
      );
    }

    return (await response.json()) as TResponse;
  }
}
