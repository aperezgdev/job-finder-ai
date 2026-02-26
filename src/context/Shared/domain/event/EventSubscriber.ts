import type { Event, EventClass } from "./Event";

export interface EventSubscriber<T extends Event> {
	subscribedTo(): Array<EventClass>;
	on(event: T): Promise<void>;
}
