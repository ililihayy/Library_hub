import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Library, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLibrary } from "@/lib/store";
import {
  completeMfaLoginApi,
  isApiMode,
  loginApi,
  mfaConfirmApi,
  mfaSetupApi,
  registerApi,
} from "@/lib/api";
import { toast } from "sonner";

const Login = () => {
  const [params] = useSearchParams();
  const initialTab = params.get("signup") ? "signup" : "login";
  const [tab, setTab] = useState(initialTab);
  const navigate = useNavigate();

  const loginLocal = useLibrary((s) => s.login);
  const signupLocal = useLibrary((s) => s.signup);
  const setSessionFromApi = useLibrary((s) => s.setSessionFromApi);
  const switchRoleDemo = useLibrary((s) => s.switchRoleDemo);

  const [email, setEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [mfaChallengeToken, setMfaChallengeToken] = useState<string | null>(null);
  const [mfaCodeLogin, setMfaCodeLogin] = useState("");
  const [busy, setBusy] = useState(false);

  const [mfaEnrollEmail, setMfaEnrollEmail] = useState("");
  const [mfaEnrollPassword, setMfaEnrollPassword] = useState("");
  const [mfaEnrollSecret, setMfaEnrollSecret] = useState<string | null>(null);
  const [mfaEnrollUri, setMfaEnrollUri] = useState<string | null>(null);
  const [mfaEnrollConfirm, setMfaEnrollConfirm] = useState("");
  const [mfaEmailCode, setMfaEmailCode] = useState("");

  const goAfterAuth = (role: "librarian" | "reader") => {
    navigate(role === "librarian" ? "/admin" : "/catalog");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isApiMode()) {
      setBusy(true);
      try {
        const result = await loginApi({ email, password: loginPassword });
        if (result.step === "complete") {
          setSessionFromApi({
            id: String(result.user.id),
            fullName: result.user.fullName,
            email: result.user.email,
            phone: result.user.phone,
            address: result.user.address,
            role: result.user.role,
            blacklisted: result.user.blacklisted,
            joinedAt:
              typeof result.user.joinedAt === "string"
                ? result.user.joinedAt.slice(0, 10)
                : new Date(result.user.joinedAt).toISOString().slice(0, 10),
            mfaEnabled: result.user.mfaEnabled,
          });
          if (result.user.blacklisted) {
            toast.error("This account is blacklisted. Please contact your librarian.");
            return;
          }
          toast.success(`Welcome back, ${result.user.fullName.split(" ")[0]}`);
          goAfterAuth(result.user.role);
        } else {
          setMfaChallengeToken(result.challengeToken);
          toast.message("Two-factor authentication", {
            description: "Enter the code from your authenticator app.",
          });
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Sign in failed");
      } finally {
        setBusy(false);
      }
      return;
    }

    const u = loginLocal(email);
    if (!u) {
      toast.error("No account found. Try a demo account below.");
      return;
    }
    if (u.blacklisted) {
      toast.error("This account is blacklisted. Please contact your librarian.");
      return;
    }
    toast.success(`Welcome back, ${u.fullName.split(" ")[0]}`);
    goAfterAuth(u.role);
  };

  const handleMfaComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaChallengeToken || !isApiMode()) return;
    setBusy(true);
    try {
      const user = await completeMfaLoginApi(mfaChallengeToken, mfaCodeLogin);
      if (user.blacklisted) {
        toast.error("This account is blacklisted. Please contact your librarian.");
        return;
      }
      setSessionFromApi(user);
      setMfaChallengeToken(null);
      setMfaCodeLogin("");
      toast.success(`Welcome back, ${user.fullName.split(" ")[0]}`);
      goAfterAuth(user.role);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "MFA verification failed");
    } finally {
      setBusy(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword !== signupConfirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (signupPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (isApiMode()) {
      setBusy(true);
      try {
        const user = await registerApi({
          fullName: signupData.fullName,
          email: signupData.email,
          phone: signupData.phone,
          address: signupData.address,
          password: signupPassword,
          confirmPassword: signupConfirmPassword,
        });
        setSessionFromApi(user);
        toast.success(`Welcome to Athenaeum, ${user.fullName.split(" ")[0]}!`);
        goAfterAuth("reader");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Registration failed");
      } finally {
        setBusy(false);
      }
      return;
    }

    const u = signupLocal({ ...signupData, role: "reader" });
    toast.success(`Welcome to Athenaeum, ${u.fullName.split(" ")[0]}!`);
    goAfterAuth("reader");
  };

  const demoAs = (role: "librarian" | "reader") => {
    switchRoleDemo(role);
    toast.success(`Signed in as a ${role}`);
    goAfterAuth(role);
  };

  const handleMfaSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isApiMode()) {
      toast.error("Set VITE_API_URL to use MFA enrollment.");
      return;
    }
    setBusy(true);
    try {
      const res = await mfaSetupApi(mfaEnrollEmail, mfaEnrollPassword);
      setMfaEnrollSecret(res.secret);
      setMfaEnrollUri(res.otpauthUri);
      setMfaEmailCode("");
      if (res.emailSent) {
        toast.success("We sent a 6-digit code to your email. Add the app, then enter email + authenticator codes below.");
      } else {
        toast.message("MFA setup (dev)", {
          description: "Email was not sent; the code is printed in the API server logs. Check MFA_EMAIL_LOG_CODE_IN_DEV.",
        });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "MFA setup failed");
    } finally {
      setBusy(false);
    }
  };

  const handleMfaEnrollConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isApiMode()) return;
    setBusy(true);
    try {
      await mfaConfirmApi(mfaEnrollEmail, mfaEnrollPassword, mfaEnrollConfirm, mfaEmailCode);
      setMfaEnrollSecret(null);
      setMfaEnrollUri(null);
      setMfaEnrollConfirm("");
      setMfaEmailCode("");
      toast.success("Two-factor authentication is now enabled for your account.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not confirm MFA");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden bg-gradient-hero text-primary-foreground lg:flex">
        <div className="flex flex-1 flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-foreground/15">
              <Library className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-semibold">Athenaeum</span>
          </Link>

          <div>
            <h2 className="font-display text-5xl font-semibold leading-tight">
              "A library is not a luxury but one of the necessities of life."
            </h2>
            <p className="mt-4 text-primary-foreground/70">— Henry Ward Beecher</p>
          </div>

          <p className="text-sm text-primary-foreground/60">
            {isApiMode()
              ? "API mode — accounts and passwords are managed by the backend."
              : "Demo mode — data is stored locally in your browser."}
          </p>
        </div>
      </aside>

      <div className="flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-hero text-primary-foreground">
              <Library className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-semibold">Athenaeum</span>
          </Link>

          <h1 className="font-display text-3xl font-semibold">
            {tab === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {tab === "login"
              ? "Sign in to continue to your dashboard."
              : "Join Athenaeum as a reader and start borrowing."}
          </p>

          {mfaChallengeToken && isApiMode() ? (
            <form onSubmit={handleMfaComplete} className="mt-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit code from your authenticator app.
              </p>
              <div className="space-y-2">
                <Label htmlFor="mfa-code">Authenticator code</Label>
                <Input
                  id="mfa-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={mfaCodeLogin}
                  onChange={(e) => setMfaCodeLogin(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                Verify and sign in
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setMfaChallengeToken(null);
                  setMfaCodeLogin("");
                }}
              >
                Back
              </Button>
            </form>
          ) : (
            <Tabs value={tab} onValueChange={setTab} className="mt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Log in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    Sign in
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full name</Label>
                    <Input
                      id="fullName"
                      value={signupData.fullName}
                      onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={signupData.phone}
                        onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={signupData.address}
                        onChange={(e) => setSignupData({ ...signupData, address: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Confirm password</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    Create account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}

          <div className="my-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Try the demo</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-auto flex-col items-start gap-1 p-4 text-left"
              onClick={() => demoAs("librarian")}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-accent" />
                <span className="font-medium">Librarian</span>
              </div>
              <span className="text-xs font-normal text-muted-foreground">Manage inventory, loans & users</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col items-start gap-1 p-4 text-left"
              onClick={() => demoAs("reader")}
            >
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span className="font-medium">Reader</span>
              </div>
              <span className="text-xs font-normal text-muted-foreground">Browse & reserve books</span>
            </Button>
          </div>

          {isApiMode() && (
            <div className="mt-10 rounded-xl border border-border bg-card p-4 shadow-soft">
              <h2 className="font-display text-lg font-semibold">Enable two-factor authentication</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                After registering, sign in once. We email you a confirmation code, then you confirm with your authenticator app.
              </p>
              <form onSubmit={handleMfaSetup} className="mt-4 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="mfa-email">Email</Label>
                  <Input
                    id="mfa-email"
                    type="email"
                    value={mfaEnrollEmail}
                    onChange={(e) => setMfaEnrollEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mfa-pass">Password</Label>
                  <Input
                    id="mfa-pass"
                    type="password"
                    value={mfaEnrollPassword}
                    onChange={(e) => setMfaEnrollPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" variant="secondary" className="w-full" disabled={busy}>
                  Generate MFA secret
                </Button>
              </form>
              {mfaEnrollSecret && mfaEnrollUri && (
                <form onSubmit={handleMfaEnrollConfirm} className="mt-4 space-y-3 border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground break-all font-mono">{mfaEnrollUri}</p>
                  <p className="text-xs">
                    <span className="text-muted-foreground">Manual key: </span>
                    <span className="font-mono">{mfaEnrollSecret}</span>
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="mfa-email-code">Code from email</Label>
                    <Input
                      id="mfa-email-code"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="6-digit code"
                      value={mfaEmailCode}
                      onChange={(e) => setMfaEmailCode(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mfa-confirm-code">Code from authenticator app</Label>
                    <Input
                      id="mfa-confirm-code"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={mfaEnrollConfirm}
                      onChange={(e) => setMfaEnrollConfirm(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    Confirm and enable MFA
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
