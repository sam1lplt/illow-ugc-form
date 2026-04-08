"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  RecaptchaVerifier, signInWithPhoneNumber, signInWithEmailAndPassword,
  ConfirmationResult
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Phone, Lock, Mail, Loader2, ArrowLeft } from "lucide-react";

declare global { interface Window { recaptchaVerifier: any; } }

export default function LoginPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<"phone" | "admin">("phone");
  const [step, setStep] = useState<"input" | "otp">("input");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && user) {
      router.push(isAdmin ? "/admin" : "/portal");
    }
  }, [user, loading, isAdmin, router]);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSubmitting(true);
    try {
      setupRecaptcha();
      // Format: ensure +90 prefix
      let formatted = phone.replace(/\s/g, "");
      if (!formatted.startsWith("+")) formatted = "+90" + formatted.replace(/^0/, "");
      const result = await signInWithPhoneNumber(auth, formatted, window.recaptchaVerifier);
      setConfirmation(result);
      setStep("otp");
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/invalid-phone-number") setError("Geçersiz telefon numarası formatı.");
      else if (err.code === "auth/too-many-requests") setError("Çok fazla deneme. Lütfen bekleyin.");
      else setError("SMS gönderilemedi. Numarayı kontrol et.");
      window.recaptchaVerifier = null;
    } finally { setSubmitting(false); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmation) return;
    setError(""); setSubmitting(true);
    try {
      await confirmation.confirm(otp);
      // useEffect will redirect
    } catch {
      setError("Hatalı doğrulama kodu. Tekrar dene.");
      setSubmitting(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // useEffect will redirect
    } catch (err: any) {
      if (err.code === "auth/wrong-password" || err.code === "auth/user-not-found")
        setError("E-posta veya şifre hatalı.");
      else setError("Giriş başarısız.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-purple-700/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-indigo-700/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="glass-card w-full max-w-sm p-8 relative z-10">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">☁️</div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
            {mode === "admin" ? "HQ Girişi" : "Creator Portal"}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {mode === "admin" ? "Yönetici hesabınızla giriş yapın" : "Telefon numaranızla giriş yapın"}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/40 text-red-200 text-sm p-3 rounded-xl mb-5 text-center">
            {error}
          </div>
        )}

        {/* PHONE MODE */}
        {mode === "phone" && step === "input" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs text-purple-200/70 uppercase tracking-wider mb-2">Telefon Numarası</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="5XX XXX XX XX" required
                  className="input-glass pl-10"
                />
              </div>
            </div>
            <div id="recaptcha-container" ref={recaptchaRef} />
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Doğrulama Kodu Gönder"}
            </button>
          </form>
        )}

        {mode === "phone" && step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <button type="button" onClick={() => setStep("input")} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white mb-2 transition-colors">
              <ArrowLeft className="w-3 h-3" /> Numarayı değiştir
            </button>
            <div>
              <label className="block text-xs text-purple-200/70 uppercase tracking-wider mb-2">SMS Kodu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text" value={otp} onChange={e => setOtp(e.target.value)}
                  placeholder="6 haneli kod" maxLength={6} required
                  className="input-glass pl-10 text-center tracking-[0.5em] text-lg"
                />
              </div>
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Giriş Yap →"}
            </button>
          </form>
        )}

        {/* ADMIN MODE */}
        {mode === "admin" && (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <button type="button" onClick={() => setMode("phone")} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white mb-2 transition-colors">
              <ArrowLeft className="w-3 h-3" /> Creator girişine dön
            </button>
            <div>
              <label className="block text-xs text-purple-200/70 uppercase tracking-wider mb-2">E-Posta</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@pillowmarket.com.tr" required className="input-glass pl-10" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-purple-200/70 uppercase tracking-wider mb-2">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="input-glass pl-10" />
              </div>
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sisteme Gir"}
            </button>
          </form>
        )}
      </div>

      {/* HQ link — bottom right */}
      <button
        onClick={() => { setMode(mode === "admin" ? "phone" : "admin"); setError(""); setStep("input"); }}
        className="fixed bottom-5 right-5 text-xs text-gray-600 hover:text-gray-400 transition-colors opacity-60 hover:opacity-100 uppercase tracking-widest"
      >
        {mode === "admin" ? "Creator Girişi" : "HQ Girişi"}
      </button>
    </div>
  );
}
