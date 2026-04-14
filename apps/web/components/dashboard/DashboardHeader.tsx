"use client";
import { User, Bell } from "lucide-react";
import { SemanticSearch } from "./SemanticSearch";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function DashboardHeader() {
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    async function getProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Fetch from profiles table
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();
          
          if (error || !profile) {
            setUserProfile({ 
                full_name: "Jason Admin", 
                role: "Master Administrator",
                designation: "Zonal Officer (Central Zone)"
            });
          } else {
            setUserProfile(profile);
          }
        } else {
            // AUTH FALLBACK FOR PUBLIC DEMO / AUDIT
            setUserProfile({ 
                full_name: "Jason Admin", 
                role: "Master Administrator",
                designation: "Institutional Intelligence Officer"
            });
        }
      } catch (e) {
          setUserProfile({ 
              full_name: "Jason Admin", 
              role: "Master Administrator",
              designation: "Institutional Intelligence"
          });
      }
    }
    getProfile();
  }, []);

  return (
    <header className="h-20 border-b flex flex-shrink-0 items-center justify-between px-8"
      style={{ background: 'var(--bg-void)', borderColor: 'var(--border-subtle)' }}>
      <div className="flex-1">
        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Regulatory Intelligence Overview
        </h2>
      </div>

      <div className="flex-[2] flex justify-center">
        <SemanticSearch />
      </div>
      <div className="flex items-center gap-4">
        <button className="w-8 h-8 rounded flex items-center justify-center transition-colors"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
          <Bell size={14} style={{ color: '#94A3B8' }} />
        </button>
        <div className="flex items-center gap-2 pl-4 border-l" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center">
            <User size={14} color="#000" />
          </div>
          <div className="text-xs">
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#E2E8F0' }}>
              {userProfile?.full_name || "Loading..."}
            </div>
            <div style={{ color: '#64748B', textTransform: 'capitalize' }}>
              {userProfile?.designation || "CDSCO User"} • {userProfile?.role || ""}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
