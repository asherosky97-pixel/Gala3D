/**
 * Gala3D - Event Asset Catalog Metadata
 * Comprehensive collection of event furniture, structures, decor, and AV equipment.
 */

export const CATEGORIES = [
  { id: 'tables', name: 'Tables', icon: 'table' },
  { id: 'chairs', name: 'Chairs & Seating', icon: 'chair' },
  { id: 'stages', name: 'Stages & Dance Floors', icon: 'layers' },
  { id: 'tents', name: 'Tents & Architecture', icon: 'tent' },
  { id: 'decor', name: 'Decor & Linens', icon: 'flower' },
  { id: 'lighting', name: 'Lighting & AV', icon: 'lightbulb' },
  { id: 'catering', name: 'Catering & Service', icon: 'coffee' }
];

export const CATALOG_ITEMS = [
  // --- TABLES ---
  {
    id: 'table_round_60',
    name: '60" Round Banquet Table',
    category: 'tables',
    dimensions: { diameter: 1.52, height: 0.76 },
    defaultSeats: 8,
    defaultPrice: 18.00,
    icon: 'circle',
    description: 'Seats 8 guests comfortably. Standard 5ft round banquet table with floor-length linen.',
    hasSeats: true,
    defaultLinen: '#ffffff'
  },
  {
    id: 'table_round_72',
    name: '72" Round Banquet Table',
    category: 'tables',
    dimensions: { diameter: 1.83, height: 0.76 },
    defaultSeats: 10,
    defaultPrice: 24.00,
    icon: 'circle',
    description: 'Seats 10-12 guests. Standard 6ft grand banquet table with draped tablecloth.',
    hasSeats: true,
    defaultLinen: '#ffffff'
  },
  {
    id: 'table_rect_8ft',
    name: '8ft Rectangular Trestle Table',
    category: 'tables',
    dimensions: { width: 0.76, length: 2.44, height: 0.76 },
    defaultSeats: 8,
    defaultPrice: 20.00,
    icon: 'rectangle',
    description: 'Seats 8 guests (3 on each side + 1 on each end). Perfect for long family banquet setups.',
    hasSeats: true,
    defaultLinen: '#ffffff'
  },
  {
    id: 'table_rect_6ft',
    name: '6ft Rectangular Dining Table',
    category: 'tables',
    dimensions: { width: 0.76, length: 1.83, height: 0.76 },
    defaultSeats: 6,
    defaultPrice: 16.00,
    icon: 'rectangle',
    description: 'Seats 6 guests. Versatile banquet and head table dining surface.',
    hasSeats: true,
    defaultLinen: '#ffffff'
  },
  {
    id: 'table_highboy',
    name: 'Highboy Cocktail Table',
    category: 'tables',
    dimensions: { diameter: 0.76, height: 1.07 },
    defaultSeats: 0,
    defaultPrice: 14.00,
    icon: 'martini',
    description: 'Standing cocktail table with elegant tied spandex or draped sash linen.',
    hasSeats: false,
    defaultLinen: '#1e293b'
  },
  {
    id: 'table_sweetheart',
    name: 'VIP Sweetheart Head Table',
    category: 'tables',
    dimensions: { width: 0.9, length: 1.8, height: 0.76 },
    defaultSeats: 2,
    defaultPrice: 45.00,
    icon: 'heart',
    description: 'Curved romantic couple table for newlyweds or VIP speakers with floral skirt.',
    hasSeats: true,
    defaultLinen: '#f8fafc'
  },
  {
    id: 'table_square_4',
    name: 'Square Bistro Table',
    category: 'tables',
    dimensions: { width: 1.0, length: 1.0, height: 0.76 },
    defaultSeats: 4,
    defaultPrice: 15.00,
    icon: 'square',
    description: 'Intimate 4-person dining table for lounges, outdoor cafes, and VIP booths.',
    hasSeats: true,
    defaultLinen: '#334155'
  },

  // --- CHAIRS ---
  {
    id: 'chair_chiavari_gold',
    name: 'Gold Chiavari Chair',
    category: 'chairs',
    dimensions: { width: 0.42, length: 0.45, height: 0.92 },
    defaultPrice: 7.50,
    icon: 'chair',
    description: 'Iconic luxury gold ballroom chair with plush ivory satin cushion.',
    color: '#d4af37'
  },
  {
    id: 'chair_chiavari_silver',
    name: 'Silver Chiavari Chair',
    category: 'chairs',
    dimensions: { width: 0.42, length: 0.45, height: 0.92 },
    defaultPrice: 7.50,
    icon: 'chair',
    description: 'Sleek chrome/silver ballroom chair with white tufted cushion.',
    color: '#c0c0c0'
  },
  {
    id: 'chair_folding_white',
    name: 'White Resin Folding Chair',
    category: 'chairs',
    dimensions: { width: 0.45, length: 0.45, height: 0.78 },
    defaultPrice: 3.50,
    icon: 'chair',
    description: 'Classic wedding garden chair with padded vinyl seat.',
    color: '#f8fafc'
  },
  {
    id: 'chair_banquet_padded',
    name: 'Royal Padded Banquet Chair',
    category: 'chairs',
    dimensions: { width: 0.45, length: 0.48, height: 0.88 },
    defaultPrice: 5.00,
    icon: 'chair',
    description: 'Stackable steel-frame ballroom banquet chair with dark velvet padding.',
    color: '#641e2e'
  },
  {
    id: 'chair_velvet_modern',
    name: 'Modern Velvet Dining Chair',
    category: 'chairs',
    dimensions: { width: 0.52, length: 0.54, height: 0.84 },
    defaultPrice: 12.00,
    icon: 'chair',
    description: 'Curved Scandinavian-style velvet chair with gold brass hairpin legs.',
    color: '#0f766e'
  },
  {
    id: 'lounge_sofa',
    name: 'Luxury Velvet 3-Seater Sofa',
    category: 'chairs',
    dimensions: { width: 0.85, length: 2.1, height: 0.82 },
    defaultPrice: 120.00,
    icon: 'armchair',
    description: 'Tufted chesterfield lounge sofa for VIP cocktail lounges and stage seating.',
    color: '#1e293b'
  },
  {
    id: 'bar_stool',
    name: 'Modern Cocktail Bar Stool',
    category: 'chairs',
    dimensions: { width: 0.4, length: 0.4, height: 0.95 },
    defaultPrice: 9.00,
    icon: 'circle-dot',
    description: 'High swivel barstool with footrest and faux-leather seat.',
    color: '#111827'
  },

  // --- STAGES & DANCE FLOORS ---
  {
    id: 'stage_modular_block',
    name: 'Modular Stage Platform (2x1m)',
    category: 'stages',
    dimensions: { width: 1.0, length: 2.0, height: 0.6 },
    defaultPrice: 65.00,
    icon: 'box',
    description: 'Heavy-duty elevated aluminum stage deck with black pleated velvet skirting.',
    isModular: true
  },
  {
    id: 'dance_floor_checkered',
    name: 'Checkered Dance Floor (4x4m)',
    category: 'stages',
    dimensions: { width: 4.0, length: 4.0, height: 0.04 },
    defaultPrice: 220.00,
    icon: 'grid',
    description: 'High-gloss black and white checkered acrylic dance floor with beveled aluminum edge.'
  },
  {
    id: 'dance_floor_wood',
    name: 'Parquet Wood Dance Floor (5x5m)',
    category: 'stages',
    dimensions: { width: 5.0, length: 5.0, height: 0.04 },
    defaultPrice: 280.00,
    icon: 'grid',
    description: 'Rich oak parquet interlocked dance floor panels with perimeter safety ramp.'
  },
  {
    id: 'dance_floor_starlight',
    name: 'LED Starlight Dance Floor (5x5m)',
    category: 'stages',
    dimensions: { width: 5.0, length: 5.0, height: 0.05 },
    defaultPrice: 450.00,
    icon: 'sparkles',
    description: 'Luxury twinkling LED starry-night dance floor for wedding first dances.'
  },
  {
    id: 'podium_lectern',
    name: 'Acrylic Presentation Lectern',
    category: 'stages',
    dimensions: { width: 0.6, length: 0.5, height: 1.15 },
    defaultPrice: 40.00,
    icon: 'mic',
    description: 'Clear crystal acrylic podium with microphone mount for keynote speakers.'
  },

  // --- TENTS & ARCHITECTURE ---
  {
    id: 'tent_high_peak',
    name: 'High-Peak Marquee Tent (6x6m)',
    category: 'tents',
    dimensions: { width: 6.0, length: 6.0, height: 4.2 },
    defaultPrice: 350.00,
    icon: 'tent',
    description: 'Elegant cathedral high-peak canopy tent with tensioned white vinyl roof.'
  },
  {
    id: 'wedding_arbor_arch',
    name: 'Floral Wedding Ceremonial Arch',
    category: 'tents',
    dimensions: { width: 0.8, length: 2.4, height: 2.6 },
    defaultPrice: 180.00,
    icon: 'heart',
    description: 'Birchwood or gold geometric hexagon wedding arch wrapped in roses and eucalyptus.'
  },
  {
    id: 'photo_backdrop_wall',
    name: 'Luxury Floral Backdrop Wall',
    category: 'tents',
    dimensions: { width: 0.3, length: 3.0, height: 2.4 },
    defaultPrice: 220.00,
    icon: 'image',
    description: 'Full 10ft greenery boxwood wall with custom 3D acrylic event monogram.'
  },
  {
    id: 'red_carpet_runner',
    name: 'VIP Red Carpet with Stanchions',
    category: 'tents',
    dimensions: { width: 1.5, length: 6.0, height: 0.95 },
    defaultPrice: 85.00,
    icon: 'award',
    description: 'Plush crimson runner rug flanked by 6 gold stanchions and red velvet ropes.'
  },

  // --- DECOR & LINENS ---
  {
    id: 'decor_centerpiece_tall',
    name: 'Tall Crystal Floral Centerpiece',
    category: 'decor',
    dimensions: { width: 0.35, length: 0.35, height: 0.85 },
    defaultPrice: 35.00,
    icon: 'flower',
    description: 'Elevated crystal trumpet vase crowned with hydrangeas, peonies, and greenery.'
  },
  {
    id: 'decor_candelabra',
    name: '5-Arm Gold Candelabra',
    category: 'decor',
    dimensions: { width: 0.4, length: 0.4, height: 0.75 },
    defaultPrice: 28.00,
    icon: 'flame',
    description: 'Vintage polished brass candelabra with LED taper candles and crystal drops.'
  },

  // --- LIGHTING & AV ---
  {
    id: 'light_uplight',
    name: 'Wireless LED Perimeter Uplight',
    category: 'lighting',
    dimensions: { width: 0.2, length: 0.2, height: 0.25 },
    defaultPrice: 22.00,
    icon: 'lightbulb',
    description: 'RGBAW battery-powered wash light casting a vertical colored cone onto walls.',
    lightColor: '#c026d3', // Magenta default
    isLightSource: true
  },
  {
    id: 'light_chandelier',
    name: 'Grand Crystal Chandelier',
    category: 'lighting',
    dimensions: { width: 1.2, length: 1.2, height: 1.4 },
    defaultPrice: 150.00,
    icon: 'sun',
    description: 'Tiered sparkling crystal chandelier suspended from ceiling trusses.',
    isCeilingMounted: true
  },
  {
    id: 'av_dj_booth',
    name: 'Pro DJ Booth & Turntable Rig',
    category: 'lighting',
    dimensions: { width: 0.9, length: 1.8, height: 1.2 },
    defaultPrice: 160.00,
    icon: 'disc',
    description: 'Lit front facade DJ console with twin Pioneer media players and mixer.'
  },
  {
    id: 'av_speaker_tower',
    name: 'Concert Line-Array Speaker Tower',
    category: 'lighting',
    dimensions: { width: 0.5, length: 0.6, height: 2.2 },
    defaultPrice: 75.00,
    icon: 'volume-2',
    description: 'Subwoofer base with vertical line-array column for acoustic sound dispersion.'
  },
  {
    id: 'av_video_wall',
    name: 'Giant LED Video Wall (4x2.5m)',
    category: 'lighting',
    dimensions: { width: 0.4, length: 4.0, height: 2.5 },
    defaultPrice: 600.00,
    icon: 'tv',
    description: 'High-definition video wall for live video feed, photo slideshows, and branding.'
  },

  // --- CATERING & SERVICE ---
  {
    id: 'catering_cake_table',
    name: '3-Tier Wedding Cake Display',
    category: 'catering',
    dimensions: { diameter: 0.9, height: 1.2 },
    defaultPrice: 65.00,
    icon: 'gift',
    description: 'Dedicated pedestal table bearing a luxury 3-tier iced cake with silver stand.'
  },
  {
    id: 'catering_buffet_station',
    name: 'Chafing Dish Buffet Station',
    category: 'catering',
    dimensions: { width: 0.8, length: 2.4, height: 0.9 },
    defaultPrice: 70.00,
    icon: 'coffee',
    description: 'Trestle table fitted with stainless-steel roll-top chafing warmers and serving tongs.'
  },
  {
    id: 'catering_bar_counter',
    name: 'LED Illuminated Cocktail Bar',
    category: 'catering',
    dimensions: { width: 0.9, length: 2.4, height: 1.15 },
    defaultPrice: 180.00,
    icon: 'glass-water',
    description: 'Curved gloss acrylic bar counter with under-counter shelving and glowing front.'
  }
];

export function getItemById(id) {
  return CATALOG_ITEMS.find(item => item.id === id);
}
