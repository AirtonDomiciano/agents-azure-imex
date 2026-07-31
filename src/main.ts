import { AzureClient } from "./azure/azure-client.js";
import { WorkItemsService } from "./azure/work-items.service.js";
import { loadConfig } from "./config/env.js";
import { MonitorService } from "./monitoring/monitor.service.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const azureClient = new AzureClient(config);
  const workItemsService = new WorkItemsService(azureClient, config);
  const monitorService = new MonitorService(workItemsService, config.flowStatuses);
  const report = await monitorService.generateReport();

  console.log(monitorService.renderReport(report));
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);

  console.error("Erro ao executar o Azure IMEX Monitor");
  console.error(message);
  process.exitCode = 1;
});
