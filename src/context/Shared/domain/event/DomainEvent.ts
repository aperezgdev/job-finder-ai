import { Event } from "./Event";

export abstract class DomainEvent extends Event {
  readonly aggregateId: string

  constructor(params: {
    aggregateId: string
    eventName: string
    eventId?: string
    occurredOn?: Date
  }) {
    const { aggregateId, ...eventParams } = params
    super(eventParams)
    this.aggregateId = params.aggregateId
  }
}