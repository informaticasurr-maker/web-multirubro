import fs from 'fs';

const rawData = JSON.parse(fs.readFileSync('scripts/firebase_dump.json', 'utf8'));

const {
  config,
  barbers,
  services,
  stories,
  gallery,
  reviews,
  appointments,
  promos
} = rawData;

const tsCode = `import { Barber, ServiceItem, Appointment, StoryItem, GalleryItem, ReviewItem, BarberShopConfig, PushPromo } from '../types';

export const INITIAL_CONFIG: BarberShopConfig = ${JSON.stringify(config, null, 2)};

export const INITIAL_BARBERS: Barber[] = ${JSON.stringify(barbers, null, 2)};

export const INITIAL_SERVICES: ServiceItem[] = ${JSON.stringify(services, null, 2)};

export const INITIAL_STORIES: StoryItem[] = ${JSON.stringify(stories, null, 2)};

export const INITIAL_GALLERY: GalleryItem[] = ${JSON.stringify(gallery, null, 2)};

export const INITIAL_REVIEWS: ReviewItem[] = ${JSON.stringify(reviews, null, 2)};

export const INITIAL_APPOINTMENTS: Appointment[] = ${JSON.stringify(appointments, null, 2)};

export const INITIAL_PROMOS: PushPromo[] = ${JSON.stringify(promos, null, 2)};
`;

fs.writeFileSync('src/data/initialData.ts', tsCode, 'utf8');
console.log('Successfully written real Firebase data to src/data/initialData.ts');
