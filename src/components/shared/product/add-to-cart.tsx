"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { CartItem } from "../../../../types";
import { PlusIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { addItemToCart } from "@/lib/actions/cart.actions";

const AddToCart = ({ item }: { item: CartItem }) => {
  const router = useRouter();
  const { toast } = useToast();
  const handleAddToCart = async () => {
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
      description: `${item.name} has been added to your cart.`,
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
  };
  return (
    <Button className="w-full" type="button" onClick={handleAddToCart}>
      {" "}
      + Add To Cart{" "}
    </Button>
  );
};

export default AddToCart;
