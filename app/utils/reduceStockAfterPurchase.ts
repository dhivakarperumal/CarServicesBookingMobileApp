import {
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";

/**
 * Reduce product stock after successful order
 * - Reduces totalStock
 * - Reduces matching variant.stock
 * - Uses Firestore transaction (safe)
 */
export const reduceStockAfterPurchase = async (
  cartItems: any[]
) => {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new Error("EMPTY_CART");
  }

  await runTransaction(db, async (transaction) => {
    for (const item of cartItems) {
      /**
       * REQUIRED FIELDS:
       * item.docId
       * item.quantity
       * item.sku
       */

      if (!item.docId || !item.quantity) {
        throw new Error("INVALID_CART_ITEM");
      }

      const productRef = doc(db, "products", item.docId);
      const productSnap = await transaction.get(productRef);

      if (!productSnap.exists()) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      const product = productSnap.data();

      /* ===== TOTAL STOCK CHECK ===== */
      if (
        typeof product.totalStock !== "number" ||
        product.totalStock < item.quantity
      ) {
        throw new Error(`OUT_OF_STOCK: ${item.name}`);
      }

      /* ===== VARIANT UPDATE ===== */
      let variantUpdated = false;

      const updatedVariants = Array.isArray(product.variants)
        ? product.variants.map((v: any) => {
            if (v.sku === item.sku) {
              if (v.stock < item.quantity) {
                throw new Error(
                  `VARIANT_OUT_OF_STOCK: ${item.name}`
                );
              }

              variantUpdated = true;

              return {
                ...v,
                stock: v.stock - item.quantity,
              };
            }

            return v;
          })
        : [];

      if (product.variants?.length && !variantUpdated) {
        throw new Error(`VARIANT_NOT_FOUND: ${item.name}`);
      }

      /* ===== UPDATE PRODUCT ===== */
      transaction.update(productRef, {
        totalStock: product.totalStock - item.quantity,
        variants: updatedVariants,
        updatedAt: serverTimestamp(),
      });
    }
  });
};