import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { estAdmin, getProfilCourant } from "@/lib/data/auth";
import { compterNonLues } from "@/lib/data/notifications";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profil, notificationsNonLues] = await Promise.all([
    getProfilCourant(),
    compterNonLues(),
  ]);

  return (
    <div className="flex min-h-screen">
      <Sidebar estAdmin={estAdmin(profil)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar profil={profil} notificationsNonLues={notificationsNonLues} />
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
