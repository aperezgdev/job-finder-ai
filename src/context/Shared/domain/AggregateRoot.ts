import type { Event } from "./event/Event"

export abstract class AggregateRoot {
	private domainEvents: Array<Event>

	constructor() {
		this.domainEvents = []
	}

	pullDomainEvents(): Array<Event> {
		const domainEvents = this.domainEvents.slice()
		this.domainEvents = []

		return domainEvents
	}

	record(event: Event): void {
		this.domainEvents.push(event)
	}

	abstract toPrimitives(): unknown
}