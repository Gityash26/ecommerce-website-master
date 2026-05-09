export type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: { rate: number; count: number };
  sizes?: string[];
  colors?: { name: string; hex: string }[];
};

export const CATEGORIES = [
  { slug: "lighting", name: "Lighting", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900&q=80" },
  { slug: "vases", name: "Vases & Vessels", image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=900&q=80" },
  { slug: "furniture", name: "Furniture", image: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=900&q=80" },
  { slug: "textiles", name: "Textiles", image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=900&q=80" },
  { slug: "tableware", name: "Tableware", image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=900&q=80" },
  { slug: "decor", name: "Decor", image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=900&q=80" },
];

const img = (id: string) => `https://images.unsplash.com/${id}?w=1000&q=80&auto=format&fit=crop`;

const COLORS = [
  { name: "Ivory", hex: "#F1ECE2" },
  { name: "Sand", hex: "#D9C9B2" },
  { name: "Onyx", hex: "#2A2622" },
  { name: "Sage", hex: "#A8B5A0" },
  { name: "Gold", hex: "#C9A55A" },
];

// export const PRODUCTS: Product[] = [
//   { id: 1, title: "Lumina Table Lamp", price: 1250, category: "lighting",
//     description: "A beacon of minimalist design. Hand-spun brass base with a warm linen shade that diffuses light into a soft glow.",
//     image: img("photo-1507473885765-e6ed057f782c"), rating: { rate: 4.9, count: 128 },
//     colors: [COLORS[4], COLORS[2]] },
//   { id: 2, title: "Terra Sculpted Vase", price: 475, category: "vases",
//     description: "A sculptural form for natural elements. Wheel-thrown stoneware with an unglazed matte finish.",
//     image: img("photo-1578500494198-246f612d3b3d"), rating: { rate: 4.8, count: 96 },
//     sizes: ["Small", "Medium", "Large"], colors: [COLORS[0], COLORS[1]] },
//   { id: 3, title: "Sol Lounge Chair", price: 2900, category: "furniture",
//     description: "Elegant workspace for modern living. Solid white oak frame with hand-stitched linen cushions.",
//     image: img("photo-1519710164239-da123dc03ef4"), rating: { rate: 5.0, count: 54 },
//     colors: [COLORS[0], COLORS[3]] },
//   { id: 4, title: "Linen Throw — Dune", price: 220, category: "textiles",
//     description: "Stonewashed Belgian linen throw with a soft, lived-in handfeel.",
//     image: img("photo-1584100936595-c0654b55a2e2"), rating: { rate: 4.7, count: 211 },
//     colors: [COLORS[1], COLORS[3], COLORS[0]] },
//   { id: 5, title: "Marble Serving Board", price: 145, category: "tableware",
//     description: "Carrara marble with a hand-bevelled edge and a brass inlay handle.",
//     image: img("photo-1578749556568-bc2c40e68b61"), rating: { rate: 4.6, count: 87 },
//     sizes: ["Round", "Rectangular"] },
//   { id: 6, title: "Brass Pendant — Halo", price: 890, category: "lighting",
//     description: "A floating ring of brushed brass that casts a perfect circle of warm light.",
//     image: img("photo-1513506003901-1e6a229e2d15"), rating: { rate: 4.9, count: 64 },
//     colors: [COLORS[4]] },
//   { id: 7, title: "Ceramic Carafe Set", price: 180, category: "tableware",
//     description: "Hand-thrown carafe with two matching tumblers in a soft sand glaze.",
//     image: img("photo-1567538096631-e0c55bd6374c"), rating: { rate: 4.5, count: 142 },
//     colors: [COLORS[1], COLORS[0]] },
//   { id: 8, title: "Travertine Side Table", price: 1480, category: "furniture",
//     description: "Sculpted from a single block of Italian travertine. Natural variations in every piece.",
//     image: img("photo-1493663284031-b7e3aefcae8e"), rating: { rate: 4.8, count: 38 },
//     colors: [COLORS[0]] },
//   { id: 9, title: "Wool Area Rug — Mesa", price: 1620, category: "textiles",
//     description: "Hand-loomed New Zealand wool with a soft tonal gradient.",
//     image: img("photo-1600585154340-be6161a56a0c"), rating: { rate: 4.7, count: 76 },
//     sizes: ["5×8", "8×10", "9×12"], colors: [COLORS[1], COLORS[2]] },
//   { id: 10, title: "Olive Wood Bowl", price: 95, category: "decor",
//     description: "Turned from a single piece of Mediterranean olive wood.",
//     image: img("photo-1581539250439-c96689b516dd"), rating: { rate: 4.9, count: 304 } },
//   { id: 11, title: "Alabaster Tea Light", price: 78, category: "decor",
//     description: "Hand-carved alabaster glows softly when lit.",
//     image: img("photo-1602874801006-e26c4b1e1c3a"), rating: { rate: 4.8, count: 187 } },
//   { id: 12, title: "Aria Floor Lamp", price: 1890, category: "lighting",
//     description: "Slender brass arc with a paper lantern shade.",
//     image: img("photo-1524634126442-357e0eac3c14"), rating: { rate: 4.9, count: 42 },
//     colors: [COLORS[4], COLORS[2]] },
// ];

// These are no longer needed because we fetch live from useShop() in the routes
// export const getProduct = (id: number) => PRODUCTS.find((p) => p.id === id);
// export const getRelated = (id: number, category: string) =>
//   PRODUCTS.filter((p) => p.id !== id && p.category === category).slice(0, 4);