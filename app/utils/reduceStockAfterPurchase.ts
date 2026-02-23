import {
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";

export const reduceStockAfterPurchase = async (
  cartItems: any[]
) => {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new Error("EMPTY_CART");
  }

  await runTransaction(db, async (transaction) => {
    /* =============================
       1️⃣ CREATE ALL REFERENCES
    ============================= */
    const productRefs = cartItems.map((item) => {
      if (!item.docId || !item.quantity) {
        throw new Error("INVALID_CART_ITEM");
      }
      return doc(db, "products", item.docId);
    });

    /* =============================
       2️⃣ READ ALL PRODUCTS FIRST
    ============================= */
    const productSnaps = await Promise.all(
      productRefs.map((ref) => transaction.get(ref))
    );

    /* =============================
       3️⃣ PROCESS & UPDATE
    ============================= */
    productSnaps.forEach((snap, index) => {
      if (!snap.exists()) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      const product = snap.data();
      const item = cartItems[index];

      // TOTAL STOCK CHECK
      if (
        typeof product.totalStock !== "number" ||
        product.totalStock < item.quantity
      ) {
        throw new Error(`OUT_OF_STOCK: ${item.name}`);
      }

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

      // UPDATE AFTER ALL READS
      transaction.update(productRefs[index], {
        totalStock: product.totalStock - item.quantity,
        variants: updatedVariants,
        updatedAt: serverTimestamp(),
      });
    });
  });
};