"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { LogOut, Loader2, ArrowRight, ExternalLink, Copy, Check, Package, ChevronDown, ChevronUp } from "lucide-react";

const COLS = [
  { id: "incelemede",       title: "📥 Yeni Başvurular",   color: "border-t-blue-500" },
  { id: "onaylandi",        title: "✅ Onaylandı",          color: "border-t-indigo-500" },
  { id: "kargo_sureci",     title: "📦 Video Bekleniyor",  color: "border-t-amber-500" },
  { id: "video_geldi",      title: "💳 Ödeme Bekleniyor",  color: "border-t-purple-500" },
  { id: "odeme_tamamlandi", title: "🎉 Tamamlananlar",     color: "border-t-green-500" },
];
const STATUS_ORDER = COLS.map(c => c.id);

export default function AdminPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [apps, setApps] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/login"); return; }
    if (!isAdmin) { router.push("/portal"); return; }

    const unsub = onSnapshot(collection(db, "applications"), (snap) => {
      setApps(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setDataLoading(false);
    });
    return () => unsub();
  }, [user, loading, isAdmin]);

  const advance = async (app: any, dir: "fwd" | "back") => {
    const ci = STATUS_ORDER.indexOf(app.status || "incelemede");
    const ni = dir === "fwd" ? ci + 1 : ci - 1;
    if (ni < 0 || ni >= STATUS_ORDER.length) return;
    const newStatus = STATUS_ORDER[ni];

    const updates: any = { status: newStatus };
    if (newStatus === "kargo_sureci") {
      if (!trackingInputs[app.id]) return alert("Lütfen kargo takip kodu gir!");
      updates.kargo_kodu = trackingInputs[app.id];
    }
    await updateDoc(doc(db, "applications", app.id), updates);
  };

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading || dataLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-purple-400" />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6 overflow-hidden h-screen">
      {/* Header */}
      <header className="glass-card p-4 px-6 flex justify-between items-center mb-5 shrink-0">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">Admin HQ Panel</h1>
          <p className="text-xs text-gray-400">Toplam {apps.length} başvuru</p>
        </div>
        <button onClick={() => signOut(auth).then(() => router.push("/login"))} className="flex items-center gap-2 text-sm text-red-300 hover:text-red-100 transition-colors">
          <LogOut className="w-4 h-4" /> Çıkış
        </button>
      </header>

      {/* Kanban */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex gap-4 h-full items-start" style={{ minWidth: `${COLS.length * 290}px` }}>
          {COLS.map(col => {
            const cards = apps.filter(a => (a.status || "incelemede") === col.id);
            const colIdx = STATUS_ORDER.indexOf(col.id);
            return (
              <div key={col.id} className={`w-68 flex flex-col glass rounded-2xl border-t-4 ${col.color} shrink-0`} style={{ width: 272 }}>
                <div className="flex items-center justify-between p-4 pb-2">
                  <h3 className="font-semibold text-sm text-white">{col.title}</h3>
                  <span className="bg-white/10 text-gray-300 text-xs px-2 py-0.5 rounded-full font-bold">{cards.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ maxHeight: "calc(100vh - 150px)" }}>
                  {cards.map(app => {
                    const expanded = expandedId === app.id;
                    return (
                      <div key={app.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-purple-400/30 transition-all">
                        {/* Card body */}
                        <div className="p-3">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-white text-sm truncate">{app.fullName || "—"}</span>
                            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono shrink-0 ml-1">
                              {app.budget ? `₺${app.budget}` : "—"}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 font-mono mb-2">{app.phone || app.id}</p>
                          <div className="flex gap-3 text-xs">
                            {app.social_url && (
                              <a href={app.social_url?.startsWith("http") ? app.social_url : `https://${app.social_url}`} target="_blank" rel="noreferrer" className="text-purple-400 hover:text-purple-200 flex items-center gap-1">
                                <ExternalLink className="w-3 h-3" /> Profil
                              </a>
                            )}
                            {app.ugc_video && (
                              <a href={app.ugc_video?.startsWith("http") ? app.ugc_video : `https://${app.ugc_video}`} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-200 flex items-center gap-1">
                                <ExternalLink className="w-3 h-3" /> Video
                              </a>
                            )}
                          </div>
                          <button onClick={() => setExpandedId(expanded ? null : app.id)} className="mt-2 text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors">
                            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            {expanded ? "Gizle" : "Detay"}
                          </button>
                        </div>

                        {/* Expanded */}
                        {expanded && (
                          <div className="border-t border-white/5 bg-black/20 p-3 space-y-3">
                            {col.id === "onaylandi" && (
                              <div>
                                <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">Kargo Kodunu Gir</label>
                                <input
                                  type="text"
                                  placeholder="MNG / PTT / Yurtiçi..."
                                  value={trackingInputs[app.id] || ""}
                                  onChange={e => setTrackingInputs(p => ({ ...p, [app.id]: e.target.value }))}
                                  className="w-full bg-white/5 border border-white/10 rounded-lg text-sm px-3 py-2 text-white focus:outline-none focus:border-purple-400"
                                />
                              </div>
                            )}
                            {app.kargo_kodu && col.id !== "onaylandi" && (
                              <div className="flex items-center gap-2 text-xs">
                                <Package className="w-3 h-3 text-purple-400" />
                                <span className="font-mono text-purple-200">{app.kargo_kodu}</span>
                              </div>
                            )}
                            {col.id === "video_geldi" && (
                              <div className="space-y-2">
                                {app.video_url && (
                                  <a href={app.video_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-purple-300 hover:underline truncate">
                                    <ExternalLink className="w-3 h-3 shrink-0" /> Video Linki
                                  </a>
                                )}
                                {app.iban && (
                                  <div className="bg-black/40 border border-white/5 rounded-lg p-2 flex items-center gap-2">
                                    <span className="text-xs font-mono text-gray-200 flex-1 break-all">{app.iban}</span>
                                    <button onClick={() => copy(app.iban, app.id)} className="text-gray-400 hover:text-white shrink-0">
                                      {copiedId === app.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 p-3 pt-0 justify-end border-t border-white/5">
                          {colIdx > 0 && (
                            <button onClick={() => advance(app, "back")} className="text-xs bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white px-2 py-1.5 rounded-lg transition-colors">←</button>
                          )}
                          {colIdx < STATUS_ORDER.length - 1 && (
                            <button onClick={() => advance(app, "fwd")} className={`text-xs text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors
                              ${col.id === "video_geldi" ? "bg-green-600 hover:bg-green-500" : "bg-purple-600 hover:bg-purple-500"}`}>
                              {col.id === "incelemede" ? "Onayla" : col.id === "onaylandi" ? "Kargola" : col.id === "kargo_sureci" ? "İlerlet" : "Ödendi ✓"}
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {cards.length === 0 && (
                    <div className="border border-dashed border-white/10 rounded-xl p-6 text-center text-gray-600 text-xs">Kayıt yok</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
