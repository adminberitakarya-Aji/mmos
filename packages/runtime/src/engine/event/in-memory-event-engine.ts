/**
 * MMOS InMemoryEventEngine - EventEmitter-Based Event Implementation
 * Per ADR-014: Event-Driven Architecture
 */

import type { Uoid } from '@mmos/sdk';
import {
  type EventEngine,
  type EventEnvelope,
  type EventPublishResult,
  type EventSubscribeParams,
  type EventSubscription,
  type EventHistoryParams,
  type EventHistoryResult,
  type EventFilter,
  type EventHandler,
  type EngineHealth,
} from '@mmos/sdk';

export interface InMemoryEventEngineOptions {
  readonly name?: string;
  readonly version?: string;
  readonly maxHistory?: number;
  readonly enableReplay?: boolean;
}

interface Subscription {
  id: string;
  types: string[];
  handler: EventHandler;
  filter: EventFilter | undefined;
}

/**
 * InMemoryEventEngine - Simple in-memory event store for development and testing
 */
export class InMemoryEventEngine implements EventEngine {
  readonly name: string;
  readonly version: string;

  private readonly subscribers: Map<string, Subscription> = new Map();
  private readonly eventHistory: EventEnvelope[] = [];
  private readonly maxHistory: number;
  private subscriptionCounter = 0;

  constructor(options: InMemoryEventEngineOptions = {}) {
    this.name = options.name ?? 'InMemoryEventEngine';
    this.version = options.version ?? '1.0.0';
    this.maxHistory = options.maxHistory ?? 10000;
  }

  async publish(event: EventEnvelope): Promise<EventPublishResult> {
    // Store in history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistory) {
      this.eventHistory.shift();
    }

    // Notify matching subscribers
    let notified = 0;
    for (const sub of this.subscribers.values()) {
      if (this.matchesEventType(event.type, sub.types)) {
        if (!sub.filter || this.matchesFilter(event, sub.filter)) {
          try {
            await Promise.resolve(sub.handler(event));
            notified++;
          } catch {
            // Log but don't fail the publish
          }
        }
      }
    }

    return { published: true, eventId: event.event.toString() };
  }

  subscribe(params: EventSubscribeParams): EventSubscription {
    const subscriptionId = `sub_${++this.subscriptionCounter}`;

    const subscription: Subscription = {
      id: subscriptionId,
      types: [...params.eventTypes],
      handler: params.handler,
      filter: params.filter,
    };

    this.subscribers.set(subscriptionId, subscription);

    return {
      id: subscriptionId,
      unsubscribe: async () => {
        this.subscribers.delete(subscriptionId);
      },
    };
  }

  async unsubscribe(subscriptionId: string): Promise<void> {
    this.subscribers.delete(subscriptionId);
  }

  async getHistory(params: EventHistoryParams): Promise<EventHistoryResult> {
    let events = [...this.eventHistory];

    // Filter by event types
    if (params.eventTypes && params.eventTypes.length > 0) {
      events = events.filter(event => 
        params.eventTypes!.some(type => this.matchesEventType(event.type, [type]))
      );
    }

    // Filter by date range
    if (params.from) {
      events = events.filter(event => event.timestamp >= params.from!);
    }
    if (params.to) {
      events = events.filter(event => event.timestamp <= params.to!);
    }

    // Apply filter
    if (params.filter) {
      events = events.filter(event => this.matchesFilter(event, params.filter!));
    }

    // Apply limit
    const limit = params.limit ?? 100;
    const total = events.length;
    events = events.slice(-limit);

    return { events, total };
  }

  async healthCheck(): Promise<EngineHealth> {
    return {
      healthy: true,
      details: {
        name: this.name,
        version: this.version,
        totalEvents: this.eventHistory.length,
        activeSubscribers: this.subscribers.size,
      },
    };
  }

  private matchesEventType(eventType: string, patterns: readonly string[]): boolean {
    return patterns.some(pattern => {
      const patternParts = pattern.split('.');
      const eventParts = eventType.split('.');

      for (let i = 0; i < patternParts.length && i < eventParts.length; i++) {
        if (patternParts[i] === '*') {
          return true;
        }
        if (patternParts[i] !== eventParts[i]) {
          return false;
        }
      }

      return patternParts.length === eventParts.length || patternParts[patternParts.length - 1] === '*';
    });
  }

  private matchesFilter(event: EventEnvelope, filter: EventFilter): boolean {
    if (filter.source && !event.source.equals(filter.source)) {
      return false;
    }
    if (filter.correlationId && event.correlationId && !event.correlationId.equals(filter.correlationId)) {
      return false;
    }
    if (filter.tags && filter.tags.length > 0) {
      if (!event.tags || !filter.tags.some(tag => event.tags!.includes(tag))) {
        return false;
      }
    }
    if (filter.custom && !filter.custom(event)) {
      return false;
    }
    return true;
  }

  /**
   * Clear all events and subscriptions (for testing)
   */
  clear(): void {
    this.eventHistory.length = 0;
    this.subscribers.clear();
  }
}