# Test Data Scripts

This directory contains scripts to add test data to the database for testing purposes.

## Add Test Withdrawal Data

This script adds test withdrawal data with different statuses (processing, success, rejected) to test the EarningFragment in the Android app.

### Prerequisites

1. Make sure you have a user account in the database (register through the app or create one manually)
2. Ensure your `.env` file has the correct `MONGO_URI` configured

### Usage

#### Option 1: Using npm script (Recommended)

```bash
cd server
npm run add-test-data
```

#### Option 2: Direct node execution

```bash
cd server
node scripts/addTestWithdrawData.js
```

### What the script does

- Connects to your MongoDB database
- Finds the first user in the database
- Adds 10 test withdrawal records:
  - **3 Processing** withdrawals (recent)
  - **4 Success** withdrawals with voucher codes
  - **3 Rejected** withdrawals

### Test Data Details

#### Processing Withdrawals
- Amazon Gift Voucher - 10,000 points (₹10.00)
- Google Play Voucher - 20,000 points (₹20.00)
- Amazon Gift Voucher - 50,000 points (₹50.00)

#### Successful Withdrawals (with voucher codes)
- Amazon Gift Voucher - 100,000 points (₹100.00) - Code: `AMZN2024ABC123XYZ`
- Google Play Voucher - 150,000 points (₹150.00) - Code: `GPLAY789DEF456GHI`
- Amazon Gift Voucher - 200,000 points (₹200.00) - Code: `AMZN2024JKL789MNO`
- Google Play Voucher - 30,000 points (₹30.00) - Code: `GPLAY456PQR123STU`

#### Rejected Withdrawals
- Amazon Gift Voucher - 80,000 points (₹80.00)
- Google Play Voucher - 100,000 points (₹100.00)
- Amazon Gift Voucher - 50,000 points (₹50.00)

### Notes

- The script uses the first user found in the database
- If no users exist, the script will exit with an error message
- All test data includes realistic timestamps (createdAt and updatedAt)
- Voucher codes are only added for successful withdrawals
- You can run this script multiple times - it will add more test data each time

### Testing in Android App

After running the script:

1. Open your Android app
2. Log in with the user account that has the test data
3. Navigate to the Earnings tab
4. You should see:
   - All withdrawals when "All" filter is selected
   - Processing withdrawals when "Processing" filter is selected
   - Successful withdrawals with voucher codes when "Success" filter is selected
   - Rejected withdrawals when "Rejected" filter is selected
5. Test the copy voucher code functionality by tapping on voucher codes in successful withdrawals

### Troubleshooting

**Error: "No users found"**
- Solution: Create a user account first through the app registration or manually in the database

**Error: "MONGO_URI is not defined"**
- Solution: Make sure your `.env` file exists and contains `MONGO_URI=your_mongodb_connection_string`

**Error: "Database connection failed"**
- Solution: Check your MongoDB connection string and ensure MongoDB is running

