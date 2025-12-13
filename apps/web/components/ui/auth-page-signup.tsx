'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './button';

import {
	AtSignIcon,
	ChevronLeftIcon,
    UserIcon,
	Grid2x2PlusIcon,
} from 'lucide-react';
import { Input } from './input';
import { cn } from '@/utils';
import Image from 'next/image';
import { signIn, signUp } from '@/utils/auth-client';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { SectionDescription } from '@/components/Typography';


export function AuthPageSignup() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const next = searchParams?.get("next");
  
    const [loadingGoogle, setLoadingGoogle] = useState(false);
    const [loadingMicrosoft, setLoadingMicrosoft] = useState(false);
    const [loadingEmail, setLoadingEmail] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
  
    const handleEmailSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingEmail(true);
        try {
          await signUp.email(
            {
              email,
              password,
              name,
              callbackURL: "/welcome/business",
            },
            {
              onError: (ctx) => {
                toast.error(ctx.error.message);
                setLoadingEmail(false);
              },
              onSuccess: () => {
                router.push("/welcome/business");
              },
            },
          );
        } catch (err) {
          toast.error("Something went wrong");
          setLoadingEmail(false);
        }
      };
  
    const handleGoogleSignIn = async () => {
      setLoadingGoogle(true);
      await signIn.social({
        provider: "google",
        errorCallbackURL: "/login/error",
        callbackURL: "/welcome",
      });
      setLoadingGoogle(false);
    };
  
    const handleMicrosoftSignIn = async () => {
      setLoadingMicrosoft(true);
      await signIn.social({
        provider: "microsoft",
        errorCallbackURL: "/login/error",
        callbackURL: "/welcome",
      });
      setLoadingMicrosoft(false);
    };

	return (
		<main className="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2 text-foreground">
			<div className="bg-muted/60 relative hidden h-full flex-col border-r p-10 lg:flex">
				<div className="from-background absolute inset-0 z-10 bg-gradient-to-t to-transparent" />
				<div className="z-10 flex items-center gap-2">
					<p className="text-xl font-semibold font-title">Angri</p>
				</div>
				<div className="z-10 mt-auto">
					<blockquote className="space-y-2">
						<p className="text-xl">
							&ldquo;This Platform has helped me to save time and serve my
							clients faster than ever before.&rdquo;
						</p>
						<footer className="font-mono text-sm font-semibold">
							~ Ali Hassan
						</footer>
					</blockquote>
				</div>
				<div className="absolute inset-0">
					<FloatingPaths position={1} />
					<FloatingPaths position={-1} />
				</div>
			</div>
			<div className="relative flex min-h-screen flex-col justify-center p-4">
				<div
					aria-hidden
					className="absolute inset-0 isolate contain-strict -z-10 opacity-60"
				>
					<div className="bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)] absolute top-0 right-0 h-320 w-140 -translate-y-87.5 rounded-full" />
					<div className="bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] absolute top-0 right-0 h-320 w-60 [translate:5%_-50%] rounded-full" />
					<div className="bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] absolute top-0 right-0 h-320 w-60 -translate-y-87.5 rounded-full" />
				</div>
				<Button variant="ghost" className="absolute top-7 left-5" asChild>
					<a href="/">
						<ChevronLeftIcon className='size-4 me-2' />
						Home
					</a>
				</Button>
				<div className="mx-auto space-y-4 sm:w-sm w-full max-w-sm">
					<div className="flex items-center gap-2 lg:hidden">
						<p className="text-xl font-semibold font-title">Angri</p>
					</div>
					<div className="flex flex-col space-y-1">
						<h1 className="font-heading text-2xl font-bold tracking-wide">
							Join Now!
						</h1>
						<p className="text-muted-foreground text-base">
							Create your Angri account.
						</p>
					</div>
					<div className="space-y-2">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button type="button" size="lg" className="w-full" variant="outline">
                                    <Image
                                        src="/images/google.svg"
                                        alt="Google"
                                        width={16}
                                        height={16}
                                        className="mr-2"
                                        unoptimized
                                    />
                                    Continue with Google
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Inloggen</DialogTitle>
                                </DialogHeader>
                                <SectionDescription>
                                    Het gebruik en de overdracht door Angri AI van informatie
                                    ontvangen van Google API's aan een andere app voldoet aan het{" "}
                                    <a
                                        href="https://developers.google.com/terms/api-services-user-data-policy"
                                        className="underline underline-offset-4 hover:text-gray-900"
                                    >
                                        Google API Services User Data
                                    </a>{" "}
                                    Policy, inclusief de Limited Use-vereisten.
                                </SectionDescription>
                                <div>
                                    <Button loading={loadingGoogle} onClick={handleGoogleSignIn}>
                                        Ik ga akkoord
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
						
						<Button type="button" size="lg" className="w-full" variant="outline" onClick={handleMicrosoftSignIn} loading={loadingMicrosoft}>
                            <Image
                                src="/images/microsoft.svg"
                                alt="Microsoft"
                                width={16}
                                height={16}
                                className="mr-2"
                                unoptimized
                            />
							Continue with Microsoft
						</Button>
					</div>

					<AuthSeparator />

					<form className="space-y-2" onSubmit={handleEmailSignUp}>
						<p className="text-muted-foreground text-start text-xs">
							Enter your details to create an account
						</p>
                        <div className="relative h-max">
							<Input
								placeholder="Full Name"
								className="peer ps-9"
								type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
							/>
							<div className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
								<UserIcon className="size-4" aria-hidden="true" />
							</div>
						</div>
						<div className="relative h-max">
							<Input
								placeholder="your.email@example.com"
								className="peer ps-9"
								type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
							/>
							<div className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
								<AtSignIcon className="size-4" aria-hidden="true" />
							</div>
						</div>
                        <div className="relative h-max">
							<Input
								placeholder="Create Password (min 8 chars)"
								className="peer ps-9"
								type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={8}
							/>
							<div className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
								<Grid2x2PlusIcon className="size-4" aria-hidden="true" />
							</div>
						</div>

						<Button type="submit" className="w-full" loading={loadingEmail}>
							<span>Create Account</span>
						</Button>
					</form>
					<p className="text-muted-foreground mt-8 text-sm">
						By clicking continue, you agree to our{' '}
						<a
							href="/terms"
							className="hover:text-primary underline underline-offset-4"
						>
							Terms of Service
						</a>{' '}
						and{' '}
						<a
							href="/privacy"
							className="hover:text-primary underline underline-offset-4"
						>
							Privacy Policy
						</a>
						.
					</p>
                    <p className="text-center text-sm text-muted-foreground mt-4">
                        Already have an account?{" "}
                        <a
                        href="/login"
                        className="underline underline-offset-4 hover:text-primary"
                        >
                        Log in
                        </a>
                    </p>
				</div>
			</div>
		</main>
	);
}

