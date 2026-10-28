// src/services/adminService.js
import { db } from "../firebase";
import {
    collection,
    query,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    setDoc,
    addDoc,
    deleteDoc,
    where,
    orderBy,
    limit,
    serverTimestamp
} from "firebase/firestore";
import { createNotification } from "./notificationService";

/**
 * Internal helper: log a balance change event to balanceHistory collection.
 */
const logBalanceChange = async ({ userId, userName, userEmail, operation, target, amount, newBalance, performedBy, performedByRole }) => {
    try {
        await addDoc(collection(db, "balanceHistory"), {
            userId,
            userName: userName || null,
            userEmail: userEmail || null,
            operation,   // "set" | "add" | "subtract"
            target,      // e.g. "funding", "trading", "commission"
            amount,
            newBalance: newBalance ?? null,
            performedBy: performedBy || "admin",
            performedByRole: performedByRole || "admin",
            createdAt: serverTimestamp()
        });
    } catch (err) {
        // Non-fatal – log but don't rethrow
        console.warn("Failed to write balanceHistory record:", err);
    }
};

/**
 * Get aggregated dashboard stats quickly without full data joins
 */
export const getAdminDashboardStats = async () => {
    try {
        const [usersSnap, walletsSnap, pendingDepositsSnap, pendingWithdrawalsSnap, activeTradesSnap] = await Promise.all([
            getDocs(collection(db, "users")),
            getDocs(collection(db, "wallets")),
            getDocs(query(collection(db, "deposits"), where("status", "==", "pending"))),
            getDocs(query(collection(db, "withdrawals"), where("status", "==", "pending"))),
            getDocs(query(collection(db, "trades"), where("status", "==", "active")))
        ]);

        let totalBalance = 0;
        walletsSnap.docs.forEach(wDoc => {
            const wData = wDoc.data();
            totalBalance += (wData.mainBalance || 0) + (wData.tradingBalance || 0);
        });

        return {
            totalUsers: usersSnap.size,
            pendingDeposits: pendingDepositsSnap.size,
            pendingWithdrawals: pendingWithdrawalsSnap.size,
            activeTrades: activeTradesSnap.size,
            totalBalance
        };
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        throw error;
    }
};

// Get all users
export const getAllUsers = async (filters = {}) => {
    try {
        const usersRef = collection(db, "users");
        let q = query(usersRef);

        if (filters.role) {
            q = query(usersRef, where("role", "==", filters.role));
        }

        const [usersSnap, walletsSnap] = await Promise.all([
            getDocs(q),
            getDocs(collection(db, "wallets"))
        ]);

        const walletMap = new Map();
        walletsSnap.docs.forEach(docSnap => {
            const data = docSnap.data();
            walletMap.set(docSnap.id, data);
            if (data.uid) {
                walletMap.set(data.uid, data);
            }
        });

        const users = usersSnap.docs.map(userDoc => {
            const userData = userDoc.data();
            const walletData = walletMap.get(userDoc.id) || walletMap.get(userData.uid);

            return {
                id: userDoc.id,
                ...userData,
                balance: (walletData?.mainBalance || 0) + (walletData?.tradingBalance || 0),
                mainBalance: walletData?.mainBalance || 0,
                tradingBalance: walletData?.tradingBalance || 0,
                commissionBalance: walletData?.commissionBalance || 0,
                createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate() : (userData.createdAt ? new Date(userData.createdAt) : null)
            };
        });

        // Sort by joined date desc
        users.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        return users;
    } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
};

