export const BRAND = {
  name: "YOUR MOMENT.",
  tagline: "Some moments deserve a beautiful setting.",
  descriptor: "VENUES · CATERING · CELEBRATIONS",
  developer:
    "Website Concept Made by: Web Developer Devin Planas",
};

const photo = (id, width = 1300) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

export const IMAGES = {
  hero: photo("photo-1519167758481-83f550bb49b3", 1800),
  editorial: photo("photo-1511795409834-ef04bbd61622"),
  dining: photo("photo-1464366400600-7168b8af9bc3"),
  flowers: photo("photo-1519225421980-715cb0215aed"),
  wedding: photo("photo-1519741497674-611481863552"),
  atmosphere: photo("photo-1523438885200-e635ba2c371e"),
  details: photo("photo-1537633552985-df8429e8048b"),
};

export const VENUES = [
  {
    id: "the-glass-garden",
    number: "01",
    name: "The Glass Garden",
    category: "Garden",
    label: "GARDEN / GLASSHOUSE",
    tagline: "Where nature meets celebration.",
    description:
      "An elegant glasshouse-inspired setting surrounded by lush greenery, natural light, and an atmosphere designed for unforgettable gatherings.",
    capacity: 320,
    minGuests: 40,
    baseRate: 88000,
    image: IMAGES.hero,
    gallery: [
      IMAGES.hero,
      IMAGES.editorial,
      IMAGES.flowers,
    ],
    features: [
      "Indoor-outdoor inspired layout",
      "Garden ceremony concept",
      "Dedicated preparation area",
      "Flexible reception styling",
      "Illustrative parking allocation",
    ],
    idealFor: [
      "Weddings",
      "Garden celebrations",
      "Milestone occasions",
    ],
  },
  {
    id: "the-grand-hall",
    number: "02",
    name: "The Grand Hall",
    category: "Ballroom",
    label: "BALLROOM / FORMAL",
    tagline: "A grand setting for a remarkable night.",
    description:
      "A refined ballroom concept with sophisticated lighting, generous event space, and a formal atmosphere for large celebrations.",
    capacity: 450,
    minGuests: 80,
    baseRate: 120000,
    image: IMAGES.dining,
    gallery: [
      IMAGES.dining,
      IMAGES.atmosphere,
      IMAGES.details,
    ],
    features: [
      "Grand banquet floor plan",
      "Formal reception concept",
      "Stage and program area",
      "Indoor climate-controlled concept",
      "Flexible guest arrangements",
    ],
    idealFor: [
      "Grand weddings",
      "Corporate galas",
      "Formal receptions",
    ],
  },
  {
    id: "the-private-courtyard",
    number: "03",
    name: "The Private Courtyard",
    category: "Courtyard",
    label: "COURTYARD / INTIMATE",
    tagline: "Intimate by design. Meaningful by nature.",
    description:
      "A warm, romantic courtyard-inspired venue concept for intimate weddings, private family events, and milestone celebrations.",
    capacity: 160,
    minGuests: 25,
    baseRate: 58000,
    image: IMAGES.flowers,
    gallery: [
      IMAGES.flowers,
      IMAGES.wedding,
      IMAGES.editorial,
    ],
    features: [
      "Intimate reception arrangement",
      "Courtyard ceremony area",
      "Soft ambient lighting concept",
      "Private lounge-inspired space",
      "Customizable table styling",
    ],
    idealFor: [
      "Intimate weddings",
      "Birthdays",
      "Family celebrations",
    ],
  },
  {
    id: "the-skyline-terrace",
    number: "04",
    name: "The Skyline Terrace",
    category: "Rooftop",
    label: "ROOFTOP / CONTEMPORARY",
    tagline: "Celebrate beautifully above it all.",
    description:
      "A contemporary terrace-inspired event setting with open-air ambiance, statement dining arrangements, and memorable city-inspired atmosphere.",
    capacity: 220,
    minGuests: 40,
    baseRate: 99000,
    image: IMAGES.wedding,
    gallery: [
      IMAGES.wedding,
      IMAGES.details,
      IMAGES.atmosphere,
    ],
    features: [
      "Rooftop-inspired reception",
      "Open-air styling concept",
      "Golden-hour photo setting",
      "Cocktail reception layout",
      "Flexible dining arrangement",
    ],
    idealFor: [
      "Engagement parties",
      "Corporate socials",
      "Evening celebrations",
    ],
  },
];

export const PACKAGES = [
  {
    id: "essential",
    number: "01",
    name: "The Essential",
    eyebrow: "BEAUTIFULLY SIMPLE",
    subtitle: "Everything begins with a thoughtful plan.",
    description:
      "A refined foundation for a meaningful celebration, featuring an illustrative catered dining experience and essential service styling.",
    perGuest: 1450,
    minimumGuests: 25,
    highlights: [
      "Sample three-course catering menu",
      "Standard dining arrangement concept",
      "Basic tablescape styling",
      "Sample service team allocation",
      "Event coordination consultation",
    ],
  },
  {
    id: "signature",
    number: "02",
    name: "The Signature",
    eyebrow: "THE MOST CONSIDERED EDIT",
    subtitle: "A little more magic in every detail.",
    description:
      "An elevated celebration concept with upgraded dining presentation, welcoming ambiance, and additional styling possibilities.",
    perGuest: 2150,
    minimumGuests: 40,
    featured: true,
    highlights: [
      "Sample three-course catering menu",
      "Elevated table styling concept",
      "Welcome refreshment concept",
      "Premium service presentation",
      "Event planning consultation",
      "Personalized reception mood board",
    ],
  },
  {
    id: "grand",
    number: "03",
    name: "The Grand Celebration",
    eyebrow: "A MOMENT OF GRANDEUR",
    subtitle: "An extraordinary setting for an extraordinary day.",
    description:
      "A comprehensive event concept with refined dining, elaborate presentation, and additional planning experiences.",
    perGuest: 2950,
    minimumGuests: 60,
    highlights: [
      "Sample premium three-course menu",
      "Luxury tablescape concept",
      "Welcome refreshments",
      "Enhanced dining service concept",
      "Event planning consultation",
      "Statement reception styling concept",
      "Illustrative event run-of-show",
    ],
  },
];

