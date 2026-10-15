// scripts/createUserDocuments.js
// This script creates Firestore documents for existing Firebase Auth users
// Run this once to migrate your existing users

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBJj1C6iv7oYuT6OFMANRv5yvElWAAU5Pk",
    authDomain: "investcoin-a817c.firebaseapp.com",
    projectId: "investcoin-a817c",
    storageBucket: "investcoin-a817c.firebasestorage.app",
    messagingSenderId: "289683454442",
    appId: "1:289683454442:web:3bdb3b3b1adb0cfdf49a93"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// List of your existing users from the screenshot
const existingUsers = [
    {
        uid: "Mr9dUZcZz4Wkt62eO3eC1Be...", // Replace with full UID
        email: "blen27az@gmail.com"
    },
    {
        uid: "JTawhi89uEbRuuqSsYAUA1Q...", // Replace with full UID
        email: "blen27zeru@gmail.com"
    },
    {
        uid: "EnwCwg6zs9RsO7yQl9KH3nX...", // Replace with full UID
        email: "blenzeru27@gmail.com"
    }
];

async function createUserDocuments() {
    console.log('🚀 Creating Firestore documents for existing users...\n');

    for (const user of existingUsers) {
        try {
            // Check if user document already exists
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                console.log(`⏭️  User ${user.email} already has a document`);
                continue;
            }

            // Create user document
            await setDoc(userDocRef, {
                uid: user.uid,
                email: user.email,
                role: 'user', // Default role
                referredBy: null,
                frozen: false,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            console.log(`✅ Created user document for ${user.email}`);

            // Create wallet document
            const walletDocRef = doc(db, 'wallets', user.uid);
            await setDoc(walletDocRef, {
                uid: user.uid,
                balance: 0,
                commissionBalance: 0,
                updatedAt: new Date()
            });

            console.log(`✅ Created wallet document for ${user.email}\n`);

        } catch (error) {
            console.error(`❌ Error creating documents for ${user.email}:`, error);
        }
    }

    console.log('\n✨ Done! Check your Firestore console.');
    process.exit(0);
}

createUserDocuments();
