"use server";

import { cookies } from "next/headers";
import { CartItem } from "../../../types";
import { convertToPlainObject, formatError, round2 } from "../utils";
import { auth } from "@/app/middleware";
import { prisma } from "../../../db/prisma";
import { Prisma } from "@prisma/client";
import { cartItemSchema, insertCartSchema } from "../validators";
import { revalidatePath } from "next/cache";

// calculate cart prices

const calcPrice = (items: CartItem[]) => {
  const itemsPrice = round2(
      items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0)
    ),
    shippingPrice = round2(itemsPrice > 100 ? 0 : 10),
    taxPrice = round2(itemsPrice * 0.15),
    totalPrice = round2(itemsPrice + shippingPrice + taxPrice);

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};

export async function addItemToCart(data: CartItem) {
  try {
    // check for cart cookie
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) {
      throw new Error("No session cart ID found");
    }

    // get session and user id

    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;

    // get cart

    const cart = await getMyCart();

    // parse and validate item

    const item = cartItemSchema.parse(data);

    // find product in database

    const product = await prisma.product.findFirst({
      where: {
        id: item.productId,
      },
    });
    if (!product) {
      throw new Error("Product not found");
    }

    if (!cart) {
      // create new cart object
      const newCart = insertCartSchema.parse({
        userId: userId,
        sessionCartId: sessionCartId,
        items: [item],
        ...calcPrice([item]),
      });
      // add to database
      await prisma.cart.create({
        data: newCart,
      });

      // revalidate product page
      revalidatePath(`/products/${product.slug}`);
      return {
        success: true,
        message: `${product.name} added to cart`,
        cart: data,
      };
    } else {
      // check if item already exists in cart
      const existItem = (cart.items as CartItem[]).find(
        (x) => x.productId === item.productId
      );
      // check if item exists
      if (existItem) {
        // check stock
        if (product.stock < existItem.quantity + 1) {
          throw new Error("Not enough stock");
        }
        // increase quantity
        (cart.items as CartItem[]).find(
          (x) => x.productId === item.productId
        )!.quantity = existItem.quantity + 1;
      } else {
        // if item does not exist in cart
        // check stock

        if (product.stock < 1) {
          throw new Error("Not enough stock");
        }
        // add item to the cart.items
        cart.items.push(item);
      }

      // save to database
      await prisma.cart.update({
        where: {
          id: cart.id,
        },
        data: {
          items: cart.items as Prisma.CartUpdateitemsInput[],
          ...calcPrice(cart.items as CartItem[]),
        },
      });

      // revalidate product page
      revalidatePath(`/products/${product.slug}`);
      return {
        success: true,
        message: `${product.name} ${
          existItem ? "updated in" : "added to"
        } cart`,
        cart: data,
      };
    }
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function getMyCart() {
  const sessionCartId = (await cookies()).get("sessionCartId")?.value;
  if (!sessionCartId) {
    throw new Error("No session cart ID found");
  }

  // get session and user id

  const session = await auth();
  const userId = session?.user?.id ? (session.user.id as string) : undefined;

  // get user cart from database
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId: userId } : { sessionCartId: sessionCartId },
  });

  if (!cart) return undefined;

  return convertToPlainObject({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
  });
}

export async function removeItemFromCart(productId: string) {
  try {
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) {
      throw new Error("No session cart ID found");
    }

    // get product
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
      },
    });
    if (!product) {
      throw new Error("Product not found");
    }

    // get user's cart
    const cart = await getMyCart();
    if (!cart) {
      throw new Error("Cart not found");
    }
    // check for item
    const existItem = (cart.items as CartItem[]).find(
      (x) => x.productId === productId
    );
    if (!existItem) {
      throw new Error("Item not found in cart");
    }

    // check if only one in quantity
    if (existItem.quantity === 1) {
      cart.items = (cart.items as CartItem[]).filter(
        (x) => x.productId !== productId
      );
    } else {
      (cart.items as CartItem[]).find(
        (x) => x.productId === productId
      )!.quantity = existItem.quantity - 1;
    }

    // save to database
    await prisma.cart.update({
      where: {
        id: cart.id,
      },
      data: {
        items: cart.items as Prisma.CartUpdateitemsInput[],
        ...calcPrice(cart.items as CartItem[]),
      },
    });

    // revalidate product page
    revalidatePath(`/products/${product.slug}`);
    return {
      success: true,
      message: `${product.name} removed from cart`,
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}