// Set user balance
export const setUserBalance = async (userId, amount, operation = "set", target = "main", performedBy = null, performedByRole = "admin") => {
    try {
        const walletRef = doc(db, "wallets", userId);
        const walletSnap = await getDoc(walletRef);

        // Map target names to field names
        const fieldMap = {
            'main': 'mainBalance',
            'funding': 'mainBalance', // Alias
            'trading': 'tradingBalance',
            'futures': 'tradingBalance', // Alias
            'spot': 'spotBalance',
            'contract': 'contractBalance',
            'earn': 'earnBalance',
            'fiat': 'fiatBalance',
            'commission': 'commissionBalance'
        };

        const balanceField = fieldMap[target.toLowerCase()] || 'mainBalance';

        if (!walletSnap.exists()) {
            // If wallet doesn't exist, create it with the one balance set
            const initialData = {
                uid: userId,
                mainBalance: 0,
                tradingBalance: 0,
                spotBalance: 0,
                contractBalance: 0,
                earnBalance: 0,
                fiatBalance: 0,
                commissionBalance: 0,
                assets: {
                    USDT: { name: 'Tether', symbol: 'USDT', total: 0, networks: { "TRC20": 0 } },
                },
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Set the specific requested balance
            initialData[balanceField] = operation === "set" ? amount : 0;
            if (target === "main" || target === "funding") {
                initialData.assets.USDT.total = initialData[balanceField];
                initialData.assets.USDT.networks.TRC20 = initialData[balanceField];
            }

            await setDoc(walletRef, initialData);
            return { success: true };
        }

        const walletData = walletSnap.data();
        const currentBalance = walletData[balanceField] !== undefined
            ? walletData[balanceField]
            : (balanceField === "mainBalance" ? (walletData.balance || 0) : 0);

        let newBalance = currentBalance;
        if (operation === "set") {
            newBalance = amount;
        } else if (operation === "add") {
            newBalance = currentBalance + amount;
        } else if (operation === "subtract") {
            newBalance = Math.max(0, currentBalance - amount);
        }

        const updates = {
            [balanceField]: newBalance,
            updatedAt: new Date()
        };

        // Synchronize with assets map if updating Funding/Main
        if (balanceField === 'mainBalance') {
            const assets = walletData.assets || {
                USDT: { name: 'Tether', symbol: 'USDT', total: 0, networks: { "TRC20": 0 } }
            };

            if (!assets.USDT) assets.USDT = { name: 'Tether', symbol: 'USDT', total: 0, networks: { "TRC20": 0 } };

            // For general funding updates, treat as USDT
            assets.USDT.total = newBalance;
            const firstNetwork = Object.keys(assets.USDT.networks || {})[0] || "TRC20";
            if (!assets.USDT.networks) assets.USDT.networks = {};
            assets.USDT.networks[firstNetwork] = newBalance;

            updates.assets = assets;
        }

        await updateDoc(walletRef, updates);

        // --- log the change ---
        // Re-fetch user name/email for the log (best-effort)
        try {
            const userSnap2 = await getDoc(doc(db, "users", userId));
            const ud = userSnap2.data() || {};
            await logBalanceChange({
                userId,
                userName: ud.name || null,
                userEmail: ud.email || null,
                operation,
                target,
                amount,
                newBalance,
                performedBy,
                performedByRole
            });
        } catch (_) { /* non-fatal */ }

        return { success: true };
    } catch (error) {
        console.error("Error setting balance:", error);
        throw error;
    }
};

// Freeze/Unfreeze user
export const freezeUser = async (userId, freeze = true) => {
    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            frozen: freeze,
            updatedAt: new Date()
        });
        return { success: true };
    } catch (error) {
        console.error("Error freezing user:", error);
        throw error;
    }
};

// Delete user and associated wallet from Firestore
export const deleteUser = async (userId) => {
    try {
        // Best-effort deletion of wallet
        try {
            await deleteDoc(doc(db, "wallets", userId));
        } catch (e) {
            console.warn("Wallet document delete warning:", e);
        }

        // Delete user document
        await deleteDoc(doc(db, "users", userId));
        return { success: true };
    } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
    }
};

// Bulk delete all frozen users (safely excluding admins)
export const deleteFrozenUsers = async (options = { excludeAdmins: true }) => {
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("frozen", "==", true));
        const snapshot = await getDocs(q);

        const protectedEmails = ["baggold57@gmail.com", "blenzeru27@gmail.com"];
        const toDelete = [];

        snapshot.docs.forEach(docSnap => {
            const data = docSnap.data();
            const isAdmin = data.role === "admin" || protectedEmails.includes(data.email?.toLowerCase());
            if (options.excludeAdmins && isAdmin) {
                return; // protect admin
            }
            toDelete.push({ id: docSnap.id, email: data.email, name: data.name });
        });

        const results = {
            total: toDelete.length,
            deleted: 0,
            failed: 0,
            errors: []
        };

        for (const item of toDelete) {
            try {
                await deleteUser(item.id);
                results.deleted++;
            } catch (err) {
                results.failed++;
                results.errors.push({ id: item.id, email: item.email, error: err.message });
            }
        }

        return results;
    } catch (error) {
        console.error("Error bulk deleting frozen users:", error);
        throw error;
    }
};

// Create agent (upgrade user to agent role)
export const createAgent = async (userId) => {
    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            role: "agent",
            updatedAt: new Date()
        });
        return { success: true };
    } catch (error) {
        console.error("Error creating agent:", error);
        throw error;
    }
};

