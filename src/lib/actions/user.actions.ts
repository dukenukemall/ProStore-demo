"use server";

import { signInSchema, signUpSchema } from "../validators";
import { signIn, signOut } from "../../../auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { hashSync } from "bcrypt";
import { prisma } from "../../../db/prisma";
import { ZodError } from "zod";
import { formatError } from "../utils";

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

export async function signUpUser(prevState: unknown, formData: FormData) {
  try {
    const user = signUpSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });
    const plainPassword = user.password;
    user.password = hashSync(user.password, 10);
    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
        address: "",
      },
    });
    await signIn("credentials", {
      email: user.email,
      password: plainPassword,
      redirectTo: "/",
    });
    return { success: true, message: "Signed up successfully" };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return {
      success: false,
      message: formatError(error),
    };
  }
}
