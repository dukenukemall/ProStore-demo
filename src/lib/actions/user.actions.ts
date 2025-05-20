"use server";

import { signInSchema } from "../validators";
import { signIn, signOut } from "../../../auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function signInWithCredentials(
  prevState: any,
  formData: FormData
) {
  try {
    const user = signInSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });
    const callbackUrl = formData.get("callbackUrl")?.toString() || "/";
    await signIn("credentials", {
      ...user,
      redirectTo: callbackUrl,
    });
    return { success: true, message: "Signed in successfully" };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { success: false, message: "Invalid email or password" };
  }
}

export async function signOutUser() {
  await signOut();
}
