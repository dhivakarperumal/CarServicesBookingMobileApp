import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";

const clean = (val: string) =>
  val?.trim().toLowerCase();

export const saveUserAddress = async (uid, address) => {
  if (!uid) throw new Error("NO_USER");

  let {
    fullName,
    phone,
    street,
    city,
    state,
    pinCode,
    email = "",
    country = "India",
  } = address;

  // Trim everything
  fullName = fullName?.trim();
  phone = phone?.trim();
  street = street?.trim();
  city = city?.trim();
  state = state?.trim();
  pinCode = pinCode?.trim();
  email = email?.trim();

  if (!fullName || !phone || !street || !city || !state || !pinCode) {
    throw new Error("INVALID_ADDRESS");
  }

  const ref = collection(db, "users", uid, "addresses");
  const snap = await getDocs(ref);

  const duplicate = snap.docs.some((doc) => {
    const d = doc.data();
    return (
      clean(d.fullName) === clean(fullName) &&
      clean(d.phone) === clean(phone) &&
      clean(d.street) === clean(street) &&
      clean(d.city) === clean(city) &&
      clean(d.state) === clean(state) &&
      clean(d.pinCode) === clean(pinCode)
    );
  });

  if (duplicate) {
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