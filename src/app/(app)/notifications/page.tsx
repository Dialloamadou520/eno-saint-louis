import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  BellOff,
  CheckCircle2,
  Info,
  TriangleAlert,
} from "lucide-react";
import { marquerCommeLue } from "@/app/(app)/notifications/actions";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getNotifications } from "@/lib/data/notifications";
import { formatDateHeure } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { NotificationType } from "@/lib/types";

export const metadata: Metadata = { title: "Notifications" };
export const dynamic = "force-dynamic";

const ICONES: Record<NotificationType, React.ReactNode> = {
  info: <Info className="size-5" />,
  succes: <CheckCircle2 className="size-5" />,
  alerte: <TriangleAlert className="size-5" />,
  erreur: <AlertTriangle className="size-5" />,
};

const COULEURS: Record<NotificationType, string> = {
  info: "bg-sky-50 text-sky-700",
  succes: "bg-brand-50 text-brand-700",
  alerte: "bg-amber-50 text-amber-700",
  erreur: "bg-red-50 text-red-700",
};

export default async function NotificationsPage() {
  const notifications = await getNotifications(50);
  const nonLues = notifications.filter((n) => !n.lu).length;

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Notifications"
        description={
          nonLues > 0
            ? `${nonLues} notification(s) non lue(s).`
            : "Toutes les notifications ont été lues."
        }
        action={
          nonLues > 0 ? (
            <form action={marquerCommeLue}>
              <Button type="submit" variant="outline">
                Tout marquer comme lu
              </Button>
            </form>
          ) : null
        }
      />

      {notifications.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center gap-3 py-14 text-slate-500">
            <BellOff className="size-8" />
            <p className="text-sm">Aucune notification pour le moment.</p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={cn(!notification.lu && "border-brand-200 bg-brand-50/30")}
            >
              <CardBody className="flex items-start gap-4">
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl",
                    COULEURS[notification.type]
                  )}
                >
                  {ICONES[notification.type]}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {notification.titre}
                  </p>
                  {notification.message ? (
                    <p className="mt-0.5 text-sm text-slate-600">
                      {notification.message}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDateHeure(notification.created_at)}
                  </p>
                  {notification.lien ? (
                    <Link
                      href={notification.lien}
                      className="mt-2 inline-block text-sm font-medium text-brand-700 hover:underline"
                    >
                      Ouvrir
                    </Link>
                  ) : null}
                </div>

                {notification.lu ? null : (
                  <form action={marquerCommeLue}>
                    <input type="hidden" name="id" value={notification.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
                    >
                      Marquer comme lu
                    </button>
                  </form>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
