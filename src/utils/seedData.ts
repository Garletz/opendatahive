import { Octo } from '@/types';

export const seedData: Omit<Octo, 'id'>[] = [
  {
    title: "European Air Quality Data",
    description: "Real-time air quality data from major European cities",
    tags: ["environment", "air-quality", "europe"],
    link: "https://api.eea.europa.eu/air-quality",
    access: "REST",
    format: "JSON",
    addedAt: new Date().toISOString(),
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    title: "Public Health Statistics",
    description: "Public health indicators data from France",
    tags: ["health", "statistics", "france"],
    link: "https://api.sante.gouv.fr/stats",
    access: "REST",
    format: "JSON",
    addedAt: new Date().toISOString(),
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    title: "Public Transport Data",
    description: "Schedules and information about public transportation",
    tags: ["transport", "mobility", "schedules"],
    link: "https://api.transport.gouv.fr",
    access: "GraphQL",
    format: "JSON",
    addedAt: new Date().toISOString(),
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    title: "Economic Indicators",
    description: "Data on key economic indicators",
    tags: ["economy", "statistics", "indicators"],
    link: "https://api.economie.gouv.fr/indicateurs",
    access: "REST",
    format: "CSV",
    addedAt: new Date().toISOString(),
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    title: "Weather Data",
    description: "Historical weather data and forecasts",
    tags: ["weather", "climate", "forecasts"],
    link: "https://api.meteo.fr",
    access: "REST",
    format: "JSON",
    addedAt: new Date().toISOString(),
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]; 