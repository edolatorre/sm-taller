import puppeteer from "puppeteer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, "flujo-plataforma-sm-em.html");
const pdfPath = path.join(__dirname, "Flujo-Plataforma-SM-EM.pdf");

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle0" });
await page.pdf({
  path: pdfPath,
  format: "A4",
  printBackground: true,
  margin: { top: "15mm", bottom: "15mm", left: "12mm", right: "12mm" },
});
await browser.close();
console.log(`PDF generado: ${pdfPath}`);
