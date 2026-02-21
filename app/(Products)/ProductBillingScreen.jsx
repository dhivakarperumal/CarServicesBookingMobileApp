// import React, { useEffect, useState, useMemo } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   Alert,
//   StyleSheet,
//   ScrollView,
// } from "react-native";
// import { Picker } from "@react-native-picker/picker";
// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import {
//   collection,
//   onSnapshot,
//   addDoc,
//   serverTimestamp,
//   doc,
//   updateDoc,
// } from "firebase/firestore";
// import { db } from "../../firebase";

// export default function ProductBillingScreen() {
//   const router = useRouter();

//   const [products, setProducts] = useState([]);
//   const [selectedProductId, setSelectedProductId] = useState("");
//   const [selectedVariantIndex, setSelectedVariantIndex] = useState("");
//   const [qty, setQty] = useState("1");
//   const [cart, setCart] = useState([]);

//   const [orderType, setOrderType] = useState("shop");

//   const [customer, setCustomer] = useState({ name: "", phone: "" });

//   const [shipping, setShipping] = useState({
//     name: "",
//     phone: "",
//     address: "",
//     city: "",
//     pincode: "",
//   });

//   /* 🔥 FETCH PRODUCTS */
//   useEffect(() => {
//     const unsub = onSnapshot(collection(db, "products"), (snap) => {
//       const list = snap.docs.map((doc) => ({
//         docId: doc.id,
//         ...doc.data(),
//       }));
//       setProducts(list);
//     });
//     return () => unsub();
//   }, []);

//   const selectedProduct = products.find(
//     (p) => p.docId === selectedProductId
//   );

//   const selectedVariant =
//     selectedProduct?.variants?.[selectedVariantIndex];

//   const price =
//     selectedProduct?.offerPrice || selectedProduct?.mrp || 0;

//   /* 🛒 ADD TO CART */
//   const addToCart = () => {
//     if (!selectedProduct || selectedVariantIndex === "")
//       return Alert.alert("Select product & variant");

//     const quantity = Number(qty);

//     if (quantity <= 0) return Alert.alert("Enter valid qty");

//     if (quantity > selectedVariant.stock)
//       return Alert.alert("Not enough stock");

//     const existingIndex = cart.findIndex(
//       (c) =>
//         c.productId === selectedProduct.docId &&
//         c.variantIndex === selectedVariantIndex
//     );

//     if (existingIndex !== -1) {
//       const updated = [...cart];
//       const newQty = updated[existingIndex].qty + quantity;

//       if (newQty > selectedVariant.stock)
//         return Alert.alert("Not enough stock");

//       updated[existingIndex].qty = newQty;
//       updated[existingIndex].total =
//         newQty * updated[existingIndex].price;

//       setCart(updated);
//     } else {
//       const item = {
//         productId: selectedProduct.docId,
//         name: selectedProduct.name,
//         variant: `${selectedVariant.position} | ${selectedVariant.material}`,
//         price,
//         qty: quantity,
//         total: price * quantity,
//         variantIndex: selectedVariantIndex,
//       };

//       setCart((prev) => [...prev, item]);
//     }

//     setQty("1");
//   };

//   const removeItem = (index) => {
//     setCart(cart.filter((_, i) => i !== index));
//   };

//   const grandTotal = useMemo(
//     () => cart.reduce((sum, item) => sum + item.total, 0),
//     [cart]
//   );

//   /* 💾 SAVE ORDER */
//   const handleSaveBill = async () => {
//     const isOnline = orderType === "online";

//     if (
//       (!isOnline && (!customer.name || !customer.phone)) ||
//       (isOnline &&
//         (!shipping.name ||
//           !shipping.phone ||
//           !shipping.address ||
//           !shipping.city ||
//           !shipping.pincode))
//     ) {
//       return Alert.alert("Enter required details");
//     }

//     if (cart.length === 0) return Alert.alert("Cart is empty");

//     try {
//       const orderId = `ORD-${Date.now()
//         .toString()
//         .slice(-6)}`;

//       /* 🔄 UPDATE STOCK */
//       for (const item of cart) {
//         const product = products.find(
//           (p) => p.docId === item.productId
//         );

