/**
 * USERS TABLE
 * Table interactive pour gérer les utilisateurs
 */

'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Ban, CheckCircle, Gift } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  plan: string;
  isPremium: boolean;
  isBanned: boolean;
  banReason: string | null;
  freeUsed: number;
  tryOnsCount: number;
  paymentsCount: number;
  createdAt: string;
  premiumSince: string | null;
}

interface UsersTableProps {
  users: User[];
}

export default function UsersTable({ users }: UsersTableProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'premium' | 'free' | 'banned'>('all');

  // Filtrer les utilisateurs
  const filteredUsers = users.filter(user => {
    const matchSearch = user.email.toLowerCase().includes(search.toLowerCase()) ||
                       user.name.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === 'all' ||
      (filter === 'premium' && user.isPremium) ||
      (filter === 'free' && !user.isPremium) ||
      (filter === 'banned' && user.isBanned);

    return matchSearch && matchFilter;
  });

  const handleBanUser = async (userId: string, email: string) => {
    if (!confirm(`Voulez-vous vraiment bannir ${email} ?`)) return;

    const reason = prompt('Raison du bannissement :');
    if (!reason) return;

    try {
      const response = await fetch('/api/admin/users/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, reason }),
      });

      if (response.ok) {
        alert('Utilisateur banni avec succès');
        window.location.reload();
      } else {
        alert('Erreur lors du bannissement');
      }
    } catch (error) {
      console.error(error);
      alert('Erreur lors du bannissement');
    }
  };

  const handleUnbanUser = async (userId: string, email: string) => {
    if (!confirm(`Voulez-vous débannir ${email} ?`)) return;

    try {
      const response = await fetch('/api/admin/users/unban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        alert('Utilisateur débanni avec succès');
        window.location.reload();
      } else {
        alert('Erreur lors du débannissement');
      }
    } catch (error) {
      console.error(error);
      alert('Erreur lors du débannissement');
    }
  };

  const handleGiveCredits = async (userId: string, email: string) => {
    const credits = prompt(`Nombre de crédits gratuits à donner à ${email} :`);
    if (!credits || isNaN(Number(credits))) return;

    try {
      const response = await fetch('/api/admin/users/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, credits: Number(credits) }),
      });

      if (response.ok) {
        alert('Crédits ajoutés avec succès');
        window.location.reload();
      } else {
        alert('Erreur lors de l\'ajout de crédits');
      }
    } catch (error) {
      console.error(error);
      alert('Erreur lors de l\'ajout de crédits');
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Rechercher par email ou nom..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            Tous
          </Button>
          <Button
            variant={filter === 'premium' ? 'default' : 'outline'}
            onClick={() => setFilter('premium')}
            size="sm"
          >
            Premium
          </Button>
          <Button
            variant={filter === 'free' ? 'default' : 'outline'}
            onClick={() => setFilter('free')}
            size="sm"
          >
            Free
          </Button>
          <Button
            variant={filter === 'banned' ? 'default' : 'outline'}
            onClick={() => setFilter('banned')}
            size="sm"
          >
            Bannis
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Try-ons</TableHead>
              <TableHead>Paiements</TableHead>
              <TableHead>Inscrit le</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500">
                  Aucun utilisateur trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>
                    <Badge variant={user.isPremium ? 'default' : 'secondary'}>
                      {user.plan}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.tryOnsCount}
                    {!user.isPremium && (
                      <span className="text-xs text-gray-500 ml-1">
                        ({user.freeUsed}/2)
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{user.paymentsCount}</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {user.createdAt}
                  </TableCell>
                  <TableCell>
                    {user.isBanned ? (
                      <Badge variant="destructive">Banni</Badge>
                    ) : (
                      <Badge variant="outline">Actif</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user.isBanned ? (
                          <DropdownMenuItem
                            onClick={() => handleUnbanUser(user.id, user.email)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Débannir
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleBanUser(user.id, user.email)}
                            className="text-red-600"
                          >
                            <Ban className="w-4 h-4 mr-2" />
                            Bannir
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleGiveCredits(user.id, user.email)}
                        >
                          <Gift className="w-4 h-4 mr-2" />
                          Donner des crédits
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-gray-500">
        {filteredUsers.length} utilisateur(s) affiché(s)
      </p>
    </div>
  );
}
