export function Logo({ className, ...props }: any) {
  return (
    <span
      className={`font-sans font-bold tracking-tight text-2xl text-foreground ${className}`}
      {...props}
    >
      ANGRI AI
    </span>
  );
}
