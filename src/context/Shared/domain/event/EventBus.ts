import type { Event } from "./Event";
import type { EventSubscriber } from "./EventSubscriber";

export interface EventBus {
	publish(events: Array<Event>): Promise<void>;
	addSuscriber(suscribers: EventSubscriber<Event>[]): void;
}
