import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export type AzureConfig = {
  organization: string;
  project: string;
  userEmail: string;
  pat: string;
  flowStatuses: string[];
};

export function loadConfig(): AzureConfig {
  loadDotEnv();

  const flowStatuses =
    readOptionalEnv("AZURE_FLOW_STATUSES")
      ?.split(",")
      .map((status) => status.trim())
      .filter(Boolean) ?? defaultFlowStatuses();

  return {
    organization: readRequiredEnv("AZURE_ORGANIZATION"),
    project: readRequiredEnv("AZURE_PROJECT"),
    userEmail: readRequiredEnv("AZURE_USER_EMAIL"),
    pat: readRequiredEnv("AZURE_PAT"),
    flowStatuses
  };
}

function loadDotEnv(): void {
  const envPath = resolve(process.cwd(), ".env");

  if (!existsSync(envPath)) {
    return;
  }

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = stripQuotes(trimmed.slice(separatorIndex + 1).trim());

    process.env[key] ??= value;
  }
}

function stripQuotes(value: string): string {
  if (
    (value.startsWith("\"") && value.endsWith("\"")) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function readRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Variável obrigatória ausente: ${name}`);
  }

  return value;
}

function readOptionalEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function defaultFlowStatuses(): string[] {
  return [
    "Disponível para Dev",
    "Disponível para Revisão de Código",
    "Realizando Revisão de Código",
    "Testando",
    "Pronto para Release"
  ];
}