//         const updatedVariants = product.variants.map(
//           (v, i) => {
//             if (i === Number(item.variantIndex)) {
//               return {
//                 ...v,
//                 stock: Number(v.stock) - item.qty,
//               };
//             }
//             return v;
//           }
//         );

//         const totalStock = updatedVariants.reduce(
//           (sum, v) => sum + Number(v.stock || 0),
//           0
//         );

//         await updateDoc(doc(db, "products", product.docId), {
//           variants: updatedVariants,
//           totalStock,
//         });
//       }

//       const orderData = {
//         orderId,
//         orderType,
//         customer: isOnline ? shipping : customer,
//         shipping: isOnline ? shipping : null,
//         items: cart,
//         subtotal: grandTotal,
//         total: grandTotal,
//         paymentMethod: isOnline ? "ONLINE" : "CASH",
//         paymentStatus: isOnline ? "Paid" : "Pending",
//         status: "OrderPlaced",
//         createdAt: serverTimestamp(),
//       };

//       await addDoc(collection(db, "orders"), orderData);

//       Alert.alert("Success", "Order saved");

//       setCart([]);
//       setCustomer({ name: "", phone: "" });
//       setShipping({
//         name: "",
//         phone: "",
//         address: "",
//         city: "",
//         pincode: "",
//       });
//       setSelectedProductId("");
//       setSelectedVariantIndex("");
//       setOrderType("shop");
//     } catch (err) {
//       console.log(err);
//       Alert.alert("Order failed");
//     }
//   };

//   return (
//     <ScrollView style={styles.container}>
//       {/* 🔝 HEADER */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()}>
//           <Ionicons name="arrow-back" size={24} color="#000" />
//         </TouchableOpacity>

//         <Text style={styles.headerTitle}>Product Billing</Text>

//         <View style={{ width: 24 }} />
//       </View>

//       {/* 🔄 ORDER TYPE */}
//       <View style={styles.picker}>
//         <Picker
//           selectedValue={orderType}
//           onValueChange={(val) => setOrderType(val)}
//         >
//           <Picker.Item label="Shop" value="shop" />
//           <Picker.Item label="Online" value="online" />
//         </Picker>
//       </View>

//       {/* 👤 CUSTOMER (SHOP) */}
//       {orderType === "shop" && (
//         <>
//           <TextInput
//             placeholder="Customer Name"
//             value={customer.name}
//             onChangeText={(text) =>
//               setCustomer({ ...customer, name: text })
//             }
//             style={styles.input}
//           />

//           <TextInput
//             placeholder="Phone"
//             keyboardType="numeric"
//             value={customer.phone}
//             onChangeText={(text) =>
//               setCustomer({ ...customer, phone: text })
//             }
//             style={styles.input}
//           />
//         </>
//       )}

//       {/* 🚚 SHIPPING (ONLINE) */}
//       {orderType === "online" && (
//         <>
//           <TextInput
//             placeholder="Shipping Name"
//             value={shipping.name}
//             onChangeText={(text) =>
//               setShipping({ ...shipping, name: text })
//             }
//             style={styles.input}
//           />

//           <TextInput
//             placeholder="Shipping Phone"
//             keyboardType="numeric"
//             value={shipping.phone}
//             onChangeText={(text) =>
//               setShipping({ ...shipping, phone: text })
//             }
//             style={styles.input}
//           />

//           <TextInput
//             placeholder="Address"
//             value={shipping.address}
//             onChangeText={(text) =>
//               setShipping({ ...shipping, address: text })
//             }
//             style={styles.input}
//           />

//           <TextInput
//             placeholder="City"
//             value={shipping.city}
//             onChangeText={(text) =>
//               setShipping({ ...shipping, city: text })
//             }
//             style={styles.input}
//           />

//           <TextInput
//             placeholder="Pincode"
//             keyboardType="numeric"
//             value={shipping.pincode}
//             onChangeText={(text) =>
//               setShipping({ ...shipping, pincode: text })
//             }
//             style={styles.input}
//           />
//         </>
//       )}

