import SignInWithGoogleButton from "./SignInWithGoogleButton"

export function LoginForm() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Sign in form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Get Started</h1>
            <p className="text-muted-foreground">Sign in to access your account</p>
          </div>

          <div className="space-y-4">
            <SignInWithGoogleButton/>
          </div>
        </div>
      </div>

      {/* Right side - App branding */}
      <div className="hidden md:flex flex-1 bg-black items-center justify-center">
        <div className="text-center">
          <h2 className="text-6xl font-bold text-white tracking-tight">Safora</h2>
          <div className="mt-4 w-24 h-1 bg-white mx-auto rounded-full"></div>
        </div>
      </div>
    </div>
  )}