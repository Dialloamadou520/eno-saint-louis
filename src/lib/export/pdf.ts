import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { SITE } from "@/lib/constants";
import { formatDateHeure } from "@/lib/format";
import type { Rapport } from "@/lib/rapports";

/** Rendu PDF paysage d'un rapport, en-tête ENO et pied de page numéroté. */
export function rapportVersPdf(rapport: Rapport): Uint8Array {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const largeur = doc.internal.pageSize.getWidth();

  doc.setFillColor(4, 120, 87);
  doc.rect(0, 0, largeur, 64, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.text(SITE.name.toUpperCase(), 40, 28);
  doc.setFontSize(9);
  doc.text(SITE.tagline, 40, 44);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.text(rapport.titre, 40, 96);
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(rapport.sousTitre, 40, 113);

  const resume = rapport.resume
    .map((r) => `${r.label} : ${r.valeur}`)
    .join("     •     ");
  if (resume) doc.text(resume, 40, 131);

  autoTable(doc, {
    startY: 148,
    head: [rapport.colonnes],
    body: rapport.lignes,
    styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 40, right: 40, bottom: 46 },
  });

  const pages = doc.getNumberOfPages();
  const hauteur = doc.internal.pageSize.getHeight();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Édité le ${formatDateHeure(new Date().toISOString())}`, 40, hauteur - 24);
    doc.text(`Page ${page} / ${pages}`, largeur - 40, hauteur - 24, {
      align: "right",
    });
  }

  return new Uint8Array(doc.output("arraybuffer"));
}