//       {/* PRODUCT PICKER */}
//       <View style={styles.picker}>
//         <Picker
//           selectedValue={selectedProductId}
//           onValueChange={(val) => {
//             setSelectedProductId(val);
//             setSelectedVariantIndex("");
//           }}
//         >
//           <Picker.Item label="Select Product" value="" />
//           {products.map((p) => (
//             <Picker.Item
//               key={p.docId}
//               label={p.name}
//               value={p.docId}
//             />
//           ))}
//         </Picker>
//       </View>

//       {/* VARIANT PICKER */}
//       {selectedProduct && (
//         <View style={styles.picker}>
//           <Picker
//             selectedValue={selectedVariantIndex}
//             onValueChange={(val) =>
//               setSelectedVariantIndex(val)
//             }
//           >
//             <Picker.Item label="Select Variant" value="" />
//             {selectedProduct.variants?.map((v, i) => (
//               <Picker.Item
//                 key={i}
//                 label={`${v.position} | ${v.material} (Stock: ${v.stock})`}
//                 value={i}
//               />
//             ))}
//           </Picker>
//         </View>
//       )}

//       {/* QTY */}
//       <TextInput
//         placeholder="Qty"
//         keyboardType="numeric"
//         value={qty}
//         onChangeText={setQty}
//         style={styles.input}
//       />

//       <TouchableOpacity style={styles.addBtn} onPress={addToCart}>
//         <Text style={styles.btnText}>Add to Cart</Text>
//       </TouchableOpacity>

//       {/* CART */}
//       <FlatList
//         data={cart}
//         keyExtractor={(_, i) => i.toString()}
//         renderItem={({ item, index }) => (
//           <View style={styles.cartItem}>
//             <View>
//               <Text style={styles.bold}>{item.name}</Text>
//               <Text>{item.variant}</Text>
//               <Text>
//                 ₹{item.price} × {item.qty} = ₹{item.total}
//               </Text>
//             </View>

//             <TouchableOpacity
//               onPress={() => removeItem(index)}
//               style={styles.removeBtn}
//             >
//               <Text style={{ color: "#fff" }}>Remove</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       />

//       <Text style={styles.total}>
//         Grand Total: ₹ {grandTotal}
//       </Text>