// Get all deposits
export const getAllDeposits = async (status = null) => {
    try {
        const depositsRef = collection(db, "deposits");
        let q = query(depositsRef, orderBy("createdAt", "desc"));

        if (status) {
            q = query(depositsRef, where("status", "==", status), orderBy("createdAt", "desc"));
        }

        const [snapshot, usersSnap] = await Promise.all([
            getDocs(q),
            getDocs(collection(db, "users"))
        ]);

        const userMap = new Map();
        usersSnap.docs.forEach(uDoc => {
            const uData = uDoc.data();
            userMap.set(uDoc.id, uData);
            if (uData.uid) userMap.set(uData.uid, uData);
        });

        const deposits = snapshot.docs.map(depositDoc => {
            const depositData = depositDoc.data();
            const userData = depositData.uid ? userMap.get(depositData.uid) : null;
            const userName = userData?.name || null;
            const userEmail = userData?.email || null;

            return {
                id: depositDoc.id,
                ...depositData,
                userName,
                userEmail,
                createdAt: depositData.createdAt?.toDate ? depositData.createdAt.toDate() : (depositData.createdAt ? new Date(depositData.createdAt) : null),
                processedAt: depositData.processedAt?.toDate ? depositData.processedAt.toDate() : (depositData.processedAt ? new Date(depositData.processedAt) : null)
            };
        });

        return deposits;
    } catch (error) {
        console.error("Error fetching deposits:", error);
        throw error;
    }
};

