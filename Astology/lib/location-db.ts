export type BirthplacePreset = {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  aliases: string[];
};

export const birthplacePresets: BirthplacePreset[] = [
  { city: "Mumbai", country: "India", latitude: 19.076, longitude: 72.8777, timezone: "Asia/Kolkata", aliases: ["mumbai", "bombay"] },
  { city: "Delhi", country: "India", latitude: 28.6139, longitude: 77.209, timezone: "Asia/Kolkata", aliases: ["delhi", "new delhi"] },
  { city: "Bengaluru", country: "India", latitude: 12.9716, longitude: 77.5946, timezone: "Asia/Kolkata", aliases: ["bengaluru", "bangalore"] },
  { city: "Chennai", country: "India", latitude: 13.0827, longitude: 80.2707, timezone: "Asia/Kolkata", aliases: ["chennai", "madras"] },
  { city: "Kolkata", country: "India", latitude: 22.5726, longitude: 88.3639, timezone: "Asia/Kolkata", aliases: ["kolkata", "calcutta"] },
  { city: "Hyderabad", country: "India", latitude: 17.385, longitude: 78.4867, timezone: "Asia/Kolkata", aliases: ["hyderabad"] },
  { city: "Pune", country: "India", latitude: 18.5204, longitude: 73.8567, timezone: "Asia/Kolkata", aliases: ["pune"] },
  { city: "Ahmedabad", country: "India", latitude: 23.0225, longitude: 72.5714, timezone: "Asia/Kolkata", aliases: ["ahmedabad"] },
  { city: "Jaipur", country: "India", latitude: 26.9124, longitude: 75.7873, timezone: "Asia/Kolkata", aliases: ["jaipur"] },
  { city: "Lucknow", country: "India", latitude: 26.8467, longitude: 80.9462, timezone: "Asia/Kolkata", aliases: ["lucknow"] },
  { city: "Dubai", country: "UAE", latitude: 25.2048, longitude: 55.2708, timezone: "Asia/Dubai", aliases: ["dubai"] },
  { city: "Abu Dhabi", country: "UAE", latitude: 24.4539, longitude: 54.3773, timezone: "Asia/Dubai", aliases: ["abu dhabi"] },
  { city: "Doha", country: "Qatar", latitude: 25.2854, longitude: 51.531, timezone: "Asia/Qatar", aliases: ["doha"] },
  { city: "London", country: "UK", latitude: 51.5072, longitude: -0.1276, timezone: "Europe/London", aliases: ["london"] },
  { city: "Rome", country: "Italy", latitude: 41.9028, longitude: 12.4964, timezone: "Europe/Rome", aliases: ["rome", "roma"] },
  { city: "Paris", country: "France", latitude: 48.8566, longitude: 2.3522, timezone: "Europe/Paris", aliases: ["paris"] },
  { city: "Berlin", country: "Germany", latitude: 52.52, longitude: 13.405, timezone: "Europe/Berlin", aliases: ["berlin"] },
  { city: "New York", country: "USA", latitude: 40.7128, longitude: -74.006, timezone: "America/New_York", aliases: ["new york", "nyc"] },
  { city: "Los Angeles", country: "USA", latitude: 34.0522, longitude: -118.2437, timezone: "America/Los_Angeles", aliases: ["los angeles", "la"] },
  { city: "Toronto", country: "Canada", latitude: 43.6532, longitude: -79.3832, timezone: "America/Toronto", aliases: ["toronto"] },
  { city: "Singapore", country: "Singapore", latitude: 1.3521, longitude: 103.8198, timezone: "Asia/Singapore", aliases: ["singapore"] },
  { city: "Sydney", country: "Australia", latitude: -33.8688, longitude: 151.2093, timezone: "Australia/Sydney", aliases: ["sydney"] }
];

function normalizePlace(value: string) {
  return value.trim().toLowerCase().replace(/[^\w\s,.-]/g, "");
}

export function findBirthplacePreset(place: string) {
  const normalized = normalizePlace(place);
  return birthplacePresets.find((preset) =>
    preset.aliases.some((alias) => normalized === alias || normalized.startsWith(`${alias},`) || normalized.includes(alias))
  );
}
