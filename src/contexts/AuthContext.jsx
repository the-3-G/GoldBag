// src/contexts/AuthContext.jsx - Enhanced with better error handling
import React, { useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot, query, collection, where, getDocs, limit, serverTimestamp } from "firebase/firestore";
import { ROLES } from "../constants/roles";
import { sendOTP, verifyOTP } from "../services/authService";

const AuthContext = React.createContext();
export const useAuth = () => useContext(AuthContext);

// Only accounts that explicitly signed up with emailVerified: false need OTP.
// Older accounts without the field are treated as already verified.
function resolveEmailVerified(userData) {
  if (userData.emailVerified === true) return true;
  if (userData.emailVerified === false) return false;
  return true;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(true);


  // Listen for login/logout changes
  useEffect(() => {
    let unsubscribeUserDoc = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      console.log('Auth state changed:', currentUser ? currentUser.email : 'No user');

      if (currentUser) {
        // Self-Healing: Ensure wallet exists (for users who signed up during outage/bug)
        try {
          const walletRef = doc(db, "wallets", currentUser.uid);
          const walletSnap = await getDoc(walletRef);

          if (!walletSnap.exists()) {
            console.log("⚠️ REPAIR: Wallet missing for user, creating default wallet...");
            await setDoc(walletRef, {
              uid: currentUser.uid,
              balance: 0,
              mainBalance: 0,
              tradingBalance: 0,
              commissionBalance: 0,
              assets: {
                USDT: { name: "Tether", symbol: "USDT", total: 0, networks: { "TRC20": 0, "ERC20": 0, "BEP20": 0 } },
                BTC: { name: "Bitcoin", symbol: "BTC", total: 0, networks: { "Bitcoin": 0 } },
                ETH: { name: "Ethereum", symbol: "ETH", total: 0, networks: { "Ethereum": 0, "Arbitrum": 0, "Optimism": 0 } },
                SOL: { name: "Solana", symbol: "SOL", total: 0, networks: { "Solana": 0 } },
                BNB: { name: "BNB", symbol: "BNB", total: 0, networks: { "BSC (BEP20)": 0 } },
                XRP: { name: "XRP", symbol: "XRP", total: 0, networks: { "Ripple": 0 } },
                DOGE: { name: "Dogecoin", symbol: "DOGE", total: 0, networks: { "Dogecoin": 0 } }
              },
              updatedAt: new Date()
            });
            console.log("✅ REPAIR: Wallet created successfully");
          }
        } catch (err) {
          console.error("Error checking/creating wallet:", err);
        }

        // Subscribe to real-time user document updates
        unsubscribeUserDoc = onSnapshot(doc(db, "users", currentUser.uid), (userDoc) => {
          const isBaggoldAdmin = currentUser.email?.toLowerCase() === "baggold57@gmail.com";

          if (userDoc.exists()) {
            const userData = userDoc.data();
            const effectiveRole = isBaggoldAdmin ? ROLES.ADMIN : (userData.role || ROLES.USER);

            // Auto-repair role for baggold57@gmail.com if needed
            if (isBaggoldAdmin && userData.role !== ROLES.ADMIN) {
              setDoc(doc(db, "users", currentUser.uid), {
                role: ROLES.ADMIN,
                updatedAt: serverTimestamp()
              }, { merge: true }).catch(err => console.warn("Failed to set admin role in Firestore:", err));
            }

            // Explicitly map key fields to ensure they exist
            setUser({
              ...userData,  // spread first so explicit fields below take priority
              uid: currentUser.uid,
              email: currentUser.email || userData.email,
              displayName: userData.name || currentUser.displayName || userData.email?.split("@")[0] || "",
              name: userData.name || currentUser.displayName || userData.email?.split("@")[0] || "",
              photoURL: userData.photoURL || currentUser.photoURL || "",
              role: effectiveRole
            });
            setUserRole(effectiveRole);

            const verified = isBaggoldAdmin ? true : resolveEmailVerified(userData);
            setEmailVerified(verified);

            // One-time repair: mark pre-OTP accounts as verified in Firestore
            if (userData.emailVerified === undefined && userData.createdAt) {
              setDoc(doc(db, "users", currentUser.uid), {
                emailVerified: true,
                updatedAt: serverTimestamp(),
              }, { merge: true }).catch((err) => console.warn("Could not auto-verify legacy account:", err));
            }

            console.log('User data updated from Firestore:', userData.name, 'Role:', effectiveRole);
          } else {
            console.log('User document does not exist in Firestore, auto-creating user document...');
            const defaultRole = isBaggoldAdmin ? ROLES.ADMIN : ROLES.USER;

            // Fallback user state immediately to avoid blocking UI
            setUser({
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName || currentUser.email?.split("@")[0] || "",
              name: currentUser.displayName || currentUser.email?.split("@")[0] || "",
              role: defaultRole,
              kycStatus: "unverified",
              verification: {
                status: "unverified",
                submittedAt: null,
                idFrontUrl: null,
                idBackUrl: null
              },
              referredBy: null,
              referralCodeUsed: null,
              frozen: false,
              emailVerified: isBaggoldAdmin ? true : false,
              createdAt: new Date(),
              updatedAt: new Date()
            });
            setUserRole(defaultRole);
            setEmailVerified(isBaggoldAdmin ? true : false);

            // Auto-create document in background
            setDoc(doc(db, "users", currentUser.uid), {
              uid: currentUser.uid,
              email: currentUser.email,
              name: currentUser.displayName || currentUser.email?.split("@")[0] || "",
              role: defaultRole,
              kycStatus: "unverified",
              verification: {
                status: "unverified",
                submittedAt: null,
                idFrontUrl: null,
                idBackUrl: null
              },
              referredBy: null,
              referralCodeUsed: null,
              frozen: false,
              emailVerified: isBaggoldAdmin ? true : false,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            }).then(() => {
              console.log('✅ REPAIR: User document created successfully with role:', defaultRole);
            }).catch((err) => {
              console.error("❌ REPAIR: Error auto-creating user document:", err);
            });
          }
          // ✅ Only stop loading AFTER user role is loaded from Firestore
          setLoading(false);
        }, (error) => {
          console.error("Error listening to user doc:", error);
          setUser(currentUser);
          setLoading(false);
        });
      } else {
        setUser(null);
        setUserRole(null);
        setEmailVerified(false);
        if (unsubscribeUserDoc) unsubscribeUserDoc();
        // No user logged in — stop loading immediately
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDoc) unsubscribeUserDoc();
    };
  }, []);

  // SIGN UP
  async function signup(email, password, referralCode = null, name = "") {
    try {
      console.log('Step 1: Creating Firebase Auth user...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log(`✅ Auth user created: ${user.uid}`);

      console.log('Step 2: Resolving referral code if provided...');
      let referrerId = null;
      if (referralCode) {
        try {
          const agentsQuery = query(
            collection(db, "users"),
            where("referralCode", "==", referralCode.toUpperCase()),
            limit(1)
          );
          const agentSnapshot = await getDocs(agentsQuery);
          if (!agentSnapshot.empty) {
            referrerId = agentSnapshot.docs[0].id;
            console.log(`✅ Resolved referral code ${referralCode} to UID: ${referrerId}`);
          } else {
            console.warn(`⚠️ Invalid referral code provided: ${referralCode}`);
          }
        } catch (err) {
          console.error("Error resolving referral code:", err);
        }
      }

      console.log('Step 3: Creating Firestore user document...');
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        name: name || email.split('@')[0],
        role: ROLES.USER,
        kycStatus: "unverified",
        verification: {
          status: "unverified",
          submittedAt: null,
          idFrontUrl: null,
          idBackUrl: null
        },
        referredBy: referrerId, // Now correctly stores the agent's UID
        referralCodeUsed: referralCode || null,
        frozen: false,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ User document created');

      console.log('Step 4: Creating wallet document...');
      await setDoc(doc(db, "wallets", user.uid), {
        uid: user.uid,
        balance: 0,           // Legacy
        mainBalance: 0,      // New schema
        tradingBalance: 0,   // New schema
        commissionBalance: 0,
        assets: {
          USDT: {
            name: "Tether",
            symbol: "USDT",
            total: 0,
            networks: {
              "TRC20": 0,
              "ERC20": 0,
              "BEP20": 0
            }
          },
          BTC: {
            name: "Bitcoin",
            symbol: "BTC",
            total: 0,
            networks: {
              "Bitcoin": 0
            }
          },
          ETH: {
            name: "Ethereum",
            symbol: "ETH",
            total: 0,
            networks: {
              "Ethereum": 0,
              "Arbitrum": 0,
              "Optimism": 0
            }
          },
          SOL: {
            name: "Solana",
            symbol: "SOL",
            total: 0,
            networks: {
              "Solana": 0
            }
          },
          BNB: {
            name: "BNB",
            symbol: "BNB",
            total: 0,
            networks: {
              "BSC (BEP20)": 0
            }
          },
          XRP: {
            name: "XRP",
            symbol: "XRP",
            total: 0,
            networks: {
              "Ripple": 0
            }
          },
          DOGE: {
            name: "Dogecoin",
            symbol: "DOGE",
            total: 0,
            networks: {
              "Dogecoin": 0
            }
          }
        },
        updatedAt: new Date()
      });
      console.log('✅ Wallet document created');

      console.log('Step 3.5: Sending initial OTP...');
      try {
        await sendOTP(user.uid, email, name || email.split('@')[0]);
        console.log('✅ Initial OTP sent');
      } catch (otpError) {
        console.error('⚠️ Failed to send initial OTP:', otpError);
        // Do not throw error, allow signup to complete
        // User can resend OTP from verification page
      }

      setUserRole(ROLES.USER);
      console.log('✅ Signup complete!');
      return userCredential;
    } catch (error) {
      console.error('❌ Signup failed:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      throw error;
    }
  }

  // LOGIN
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // LOGOUT
  function logout() {
    setUserRole(null);
    setEmailVerified(false);
    return signOut(auth);
  }

  // VERIFY EMAIL OTP
  async function verifyEmailOTP(code) {
    if (!user) throw new Error("No user logged in");
    const result = await verifyOTP(user.uid, code);
    if (result.success) {
      setEmailVerified(true);
      // Also update local user document in state if needed
    }
    return result;
  }

  // RESEND OTP
  async function resendOTP() {
    if (!user && !auth.currentUser) throw new Error("No user logged in");

    // Use auth.currentUser as fallback if user state is not fully ready
    const targetUser = user || auth.currentUser;
    const email = targetUser.email;
    const name = targetUser.displayName || targetUser.name || (email ? email.split('@')[0] : "User");

    if (!email) {
      console.error("Attempted to resend OTP but email is missing", targetUser);
      throw new Error("User email is missing. Please try logging in again.");
    }

    return await sendOTP(targetUser.uid, email, name);
  }

  // Role check helpers
  const isAdmin = () => userRole === ROLES.ADMIN;
  const isAgent = () => userRole === ROLES.AGENT;
  const isUser = () => userRole === ROLES.USER;

  const value = {
    user,
    userRole,
    emailVerified,
    loading,
    signup,
    login,
    logout,
    verifyEmailOTP,
    resendOTP,
    isAdmin,
    isAgent,
    isUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
