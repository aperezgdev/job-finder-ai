import { ValidationError } from "../../Shared/domain/ValidationError";
import { StringValueObject } from "../../Shared/domain/value-object/StringValueObject";

export class JobSearchPremise extends StringValueObject {
  constructor(value: string) {
    super(value);
    this.ensureIsValid(value);
  }
  
  private ensureIsValid(value: string): void {
    if (value.length === 0 || value.length > 255) {
      throw new ValidationError("Job search premise must be between 1 and 255 characters");
    }
  }
}