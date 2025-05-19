"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { signInDefaultValues } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { signInWithCredentials } from "@/lib/actions/user.actions";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

const CredentialsSignInForm = () => {
    const [data, action] = useActionState(signInWithCredentials, {
        success: false,
        message: "",
    });

    const SignInButton = () => {
        const { pending } = useFormStatus();
        return (
            <Button className="w-full" variant="default" disabled={pending}>
                {pending ? "Signing in..." : "Sign In"}
            </Button>
        )
    }
  return (
    <>
      <form action={action}>
        <div className="space-y-6">
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            required
            autoComplete="email"
            defaultValue={signInDefaultValues.email}
          />
        </div>
        <div className="space-y-6">
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            required
            autoComplete="password"
            defaultValue={signInDefaultValues.password}
          />
        </div>
        <div>
            <SignInButton />
        </div>
        {data && !data.success && (
            <div className="text-center text-destructive">{data.message}</div>
        )}
        <div className="text-sm text-center text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/sign-up" target="_self" className="link">
            Sign Up
          </Link>
        </div>
      </form>
    </>
  );
};

export default CredentialsSignInForm;
