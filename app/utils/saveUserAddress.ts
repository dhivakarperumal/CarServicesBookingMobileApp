import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";

export const saveUserAddress = async (
  uid: string,
  address: any
) => {
  if (!uid) throw new Error("NO_USER");

  const {
    fullName,
    phone,
    street,
    city,
    state,
    pinCode,
    email = "",
    country = "India",
  } = address;

  if (!fullName || !phone || !street || !city || !state || !pinCode) {
    throw new Error("INVALID_ADDRESS");
  }

  const ref = collection(db, "users", uid, "addresses");

  const q = query(
    ref,
    where("phone", "==", phone),
    where("street", "==", street),
    where("pinCode", "==", pinCode)
  );

  const snap = await getDocs(q);

  if (!snap.empty) {
    throw new Error("DUPLICATE_ADDRESS");
  }

  await addDoc(ref, {
    fullName,
    phone,
    email,
    street,
    city,
    state,
    pinCode,
    country,
    createdAt: serverTimestamp(),
  });
};