// Approve deposit
export const approveDeposit = async (depositId) => {
    try {
        const depositRef = doc(db, "deposits", depositId);
        const depositSnap = await getDoc(depositRef);

        if (!depositSnap.exists()) {
            throw new Error("Deposit not found");
        }

        const depositData = depositSnap.data();
        const { uid, amount } = depositData;
        const depositAmount = parseFloat(amount);

        if (isNaN(depositAmount)) {
            throw new Error("Invalid deposit amount");
        }

        // Update user's wallet balance (Approved deposits go to mainBalance)
        const walletRef = doc(db, "wallets", uid);
        const walletSnap = await getDoc(walletRef);

        if (!walletSnap.exists()) {
            const assetSymbol = depositData.asset || "USDT";
            const initialAssets = {
                USDT: { name: 'Tether', symbol: 'USDT', total: 0, networks: { "TRC20": 0 } },
                BTC: { name: 'Bitcoin', symbol: 'BTC', total: 0, networks: { "Bitcoin": 0 } },
                ETH: { name: 'Ethereum', symbol: 'ETH', total: 0, networks: { "Ethereum": 0 } },
            };

            if (initialAssets[assetSymbol]) {
                initialAssets[assetSymbol].total = depositAmount;
                const network = assetSymbol === "USDT" ? "TRC20" : assetSymbol;
                initialAssets[assetSymbol].networks[network] = depositAmount;
            } else {
                const names = { USDT: 'Tether', BTC: 'Bitcoin', ETH: 'Ethereum', SOL: 'Solana' };
                initialAssets[assetSymbol] = {
                    name: names[assetSymbol] || assetSymbol,
                    symbol: assetSymbol,
                    total: depositAmount,
                    networks: { [assetSymbol === "USDT" ? "TRC20" : assetSymbol]: depositAmount }
                };
            }

            // Create wallet if it doesn't exist
            await setDoc(walletRef, {
                uid: uid,
                mainBalance: depositAmount,
                tradingBalance: 0,
                commissionBalance: 0,
                assets: initialAssets,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        } else {
            const walletData = walletSnap.data();
            const currentMainBalance = walletData.mainBalance !== undefined
                ? walletData.mainBalance
                : (walletData.balance || 0);

            const newMainBalance = currentMainBalance + depositAmount;
            const updates = {
                mainBalance: newMainBalance,
                updatedAt: new Date()
            };

            // Update assets map for synchronized display
            const assetSymbol = depositData.asset || "USDT";
            const assets = walletData.assets || {
                USDT: { name: 'Tether', symbol: 'USDT', total: 0, networks: { "TRC20": 0 } },
                BTC: { name: 'Bitcoin', symbol: 'BTC', total: 0, networks: { "Bitcoin": 0 } },
                ETH: { name: 'Ethereum', symbol: 'ETH', total: 0, networks: { "Ethereum": 0 } },
                SOL: { name: 'Solana', symbol: 'SOL', total: 0, networks: { "Solana": 0 } },
                BNB: { name: 'BNB', symbol: 'BNB', total: 0, networks: { "BSC (BEP20)": 0 } },
                XRP: { name: 'XRP', symbol: 'XRP', total: 0, networks: { "Ripple": 0 } },
                DOGE: { name: 'Dogecoin', symbol: 'DOGE', total: 0, networks: { "Dogecoin": 0 } }
            };

            if (!assets[assetSymbol]) {
                const names = { USDT: 'Tether', BTC: 'Bitcoin', ETH: 'Ethereum', SOL: 'Solana', BNB: 'BNB', XRP: 'XRP', DOGE: 'Dogecoin' };
                assets[assetSymbol] = {
                    name: names[assetSymbol] || assetSymbol,
                    symbol: assetSymbol,
                    total: 0,
                    networks: {}
                };
            }

            assets[assetSymbol].total = (assets[assetSymbol].total || 0) + depositAmount;

            // Determine network (default to TRC20 for USDT, BSC for BNB, or direct network)
            const network = assetSymbol === "USDT"
                ? "TRC20"
                : assetSymbol === "BNB"
                    ? "BSC (BEP20)"
                    : assetSymbol === "SOL"
                        ? "Solana"
                        : assetSymbol === "XRP"
                            ? "Ripple"
                            : assetSymbol === "DOGE"
                                ? "Dogecoin"
                                : assetSymbol;
            if (!assets[assetSymbol].networks) assets[assetSymbol].networks = {};
            assets[assetSymbol].networks[network] = (assets[assetSymbol].networks[network] || 0) + depositAmount;

            updates.assets = assets;

            await updateDoc(walletRef, updates);
        }

        // Check for referrer and handle commission
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();

        if (userData && userData.referredBy) {
            const referredBy = userData.referredBy;

            // Commission Split (Total 100% logic on deposit/profit base):
            // Platform Fee (Builder): 10%
            // Agent Commission: 40%
            // Admin Profit: 50%
            const platformFee = depositAmount * 0.10;      // 10%
            const platformProfit = depositAmount * 0.50;   // 50%
            const agentCommission = depositAmount * 0.40;  // 40%

            // Create commission record
            await addDoc(collection(db, "commissions"), {
                agentId: referredBy,
                userId: uid,
                depositId: depositId,
                depositAmount: depositAmount,
                platformFee,
                agentCommission,
                platformProfit,
                status: "approved",
                createdAt: new Date()
            });

            // Add commission to agent's commission balance
            const agentWalletRef = doc(db, "wallets", referredBy);
            const agentWalletSnap = await getDoc(agentWalletRef);

            if (agentWalletSnap.exists()) {
                const currentCommissionBalance = agentWalletSnap.data().commissionBalance || 0;
                await updateDoc(agentWalletRef, {
                    commissionBalance: currentCommissionBalance + agentCommission,
                    updatedAt: new Date()
                });
            } else {
                // Create wallet for agent if doesn't exist
                await setDoc(agentWalletRef, {
                    uid: referredBy,
                    mainBalance: 0,
                    tradingBalance: 0,
                    commissionBalance: agentCommission,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
        }

        // Update deposit status
        await updateDoc(depositRef, {
            status: "approved",
            processedAt: new Date()
        });

        // Notify user
        await createNotification(
            uid,
            "Deposit Approved",
            `Your deposit of $${depositAmount} has been approved and credited to your main balance.`,
            "deposit"
        );

        return { success: true };
    } catch (error) {
        console.error("Error approving deposit:", error);
        throw error;
    }
};

// Reject deposit
export const rejectDeposit = async (depositId, reason) => {
    try {
        const depositRef = doc(db, "deposits", depositId);
        await updateDoc(depositRef, {
            status: "rejected",
            rejectionReason: reason,
            processedAt: new Date()
        });

        const depositData = (await getDoc(depositRef)).data();
        if (depositData && depositData.uid) {
            await createNotification(
                depositData.uid,
                "Deposit Rejected",
                `Your deposit request was rejected. Reason: ${reason}`,
                "deposit"
            );
        }

        return { success: true };
    } catch (error) {
        console.error("Error rejecting deposit:", error);
        throw error;
    }
};

// Get all withdrawals
export const getAllWithdrawals = async (status = null) => {
    try {
        const withdrawalsRef = collection(db, "withdrawals");
        let q = query(withdrawalsRef, orderBy("createdAt", "desc"));

        if (status) {
            q = query(withdrawalsRef, where("status", "==", status), orderBy("createdAt", "desc"));
        }

        const [snapshot, usersSnap] = await Promise.all([
            getDocs(q),
            getDocs(collection(db, "users"))
        ]);

        const userMap = new Map();
        usersSnap.docs.forEach(uDoc => {
            const uData = uDoc.data();
            userMap.set(uDoc.id, uData);
            if (uData.uid) userMap.set(uData.uid, uData);
        });

        const withdrawals = snapshot.docs.map(withdrawalDoc => {
            const withdrawalData = withdrawalDoc.data();
            const targetUid = withdrawalData.uid || withdrawalData.agentId;
            const userData = targetUid ? userMap.get(targetUid) : null;
            const userName = userData?.name || null;
            const userEmail = userData?.email || null;

            return {
                id: withdrawalDoc.id,
                ...withdrawalData,
                userName,
                userEmail,
                createdAt: withdrawalData.createdAt?.toDate ? withdrawalData.createdAt.toDate() : (withdrawalData.createdAt ? new Date(withdrawalData.createdAt) : null),
                processedAt: withdrawalData.processedAt?.toDate ? withdrawalData.processedAt.toDate() : (withdrawalData.processedAt ? new Date(withdrawalData.processedAt) : null)
            };
        });

        return withdrawals;
    } catch (error) {
        console.error("Error fetching withdrawals:", error);
        throw error;
    }
};

// Approve withdrawal
export const approveWithdrawal = async (withdrawalId) => {
    try {
        const withdrawalRef = doc(db, "withdrawals", withdrawalId);
        const withdrawalSnap = await getDoc(withdrawalRef);

        if (!withdrawalSnap.exists()) {
            throw new Error("Withdrawal not found");
        }

        const withdrawalData = withdrawalSnap.data();

        // Idempotency check
        if (withdrawalData.status === "approved" || withdrawalData.status === "rejected") {
            throw new Error(`Withdrawal is already ${withdrawalData.status}`);
        }

        const { uid, amount, agentId } = withdrawalData;
        const withdrawalAmount = parseFloat(amount);

        if (isNaN(withdrawalAmount)) {
            throw new Error("Invalid withdrawal amount");
        }

        // Determine which balance to deduct from (User balance or Agent commission)
        const targetUid = uid || agentId;
        const balanceField = uid ? "mainBalance" : "commissionBalance";

        if (!targetUid) {
            throw new Error("User ID or Agent ID missing from withdrawal record");
        }

        // Update wallet balance
        const walletRef = doc(db, "wallets", targetUid);
        const walletSnap = await getDoc(walletRef);

        if (!walletSnap.exists()) {
            throw new Error("Wallet not found for the user");
        }

        const walletData = walletSnap.data();

        // Handle legacy "balance" vs "mainBalance"
        let currentBalance = 0;
        if (balanceField === "mainBalance") {
            currentBalance = walletData.mainBalance !== undefined
                ? walletData.mainBalance
                : (walletData.balance || 0);
        } else {
            currentBalance = parseFloat(walletData[balanceField]) || 0;
        }

        if (currentBalance < withdrawalAmount) {
            throw new Error(`Insufficient funds. Current: ${currentBalance}, Request: ${withdrawalAmount}`);
        }

        const updates = {
            [balanceField]: currentBalance - withdrawalAmount,
            updatedAt: new Date()
        };

        // If main balance, sync asset (USDT TRC20 usually)
        if (balanceField === "mainBalance") {
            const assets = walletData.assets || {};
            // Assume USDT for withdrawals if not specified, or match logic
            // Ideally we deduct specific asset, but simplified system treats mainBalance as USDT-equivalent
            if (assets.USDT && assets.USDT.total !== undefined) {
                assets.USDT.total = Math.max(0, assets.USDT.total - withdrawalAmount);
                if (assets.USDT.networks?.TRC20) {
                    assets.USDT.networks.TRC20 = Math.max(0, assets.USDT.networks.TRC20 - withdrawalAmount);
                }
                updates.assets = assets;
            }
        }

        await updateDoc(walletRef, updates);

        // Update withdrawal status
        await updateDoc(withdrawalRef, {
            status: "approved",
            processedAt: new Date()
        });

        // Notify user
        await createNotification(
            targetUid,
            "Withdrawal Approved",
            `Your withdrawal request for $${withdrawalAmount} has been approved and processed.`,
            "withdrawal"
        );

        return { success: true };
    } catch (error) {
        console.error("Error approving withdrawal:", error);
        throw error;
    }
};

// Reject withdrawal
export const rejectWithdrawal = async (withdrawalId, reason) => {
    try {
        const withdrawalRef = doc(db, "withdrawals", withdrawalId);
        await updateDoc(withdrawalRef, {
            status: "rejected",
            rejectionReason: reason,
            processedAt: new Date()
        });

        const withdrawalData = (await getDoc(withdrawalRef)).data();
        if (withdrawalData && (withdrawalData.uid || withdrawalData.agentId)) {
            await createNotification(
                withdrawalData.uid || withdrawalData.agentId,
                "Withdrawal Rejected",
                `Your withdrawal request was rejected. Reason: ${reason}`,
                "withdrawal"
            );
        }

        return { success: true };
    } catch (error) {
        console.error("Error rejecting withdrawal:", error);
        throw error;
    }
};

// Get all active trades for admin (without limit or high limit, to ensure none are missed)
export const getActiveTradesForAdmin = async () => {
    try {
        const tradesRef = collection(db, "trades");
        const q = query(tradesRef, where("status", "==", "active"));
        const [snapshot, usersSnap] = await Promise.all([
            getDocs(q),
            getDocs(collection(db, "users"))
        ]);

        const userMap = new Map();
        usersSnap.docs.forEach(uDoc => {
            const uData = uDoc.data();
            userMap.set(uDoc.id, uData);
            if (uData.uid) userMap.set(uData.uid, uData);
        });

        const trades = snapshot.docs.map(tradeDoc => {
            const tradeData = tradeDoc.data();
            const userData = tradeData.uid ? userMap.get(tradeData.uid) : null;
            const userEmail = userData?.email || "Unknown";
            const userName = userData?.name || "Unknown";

            return {
                id: tradeDoc.id,
                ...tradeData,
                userEmail,
                userName,
                createdAt: tradeData.createdAt?.toDate ? tradeData.createdAt.toDate() : (tradeData.createdAt ? new Date(tradeData.createdAt) : null),
                closedAt: tradeData.closedAt?.toDate ? tradeData.closedAt.toDate() : (tradeData.closedAt ? new Date(tradeData.closedAt) : null)
            };
        });

        // Sort by creation date desc
        trades.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        return trades;
    } catch (error) {
        console.error("Error fetching active trades:", error);
        throw error;
    }
};

// Get all trades
export const getAllTrades = async () => {
    try {
        const tradesRef = collection(db, "trades");
        const q = query(tradesRef, orderBy("createdAt", "desc"), limit(100));
        const [snapshot, usersSnap] = await Promise.all([
            getDocs(q),
            getDocs(collection(db, "users"))
        ]);

        const userMap = new Map();
        usersSnap.docs.forEach(uDoc => {
            const uData = uDoc.data();
            userMap.set(uDoc.id, uData);
            if (uData.uid) userMap.set(uData.uid, uData);
        });

        const trades = snapshot.docs.map(tradeDoc => {
            const tradeData = tradeDoc.data();
            const userData = tradeData.uid ? userMap.get(tradeData.uid) : null;
            const userEmail = userData?.email || "Unknown";
            const userName = userData?.name || "Unknown";

            return {
                id: tradeDoc.id,
                ...tradeData,
                userEmail,
                userName,
                createdAt: tradeData.createdAt?.toDate ? tradeData.createdAt.toDate() : (tradeData.createdAt ? new Date(tradeData.createdAt) : null),
                closedAt: tradeData.closedAt?.toDate ? tradeData.closedAt.toDate() : (tradeData.closedAt ? new Date(tradeData.closedAt) : null)
            };
        });

        return trades;
    } catch (error) {
        console.error("Error fetching trades:", error);
        throw error;
    }
};

// Force trade result
export const forceTradeResult = async (tradeId, result, pnl) => {
    try {
        const tradeRef = doc(db, "trades", tradeId);
        const tradeSnap = await getDoc(tradeRef);

        if (!tradeSnap.exists()) {
            throw new Error("Trade not found");
        }

        const tradeData = tradeSnap.data();

        // Idempotency check
        if (tradeData.status === "closed") {
            throw new Error("Trade is already closed");
        }

        const updates = {
            status: "closed",
            result: result,
            pnl: pnl,
            closedAt: new Date(),
            forcedBy: "admin"
        };

        // Handle wallet update
        if (result === "win" || result === "tie") {
            const walletRef = doc(db, "wallets", tradeData.uid);
            const walletSnap = await getDoc(walletRef);

            if (walletSnap.exists()) {
                const walletData = walletSnap.data();
                const currentBalance = parseFloat(walletData.tradingBalance) || 0;

                // Calculate return amount
                // If Win: Principal + PnL
                // If Tie: Principal only (PnL is usually 0 but we ignore it for safety or add it if strictly 0)
                let returnAmount = 0;
                const tradeAmount = parseFloat(tradeData.amount) || 0;
                const pnlAmount = parseFloat(pnl) || 0;

                if (result === "win") {
                    returnAmount = tradeAmount + pnlAmount;
                } else if (result === "tie") {
                    returnAmount = tradeAmount;
                }

                await updateDoc(walletRef, {
                    tradingBalance: currentBalance + returnAmount,
                    updatedAt: new Date()
                });
            }
        }

        await updateDoc(tradeRef, updates);
        return { success: true };
    } catch (error) {
        console.error("Error forcing trade result:", error);
        throw error;
    }
};

/**
 * Manually assign a user to an agent (for users who didn't use referral code)
 */
export const assignUserToAgent = async (userId, agentId) => {
    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            throw new Error("User not found");
        }

        // Verify agent exists and has agent role
        const agentRef = doc(db, "users", agentId);
        const agentSnap = await getDoc(agentRef);

        if (!agentSnap.exists()) {
            throw new Error("Agent not found");
        }

        if (agentSnap.data().role !== "agent") {
            throw new Error("Selected user is not an agent");
        }

        // Update user document with referredBy field
        await updateDoc(userRef, {
            referredBy: agentId,
            updatedAt: new Date()
        });

        return { success: true };
    } catch (error) {
        console.error("Error assigning user to agent:", error);
        throw error;
    }
};

/**
 * Get all agents (for dropdown selection)
 */
export const getAllAgents = async () => {
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("role", "==", "agent"));
        const [snapshot, walletsSnap] = await Promise.all([
            getDocs(q),
            getDocs(collection(db, "wallets"))
        ]);

        const walletMap = new Map();
        walletsSnap.docs.forEach(docSnap => {
            const data = docSnap.data();
            walletMap.set(docSnap.id, data);
            if (data.uid) walletMap.set(data.uid, data);
        });

        return snapshot.docs.map(doc => {
            const data = doc.data();
            const walletData = walletMap.get(doc.id) || walletMap.get(data.uid);
            return {
                id: doc.id,
                ...data,
                commissionBalance: walletData?.commissionBalance || 0
            };
        });
    } catch (error) {
        console.error("Error fetching agents:", error);
        throw error;
    }
};

/**
 * Get users referred by a specific agent
 */
export const getUsersByReferrer = async (agentId) => {
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("referredBy", "==", agentId));
        const [snapshot, walletsSnap] = await Promise.all([
            getDocs(q),
            getDocs(collection(db, "wallets"))
        ]);

        const walletMap = new Map();
        walletsSnap.docs.forEach(docSnap => {
            const data = docSnap.data();
            walletMap.set(docSnap.id, data);
            if (data.uid) walletMap.set(data.uid, data);
        });

        const users = snapshot.docs.map(userDoc => {
            const userData = userDoc.data();
            const walletData = walletMap.get(userDoc.id) || walletMap.get(userData.uid);

            return {
                id: userDoc.id,
                ...userData,
                balance: (walletData?.mainBalance || 0) + (walletData?.tradingBalance || 0),
                createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate() : (userData.createdAt ? new Date(userData.createdAt) : null)
            };
        });

        // Sort by joined date desc
        users.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        return users;
    } catch (error) {
        console.error("Error fetching referred users:", error);
        throw error;
    }
};

