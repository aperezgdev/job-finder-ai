import { ValidationError } from "./ValidationError";
import { EnumValueObject } from "./value-object/EnumValueObject";

export enum JobProviderEnum {
  LINKEDIN = "linkedin",
  INFOJOBS = "infojobs",
}
export class JobProvider extends EnumValueObject<JobProviderEnum> {
  constructor(value: string) {
    super(value as JobProviderEnum, Object.values(JobProviderEnum));
  }

  protected invalidValue(value: JobProviderEnum): void {
    throw new ValidationError(`Invalid job provider: ${value}`);
  }
}