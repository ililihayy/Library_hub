import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Library, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLibrary } from "@/lib/store";
import { toast } from "sonner";

const Login = () => {
  const [params] = useSearchParams();
  const initialTab = params.get("signup") ? "signup" : "login";
  const [tab, setTab] = useState(initialTab);
  const navigate = useNavigate();

  const login = useLibrary((s) => s.login);
  const signup = useLibrary((s) => s.signup);
  const switchRoleDemo = useLibrary((s) => s.switchRoleDemo);

  const [email, setEmail] = useState("");
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });

  const goAfterAuth = (role: "librarian" | "reader") => {
    navigate(role === "librarian" ? "/admin" : "/catalog");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const u = login(email);
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

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    const u = signup({ ...signupData, role: "reader" });
    toast.success(`Welcome to Athenaeum, ${u.fullName.split(" ")[0]}!`);
    goAfterAuth("reader");
  };

  const demoAs = (role: "librarian" | "reader") => {
    switchRoleDemo(role);
    toast.success(`Signed in as a ${role}`);
    goAfterAuth(role);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: brand panel */}
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
            Demo environment — data is stored locally in your browser.
          </p>
        </div>
      </aside>

      {/* Right: forms */}
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
                  <Input id="password" type="password" placeholder="••••••••" defaultValue="demo1234" />
                </div>
                <Button type="submit" className="w-full">Sign in</Button>
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
                <Button type="submit" className="w-full">Create account</Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Demo */}
          <div className="my-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Try the demo</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-auto flex-col items-start gap-1 p-4 text-left" onClick={() => demoAs("librarian")}>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-accent" />
                <span className="font-medium">Librarian</span>
              </div>
              <span className="text-xs font-normal text-muted-foreground">Manage inventory, loans & users</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col items-start gap-1 p-4 text-left" onClick={() => demoAs("reader")}>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span className="font-medium">Reader</span>
              </div>
              <span className="text-xs font-normal text-muted-foreground">Browse & reserve books</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
