import Image from "next/image"
import SignInWithGoogleButton from "./SignInWithGoogleButton"

export function LoginForm() {
  return (
    <div className="h-[85vh] flex overflow-hidden max-w-full">
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
      <div className="hidden md:flex flex-1 bg-[#F8F4FF] items-center justify-center md:rounded-l-xl">
  <div className="text-center p-4">
    <Image
      src="/logo.avif"
      alt="Safe or Not"
      width={250}
      height={80}
      className="max-w-full h-auto"
      unoptimized
    />
  </div>
</div>
    </div>
  )}