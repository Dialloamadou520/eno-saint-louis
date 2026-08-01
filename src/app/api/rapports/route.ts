import { NextResponse, type NextRequest } from "next/server";
import { PERIODES } from "@/lib/constants";
import { rapportVersExcel } from "@/lib/export/excel";
import { rapportVersPdf } from "@/lib/export/pdf";
import {
  TYPES_RAPPORT,
  construireRapport,
  type TypeRapport,
} from "@/lib/rapports";
import type { PeriodeHistorique } from "@/lib/types";

export const runtime = "nodejs";

const CONTENT_TYPES = {
  pdf: "application/pdf",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
} as const;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const type = params.get("type") ?? "";
  const format = params.get("format") ?? "pdf";
  const periode = params.get("periode") ?? "mois";

  if (!TYPES_RAPPORT.includes(type as TypeRapport)) {
    return NextResponse.json({ error: "Type de rapport inconnu." }, { status: 400 });
  }
  if (format !== "pdf" && format !== "xlsx") {
    return NextResponse.json({ error: "Format non supporté." }, { status: 400 });
  }
  if (!(periode in PERIODES)) {
    return NextResponse.json({ error: "Période inconnue." }, { status: 400 });
  }

  const rapport = await construireRapport(
    type as TypeRapport,
    periode as PeriodeHistorique
  );
  const contenu =
    format === "pdf"
      ? rapportVersPdf(rapport)
      : await rapportVersExcel(rapport);

  const nom = `eno-${type}-${periode}-${new Date().toISOString().slice(0, 10)}.${format}`;

  return new NextResponse(contenu as BodyInit, {
    headers: {
      "Content-Type": CONTENT_TYPES[format],
      "Content-Disposition": `attachment; filename="${nom}"`,
      "Cache-Control": "no-store",
    },
  });
}
