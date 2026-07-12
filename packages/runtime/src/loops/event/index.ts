/**
 * MMOS EventLoop - Public API
 * Per docs/reference/runtime/event-loop.md
 */

export { createEventLoop } from './event-loop.js';
export type { EventLoop, EventLoopOptions } from './event-loop.js';

export { createEventValidator, defaultSchemaValidator, defaultMetadataValidator } from './event-validator.js';
export type { EventValidator, ValidationResult, SchemaValidator } from './event-validator.js';

export { createEventQueue } from './event-queue.js';
export type { EventQueue } from './event-queue.js';

export { createEventSelector } from './event-selector.js';
export type { EventSelector } from './event-selector.js';

export { createEventDispatcher } from './event-dispatcher.js';
export type { EventDispatcher } from './event-dispatcher.js';

export { createSubscriberRegistry } from './subscriber-registry.js';
export type { SubscriberRegistry, SubscriberEntry, EventCategory } from './subscriber-registry.js';

export { createEventRetryPolicy, EventRetryPolicy } from './retry-policy.js';
export type { RetryPolicy, RetryDecision } from './retry-policy.js';

export { createDeadLetterQueue } from './dead-letter-queue.js';
export type { DeadLetterQueue, DLQEntry } from './dead-letter-queue.js';

export { createEventArchive } from './event-archiver.js';
export type { EventArchive } from './event-archiver.js';
