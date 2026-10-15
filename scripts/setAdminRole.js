// scripts/setAdminRole.js
// Run this script once to set your first admin user
// Usage: node scripts/setAdminRole.js YOUR_EMAIL@example.com

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

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

async function setAdminRole(email) {
    try {
        // Find user by email
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', email));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.error(`❌ No user found with email: ${email}`);
            console.log('Make sure the user has signed up first!');
            return;
        }

        // Update role to admin
        const userDoc = snapshot.docs[0];
        await updateDoc(doc(db, 'users', userDoc.id), {
            role: 'admin',
            updatedAt: new Date()
        });

        console.log(`✅ Successfully set ${email} as ADMIN`);
        console.log(`User ID: ${userDoc.id}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error setting admin role:', error);
        process.exit(1);
    }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
    console.error('❌ Please provide an email address');
    console.log('Usage: node scripts/setAdminRole.js your@email.com');
    process.exit(1);
}

setAdminRole(email);
