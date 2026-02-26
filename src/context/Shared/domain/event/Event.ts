import { Uuid } from "../value-object/Uuid"

export abstract class Event {
	static EVENT_NAME: string

	readonly eventId: string
	readonly occurredOn: Date
	readonly eventName: string

	constructor(params: {
		eventName: string
		eventId?: string
		occurredOn?: Date
	}) {
		const { eventName, eventId, occurredOn } = params
		this.eventId = eventId || Uuid.random().value
		this.occurredOn = occurredOn || new Date()
		this.eventName = eventName
	}
}

export type EventClass = {
	EVENT_NAME: string
}