function FloatingPaths({ position }: { position: number }) {
	const paths = Array.from({ length: 36 }, (_, i) => ({
		id: i,
		d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
			380 - i * 5 * position
		} -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
			152 - i * 5 * position
		} ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
			684 - i * 5 * position
		} ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
		color: `rgba(15,23,42,${0.1 + i * 0.03})`,
		width: 0.5 + i * 0.03,
	}));

	return (
		<div className="pointer-events-none absolute inset-0">
			<svg
				className="h-full w-full text-slate-950 dark:text-white"
				viewBox="0 0 696 316"
				fill="none"
			>
				<title>Background Paths</title>
				{paths.map((path) => (
					<motion.path
						key={path.id}
						d={path.d}
						stroke="currentColor"
						strokeWidth={path.width}
						strokeOpacity={0.1 + path.id * 0.03}
						initial={{ pathLength: 0.3, opacity: 0.6 }}
						animate={{
							pathLength: 1,
							opacity: [0.3, 0.6, 0.3],
							pathOffset: [0, 1, 0],
						}}
						transition={{
							duration: 20 + Math.random() * 10,
							repeat: Number.POSITIVE_INFINITY,
							ease: 'linear',
						}}
					/>
				))}
			</svg>
		</div>
	);
}

const AuthSeparator = () => {
	return (
		<div className="flex w-full items-center justify-center">
			<div className="bg-border h-px w-full" />
			<span className="text-muted-foreground px-2 text-xs">OR</span>
			<div className="bg-border h-px w-full" />
		</div>
	);
};
