"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { CartItem, Cart } from "../../../../types";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { MinusIcon, PlusIcon, Loader } from "lucide-react";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import { useTransition } from "react";

const AddToCart = ({ item, cart }: { item: CartItem; cart?: Cart }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleAddToCart = async () => {
    startTransition(async () => {
      const rest = await addItemToCart(item);
      if (!rest.success) {
        toast({
          description: rest.message,
          variant: "destructive",
        });
        return;
      }
      // handle success
      toast({
        description: rest.message,
        action: (
          <ToastAction
            className="bg-primary text-white hover:bg-gray-800"
            altText="View Cart"
            onClick={() => router.push("/cart")}
          >
            Go To Cart
          </ToastAction>
        ),
      });
      router.refresh();
    });
  };

  // handle remove from cart
  const handleRemoveFromCart = async () => {
    startTransition(async () => {
      if (existItem && existItem.quantity === 1) {
        const rest = await removeItemFromCart(item.productId);
        if (!rest.success) {
          toast({
            description: rest.message,
            variant: "destructive",
          });
        } else {
          toast({
            description: `${item.name} removed from Cart`,
            variant: "default",
          });
        }
        router.refresh();
        return;
      }

      const rest = await removeItemFromCart(item.productId);
      if (!rest.success) {
        toast({
          description: rest.message,
          variant: rest.success ? "default" : "destructive",
        });
      }
      router.refresh();
    });
  };

  // check if item is in cart
  const existItem =
    cart && cart.items.find((x) => x.productId === item.productId);
  return existItem ? (
    <div>
      <Button type="button" variant="outline" onClick={handleRemoveFromCart}>
        <MinusIcon className="w-4 h-4" />
        {isPending && <Loader className="w-4 h-4 animate-spin" />}
      </Button>
      <span className="px-2">{existItem.quantity}</span>
      <Button type="button" variant="outline" onClick={handleAddToCart}>
        <PlusIcon className="w-4 h-4" />
        {isPending && <Loader className="w-4 h-4 animate-spin" />}
      </Button>
    </div>
  ) : (
    <Button className="w-full" type="button" onClick={handleAddToCart}>
      {" "}
      + Add To Cart {isPending && <Loader className="w-4 h-4 animate-spin" />}
    </Button>
  );
};

export default AddToCart;
