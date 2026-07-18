/**
 * Inventario Mystery Box SHEIN → Excel (.xlsx)
 * Una línea del listado = un producto. Packs (x3, Triple, etc.) = una sola fila.
 */
import XLSX from "xlsx";
import { readFileSync, mkdirSync, writeFileSync, copyFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const CORRECTIONS = [
  [/\bSweter\b/gi, "Suéter"],
  [/\bSueter\b/g, "Suéter"],
  [/\bPalaso\b/gi, "Palazzo"],
  [/\bPalazo\b/gi, "Palazzo"],
  [/\bCalsas\b/gi, "Calzas"],
  [/\bCalsa\b/gi, "Calza"],
  [/\bRemrea\b/gi, "Remera"],
  [/\bRemerea\b/gi, "Remera"],
  [/\bRermera\b/gi, "Remera"],
  [/\bmuier\b/gi, "mujer"],
  [/\bhomre\b/gi, "hombre"],
  [/\bcalabera\b/gi, "calavera"],
  [/\bmarron\b/g, "marrón"],
  [/\bMarron\b/g, "Marrón"],
  [/\bnegroo\b/gi, "negro"],
  [/\bculotteles\b/gi, "culottes"],
  [/\bdepotiva\b/gi, "deportiva"],
  [/\bdepotivo\b/gi, "deportivo"],
  [/\bMedibachas\b/gi, "Medias bachas"],
  [/\bAlfonbra\b/gi, "Alfombra"],
  [/\bdibuiitos\b/gi, "dibujitos"],
  [/\bcruadille\b/gi, "cuadrillé"],
  [/\bcruadrille\b/gi, "cuadrillé"],
  [/\bcuadrille\b/gi, "cuadrillé"],
  [/\bnefra\b/gi, "negra"],
  [/\btranparencia\b/gi, "transparencia"],
  [/\banimal prin\b/gi, "animal print"],
  [/\banimal rpint\b/gi, "animal print"],
  [/\bHunder armour\b/gi, "Under Armour"],
  [/\bmorlei\b/gi, "morley"],
  [/\bebilla\b/gi, "hebilla"],
  [/\bGotto\b/g, "Gorro"],
  [/\bmussic\b/gi, "music"],
  [/\bcorderoi\b/gi, "corderoy"],
  [/\bfrizada\b/gi, "frisada"],
  [/\bfrizado\b/gi, "frisado"],
  [/\boxfort\b/gi, "oxford"],
  [/\bjakson\b/gi, "Jackson"],
  [/\bjoga\b/gi, "yoga"],
  [/\blasos\b/gi, "lazos"],
  [/\bmaga larga\b/gi, "manga larga"],
  [/\bstraples\b/gi, "strapless"],
  [/\bGamulan\b/gi, "Gamuza"],
  [/\bcaspeado\b/gi, "jaspeado"],
  [/\bsastreta\b/gi, "sastre"],
  [/\b4XI\b/g, "4XL"],
  [/\bT\.?\s*XXI\b/gi, "T.XXL"],
  [/\bvalette\b/gi, "ballet"],
  [/\brallada\b/gi, "rayada"],
  [/\brallado\b/gi, "rayado"],
  [/\bMusculo negra\b/gi, "Musculosa negra"],
  [/\blaicra\b/gi, "lycra"],
  [/\bcierra\b/gi, "cierre"],
  [/\bagel\b/gi, "angel"],
  [/\bdoradis\b/gi, "dorados"],
  [/\bmusera\b/gi, "mujer"],
  [/\bplizado\b/gi, "plisado"],
  [/\bstich\b/gi, "stitch"],
  [/\bscone V\b/gi, "escote V"],
  [/\bnired\b/gi, "wired"],
  [/\bChaquet\b/g, "Chaqueta"],
  [/\bespins\b/gi, "espinas"],
  [/\bsalas\b/gi, "calzas"],
  [/\byonki\b/gi, "yonki"],
];

function cleanName(raw) {
  let s = String(raw)
    .replace(/[\$Ş]\s*\.?\s*[\d.]+(?:\s*c\/?u)?/gi, "")
    .replace(/(?<![A-Za-z])S\s*([\d]{2}\.[\d]{3})/g, "")
    .replace(/\s+c\/?u\s*$/i, "")
    .replace(/\*+$/g, "")
    .replace(/\s+/g, " ")
    .replace(/^[\s.\-–—,]+|[\s.\-–—,]+$/g, "");
  for (const [pat, rep] of CORRECTIONS) s = s.replace(pat, rep);
  if (s) s = s[0].toUpperCase() + s.slice(1);
  return s.trim();
}

function parsePrice(text) {
  let t = String(text).replace(/Ş/g, "$");
  t = t.replace(/(?<![A-Za-z$])S(\d{2}\.\d{3})/g, "$$$1");
  const m = t.match(/\$\s*\.?\s*([\d.]+)/);
  if (!m) return "";
  const raw = m[1];
  if (/^\d+\.\d{2}$/.test(raw) && !/^\d+\.\d{3}$/.test(raw)) {
    const v = parseFloat(raw);
    if (v < 100) return Math.round(v * 1000);
  }
  return parseInt(raw.replace(/\./g, ""), 10);
}

function detectTalle(name) {
  const s = String(name);
  if (/41EUR/i.test(s)) return "41";
  if (/T\.?\s*S\/M\b/i.test(s)) return "S/M";
  if (/T\.?\s*M\/44\b/i.test(s)) return "M/44";
  if (/T\.?\s*85-90\b/i.test(s)) return "85-90";
  const patterns = [
    /Talle\s+(\d{2})\s*europeo/i,
    /CN\s*(\d{1,2}\s*[-/]\s*\d{1,2})/i,
    /T\.?\s*(\d{1,2}\s*[-/]\s*\d{1,2}\s*(?:años?|M|meses)?)/i,
    /T\.?\s*(6XL|5XL|4XL|3XL|2XL|XXL|XL|XS|S|M|L)\b/i,
    /T\.?\s*(XXI)\b/i,
    /\bT\.?\s*(\d{2}-\d{2})\b/,
    /\bT\.?\s*(\d{2})\b/,
    /\bT(\d{2})\b/,
    /T\.?\s*(\d{1,2})\s*años?/i,
    /(\d{1,2}[-/]\d{1,2}\s*M)/i,
    /(\d{1,2}-\d{1,2}\s*años?)/i,
    /(\d{1,2}\/\d{1,2}\s*Años?)/i,
    /eur\s*(\d{2})/i,
    /cm\s*(\d{2}\/\d{2})/i,
    /T\.?\s*(I)\b/,
    /T\.?\s*(\d{1,2})\b/,
    /(\d{1,2}\s*años?)/i,
  ];
  for (const p of patterns) {
    const m = s.match(p);
    if (!m) continue;
    let t = (m[1] || "").trim().replace(/\s+/g, " ");
    if (/^xxi$/i.test(t)) return "XXL";
    if (/^i$/i.test(t)) return "L";
    if (/^(6XL|5XL|4XL|3XL|2XL|XXL|XL|XS|S|M|L)$/i.test(t)) return t.toUpperCase();
    return t;
  }
  const m2 = s.match(/\b(XL|XXL|XS|S|M|L)\s*$/i);
  return m2 ? m2[1].toUpperCase() : "";
}

/** Valores permitidos por el importador: Mujer | Hombre | Niño */
function detectGenero(name) {
  const n = name.toLowerCase();
  if (/\bhombre\b|\bboxer\b|\bcalzoncillos\b|\bt[aá]ctico\b|\bnova men\b/.test(n)) return "Hombre";
  if (/\bniña\b|\bnena\b|\bniño\b|\bbebe\b|\bbebé\b|baby shoes|\bbaby\b/.test(n)) return "Niño";
  if (
    /\d[-/]\d\s*(años?|m)\b|\d+\s*años?|\d+\/\d+m|\d+-\d+m|años|\/\d+M|\d+-\d+M|18-24|6-9M|9-12M|12\/18M/i.test(
      n,
    )
  ) {
    if (/hombre/.test(n)) return "Hombre";
    return "Niño";
  }
  if (/\bunisex\b/.test(n)) return "Mujer";
  if (
    /\bmujer\b|\bfem\b|\bcors[eé]t\b|\bcorset\b|\bpollera\b|\bvestido\b|\bcartera\b|\bbody\b|\bculott|\bguantes|\bguillerminas|\bsandalias|\bcorpiño\b|\btop\b|\bblusa\b|\bkimono\b|\bpalazzo\b|\bfaja\b|\bblazer\b|bikini|\bbaby tee|\benterito|\bmonito|\bjardiner|\bseñora\b/.test(
      n,
    )
  )
    return "Mujer";
  // Default: mystery box mayormente mujer
  return "Mujer";
}

/**
 * Valores permitidos: Remera, Buzo, Camisa, Pantalón, Campera, Zapatilla.
 * Categorías finas no soportadas se mapean a la más cercana.
 */
function detectCategoria(name) {
  const n = name.toLowerCase();
  if (
    /\b(zapat|sandalia|guillermina|mocasin|mokasin|chinelo|pantufla|borsego|zapas|baby shoes|zapatito|stiletto|zapaton)\b/.test(
      n,
    )
  )
    return "Zapatilla";
  if (
    /\bcampera\b|\bcamperita\b|\btapado\b|\bjacket\b|\bchaquet|\bchamarra\b|\bpiloto\b|\bcasaca\b|\bblazer\b|\bchaleco\b|\bchalequito\b|\bsaquito\b|\bcanguro\b|\btrench\b|\bkimono\b/.test(
      n,
    )
  )
    return "Campera";
  if (/\bbuzo\b|\bsu[eé]ter\b/.test(n)) return "Buzo";
  if (/\bcamisa\b|\bchomba\b|\bblusa\b|\bpolo\b/.test(n)) return "Camisa";
  if (
    /\bpantal[oó]n\b|\bpalazzo\b|\bjogging\b|\bshort\b|\bbermuda\b|\bcargo\b|\bculott|\bboxer\b|\bcalzoncillo\b|\bpollera\b|\bcapri\b|\bbombacha\b|\bcalza\b|\bcalsa\b|\bjean\b/.test(
      n,
    )
  )
    return "Pantalón";
  if (
    /\bremera\b|\bmusculosa\b|\btop\b|\bcamiseta\b|\bpolera\b|\bbaby tee\b|\bremeron\b|\bremerita\b|\bcamisola\b|\bbody\b|\bbodi\b|\bcorpiño\b|\bcors[eé]t\b|\bcorset\b|bikini|\bvestido\b|\bmono\b|\benterito\b|\bmonito\b|\bjardiner|\bentero\b|\bpijama\b|\bconjunto\b|\btriple\b|\bdupla\b|\bmanga larga negra morley\b/.test(
      n,
    )
  )
    return "Remera";
  // Accesorios y resto → Remera (única categoría genérica disponible)
  return "Remera";
}

function parseInventory(raw) {
  raw = raw.replace(/\u2028/g, "\n").replace(/\ufeff/g, "").replace(/\u200b/g, "");
  const parts = raw.split(/CONTEO CAJA\s+(\d+)\s*\((\d+)\s*PIEZAS\)/);
  const boxes = [];
  for (let i = 1; i < parts.length; i += 3) {
    const num = Number(parts[i]);
    const target = Number(parts[i + 1]);
    const body = parts[i + 2] || "";
    const lines = [];
    for (const line of body.split(/\r?\n/)) {
      let s = line.trim();
      if (!s) continue;
      if (/^español/i.test(s)) continue;
      if (s.startsWith("</")) continue;
      s = s.replace(/^[\-–—•\t\s\u2043\u2022]+/, "").trim();
      if (!s) continue;
      if (/^CONTEO CAJA/i.test(s)) continue;
      s = s.replace(/\.+$/, "");
      lines.push(s);
    }
    boxes.push({ num, target, lines });
  }
  return boxes;
}

const rawPath = process.argv[2] || "/tmp/inventario_raw.txt";
const raw = readFileSync(rawPath, "utf8");
const boxes = parseInventory(raw);

const headers = [
  "SKU",
  "Lote",
  "Proveedor",
  "Nombre",
  "Categoría",
  "Género",
  "Talle",
  "Precio",
  "Costo",
  "Estado",
];
const rows = [headers];
let n = 0;
const counts = {};

for (const box of boxes) {
  const lote = `Caja ${box.num}`;
  counts[lote] = 0;
  for (const rawLine of box.lines) {
    n += 1;
    counts[lote] += 1;
    const precioRaw = parsePrice(rawLine);
    // Importador exige precio ≥ 0 (obligatorio). Sin precio en el listado → 0.
    const precio = precioRaw === "" ? 0 : precioRaw;
    const nombre = cleanName(rawLine);
    // Importador exige talle. Sin talle en el nombre → Único.
    const talle = detectTalle(rawLine) || detectTalle(nombre) || "Único";
    rows.push([
      `LS-${String(n).padStart(6, "0")}`,
      lote,
      "SHEIN",
      nombre,
      detectCategoria(nombre),
      detectGenero(nombre),
      talle,
      precio,
      6000,
      "Disponible",
    ]);
  }
}

const ws = XLSX.utils.aoa_to_sheet(rows);
ws["!cols"] = [
  { wch: 12 },
  { wch: 10 },
  { wch: 10 },
  { wch: 55 },
  { wch: 12 },
  { wch: 12 },
  { wch: 14 },
  { wch: 10 },
  { wch: 8 },
  { wch: 12 },
];
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Inventario");

const outMain = join(ROOT, "inventario-mysterybox-shein.xlsx");
const outPublic = join(ROOT, "apps/admin-web/public/exports/inventario-mysterybox-shein.xlsx");
mkdirSync(dirname(outPublic), { recursive: true });
XLSX.writeFile(wb, outMain);
copyFileSync(outMain, outPublic);
// also keep alternate filename used earlier
copyFileSync(outMain, join(ROOT, "inventario-mystery-box-shein.xlsx"));

console.log("TOTAL", n);
console.log("Declared piece sum", boxes.reduce((a, b) => a + b.target, 0));
for (const box of boxes) {
  console.log(`Caja ${box.num}: ${box.lines.length} productos (encabezado ${box.target} piezas)`);
}
console.log("Escrito:", outMain);
