import { ValidationError } from "../ValidationError";
import { StringValueObject } from "./StringValueObject";

export class LinkValueObject extends StringValueObject {
  constructor(value: string) {
    super(value);
    this.validateLink(value);
  }

  private validateLink(value: string): void {
    try {
      new URL(value);
    } catch (_) {
      throw new ValidationError(`Invalid URL: ${value}`);
    }
  }
}