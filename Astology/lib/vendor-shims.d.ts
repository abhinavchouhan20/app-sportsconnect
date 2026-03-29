declare module "luxon" {
  export class DateTime {
    static fromISO(value: string, options?: { zone?: string }): DateTime;
    static fromObject(
      value: {
        year: number;
        month: number;
        day: number;
        hour?: number;
        minute?: number;
        second?: number;
      },
      options?: { zone?: string }
    ): DateTime;
    static now(): DateTime;
    static utc(): DateTime;
    readonly isValid: boolean;
    readonly zoneName: string;
    readonly year: number;
    readonly month: number;
    readonly day: number;
    readonly hour: number;
    readonly minute: number;
    readonly second: number;
    readonly millisecond: number;
    readonly weekday: number;
    readonly zone: unknown;
    toUTC(): DateTime;
    setZone(zone: string | unknown): DateTime;
    startOf(unit: string): DateTime;
    endOf(unit: string): DateTime;
    plus(duration: { days?: number; months?: number; hours?: number; minutes?: number; milliseconds?: number }): DateTime;
    minus(duration: { days?: number; months?: number; hours?: number; minutes?: number; milliseconds?: number }): DateTime;
    toFormat(format: string): string;
    toISO(): string | null;
    toISODate(): string | null;
    toMillis(): number;
    valueOf(): number;
  }

  export class IANAZone {
    static isValidZone(zone: string): boolean;
  }
}

declare module "tz-lookup" {
  export default function tzLookup(latitude: number, longitude: number): string;
}