/**
 * Recalculate commissions for all past approved deposits
 * This is useful for backfilling data or fixing missing commissions
 */
export const recalculateCommissions = async () => {
    try {
        console.log("Starting commission recalculation...");

        // 1. Get all approved deposits
        const depositsRef = collection(db, "deposits");
        const q = query(depositsRef, where("status", "==", "approved"));
        const depositSnap = await getDocs(q);

        console.log(`Found ${depositSnap.size} approved deposits`);

        let createdCount = 0;
        let skippedCount = 0;

        for (const depositDoc of depositSnap.docs) {
            const deposit = depositDoc.data();
            const depositId = depositDoc.id;

            // 2. Check if commission already exists for this deposit
            const commRef = collection(db, "commissions");
            const commQ = query(commRef, where("depositId", "==", depositId));
            const commSnap = await getDocs(commQ);

            if (!commSnap.empty) {
                skippedCount++;
                continue; // Commission already exists
            }

            // 3. Get user to check for referrer
            if (!deposit.uid) continue;

            const userRef = doc(db, "users", deposit.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) continue;

            const userData = userSnap.data();

            if (userData.referredBy) {
                const amount = parseFloat(deposit.amount);
                if (isNaN(amount)) continue;

                const platformFee = amount * 0.10;       // 10%
                const platformProfit = amount * 0.50;    // 50%
                const agentCommission = amount * 0.40;   // 40%

                // 4. Create commission record
                await addDoc(collection(db, "commissions"), {
                    agentId: userData.referredBy,
                    userId: deposit.uid,
                    depositId: depositId,
                    depositAmount: amount,
                    platformFee,
                    agentCommission,
                    platformProfit,
                    status: "approved",
                    createdAt: deposit.createdAt || new Date(), // Use deposit date if available
                    recalculatedAt: new Date()
                });

                // 5. Update agent wallet
                const agentWalletRef = doc(db, "wallets", userData.referredBy);
                const agentWalletSnap = await getDoc(agentWalletRef);

                if (agentWalletSnap.exists()) {
                    const currentComm = parseFloat(agentWalletSnap.data().commissionBalance) || 0;
                    await updateDoc(agentWalletRef, {
                        commissionBalance: currentComm + agentCommission,
                        updatedAt: new Date()
                    });
                } else {
                    await setDoc(agentWalletRef, {
                        uid: userData.referredBy,
                        mainBalance: 0,
                        tradingBalance: 0,
                        commissionBalance: agentCommission,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                }

                createdCount++;
            }
        }

        return { success: true, created: createdCount, skipped: skippedCount };
    } catch (error) {
        console.error("Error recalculating commissions:", error);
        throw error;
    }
};

/**
 * Get platform settings (including deposit addresses)
 */
export const getPlatformSettings = async () => {
    try {
        const settingsRef = doc(db, "settings", "platform");
        const settingsSnap = await getDoc(settingsRef);

        if (settingsSnap.exists()) {
            return settingsSnap.data();
        } else {
            // Default mock data if no settings exist yet
            return {
                depositAddresses: {
                    BTC: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
                    ETH: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
                    USDT: "TYASr5UV6HEcXatwdFQfmLVUqQQQMUxHLS",
                    BNB: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
                    SOL: "HN7cABV4HPzsiTy2XTn8213Mupjs12DhfW1ALFu56B24",
                    XRP: "rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh",
                    DOGE: "DJL7z75z65AFG75z65AFG75z65AFG75z65"
                },
                updatedAt: new Date()
            };
        }
    } catch (error) {
        console.error("Error fetching platform settings:", error);
        throw error;
    }
};

/**
 * Get balance history log (all admin/agent balance changes)
 */
export const getBalanceHistory = async ({ limitCount = 200 } = {}) => {
    try {
        const histRef = collection(db, "balanceHistory");
        const q = query(histRef, orderBy("createdAt", "desc"), limit(limitCount));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(d => ({
            id: d.id,
            ...d.data(),
            createdAt: d.data().createdAt?.toDate()
        }));
    } catch (error) {
        console.error("Error fetching balance history:", error);
        throw error;
    }
};

/**
 * Set a custom deposit wallet address for a specific user.
 * Stored at wallets/{userId}.customDepositAddresses.{crypto}
 * The Deposit page will prioritise these over platform-wide defaults.
 */
export const setUserWalletAddress = async (userId, crypto, address, network = null) => {
    try {
        const walletRef = doc(db, "wallets", userId);
        const walletSnap = await getDoc(walletRef);

        const field = `customDepositAddresses.${crypto.toUpperCase()}`;
        const entry = { address, network: network || crypto, updatedAt: new Date() };

        if (!walletSnap.exists()) {
            // Create the wallet document with just the custom address
            await setDoc(walletRef, {
                uid: userId,
                mainBalance: 0,
                tradingBalance: 0,
                customDepositAddresses: { [crypto.toUpperCase()]: entry },
                createdAt: new Date(),
                updatedAt: new Date()
            });
        } else {
            await updateDoc(walletRef, {
                [field]: entry,
                updatedAt: new Date()
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Error setting user wallet address:", error);
        throw error;
    }
};

/**
 * Get a user's custom deposit addresses (returns null if none set)
 */
export const getUserWalletAddresses = async (userId) => {
    try {
        const walletRef = doc(db, "wallets", userId);
        const walletSnap = await getDoc(walletRef);

        if (!walletSnap.exists()) return null;
        return walletSnap.data().customDepositAddresses || null;
    } catch (error) {
        console.error("Error fetching user wallet addresses:", error);
        return null;
    }
};



/**
 * Update platform settings
 */
export const updatePlatformSettings = async (settings) => {
    try {
        console.log("💾 Saving platform settings to Firestore:", settings);
        const settingsRef = doc(db, "settings", "platform");
        await setDoc(settingsRef, {
            ...settings,
            updatedAt: new Date()
        }, { merge: true });

        console.log("✅ Platform settings saved successfully!");
        return { success: true };
    } catch (error) {
        console.error("❌ Error updating platform settings:", error);
        throw error;
    }
};
