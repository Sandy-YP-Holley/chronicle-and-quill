"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Search,
  ShieldCheck,
  Store,
  UserCheck,
  Shield,
} from "lucide-react";
import { useStore } from "@/context/store-context";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "buyer" | "seller" | "admin";
  sellerName?: string;
  sellerBio?: string;
  specialtyEra?: string;
  isApprovedSeller: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { showToast } = useStore();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      } else {
        showToast("Access restricted or failed to load user directory.", "error");
      }
    } catch {
      showToast("Network error fetching user directory.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    let result = [...users];

    if (roleFilter !== "All") {
      result = result.filter((u) => u.role === roleFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          u.name.toLowerCase().includes(q) ||
          (u.sellerName && u.sellerName.toLowerCase().includes(q)) ||
          u.id.toLowerCase().includes(q)
      );
    }

    setFilteredUsers(result);
  }, [users, roleFilter, searchQuery]);

  function getRoleBadge(role: string) {
    switch (role) {
      case "admin":
        return {
          label: "Master Overseer",
          bg: "bg-burgundy-700 text-parchment-50 border-gold-500",
          icon: Shield,
        };
      case "seller":
        return {
          label: "Archival Seller",
          bg: "bg-gold-300/40 text-burgundy-700 border-gold-500/40",
          icon: Store,
        };
      default:
        return {
          label: "Scholar Buyer",
          bg: "bg-stone-100 text-stone-700 border-stone-300",
          icon: UserCheck,
        };
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full animate-fadeIn">
      <div className="mb-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-xs font-cinzel text-stone-500 hover:text-burgundy-700 uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Overseer Suite</span>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-stone-200 gap-4">
        <div>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-ink-900">
            Scholar &amp; Seller Directory
          </h1>
          <p className="text-xs text-stone-500 font-serif mt-1">
            Registered guild accounts, dealership accreditations, and session roles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search email, name, bookstore..."
              className="w-full bg-white border border-stone-300 rounded-md py-2 pl-8 pr-3 text-xs text-ink-900 focus:outline-none focus:border-gold-500 font-serif"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-3" />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white border border-stone-300 rounded-md py-2 px-3 text-xs font-cinzel uppercase text-ink-900 focus:outline-none focus:border-gold-500 cursor-pointer"
          >
            <option value="All">All Roles</option>
            <option value="buyer">Buyers</option>
            <option value="seller">Sellers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2.5 text-xs font-mono text-emerald-800 mb-6">
        <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-700" />
        <span>
          Password Safety Enforced: Server queries explicitly omit password hashes via Mongo projection (`{`passwordHash: 0`}`).
        </span>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden mb-12">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-burgundy-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span className="font-cinzel text-xs uppercase text-stone-500">
              Retrieving Guild Member Ledger...
            </span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-8 h-8 text-stone-400 mx-auto mb-3" />
            <h3 className="font-cinzel text-sm font-bold text-ink-900 mb-1">
              No Matching Guild Members Found
            </h3>
            <p className="text-xs text-stone-500 font-serif">
              Try adjusting your query or role filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-serif">
              <thead className="bg-parchment-100/60 font-cinzel text-[11px] uppercase tracking-wider text-stone-600 border-b border-stone-200">
                <tr>
                  <th className="py-3.5 px-6">Guild Member</th>
                  <th className="py-3.5 px-4">Role Archetype</th>
                  <th className="py-3.5 px-4">Dealership Details</th>
                  <th className="py-3.5 px-4">Member ID</th>
                  <th className="py-3.5 px-6 text-right">Registration Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredUsers.map((u) => {
                  const badge = getRoleBadge(u.role);

                  return (
                    <tr key={u.id} className="hover:bg-parchment-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-parchment-200 text-ink-900 flex items-center justify-center font-cinzel font-bold text-xs shrink-0">
                            {u.name ? u.name[0].toUpperCase() : u.email[0].toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-ink-900 block text-xs">
                              {u.name}
                            </span>
                            <span className="font-mono text-[11px] text-stone-500">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] font-cinzel font-bold uppercase px-2.5 py-1 rounded border ${badge.bg}`}
                        >
                          <badge.icon className="w-3.5 h-3.5" />
                          <span>{badge.label}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {u.sellerName ? (
                          <div>
                            <span className="font-semibold text-ink-900 block">
                              {u.sellerName}
                            </span>
                            <span className="text-[11px] text-stone-500 block truncate max-w-xs">
                              {u.specialtyEra || "General Historical Folios"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-stone-400 font-mono text-[11px]">&mdash;</span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-mono text-[11px] text-stone-500 whitespace-nowrap">
                        {u.id.slice(-8)}
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-[11px] text-stone-500 whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
