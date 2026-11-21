/**
 * Gilli Solutions — single source of truth for business details and product data.
 * Products live here (rendered in the browser by products.js and used by the assistant).
 * Business details (phones, hours, address…) live in src/site.json — run
 * `python tools/build.py` and they are written into every page and into assets/js/site.js.
 */

import { SITE } from './site.js';
export { SITE };

export const CATEGORIES = {
  exhaust: 'Exhaust systems',
  freshair: 'Fresh air & accessories',
};

/**
 * Product images below are hot-linked from third-party sites (Bing, Amazon, MDPI, CGTrader).
 * Replace them with your own factory photos on ImageKit — hot-linked images can vanish
 * or carry copyright/watermark issues.
 *
 * `legacy` keeps the old category hash working for existing links.
 */
export const PRODUCTS = [
  {
    id: 1,
    slug: 'kitchen-hoods',
    name: 'Commercial kitchen hoods',
    category: 'exhaust',
    legacy: 'Commercial_Kitchen_Ventilation_Systems',
    keywords: ['hood', 'canopy', 'chimney', 'exhaust hood', 'kitchen hood'],
    image: 'https://www.commercial-kitchenequipments.com/photo/ps1831771-eh_115_silver_commercial_stainless_steel_exhaust_hood_with_filter_for_kitchen.jpg',
    summary: 'Stainless steel canopies that capture heat, smoke, grease-laden vapour and odour right above the cooking line.',
    description: 'The hood is where an exhaust system starts. Ours are fabricated in stainless steel for high extraction and long service in busy kitchens, with removable baffle filters, integrated lighting and sizes built to your cooking line. A correctly sized and installed hood keeps the kitchen cooler, the air cleaner and the system in line with fire-safety and hygiene expectations.',
    specs: [
      ['Type', 'Wall-mounted, island or low-profile'],
      ['Material', 'Stainless steel, 18 or 20 gauge'],
      ['Airflow capacity', '500 – 2,500 CFM'],
      ['Lighting', 'Integrated LED'],
      ['Ducting', 'Ducted or ductless configurations'],
      ['Design reference', 'NFPA 96'],
      ['Noise level', '65 – 75 dB'],
    ],
  },
  {
    id: 2,
    slug: 'exhaust-ducting',
    name: 'Commercial exhaust ducting',
    category: 'exhaust',
    legacy: 'Commercial_Kitchen_Ventilation_Systems',
    keywords: ['duct', 'ducting', 'gi duct', 'pipe', 'ductwork'],
    image: 'https://tse3.mm.bing.net/th/id/OIP.jgY9wKBCvUyR602Hfzej1gHaEK?rs=1&pid=ImgDetMain&o=7&rm=3',
    summary: 'Sealed galvanised or stainless ductwork that carries contaminated air from the hood to the outside.',
    description: 'Exhaust ducting connects the hood to the blower and safely carries smoke, heat and airborne grease out of the building. We fabricate it in heavy-gauge galvanised or stainless steel to handle high temperatures and the corrosive kitchen environment, with sealed joints that prevent leaks. Well-designed ducting keeps airflow efficient and reduces fire risk.',
    specs: [
      ['Material', 'Galvanised or stainless steel, 16 – 20 gauge'],
      ['Shape', 'Round or rectangular'],
      ['Size', '8" – 24", sized to airflow'],
      ['Joints', 'Welded or flanged, airtight'],
      ['Fire rating', 'Built to NFPA 96 grease-duct practice'],
      ['Insulation', 'High-temperature insulation available'],
      ['Length', 'Custom, to suit the kitchen layout'],
      ['Mounting', 'Horizontal or vertical'],
    ],
  },
  {
    id: 3,
    slug: 'centrifugal-blowers',
    name: 'Centrifugal blowers',
    category: 'exhaust',
    legacy: 'Commercial_Kitchen_Ventilation_Systems',
    keywords: ['blower', 'fan', 'centrifugal', 'motor', 'suction', 'exhaust fan', 'axial'],
    image: 'https://img-new.cgtrader.com/items/943730/28829c9894/large/industrial-centrifugal-blower-fan-animated-3d-model-animated-max-obj-fbx-3dm-mtl.jpg',
    summary: 'The engine of the system — pulls air through hoods and ducts at the pressure long duct runs need.',
    description: 'Centrifugal blowers deliver the airflow that removes heat, smoke and grease particles. Forward-curved or backward-inclined impellers give efficient, quiet operation, and direct-drive or belt-drive configurations suit different kitchen sizes and duct layouts. Their high static-pressure capacity makes them the right choice for systems with long ductwork and heavy cooking loads.',
    specs: [
      ['Type', 'Single or double inlet'],
      ['Housing', 'M.S., galvanised steel or aluminium with steel impeller'],
      ['Airflow capacity', '500 – 10,000 CFM'],
      ['Drive', 'Direct-drive or belt-drive'],
      ['Speed', 'Variable-speed options'],
      ['Noise level', '55 – 75 dB'],
      ['Mounting', 'Roof or wall'],
      ['Strength', 'High static pressure for long duct runs'],
    ],
  },
  {
    id: 4,
    slug: 'hood-filters',
    name: 'Baffle hood filters',
    category: 'exhaust',
    legacy: 'Commercial_Kitchen_Ventilation_Systems',
    keywords: ['filter', 'baffle', 'grease filter', 'mesh'],
    image: 'https://m.media-amazon.com/images/I/510ggsd2CkL._AC_SL1500_.jpg',
    summary: 'Stainless steel baffles that trap grease before it reaches the duct — reusable and easy to wash.',
    description: 'Hood filters capture grease-laden vapour before it enters the exhaust duct. Stainless steel baffle filters are the standard for their durability, fire safety and easy cleaning: the angled baffles separate grease while keeping airflow up. Good filters reduce fire risk and extend the life of your ducting and blower.',
    specs: [
      ['Type', 'Baffle (recommended) or mesh'],
      ['Material', 'Stainless steel or aluminium'],
      ['Standard sizes', '10" × 20", 16" × 20", 20" × 20", or custom'],
      ['Construction', 'Welded or riveted frame with handles'],
      ['Efficiency', 'High grease capture, low airflow restriction'],
      ['Cleaning', 'Dishwasher-safe and reusable'],
      ['Operating temperature', 'Up to 204 °C (400 °F)'],
    ],
  },
  {
    id: 5,
    slug: 'dampers',
    name: 'Dampers',
    category: 'exhaust',
    legacy: 'Commercial_Kitchen_Ventilation_Systems',
    keywords: ['damper', 'balance', 'backdraft', 'volume control', 'vcd'],
    image: 'https://airmasteremirates.com/wp-content/uploads/2016/02/GI-Volume-Control-Damper-1.jpg',
    summary: 'Manual, motorised and backdraft dampers that balance airflow and stop reverse draught.',
    description: 'Dampers control airflow inside the duct network so exhaust and supply stay balanced. Manual dampers give simple, low-cost adjustment; motorised dampers can be linked to building automation; backdraft dampers stop air flowing back in when the system is off. Built in galvanised or stainless steel for continuous duty.',
    specs: [
      ['Type', 'Manual, motorised or backdraft'],
      ['Material', 'Galvanised or stainless steel'],
      ['Size', '4" – 24" round, or custom rectangular'],
      ['Operation', 'Lever (manual) or actuator (motorised)'],
      ['Sealing', 'Gasketed blades for low leakage'],
      ['Temperature rating', 'Up to 121 °C (250 °F), standard'],
      ['Installation', 'Horizontal or vertical duct'],
    ],
  },
  {
    id: 6,
    slug: 'silencers',
    name: 'Blower silencers',
    category: 'exhaust',
    legacy: 'Commercial_Kitchen_Ventilation_Systems',
    keywords: ['silencer', 'noise', 'sound', 'loud', 'attenuator', 'acoustic'],
    image: 'https://www.mdpi.com/applsci/applsci-13-04426/article_deploy/html/images/applsci-13-04426-g005-550.jpg',
    summary: 'Acoustic duct sections that cut blower noise for staff and neighbours without choking airflow.',
    description: 'Silencers absorb the sound produced by exhaust and make-up air blowers so less noise travels through the ducts. Steel casings with acoustic lining keep airflow high with minimal pressure drop. They make the kitchen more comfortable to work in and help keep neighbours happy.',
    specs: [
      ['Type', 'Rectangular or cylindrical'],
      ['Casing', 'Galvanised or stainless steel'],
      ['Lining', 'Acoustic insulation behind perforated metal'],
      ['Noise reduction', '20 – 40 dB, depending on design'],
      ['Temperature rating', 'Up to 121 °C (250 °F)'],
      ['Length', 'Typically 3 – 10 ft, custom available'],
      ['Installation', 'Horizontal or vertical duct'],
    ],
  },
  {
    id: 7,
    slug: 'fresh-air-collars',
    name: 'Fresh air collars',
    category: 'freshair',
    legacy: 'Commercial_Kitchen_Ventilation_&_HVAC_Accessories',
    keywords: ['collar', 'fresh air', 'make-up air', 'makeup air', 'supply air', 'air grill', 'diffuser'],
    image: 'https://tse1.mm.bing.net/th/id/OIP.TANRma-tuKETlCmsosk23AHaG1?rs=1&pid=ImgDetMain&o=7&rm=3',
    summary: 'Airtight connectors between ducts, diffusers and plenums on the fresh-air supply side.',
    description: 'Collars join ducts, diffusers and plenums on the fresh-air side of a ventilation system. They give secure, leak-free transitions so supply air reaches the kitchen efficiently. Round and rectangular versions are made from galvanised or stainless steel, many with gaskets for an airtight fit.',
    specs: [
      ['Type', 'Round or rectangular'],
      ['Material', 'Galvanised steel, stainless steel or aluminium'],
      ['Size', '4" – 24" round, or custom rectangular'],
      ['Connection', 'Slip-in or flanged'],
      ['Sealing', 'Gaskets or sealant'],
      ['Finish', 'Zinc or powder coated'],
      ['Design reference', 'SMACNA duct fittings'],
    ],
  },
];

export const productUrl = (p) => `product-detail.html?id=${p.id}`;
export const findProduct = (slugOrId) =>
  PRODUCTS.find((p) => p.slug === slugOrId || p.id === Number(slugOrId));
