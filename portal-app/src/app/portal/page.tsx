"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Loader2, LogOut, Clock, CheckCircle, Truck, Video, CreditCard, Package } from "lucide-react";

const STEPS = [
  { id: "incelemede",       label: "İncelemede",    icon: Clock },
  { id: "onaylandi",        label: "Onaylandı",     icon: CheckCircle },
  { id: "kargo_sureci",     label: "Kargo Yolda",   icon: Truck },
  { id: "video_geldi",      label: "Video Girildi", icon: Video },
  { id: "odeme_tamamlandi", label: "Ödeme Yapıldı", icon: CreditCard },
];

export default function PortalPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [appData, setAppData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState("");
  const [iban, setIban] = useState("");
  const [msg, setMsg] = useState({ text: "", type: "" });

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/login"); return; }
    if (isAdmin) { router.push("/admin"); return; }
    loadData();
  }, [user, loading, isAdmin]);

  const loadData = async () => {
    if (!user?.phoneNumber) { setDataLoading(false); return; }
    try {
      const snap = await getDoc(doc(db, "applications", user.phoneNumber));
      if (snap.exists()) {
        const d = snap.data();
        setAppData(d);
        setVideoUrl(d.video_url || "");
        setIban(d.iban || "");
      }
    } catch (e) { console.error(e); }
    setDataLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.phoneNumber) return;
    try {
      await updateDoc(doc(db, "applications", user.phoneNumber), {
        video_url: videoUrl, iban, status: "video_geldi",
      });
      setAppData((p: any) => ({ ...p, video_url: videoUrl, iban, status: "video_geldi" }));
      setMsg({ text: "✅ Bilgiler kaydedildi!", type: "success" });
    } catch { setMsg({ text: "❌ Kayıt hatası, tekrar dene.", type: "error" }); }
  };

  const handleLogout = () => signOut(auth).then(() => router.push("/login"));

  if (loading || dataLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-purple-400" />
    </div>
  );

  if (!appData) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card p-8 text-center max-w-md">
        <div className="text-5xl mb-4">📋</div>
        <h2 className="text-xl font-bold mb-3">Başvuru Bulunamadı</h2>
        <p className="text-gray-400 text-sm mb-6">
          Bu numaraya ait başvuru sistemde yok.<br/>
          Ana sayfadan formu doldurman gerekiyor.
        </p>
        <button onClick={handleLogout} className="btn-primary mx-auto">Çıkış Yap</button>
      </div>
    </div>
  );

  const stepIdx = Math.max(STEPS.findIndex(s => s.id === appData.status), 0);

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="glass-card p-4 px-6 flex justify-between items-center mb-8">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
            Creator Dashboard ☁️
          </h1>
          <p className="text-sm text-gray-400">Hoş geldin, {appData.fullName || user?.phoneNumber}</p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-300 hover:text-red-100 transition-colors">
          <LogOut className="w-4 h-4" /> Çıkış
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* TIMELINE */}
          <div className="glass-card p-6">
            <h2 className="font-semibold mb-6 flex items-center gap-2 text-purple-200">
              <Clock className="w-5 h-5" /> Süreç Durumu
            </h2>
            <div className="relative">
              {/* Track line */}
              <div className="hidden md:block absolute top-5 left-5 right-5 h-0.5 bg-gray-700/60" />
              <div
                className="hidden md:block absolute top-5 h-0.5 bg-gradient-to-r from-purple-500 to-purple-300 transition-all duration-700"
                style={{ left: "5%", width: `${(stepIdx / (STEPS.length - 1)) * 90}%` }}
              />
              <div className="flex flex-col md:flex-row justify-between gap-4">
                {STEPS.map((s, i) => {
                  const Icon = s.icon;
                  const active = i <= stepIdx;
                  const current = i === stepIdx;
                  return (
                    <div key={s.id} className="flex md:flex-col items-center gap-3 md:gap-2 md:flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-500 shrink-0
                        ${active ? "bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]" : "bg-gray-800 text-gray-600 border border-gray-700"}
                        ${current ? "scale-110 ring-2 ring-purple-400/40 ring-offset-2 ring-offset-[#0b0a1a]" : ""}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-xs font-medium md:text-center leading-tight ${active ? "text-white" : "text-gray-600"}`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* KARGO */}
          {stepIdx >= 2 && (
            <div className="glass-card p-6 border-l-4 border-l-purple-500">
              <h2 className="font-semibold mb-3 flex items-center gap-2 text-purple-200">
                <Package className="w-5 h-5" /> Kargo Bilgileri
              </h2>
              {appData.kargo_kodu ? (
                <>
                  <p className="text-sm text-gray-400 mb-2">🎉 Kargon yola çıktı! Takip kodun:</p>
                  <div className="bg-black/40 border border-purple-500/20 rounded-xl px-5 py-4 flex items-center gap-3">
                    <Truck className="w-5 h-5 text-purple-400 shrink-0" />
                    <span className="font-mono text-xl tracking-widest text-purple-200">{appData.kargo_kodu}</span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-400">Ürünlerin hazırlanıyor. Takip kodu yakında eklenecek ⏳</p>
              )}
            </div>
          )}

          {/* VİDEO & IBAN */}
          <div className="glass-card p-6">
            <h2 className="font-semibold mb-5 flex items-center gap-2 text-purple-200">
              <Video className="w-5 h-5" /> Video & Ödeme Bilgileri
            </h2>
            {msg.text && (
              <div className={`text-sm p-3 rounded-xl mb-4 ${msg.type === "success" ? "bg-green-500/20 text-green-200 border border-green-500/30" : "bg-red-500/20 text-red-200 border border-red-500/30"}`}>
                {msg.text}
              </div>
            )}
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs text-purple-200/70 uppercase tracking-wider mb-2">Video Linki (TikTok / Reels / Drive)</label>
                <input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://..." className="input-glass" required />
              </div>
              <div>
                <label className="block text-xs text-purple-200/70 uppercase tracking-wider mb-2">Ad Soyad & IBAN</label>
                <input type="text" value={iban} onChange={e => setIban(e.target.value)} placeholder="Ad Soyad | TR00 0000 0000 0000 0000 0000 00" className="input-glass font-mono" required />
              </div>
              <button type="submit" className="btn-primary w-full">Bilgilerimi Kaydet 🚀</button>
            </form>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="glass-card p-6 h-fit lg:sticky lg:top-6">
          <h2 className="font-semibold mb-4 text-purple-300 border-b border-white/10 pb-3 text-sm">
            🎥 Video Çekim Rehberi
          </h2>
          <ul className="space-y-4 text-sm">
            {[
              ["✨", "Mekan Temizliği", "Aydınlık ve derli toplu bir ortam. Dağınık görüntü olmaz."],
              ["💡", "Işık", "Gün ışığı en iyisi. Net ve parlak görüntü şart."],
              ["🎣", "Hook", "İlk 3 saniye kritik. Güçlü bir kanca ile başla."],
              ["🗣️", "Doğallık", "Robota dönme. Arkadaşına anlatır gibi çek."],
              ["📦", "Ürün", "Dokunuşunu göster. Yumuşaklığı, desteği hissettir."],
            ].map(([e, t, d]) => (
              <li key={t} className="flex gap-3">
                <span className="text-lg shrink-0">{e}</span>
                <div>
                  <strong className="text-white text-xs block mb-0.5">{t}</strong>
                  <span className="text-gray-400 text-xs">{d}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
