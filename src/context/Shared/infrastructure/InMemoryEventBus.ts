import type { Event } from "../domain/event/Event";
import type { EventBus } from "../domain/event/EventBus";
import type { EventSubscriber } from "../domain/event/EventSubscriber";

export class InMemoryEventBus implements EventBus {
	private readonly suscribersByEventName = new Map<
		string,
		Set<EventSubscriber<Event>>
	>();

	async publish(events: Array<Event>): Promise<void> {
		for (const event of events) {
			const suscribers = this.suscribersByEventName.get(event.eventName);
			if (!suscribers) continue;

			const pending = Array.from(suscribers).map((suscriber) =>
				suscriber.on(event),
			);

			await Promise.all(pending);
		}
	}

	addSuscriber(suscribers: EventSubscriber<Event>[]): void {
		for (const suscriber of suscribers) {
			for (const eventClass of suscriber.subscribedTo()) {
				const eventName = eventClass.EVENT_NAME;
				const currentSuscribers =
					this.suscribersByEventName.get(eventName) ?? new Set();

				currentSuscribers.add(suscriber);
				this.suscribersByEventName.set(eventName, currentSuscribers);
			}
		}
	}
}
