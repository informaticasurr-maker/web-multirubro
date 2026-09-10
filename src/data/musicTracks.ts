import { InstrumentalTrack } from '../types';

export const INSTRUMENTAL_TRACKS: InstrumentalTrack[] = [
  // 1. REGGAETÓN INSTRUMENTAL (Ritmo urbano, dembow clásico para ambiente de barbería)
  {
    id: 'track-reggaeton-1',
    title: 'Dembow Barber Flow',
    artist: 'Barbería Urban Beats',
    genre: 'reggaeton',
    genreLabel: 'Reggaetón Instrumental',
    occasion: 'fade_urbano',
    occasionLabel: 'Ideal para Degradados & Fade',
    bpm: 95,
    durationSeconds: 160,
    vibeDescription: 'Bajo 808 envolvente, dembow sincopado tradicional y sintetizador nocturno.',
    proceduralStyle: 'reggaeton',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=urban-reggaeton-112194.mp3',
    coverImage: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300&auto=format&fit=crop'
  },
  {
    id: 'track-reggaeton-2',
    title: 'Perreo Lofi Chill',
    artist: 'Latin Cut Studio',
    genre: 'reggaeton',
    genreLabel: 'Reggaetón Instrumental',
    occasion: 'ambiente_salon',
    occasionLabel: 'Ambiente Diario de Salón',
    bpm: 92,
    durationSeconds: 145,
    vibeDescription: 'Beat de reggaetón con textura lofi cálida, perfecto para esperar o recortar barba.',
    proceduralStyle: 'reggaeton',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c36f56195c.mp3?filename=reggaeton-pop-103323.mp3',
    coverImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=300&auto=format&fit=crop'
  },
  {
    id: 'track-reggaeton-3',
    title: 'Medellín Golden Scissors',
    artist: 'Cali & Barber Instrumental',
    genre: 'reggaeton',
    genreLabel: 'Reggaetón Instrumental',
    occasion: 'fade_urbano',
    occasionLabel: 'Corte Moderno & Freestyle',
    bpm: 96,
    durationSeconds: 175,
    vibeDescription: 'Guitarras latinas acústicas combinadas con el clásico ritmo dembow caribeño.',
    proceduralStyle: 'reggaeton',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_497576a92a.mp3?filename=reggaeton-latin-urban-9599.mp3',
    coverImage: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=300&auto=format&fit=crop'
  },
  {
    id: 'track-reggaeton-4',
    title: 'San Juan Sunset Fade',
    artist: 'Isla Beats Lab',
    genre: 'reggaeton',
    genreLabel: 'Reggaetón Instrumental',
    occasion: 'general',
    occasionLabel: 'Tardes de Barbería',
    bpm: 94,
    durationSeconds: 155,
    vibeDescription: 'Ritmo suave de reggaetón melódico con marimbas sutiles y bajo profundo.',
    proceduralStyle: 'reggaeton',
    coverImage: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=300&auto=format&fit=crop'
  },

  // 2. HIP-HOP & URBAN TRAP INSTRUMENTAL (Boom Bap, Fade y Taper)
  {
    id: 'track-hiphop-1',
    title: 'High Fade Boom Bap',
    artist: 'Vintage Clipper Records',
    genre: 'hiphop',
    genreLabel: 'Hip-Hop Instrumental',
    occasion: 'corte_clasico',
    occasionLabel: 'Corte Clásico & Estilo New York',
    bpm: 88,
    durationSeconds: 168,
    vibeDescription: 'Cajas secas, bajo redondo acústico y teclados de jazz ideales para tijera y peine.',
    proceduralStyle: 'hiphop',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=lofi-study-112191.mp3',
    coverImage: 'https://images.unsplash.com/photo-1517832606589-7629c3397143?w=300&auto=format&fit=crop'
  },
  {
    id: 'track-hiphop-2',
    title: 'Midnight Taper Trap',
    artist: 'Street Barber Studio',
    genre: 'hiphop',
    genreLabel: 'Hip-Hop & Trap Instrumental',
    occasion: 'fade_urbano',
    occasionLabel: 'Degradados de Alta Precisión',
    bpm: 130,
    durationSeconds: 150,
    vibeDescription: 'Hi-hat rolls en triplete, 808 profundo y ambiente nocturno contemporáneo.',
    proceduralStyle: 'hiphop',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=trap-future-bass-111197.mp3',
    coverImage: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=300&auto=format&fit=crop'
  },
  {
    id: 'track-hiphop-3',
    title: 'Brooklyn Razor Lofi',
    artist: 'Crown Heights Beats',
    genre: 'hiphop',
    genreLabel: 'Hip-Hop Instrumental Lofi',
    occasion: 'ambiente_salon',
    occasionLabel: 'Esperas & Turnos Relajados',
    bpm: 86,
    durationSeconds: 140,
    vibeDescription: 'Batería con swing lofi, vinilo crepitante y sampleos de trompeta con sordina.',
    proceduralStyle: 'hiphop',
    coverImage: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300&auto=format&fit=crop'
  },

  // 3. LATIN LOUNGE & ACÚSTICO (Para ritual de barba, toalla caliente y calma)
  {
    id: 'track-latin-1',
    title: 'Havana Ritual & Navaja',
    artist: 'Tropic Barber Lounge',
    genre: 'latin',
    genreLabel: 'Latin Chill & Lounge',
    occasion: 'barba_relax',
    occasionLabel: 'Ritual de Barba & Toalla Caliente',
    bpm: 102,
    durationSeconds: 180,
    vibeDescription: 'Congas suaves, piano montuno caribeño relajante y bajo cálido.',
    proceduralStyle: 'latin',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f77c30.mp3?filename=bossa-in-my-heart-123472.mp3',
    coverImage: 'https://images.unsplash.com/photo-1512690459411-b9245aed614b?w=300&auto=format&fit=crop'
  },
  {
    id: 'track-latin-2',
    title: 'Playa & Acústica Barber',
    artist: 'Bahía Lounge Trio',
    genre: 'latin',
    genreLabel: 'Guitarra Latina Instrumental',
    occasion: 'barba_relax',
    occasionLabel: 'Afeitado Clásico & Spa Facial',
    bpm: 110,
    durationSeconds: 165,
    vibeDescription: 'Bossa nova instrumental con acordes de guitarra española y percusión sutil.',
    proceduralStyle: 'latin',
    coverImage: 'https://images.unsplash.com/photo-1532710093739-9470acff878f?w=300&auto=format&fit=crop'
  },

  // 4. AFROBEAT INSTRUMENTAL (Ritmo moderno, contagioso y bailable)
  {
    id: 'track-afrobeat-1',
    title: 'Lagos Barber Rhythm',
    artist: 'Nairobi Hair & Fade',
    genre: 'afrobeat',
    genreLabel: 'Afrobeat Instrumental',
    occasion: 'fade_urbano',
    occasionLabel: 'Energía de Barbería',
    bpm: 106,
    durationSeconds: 172,
    vibeDescription: 'Kalimba sincopada, guitarras entrelazadas y groove africano moderno irresistible.',
    proceduralStyle: 'afrobeat',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/26/audio_d0c6ff1e01.mp3?filename=african-safari-108745.mp3',
    coverImage: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=300&auto=format&fit=crop'
  },

  // 5. NEO-SOUL & JAZZ LOUNGE (Elegancia pura de barbería tradicional)
  {
    id: 'track-neosoul-1',
    title: 'Velvet Scissors Jazz',
    artist: 'Gentlemen Soul Collective',
    genre: 'neosoul',
    genreLabel: 'Neo-Soul & Jazz Lounge',
    occasion: 'corte_clasico',
    occasionLabel: 'Cortes Ejecutivos & Perfilado',
    bpm: 84,
    durationSeconds: 190,
    vibeDescription: 'Ricos acordes de piano Rhodes con séptimas y novenas, bajo fretless y escobillas.',
    proceduralStyle: 'neosoul',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_34433c2a13.mp3?filename=soul-interlude-7128.mp3',
    coverImage: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop'
  }
];