//       <TouchableOpacity
//         style={styles.saveBtn}
//         onPress={handleSaveBill}
//       >
//         <Text style={styles.btnText}>Save Order</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f1f5f9",
//     padding: 16,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 12,
//     backgroundColor:"#15173D"
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   input: {
//     backgroundColor: "#fff",
//     padding: 12,
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   picker: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   addBtn: {
//     backgroundColor: "#000",
//     padding: 12,
//     borderRadius: 10,
//     marginBottom: 14,
//   },
//   saveBtn: {
//     backgroundColor: "#16a34a",
//     padding: 14,
//     borderRadius: 12,
//     marginTop: 10,
//   },
//   btnText: {
//     color: "#fff",
//     textAlign: "center",
//     fontWeight: "bold",
//   },
//   cartItem: {
//     backgroundColor: "#fff",
//     padding: 12,
//     borderRadius: 10,
//     marginBottom: 10,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   removeBtn: {
//     backgroundColor: "red",
//     padding: 8,
//     borderRadius: 8,
//   },
//   total: {
//     fontSize: 18,
//     fontWeight: "bold",
//     textAlign: "right",
//     marginTop: 10,
//   },
//   bold: {
//     fontWeight: "bold",
//   },
// });

import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";

export default function ProductBillingScreen() {
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedVariantIndex, setSelectedVariantIndex] = useState("");
  const [qty, setQty] = useState("1");
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState("shop");

  const [customer, setCustomer] = useState({ name: "", phone: "" });

  const [shipping, setShipping] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  /* 🔥 FETCH PRODUCTS */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      const list = snap.docs.map((doc) => ({
        docId: doc.id,
        ...doc.data(),
      }));
      setProducts(list);
    });
    return () => unsub();
  }, []);

  const selectedProduct = products.find((p) => p.docId === selectedProductId);

  const selectedVariant = selectedProduct?.variants?.[selectedVariantIndex];

  const price = selectedProduct?.offerPrice || selectedProduct?.mrp || 0;

  /* 🛒 ADD TO CART */
  const addToCart = () => {
    if (!selectedProduct || selectedVariantIndex === "")
      return Alert.alert("Select product & variant");

    const quantity = Number(qty);
    if (quantity <= 0) return Alert.alert("Enter valid qty");

    if (quantity > selectedVariant.stock)
      return Alert.alert("Not enough stock");

    const existingIndex = cart.findIndex(
      (c) =>
        c.productId === selectedProduct.docId &&
        c.variantIndex === selectedVariantIndex,
    );

    if (existingIndex !== -1) {
      const updated = [...cart];
      const newQty = updated[existingIndex].qty + quantity;

      if (newQty > selectedVariant.stock)
        return Alert.alert("Not enough stock");

      updated[existingIndex].qty = newQty;
      updated[existingIndex].total = newQty * updated[existingIndex].price;

      setCart(updated);
    } else {
      const item = {
        productId: selectedProduct.docId,
        name: selectedProduct.name,
        variant: `${selectedVariant.position} | ${selectedVariant.material}`,
        price,
        qty: quantity,
        total: price * quantity,
        variantIndex: selectedVariantIndex,
      };

      setCart((prev) => [...prev, item]);
    }

    setQty("1");
  };

  const removeItem = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const grandTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.total, 0),
    [cart],
  );

  /* 💾 SAVE ORDER */
  const handleSaveBill = async () => {
    const isOnline = orderType === "online";

    if (
      (!isOnline && (!customer.name || !customer.phone)) ||
      (isOnline &&
        (!shipping.name ||
          !shipping.phone ||
          !shipping.address ||
          !shipping.city ||
          !shipping.pincode))
    ) {
      return Alert.alert("Enter required details");
    }

    if (cart.length === 0) return Alert.alert("Cart is empty");

    try {
      const orderId = `ORD-${Date.now().toString().slice(-6)}`;

      /* 🔄 UPDATE STOCK */
      for (const item of cart) {
        const product = products.find((p) => p.docId === item.productId);

        const updatedVariants = product.variants.map((v, i) => {
          if (i === Number(item.variantIndex)) {
            return {
              ...v,
              stock: Number(v.stock) - item.qty,
            };
          }
          return v;
        });

        const totalStock = updatedVariants.reduce(
          (sum, v) => sum + Number(v.stock || 0),
          0,
        );

        await updateDoc(doc(db, "products", product.docId), {
          variants: updatedVariants,
          totalStock,
        });
      }

      const orderData = {
        orderId,
        orderType,
        customer: isOnline ? shipping : customer,
        shipping: isOnline ? shipping : null,
        items: cart,
        subtotal: grandTotal,
        total: grandTotal,
        paymentMethod: isOnline ? "ONLINE" : "CASH",
        paymentStatus: isOnline ? "Paid" : "Pending",
        status: "OrderPlaced",
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "orders"), orderData);

      Alert.alert("Success", "Order saved");

      setCart([]);
      setCustomer({ name: "", phone: "" });
      setShipping({
        name: "",
        phone: "",
        address: "",
        city: "",
        pincode: "",
      });
      setSelectedProductId("");
      setSelectedVariantIndex("");
      setOrderType("shop");
    } catch (err) {
      console.log(err);
      Alert.alert("Order failed");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#020617" }}>
      {/* 🔝 HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Product Billing</Text>

        <View style={{ width: 24 }} />
      </View>

      {/* 🔽 BODY */}
      <ScrollView style={styles.container}>
        {/* ORDER TYPE */}
        <View style={styles.picker}>
          <Picker
            selectedValue={orderType}
            onValueChange={(val) => setOrderType(val)}
            dropdownIconColor="#38bdf8"
            style={{ color: "#64748b" }}
            itemStyle={{ color: "#fff" }}
          >
            <Picker.Item label="Shop" value="shop" />
            <Picker.Item label="Online" value="online" />
          </Picker>
        </View>

        {/* CUSTOMER */}
        {orderType === "shop" && (
          <>
            <TextInput
              placeholder="Customer Name"
              placeholderTextColor="#64748b"
              value={customer.name}
              onChangeText={(text) => setCustomer({ ...customer, name: text })}
              style={styles.input}
            />

            <TextInput
              placeholder="Phone"
              placeholderTextColor="#64748b"
              keyboardType="numeric"
              value={customer.phone}
              onChangeText={(text) => setCustomer({ ...customer, phone: text })}
              style={styles.input}
            />
          </>
        )}

        {/* SHIPPING */}
        {orderType === "online" && (
          <>
            {["name", "phone", "address", "city", "pincode"].map((field) => (
              <TextInput
                key={field}
                placeholder={`Shipping ${field}`}
                placeholderTextColor="#64748b"
                value={shipping[field]}
                keyboardType={
                  field === "phone" || field === "pincode"
                    ? "numeric"
                    : "default"
                }
                onChangeText={(text) =>
                  setShipping({ ...shipping, [field]: text })
                }
                style={styles.input}
              />
            ))}
          </>
        )}

        {/* PRODUCT PICKER */}
        <View style={styles.picker}>
          <Picker
            selectedValue={selectedProductId}
            onValueChange={(val) => {
              setSelectedProductId(val);
              setSelectedVariantIndex("");
            }}
            dropdownIconColor="#38bdf8"
            style={{ color: "#64748b" }}
            itemStyle={{ color: "#64748b" }}
          >
            <Picker.Item label="Select Product" value="" />
            {products.map((p) => (
              <Picker.Item key={p.docId} label={p.name} value={p.docId} />
            ))}
          </Picker>
        </View>

        {/* VARIANT PICKER */}
        {selectedProduct && (
          <View style={styles.picker}>
            <Picker
              selectedValue={selectedVariantIndex}
              onValueChange={(val) => setSelectedVariantIndex(val)}
              dropdownIconColor="#38bdf8"
              style={{ color: "#64748b" }}
              itemStyle={{ color: "#64748b" }}
            >
              <Picker.Item label="Select Variant" value="" />
              {selectedProduct.variants?.map((v, i) => (
                <Picker.Item
                  key={i}
                  label={`${v.position} | ${v.material} (Stock: ${v.stock})`}
                  value={i}
                />
              ))}
            </Picker>
          </View>
        )}

        {/* QTY */}
        <TextInput
          placeholder="Qty"
          placeholderTextColor="#64748b"
          keyboardType="numeric"
          value={qty}
          onChangeText={setQty}
          style={styles.input}
        />

        <TouchableOpacity style={styles.addBtn} onPress={addToCart}>
          <Text style={styles.btnText}>Add to Cart</Text>
        </TouchableOpacity>

        {/* CART */}
        <FlatList
          data={cart}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.cartItem}>
              <View>
                <Text style={styles.bold}>{item.name}</Text>
                <Text>{item.variant}</Text>
                <Text>
                  ₹{item.price} × {item.qty} = ₹{item.total}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => removeItem(index)}
                style={styles.removeBtn}
              >
                <Text style={{ color: "#fff" }}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        />

        <Text style={styles.total}>Grand Total: ₹ {grandTotal}</Text>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveBill}>
          <Text style={styles.btnText}>Save Order</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    borderBottomWidth: 1,
    borderColor: "#0b3b6f",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },

  container: {
    flex: 1,
    backgroundColor: "#020617",
    padding: 16,
  },

  input: {
    backgroundColor: "#0f172a",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#0b3b6f",
    color: "#fff",
  },

picker: {
  backgroundColor: "#0f172a",
  borderRadius: 12,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: "#0b3b6f",
  overflow: "hidden", 
},

  addBtn: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#38bdf8",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },

  saveBtn: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 14,
    marginTop: 10,
    marginBottom: 40,
    shadowColor: "#38bdf8",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },

  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
  },

  cartItem: {
    backgroundColor: "#0f172a",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#0b3b6f",
  },

  removeBtn: {
    backgroundColor: "#020617",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ef4444",
  },

  total: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "right",
    marginTop: 14,
    color: "#38bdf8",
  },

  bold: {
    fontWeight: "700",
    color: "#fff",
  },
});
