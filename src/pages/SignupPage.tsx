import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { SEO } from "../components/SEO";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { ArrowRight, CheckCircle, Zap, Shield, Briefcase, User, Sparkles, AlertCircle, Info } from "lucide-react";

export function SignupPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Detect selected signup type
  const typeParam = searchParams.get("type");
  
  // Local state for selected mode: 'hire' (client) or 'work' (freelancer)
  const [signupType, setSignupType] = useState<"hire" | "work" | null>(null);
  
  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Client-specific form states
  const [companyName, setCompanyName] = useState("");
  const [projectBrief, setProjectBrief] = useState("");
  const [budgetSats, setBudgetSats] = useState("");
  
  // Freelancer-specific form states
  const [specialty, setSpecialty] = useState("");
  const [lightningAddress, setLightningAddress] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  
  // General flow states
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate the URL search parameter on load and route transitions
  useEffect(() => {
    if (typeParam === "hire") {
      setSignupType("hire");
      setErrorMsg("");
    } else if (typeParam === "work") {
      setSignupType("work");
      setErrorMsg("");
    } else {
      // If type param is missing or invalid, make sure we show selection
      // But if there was a param and it was invalid, we can gracefully reset/warn
      if (typeParam !== null && typeParam !== "hire" && typeParam !== "work") {
        // Redirect to the clean default signup page without invalid params
        setSearchParams({});
      }
      setSignupType(null);
    }
  }, [typeParam, setSearchParams]);

  const handleSelectType = (selected: "hire" | "work") => {
    // This updates the URL param, which triggers the useEffect above
    setSearchParams({ type: selected });
  };

  const handleResetType = () => {
    setName("");
    setEmail("");
    setPassword("");
    setCompanyName("");
    setProjectBrief("");
    setBudgetSats("");
    setSpecialty("");
    setLightningAddress("");
    setPortfolioUrl("");
    setIsSuccess(false);
    setSearchParams({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    if (signupType === "work" && !lightningAddress.trim()) {
      setErrorMsg("Lightning payout address is required for freelancers to receive direct payouts.");
      return;
    }

    setIsSubmitting(true);

    // Simulate saving to local storage
    setTimeout(() => {
      const userData = {
        name,
        email,
        role: signupType === "hire" ? "Client" : "Freelancer",
        details: signupType === "hire" ? {
          companyName,
          projectBrief,
          budgetSats
        } : {
          specialty,
          lightningAddress,
          portfolioUrl
        },
        avatar: signupType === "hire" 
          ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
          : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        registeredAt: new Date().toISOString()
      };

      localStorage.setItem("registeredUser", JSON.stringify(userData));
      setIsSuccess(true);
      setIsSubmitting(false);
    }, 1000);
  };

  const handleGoToProfile = () => {
    navigate("/profile");
  };

  // SEO metadata depending on account preselection
  const pageTitle = signupType === "hire"
    ? "Hire Vetted Remote Bitcoin Freelancers - Register Client Account"
    : signupType === "work"
    ? "Find Remote Bitcoin Jobs - Register Freelancer Account"
    : "Join Bitlance - The Vetted Remote Bitcoin Job Marketplace";

  const pageDescription = signupType === "hire"
    ? "Sign up as a client to hire top-tier global remote engineers, designers, and technical writers who work for Bitcoin. Fund milestone contracts with instant Lightning settlement."
    : signupType === "work"
    ? "Sign up as a freelancer to discover curated remote Bitcoin-native roles. Earn hard currency and receive instant self-custodial payouts directly to your Lightning address."
    : "Register a secure, KYC-free account on Bitlance to hire vetted remote talent or work in the decentralized, borderless Bitcoin economy.";

  const pageCanonical = signupType === "hire"
    ? "https://www.bitlance.work/signup?type=hire"
    : signupType === "work"
    ? "https://www.bitlance.work/signup?type=work"
    : "https://www.bitlance.work/signup";

  return (
    <div className="min-h-screen bg-[#FAF6EF] flex flex-col font-sans selection:bg-[#F2861D] selection:text-white">
      <SEO
        title={pageTitle}
        description={pageDescription}
        canonicalUrl={pageCanonical}
        orgSchema={true}
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Sign Up", item: `/signup${signupType ? `?type=${signupType}` : ""}` }
        ]}
      />
      <Navigation />

      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-12 min-h-[600px] animate-fade-in">
          
          {/* Left Feature Column */}
          <div className="md:col-span-5 bg-[#2A1E14] text-[#EAE4D8] p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#F2861D]/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10">
              <Link to="/" className="inline-flex items-center gap-2 mb-10 group">
                <div className="h-8 w-8 rounded-lg bg-[#F2861D] flex items-center justify-center text-white font-bold text-sm shadow-xs">
                  ₿
                </div>
                <span className="font-bold tracking-tight text-lg text-white group-hover:text-[#F2861D] transition-colors">Bitlance</span>
              </Link>

              {/* Dynamic Feature List based on account selection */}
              {signupType === "hire" ? (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold tracking-tight leading-tight md:text-3xl text-white">
                    Hire Bitcoin Developers
                  </h2>
                  <p className="text-[#9CA3AF] text-sm leading-relaxed">
                    Access vetted engineers, designers, and specialists who work for Bitcoin.
                  </p>
                  
                  <ul className="space-y-4 pt-4 text-sm text-[#EAE4D8]">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle className="w-5 h-5 text-[#F2861D] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block font-semibold">Pre-Vetted Proof of Work</strong>
                        <span className="text-[#9CA3AF] text-xs">Verified skills so you skip lengthy interviewing.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle className="w-5 h-5 text-[#F2861D] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block font-semibold">Milestone Payment Protection</strong>
                        <span className="text-[#9CA3AF] text-xs">Funds are secured until work is approved.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle className="w-5 h-5 text-[#F2861D] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block font-semibold">Minimal Platform Fees</strong>
                        <span className="text-[#9CA3AF] text-xs">Transparent 5% fee. No hidden markups.</span>
                      </div>
                    </li>
                  </ul>
                </div>
              ) : signupType === "work" ? (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold tracking-tight leading-tight md:text-3xl text-white">
                    Work Online. Get Paid in Bitcoin.
                  </h2>
                  <p className="text-[#9CA3AF] text-sm leading-relaxed">
                    Find high-value work from Bitcoin-native companies worldwide.
                  </p>
                  
                  <ul className="space-y-4 pt-4 text-sm text-[#EAE4D8]">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle className="w-5 h-5 text-[#F2861D] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block font-semibold">Zero Commission on Payouts</strong>
                        <span className="text-[#9CA3AF] text-xs">Freelancers keep 100% of their earnings.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle className="w-5 h-5 text-[#F2861D] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block font-semibold">Fast Lightning Payments</strong>
                        <span className="text-[#9CA3AF] text-xs">Settled directly to your Lightning address.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle className="w-5 h-5 text-[#F2861D] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block font-semibold">Reputation Tied to Work</strong>
                        <span className="text-[#9CA3AF] text-xs">Your portfolio and code speak for themselves.</span>
                      </div>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold tracking-tight leading-tight md:text-3xl text-white">
                    Work Online. Get Paid in Bitcoin.
                  </h2>
                  <p className="text-[#9CA3AF] text-sm leading-relaxed">
                    The simplest freelance platform built for the Bitcoin economy.
                  </p>
                  
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#F2861D]/15 rounded-lg flex items-center justify-center text-[#F2861D] font-bold text-xs shrink-0">
                        ⚡
                      </div>
                      <p className="text-xs text-[#EAE4D8] font-medium">Fast and low-fee payments via Lightning Network.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#F2861D]/15 rounded-lg flex items-center justify-center text-[#F2861D] font-bold text-xs shrink-0">
                        0%
                      </div>
                      <p className="text-xs text-[#EAE4D8] font-medium">We keep platform fees minimal so you earn more.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="relative z-10 pt-8 mt-10">
              <p className="text-xs text-[#9CA3AF] font-medium flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#F2861D]" /> Payment protection on every contract
              </p>
            </div>
          </div>

          {/* Right Action Column */}
          <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center bg-white">
            
            {/* 1. Account type selection screen (if parameter is missing/invalid) */}
            {!signupType && !isSuccess && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] tracking-tight mb-2">
                    Create Your Account
                  </h1>
                  <p className="text-[#6B6B6B] text-sm">
                    Choose how you want to use Bitlance.
                  </p>
                </div>

                <div className="grid gap-4">
                  {/* Employer Choice */}
                  <button
                    onClick={() => handleSelectType("hire")}
                    className="flex items-start gap-4 p-5 rounded-2xl bg-black/[0.02] hover:bg-[#FAF6EF] text-left transition-all group cursor-pointer shadow-2xs"
                  >
                    <div className="w-10 h-10 bg-[#FAF6EF] text-[#F2861D] rounded-xl flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#F2861D]/10 transition-colors">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#1A1A1A] text-base group-hover:text-[#F2861D] transition-colors flex items-center justify-between">
                        I want to Hire Talent
                        <ArrowRight className="w-4 h-4 text-[#6B6B6B] group-hover:text-[#F2861D] group-hover:translate-x-1 transition-all" />
                      </h3>
                      <p className="text-xs text-[#6B6B6B] mt-1 leading-relaxed">
                        Find remote developers, designers, and specialists. Funds are secured until work is approved.
                      </p>
                    </div>
                  </button>

                  {/* Freelancer Choice */}
                  <button
                    onClick={() => handleSelectType("work")}
                    className="flex items-start gap-4 p-5 rounded-2xl bg-black/[0.02] hover:bg-[#FAF6EF] text-left transition-all group cursor-pointer shadow-2xs"
                  >
                    <div className="w-10 h-10 bg-[#FAF6EF] text-[#F2861D] rounded-xl flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#F2861D]/10 transition-colors">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#1A1A1A] text-base group-hover:text-[#F2861D] transition-colors flex items-center justify-between">
                        I want to Find Work
                        <ArrowRight className="w-4 h-4 text-[#6B6B6B] group-hover:text-[#F2861D] group-hover:translate-x-1 transition-all" />
                      </h3>
                      <p className="text-xs text-[#6B6B6B] mt-1 leading-relaxed">
                        Bid on Bitcoin jobs. Get paid in sats directly to your Lightning address.
                      </p>
                    </div>
                  </button>
                </div>

                <div className="pt-4 text-center">
                  <p className="text-xs text-[#6B6B6B]">
                    Already have an account? <Link to="/profile" className="text-[#F2861D] font-semibold hover:underline">Log In</Link>
                  </p>
                </div>
              </div>
            )}

            {/* 2. Success screen */}
            {isSuccess && (
              <div className="space-y-6 text-center animate-fade-in max-w-md mx-auto">
                <div className="w-16 h-16 bg-[#FAF6EF] text-[#16A34A] rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
                  <CheckCircle className="w-8 h-8" />
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-[#1A1A1A] tracking-tight mb-2">
                    Welcome to Bitlance
                  </h2>
                  <p className="text-sm text-[#6B6B6B]">
                    Your <strong className="text-[#1A1A1A]">{signupType === "hire" ? "Client" : "Freelancer"}</strong> profile was created successfully.
                  </p>
                </div>

                {signupType === "hire" ? (
                  <div className="bg-[#FAF6EF] rounded-2xl p-4 text-left text-xs leading-relaxed text-[#1A1A1A]">
                    <p className="font-bold mb-1 flex items-center gap-1.5 text-[#1A1A1A]">
                      <Info className="w-4 h-4 text-[#F2861D]" /> Next Steps:
                    </p>
                    <ul className="list-disc pl-4 space-y-1 mt-1 text-[#6B6B6B]">
                      <li>Configure your profile on your dashboard.</li>
                      <li>Post a job with milestone budgets denominated in sats.</li>
                      <li>Receive proposals from verified Bitcoin specialists.</li>
                    </ul>
                  </div>
                ) : (
                  <div className="bg-[#FAF6EF] rounded-2xl p-4 text-left text-xs leading-relaxed text-[#1A1A1A]">
                    <p className="font-bold mb-1 flex items-center gap-1.5 text-[#1A1A1A]">
                      <Info className="w-4 h-4 text-[#F2861D]" /> Next Steps:
                    </p>
                    <ul className="list-disc pl-4 space-y-1 mt-1 text-[#6B6B6B]">
                      <li>Your Lightning Address <code className="bg-white px-1.5 py-0.5 rounded font-mono text-[#1A1A1A]">{lightningAddress}</code> is configured.</li>
                      <li>Explore published guides and active jobs.</li>
                      <li>Apply directly with zero commission on payouts.</li>
                    </ul>
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleGoToProfile}
                    className="w-full bg-[#F2861D] hover:bg-[#D9740F] text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-2xs text-sm cursor-pointer"
                  >
                    Go to Dashboard
                  </button>
                  <button
                    onClick={handleResetType}
                    className="w-full bg-black/[0.04] hover:bg-black/[0.08] text-[#6B6B6B] font-semibold py-2.5 px-6 rounded-xl transition-all text-xs cursor-pointer"
                  >
                    Register another account
                  </button>
                </div>
              </div>
            )}

            {/* 3. Personalized Client/Freelancer registration forms */}
            {signupType && !isSuccess && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleResetType}
                    className="text-xs font-semibold text-[#6B6B6B] hover:text-[#1A1A1A] flex items-center gap-1 py-1 px-2.5 rounded-lg transition-all hover:bg-black/5 cursor-pointer"
                  >
                    ← Choose Type
                  </button>
                  <span className="text-xs font-semibold text-[#F2861D] flex items-center gap-1.5">
                    {signupType === "hire" ? <Briefcase className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                    {signupType === "hire" ? "Client Account" : "Freelancer Account"}
                  </span>
                </div>

                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] tracking-tight leading-tight">
                    {signupType === "hire" ? "Hire Bitcoin Freelancers" : "Work Online. Get Paid in Bitcoin."}
                  </h1>
                  <p className="text-[#6B6B6B] text-xs sm:text-sm mt-1">
                    {signupType === "hire" 
                      ? "Create a client profile to hire talent and fund project milestones."
                      : "Create a freelancer profile to browse work and receive Lightning payments."}
                  </p>
                </div>

                {errorMsg && (
                  <div className="bg-red-50 text-red-700 text-xs font-medium p-3.5 rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Common required fields */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#1A1A1A] mb-1.5">
                        Full Name <span className="text-[#F2861D]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alice Nakamoto"
                        className="w-full bg-black/[0.03] rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#F2861D] font-medium text-sm transition-all text-[#1A1A1A]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#1A1A1A] mb-1.5">
                        Email Address <span className="text-[#F2861D]">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alice@company.com"
                        className="w-full bg-black/[0.03] rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#F2861D] font-medium text-sm transition-all text-[#1A1A1A]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#1A1A1A] mb-1.5">
                      Password <span className="text-[#F2861D]">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-black/[0.03] rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#F2861D] font-medium text-sm transition-all text-[#1A1A1A]"
                    />
                  </div>

                  {/* Client-specific onboarding questions */}
                  {signupType === "hire" ? (
                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="block text-xs font-medium text-[#1A1A1A] mb-1.5">
                          Company Name <span className="text-[#6B6B6B] font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Acme Labs Inc."
                          className="w-full bg-black/[0.03] rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#F2861D] font-medium text-sm transition-all text-[#1A1A1A]"
                        />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-[#1A1A1A] mb-1.5">
                            Initial Project Brief
                          </label>
                          <input
                            type="text"
                            value={projectBrief}
                            onChange={(e) => setProjectBrief(e.target.value)}
                            placeholder="e.g. Integrate Lightning Network payments"
                            className="w-full bg-black/[0.03] rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#F2861D] font-medium text-sm transition-all text-[#1A1A1A]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#1A1A1A] mb-1.5">
                            Milestone Budget <span className="text-[#6B6B6B] font-normal">(sats)</span>
                          </label>
                          <input
                            type="number"
                            value={budgetSats}
                            onChange={(e) => setBudgetSats(e.target.value)}
                            placeholder="e.g. 5000000"
                            className="w-full bg-black/[0.03] rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#F2861D] font-medium text-sm transition-all text-[#1A1A1A]"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Freelancer-specific onboarding questions */
                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="block text-xs font-medium text-[#1A1A1A] mb-1.5">
                          Primary Specialty <span className="text-[#F2861D]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={specialty}
                          onChange={(e) => setSpecialty(e.target.value)}
                          placeholder="e.g. Lightning Network Integration (LND/CLN)"
                          className="w-full bg-black/[0.03] rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#F2861D] font-medium text-sm transition-all text-[#1A1A1A]"
                        />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-[#1A1A1A] mb-1.5">
                            Lightning Payout Address <span className="text-[#F2861D]">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={lightningAddress}
                            onChange={(e) => setLightningAddress(e.target.value)}
                            placeholder="satoshi@getalby.com"
                            className="w-full bg-black/[0.03] rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#F2861D] font-medium text-sm transition-all font-mono text-[#1A1A1A]"
                          />
                          <p className="text-[11px] text-[#6B6B6B] mt-1 leading-relaxed">
                            Approved payouts land directly in this self-custodial wallet.
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#1A1A1A] mb-1.5">
                            GitHub / Portfolio Link
                          </label>
                          <input
                            type="url"
                            value={portfolioUrl}
                            onChange={(e) => setPortfolioUrl(e.target.value)}
                            placeholder="https://github.com/satoshi"
                            className="w-full bg-black/[0.03] rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#F2861D] font-medium text-sm transition-all text-[#1A1A1A]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#F2861D] hover:bg-[#D9740F] disabled:opacity-60 text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-2xs text-sm mt-6 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      "Creating Account..."
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
