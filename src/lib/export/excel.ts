import ExcelJS from "exceljs";
import { SITE } from "@/lib/constants";
import type { Rapport } from "@/lib/rapports";

/** Classeur Excel d'un rapport : en-tête, résumé, tableau et colonnes ajustées. */
export async function rapportVersExcel(rapport: Rapport): Promise<Uint8Array> {
  const classeur = new ExcelJS.Workbook();
  classeur.creator = SITE.name;
  classeur.created = new Date();

  const feuille = classeur.addWorksheet(rapport.titre.slice(0, 30));
  const nbColonnes = Math.max(rapport.colonnes.length, 2);

  feuille.mergeCells(1, 1, 1, nbColonnes);
  const titre = feuille.getCell(1, 1);
  titre.value = `${SITE.name} — ${rapport.titre}`;
  titre.font = { size: 14, bold: true, color: { argb: "FF0F172A" } };

  feuille.mergeCells(2, 1, 2, nbColonnes);
  const sousTitre = feuille.getCell(2, 1);
  sousTitre.value = rapport.sousTitre;
  sousTitre.font = { size: 10, color: { argb: "FF64748B" } };

  if (rapport.resume.length > 0) {
    feuille.mergeCells(3, 1, 3, nbColonnes);
    const resume = feuille.getCell(3, 1);
    resume.value = rapport.resume
      .map((r) => `${r.label} : ${r.valeur}`)
      .join("   •   ");
    resume.font = { size: 10, italic: true, color: { argb: "FF475569" } };
  }

  const ligneEntete = 5;
  const entete = feuille.getRow(ligneEntete);
  entete.values = rapport.colonnes;
  entete.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F172A" },
    };
    cell.alignment = { vertical: "middle" };
  });
  entete.commit();

  rapport.lignes.forEach((ligne, index) => {
    const row = feuille.getRow(ligneEntete + 1 + index);
    row.values = ligne;
    if (index % 2 === 1) {
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF8FAFC" },
        };
      });
    }
    row.commit();
  });

  rapport.colonnes.forEach((colonne, index) => {
    const longueurMax = rapport.lignes.reduce(
      (max, ligne) => Math.max(max, (ligne[index] ?? "").length),
      colonne.length
    );
    feuille.getColumn(index + 1).width = Math.min(42, Math.max(12, longueurMax + 2));
  });

  feuille.views = [{ state: "frozen", ySplit: ligneEntete }];
  feuille.autoFilter = {
    from: { row: ligneEntete, column: 1 },
    to: { row: ligneEntete, column: nbColonnes },
  };

  const buffer = await classeur.xlsx.writeBuffer();
  return new Uint8Array(buffer);
}