export const GENRE_FILTERS: { key: InstrumentalTrack['genre'] | 'todos'; label: string; icon: string }[] = [
  { key: 'todos', label: 'Todos (Aleatorio)', icon: 'Shuffle' },
  { key: 'reggaeton', label: 'Reggaetón Instrumental', icon: 'Flame' },
  { key: 'hiphop', label: 'Hip-Hop & Trap', icon: 'Disc' },
  { key: 'latin', label: 'Latin Chill & Bossa', icon: 'Guitar' },
  { key: 'afrobeat', label: 'Afrobeat', icon: 'Zap' },
  { key: 'neosoul', label: 'Neo-Soul Lounge', icon: 'Music' }
];

export const OCCASIONS_MAP: Record<string, { label: string; description: string }> = {
  fade_urbano: {
    label: 'Fade & Degradado Urbano',
    description: 'Ritmos con pegada rítmica para cortes modernos y delineados a navaja.'
  },
  corte_clasico: {
    label: 'Corte Clásico a Tijera',
    description: 'Música instrumental cadenciosa y elegante para máxima precisión de tijera y peine.'
  },
  barba_relax: {
    label: 'Ritual de Barba & Relax',
    description: 'Sonoridades acústicas y serenas para aplicar toallas calientes, aceites y afeitado.'
  },
  ambiente_salon: {
    label: 'Ambiente General de Salón',
    description: 'Mezcla perfecta para el día a día, clientes en espera y equipo de trabajo.'
  },
  general: {
    label: 'Sesión Libre de Barbería',
    description: 'Variedad de ritmos aleatorios que acompañan el flujo de trabajo.'
  }
};
