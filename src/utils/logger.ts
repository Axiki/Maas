import type { ApiResponse } from '../types';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  timestamp: string;
  incidentId?: string;
  metadata?: Record<string, unknown>;
}

export type LogListener = (entry: LogEntry) => void;

const generateId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeValue = (value: unknown): unknown => {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  return value;
};

const sanitizeMetadata = (metadata?: Record<string, unknown>) => {
  if (!metadata) return undefined;

  const entries = Object.entries(metadata)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => [key, normalizeValue(value)] as const);

  return entries.length ? Object.fromEntries(entries) : undefined;
};

class IncidentLogger {
  private listeners = new Set<LogListener>();

  private history: LogEntry[] = [];

  private incidentContext?: string;

  private fallbackIncidentId?: string;

  private emit(entry: LogEntry) {
    if (this.history.length >= 100) {
      this.history.shift();
    }

    this.history.push(entry);
    this.listeners.forEach((listener) => listener(entry));
    this.writeToConsole(entry);
  }

  private writeToConsole(entry: LogEntry) {
    const prefix = `[MAS][${entry.level.toUpperCase()}][${entry.timestamp}]`;
    const incidentSuffix = entry.incidentId ? ` [${entry.incidentId}]` : '';
    const message = `${prefix}${incidentSuffix} ${entry.message}`;

    const payload = entry.metadata;

    switch (entry.level) {
      case 'error':
        payload ? console.error(message, payload) : console.error(message);
        break;
      case 'warn':
        payload ? console.warn(message, payload) : console.warn(message);
        break;
      case 'debug':
        payload ? console.debug(message, payload) : console.debug(message);
        break;
      default:
        payload ? console.info(message, payload) : console.info(message);
        break;
    }
  }

  private resolveIncidentId(metadataIncidentId?: unknown) {
    if (typeof metadataIncidentId === 'string' && metadataIncidentId.trim().length > 0) {
      this.attachIncidentId(metadataIncidentId);
      return metadataIncidentId;
    }

    return this.incidentContext ?? this.fallbackIncidentId;
  }

  attachIncidentId(incidentId?: string) {
    if (!incidentId) {
      return;
    }

    this.incidentContext = incidentId;
    this.fallbackIncidentId = incidentId;
  }

  clearIncidentContext() {
    this.incidentContext = undefined;
  }

  withIncident<T>(incidentId: string | undefined, callback: () => T): T {
    const previous = this.incidentContext;
    if (incidentId) {
      this.attachIncidentId(incidentId);
    }

    try {
      return callback();
    } finally {
      this.incidentContext = previous;
    }
  }

  getHistory() {
    return [...this.history];
  }

  subscribe(listener: LogListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  log(level: LogLevel, message: string, metadata?: Record<string, unknown>) {
    const resolvedIncidentId = this.resolveIncidentId(metadata?.incidentId);

    const entry: LogEntry = {
      id: generateId(),
      level,
      message,
      timestamp: new Date().toISOString(),
      incidentId: resolvedIncidentId,
      metadata: sanitizeMetadata({ ...metadata, incidentId: resolvedIncidentId }),
    };

    this.emit(entry);
    return entry;
  }

  debug(message: string, metadata?: Record<string, unknown>) {
    return this.log('debug', message, metadata);
  }

  info(message: string, metadata?: Record<string, unknown>) {
    return this.log('info', message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>) {
    return this.log('warn', message, metadata);
  }

  error(message: string, metadata?: Record<string, unknown>) {
    return this.log('error', message, metadata);
  }

  logApiResponse<T>(response: ApiResponse<T>, message: string, metadata?: Record<string, unknown>) {
    const incidentContext = response.incidentId ?? response.meta?.fallbackIncidentId;

    if (incidentContext) {
      this.attachIncidentId(incidentContext);
    }

    const mergedMetadata: Record<string, unknown> = {
      ...metadata,
      incidentId: incidentContext,
    };

    if (response.meta?.correlationId) {
      mergedMetadata.correlationId = response.meta.correlationId;
    }

    const additionalMeta = { ...response.meta };
    if (additionalMeta) {
      delete additionalMeta.correlationId;
      if (Object.keys(additionalMeta).length > 0) {
        mergedMetadata.meta = additionalMeta;
      }
    }

    this.info(message, mergedMetadata);

    return response.data;
  }
}

export const logger = new IncidentLogger();

export { IncidentLogger };
