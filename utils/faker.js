import { faker } from '@faker-js/faker';
import User from '../models/User.js';
import bcrypt from "bcrypt";

export const seedUsers = async (no) => {
    try {
        // Find the user by ID to be used as the referrer (if any)
        const referrerUser = await User.findById("674d8dc3fe04f84c1e5dd0ca");

        const users = [];

        for (let i = 0; i < no; i++) {
            // Randomly decide if the user will have a referrer
            const shouldHaveReferrer = Math.random() < 0.2;
            let referredBy = null;

            // If the user should have a referrer, assign the referrer (use referrerUser here)
            if (shouldHaveReferrer && referrerUser) {
                referredBy = referrerUser._id;
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash("password", 10);

            // Add the user to the users array
            users.push({
                name: faker.person.fullName(),
                username: faker.internet.username().slice(0, 7),
                email: faker.internet.email(),
                password: hashedPassword,  // Hashed password
                walletPoints: faker.number.int({ min: 5000, max: 10000 }),  // Random wallet points between 5000 and 10000
                referredBy: referredBy, // Reference to the referrer user if any
            });
        }

        // Insert all users into the database at once
        const insertedUsers = await User.insertMany(users);
        console.log(`${insertedUsers.length} users seeded successfully`);

    } catch (err) {
        console.error('Error seeding users:', err);
    } finally {
        process.exit();  // Exit the process
    }
};
