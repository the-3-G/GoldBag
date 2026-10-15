# Agent Referral Code Migration

## Quick Start

### Option 1: Run from Admin Panel (Recommended)

1. Log in as admin
2. Go to Admin Dashboard
3. Look for "Migration Tools" section
4. Click "Migrate Agent Referral Codes"
5. Confirm the action
6. Wait for completion message

### Option 2: Run Standalone Script

```bash
# Navigate to project directory
cd c:\Users\jacka\OneDrive\Documents\Analyitics\investFX

# Install dependencies if needed
npm install

# Run the migration script
node scripts/migrateAgentReferralCodes.js
```

## What It Does

The migration script will:

1. ✅ Find all users with `role === "agent"`
2. ✅ Check if they have a `referralCode` field
3. ✅ Generate unique 6-character codes for agents without one
4. ✅ Update their user documents in Firestore
5. ✅ Provide a detailed summary of results

## Example Output

```
🚀 Starting agent referral code migration...

📊 Found 5 existing referral codes

🔍 Found 3 agents without referral codes:
   1. john@example.com
   2. jane@example.com  
   3. agent@test.com

✅ Assigned code ABC123 to john@example.com
✅ Assigned code XYZ789 to jane@example.com
✅ Assigned code DEF456 to agent@test.com

==================================================
📈 Migration Summary:
   ✅ Successful: 3
   ❌ Failed: 0
   📊 Total: 3
==================================================

🎉 Migration completed successfully!
```

## Safety Features

- ✅ **Idempotent** - Safe to run multiple times, won't duplicate codes
- ✅ **Unique Codes** - Checks existing codes to prevent duplicates
- ✅ **Error Handling** - Continues even if one agent fails
- ✅ **Detailed Logging** - Shows exactly what happened
- ✅ **No Data Loss** - Only adds fields, doesn't remove anything

## Troubleshooting

**Script fails to connect to Firebase:**
- Check that your `.env` file has correct Firebase credentials
- Ensure Firebase project is accessible

**Some agents fail to update:**
- Check the error messages in the output
- Verify Firebase permissions
- Retry the failed agents manually

**Need to regenerate a specific agent's code:**
- Use the Admin Panel's "Agent Creator" to upgrade the user again
- Or update directly in Firestore console
