import { ValidationError } from "../../Shared/domain/ValidationError";
import { NumberValueObject } from "../../Shared/domain/value-object/NumberValueObject";

export class JobScoredRating extends NumberValueObject {
  constructor(value: number) {
    super(value);
    this.ensureIsValidRating(value);
  }

  private ensureIsValidRating(value: number): void {
    if (value < 0 || value > 5) {
      throw new ValidationError("Rating must be between 0 and 5");
    }
    if(value > 0 && value % 0.5 !== 0) {
      throw new ValidationError("Rating must be in increments of 0.5");
    }
  }
}