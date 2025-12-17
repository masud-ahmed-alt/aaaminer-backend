/**
 * Script to add test withdrawal data for testing EarningFragment
 * 
 * Usage: node server/scripts/addTestWithdrawData.js
 * Or: npm run add-test-data (if added to package.json)
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import Withdraw from "../models/Withdraw.js";
import User from "../models/User.js";

// Load environment variables
dotenv.config({ path: ".env" });

const addTestWithdrawData = async () => {
    try {
        // Connect to database
        const dbURI = process.env.MONGO_URI;
        if (!dbURI) {
            console.error("❌ MONGO_URI is not defined in environment variables");
            process.exit(1);
        }

        // Connect to MongoDB
        await mongoose.connect(dbURI, { dbName: "aaaminer" });
        console.log("✅ Connected to database");

        // Get the first user (or create a test user if none exists)
        let user = await User.findOne();
        
        if (!user) {
            console.log("⚠️  No users found. Creating a test user...");
            // You might want to create a test user here or use an existing one
            console.log("❌ Please create a user first through registration");
            process.exit(1);
        }

        console.log(`✅ Using user: ${user.name} (${user.email})`);

        // Clear existing test withdrawals for this user (optional)
        const existingCount = await Withdraw.countDocuments({ user: user._id });
        console.log(`📊 Found ${existingCount} existing withdrawals for this user`);

        // Test withdrawal data with different statuses
        const testWithdrawals = [
            // Processing withdrawals
            {
                user: user._id,
                name: "Amazon Gift Voucher",
                redeemOption: "0",
                points: 10000,
                amount: 10.00,
                status: "processing",
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            },
            {
                user: user._id,
                name: "Google Play Voucher",
                redeemOption: "1",
                points: 20000,
                amount: 20.00,
                status: "processing",
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
                updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
            },
            {
                user: user._id,
                name: "Amazon Gift Voucher",
                redeemOption: "0",
                points: 50000,
                amount: 50.00,
                status: "processing",
                createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
                updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
            },
            
            // Successful withdrawals with voucher codes
            {
                user: user._id,
                name: "Amazon Gift Voucher",
                redeemOption: "0",
                voucher: "AMZN2024ABC123XYZ",
                points: 100000,
                amount: 100.00,
                status: "success",
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
                updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // Updated 5 days ago
            },
            {
                user: user._id,
                name: "Google Play Voucher",
                redeemOption: "1",
                voucher: "GPLAY789DEF456GHI",
                points: 150000,
                amount: 150.00,
                status: "success",
                createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
                updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) // Updated 8 days ago
            },
            {
                user: user._id,
                name: "Amazon Gift Voucher",
                redeemOption: "0",
                voucher: "AMZN2024JKL789MNO",
                points: 200000,
                amount: 200.00,
                status: "success",
                createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
                updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000) // Updated 12 days ago
            },
            {
                user: user._id,
                name: "Google Play Voucher",
                redeemOption: "1",
                voucher: "GPLAY456PQR123STU",
                points: 30000,
                amount: 30.00,
                status: "success",
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
                updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // Updated 2 days ago
            },
            
            // Rejected withdrawals
            {
                user: user._id,
                name: "Amazon Gift Voucher",
                redeemOption: "0",
                points: 80000,
                amount: 80.00,
                status: "rejected",
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
                updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // Updated 4 days ago
            },
            {
                user: user._id,
                name: "Google Play Voucher",
                redeemOption: "1",
                points: 100000,
                amount: 100.00,
                status: "rejected",
                createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
                updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Updated 7 days ago
            },
            {
                user: user._id,
                name: "Amazon Gift Voucher",
                redeemOption: "0",
                points: 50000,
                amount: 50.00,
                status: "rejected",
                createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
                updatedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000) // Updated 11 days ago
            }
        ];

        // Insert test data
        console.log("\n📝 Adding test withdrawal data...");
        const result = await Withdraw.insertMany(testWithdrawals);
        
        console.log(`\n✅ Successfully added ${result.length} test withdrawals:`);
        console.log(`   - ${testWithdrawals.filter(w => w.status === 'processing').length} Processing`);
        console.log(`   - ${testWithdrawals.filter(w => w.status === 'success').length} Success`);
        console.log(`   - ${testWithdrawals.filter(w => w.status === 'rejected').length} Rejected`);
        
        console.log("\n📋 Test Data Summary:");
        testWithdrawals.forEach((withdraw, index) => {
            console.log(`   ${index + 1}. ${withdraw.name} - ${withdraw.points} points (${withdraw.status})`);
            if (withdraw.voucher) {
                console.log(`      Voucher: ${withdraw.voucher}`);
            }
        });

        console.log("\n✅ Test data added successfully!");
        console.log("💡 You can now test the EarningFragment in your Android app");
        
        // Close database connection
        await mongoose.connection.close();
        console.log("✅ Database connection closed");
        process.exit(0);

    } catch (error) {
        console.error("❌ Error adding test data:", error);
        process.exit(1);
    }
};

// Run the script
addTestWithdrawData();

