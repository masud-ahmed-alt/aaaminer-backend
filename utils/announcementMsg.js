export const announcementMsg = (fullname)=>{
    const message =`
    
    <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
            color: #333;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background-color: #007BFF;
            color: white;
            text-align: center;
            padding: 20px;
            font-size: 24px;
            font-weight: bold;
        }
        .content {
            padding: 20px;
            line-height: 1.6;
        }
        .content h2 {
            color: #007BFF;
        }
        .cta {
            text-align: center;
            margin: 20px 0;
        }
        .cta a {
            text-decoration: none;
            background-color: #28a745;
            color: white;
            padding: 12px 24px;
            border-radius: 5px;
            font-size: 16px;
            font-weight: bold;
        }
        .cta a:hover {
            background-color: #218838;
        }
        .footer {
            background-color: #f1f1f1;
            text-align: center;
            padding: 10px;
            font-size: 14px;
            color: #666;
        }
        .footer a {
            color: #007BFF;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header Section -->
        <div class="header">
            Exciting Rewards Are Coming Your Way!
        </div>
        <!-- Content Section -->
        <div class="content">
            <h2>Hi ${fullname},</h2>
            <p>
                We're thrilled to announce that we're working hard to bring you exciting new ways to redeem your points! Soon, you'll be able to unlock amazing rewards, exclusive offers, and incredible gifts.
            </p>
            <p>
                In the meantime, stay connected and keep fulfilling your tasks to maximize your points. The more you engage, the bigger the rewards you'll earn!
            </p>
            <div class="cta">
               
            </div>
            <p>
                Thank you for being a part of our journey. Together, let's turn your efforts into unforgettable rewards!
            </p>
        </div>
        <!-- Footer Section -->
        <div class="footer">
            <p>
                Need help? <a href="https://t.me/rewardplus">Join Telegram</a> or visit our <a href="https://rewardplus.site/" target="_blank">Official Site</a>.
            </p>
            <p>&copy; 2024-25 Reward+. All rights reserved.</p>
        </div>
    </div>
</body>
</html>


    `


    return message
}