export const ADDONS = [
  {
    id: "floral-styling",
    name: "Signature Floral Styling",
    description: "An upgraded floral styling concept.",
    price: 18500,
    unit: "fixed",
  },
  {
    id: "photo-booth",
    name: "Photo Booth Experience",
    description: "An illustrative photo booth setup.",
    price: 12500,
    unit: "fixed",
  },
  {
    id: "cocktail-hour",
    name: "Welcome Mocktail Hour",
    description: "A sample non-alcoholic welcome drink service.",
    price: 350,
    unit: "perGuest",
  },
  {
    id: "extended-hours",
    name: "Extended Celebration Hours",
    description: "An illustrative event-time extension.",
    price: 9000,
    unit: "fixed",
  },
];

export const MENU_OPTIONS = {
  starter: [
    "Garden Salad with Citrus Dressing",
    "Roasted Pumpkin Soup",
    "Creamy Mushroom Soup",
  ],

  main: [
    "Herb-Roasted Chicken",
    "Slow-Braised Beef",
    "Grilled Fish with Lemon Butter",
    "Vegetarian Pasta Primavera",
  ],

  dessert: [
    "Classic Panna Cotta",
    "Chocolate Mousse",
    "Seasonal Fruit Tart",
  ],
};

export const EVENT_TYPES = [
  "Wedding Reception",
  "Birthday Celebration",
  "Debut",
  "Corporate Event",
  "Anniversary",
  "Private Gathering",
  "Other Celebration",
];

export const EVENT_PERIODS = [
  {
    id: "morning",
    name: "Morning Event",
    time: "9 AM – 1 PM",
  },
  {
    id: "afternoon",
    name: "Afternoon Event",
    time: "2 PM – 6 PM",
  },
  {
    id: "evening",
    name: "Evening Event",
    time: "6 PM – 10 PM",
  },
];

export const PRINCIPLES = [
  {
    number: "01",
    title: "A setting that feels right.",
    text:
      "Explore beautiful venues designed around different celebrations, guest counts, and event styles.",
  },
  {
    number: "02",
    title: "Dining worth remembering.",
    text:
      "Discover curated catering packages and build a sample menu that reflects your occasion.",
  },
  {
    number: "03",
    title: "Details made clearer.",
    text:
      "Preview transparent sample costs and event preferences before moving forward.",
  },
];

export const FAQS = [
  {
    question: "Are these real event venues?",
    answer:
      "No. All venue names, capacities, packages, and settings are fictional portfolio examples. This website demonstrates how a real event venue and catering business could present its services.",
  },
  {
    question: "Is the quotation a final event price?",
    answer:
      "No. The calculator provides a non-binding illustration using sample Philippine peso amounts. Real quotations may include additional costs, taxes, logistics, venue conditions, and supplier fees.",
  },
  {
    question: "Does selecting an event date reserve the venue?",
    answer:
      "No. Selecting a date creates a demo event-planning request saved only in your browser. It does not check real availability or reserve a venue.",
  },
  {
    question: "Can I customize the catering menu?",
    answer:
      "Yes. The sample planner allows you to choose menu preferences for each course. These selections are illustrative and do not confirm dietary, allergy, or production capabilities.",
  },
];

export function findVenue(id) {
  return VENUES.find((venue) => venue.id === id);
}

export function findPackage(id) {
  return PACKAGES.find((item) => item.id === id);
}

export function formatPeso(value) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function dateAfter(days) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);

  return localDateKey(date);
}

export function formatDate(key) {
  if (!key) return "Not selected";

  const date = new Date(`${key}T12:00:00`);

  if (Number.isNaN(date.getTime())) return "Invalid date";

  return date.toLocaleDateString("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function calculateEstimate({
  venueId,
  packageId,
  guests,
  addonIds = [],
}) {
  const venue = findVenue(venueId);
  const packageItem = findPackage(packageId);

  const count = Number(guests);

  if (
    !venue ||
    !packageItem ||
    !Number.isInteger(count) ||
    count < Math.max(venue.minGuests, packageItem.minimumGuests) ||
    count > venue.capacity
  ) {
    return null;
  }

  const catering = packageItem.perGuest * count;

  const selectedAddons = ADDONS.filter((item) =>
    addonIds.includes(item.id)
  );

  const addons = selectedAddons.map((item) => ({
    ...item,
    total:
      item.unit === "perGuest"
        ? item.price * count
        : item.price,
  }));

  const addonTotal = addons.reduce(
    (sum, item) => sum + item.total,
    0
  );

  return {
    venue,
    packageItem,
    guests: count,
    venueTotal: venue.baseRate,
    cateringTotal: catering,
    addons,
    addonTotal,
    total: venue.baseRate + catering + addonTotal,
  };
}