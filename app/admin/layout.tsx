/**
 * ADMIN LAYOUT
 * Layout pour toutes les pages admin avec sidebar de navigation
 */

import { requireAdmin } from '@/lib/admin';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Flag,
  Settings,
  FileText,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Vérifier que l'utilisateur est admin (sinon redirect)
  const user = await requireAdmin();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Header Sidebar */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Admin Panel</h1>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <NavLink href="/admin" icon={LayoutDashboard}>
            Dashboard
          </NavLink>
          <NavLink href="/admin/users" icon={Users}>
            Utilisateurs
          </NavLink>
          <NavLink href="/admin/payments" icon={CreditCard}>
            Paiements
          </NavLink>
          <NavLink href="/admin/moderation" icon={Flag}>
            Modération
          </NavLink>
          <NavLink href="/admin/settings" icon={Settings}>
            Paramètres
          </NavLink>
          <NavLink href="/admin/reports" icon={FileText}>
            Rapports
          </NavLink>
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-gray-200">
          <Link href="/">
            <Button variant="outline" className="w-full justify-start" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Retour au site
            </Button>
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

/**
 * Composant NavLink pour la sidebar
 */
function NavLink({
  href,
  icon: Icon,
  children
}: {
  href: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900"
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{children}</span>
    </Link>
  );
}
