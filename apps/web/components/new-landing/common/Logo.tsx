import Link from "next/link";

interface LogoProps {
  variant?: "default" | "mobile" | "glass";
  className?: string;
}

export function Logo({ variant = "default", className }: LogoProps) {
  return (
    <Link href="/" className={className}>
      <span
        className={`font-sans font-bold tracking-tight ${
          variant === "mobile" ? "text-xl" : "text-2xl"
        } ${variant === "glass" ? "text-white" : "text-foreground"}`}
      >
        ANGRI AI
      </span>
    </Link>
  );
}
