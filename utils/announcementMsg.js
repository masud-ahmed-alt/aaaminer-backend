export const announcementMsg = (fullname)=>{
//     const message =`
    
//     <!DOCTYPE html>
// <html>
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <style>
//         body {
//             font-family: Arial, sans-serif;
//             background-color: #f9f9f9;
//             margin: 0;
//             padding: 0;
//             color: #333;
//         }
//         .email-container {
//             max-width: 600px;
//             margin: 20px auto;
//             background-color: #ffffff;
//             border-radius: 8px;
//             box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
//             overflow: hidden;
//         }
//         .header {
//             background-color: #007BFF;
//             color: white;
//             text-align: center;
//             padding: 20px;
//             font-size: 24px;
//             font-weight: bold;
//         }
//         .content {
//             padding: 20px;
//             line-height: 1.6;
//         }
//         .content h2 {
//             color: #007BFF;
//         }
//         .cta {
//             text-align: center;
//             margin: 20px 0;
//         }
//         .cta a {
//             text-decoration: none;
//             background-color: #28a745;
//             color: white;
//             padding: 12px 24px;
//             border-radius: 5px;
//             font-size: 16px;
//             font-weight: bold;
//         }
//         .cta a:hover {
//             background-color: #218838;
//         }
//         .footer {
//             background-color: #f1f1f1;
//             text-align: center;
//             padding: 10px;
//             font-size: 14px;
//             color: #666;
//         }
//         .footer a {
//             color: #007BFF;
//             text-decoration: none;
//         }
//     </style>
// </head>
// <body>
//     <div class="email-container">
//         <!-- Header Section -->
//         <div class="header">
//             Exciting Rewards Are Coming Your Way!
//         </div>
//         <!-- Content Section -->
//         <div class="content">
//             <h2>Hi ${fullname},</h2>
//             <p>
//                 We're thrilled to announce that we're working hard to bring you exciting new ways to redeem your points! Soon, you'll be able to unlock amazing rewards, exclusive offers, and incredible gifts.
//             </p>
//             <p>
//                 In the meantime, stay connected and keep fulfilling your tasks to maximize your points. The more you engage, the bigger the rewards you'll earn!
//             </p>
//             <div class="cta">
               
//             </div>
//             <p>
//                 Thank you for being a part of our journey. Together, let's turn your efforts into unforgettable rewards!
//             </p>
//         </div>
//         <!-- Footer Section -->
//         <div class="footer">
//             <p>
//                 Need help? <a href="https://t.me/rewardplus">Join Telegram</a> or visit our <a href="https://rewardplus.site/" target="_blank">Official Site</a>.
//             </p>
//             <p>&copy; 2024-25 Reward+. All rights reserved.</p>
//         </div>
//     </div>
// </body>
// </html>


//     `

    const message = `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Update Your Application</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border: 1px solid #dddddd;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header h1 {
            color: #333333;
        }
        .content {
            line-height: 1.6;
            color: #555555;
        }
        .content p {
            margin: 10px 0;
        }
        .cta-button {
            display: inline-block;
            margin: 20px 0;
            padding: 10px 20px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
        }
        .cta-button:hover {
            background-color: #0056b3;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #888888;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Update Your Application, Reward+</h1>
        </div>
        <div class="content">
            <p>Dear ${fullname},</p>
            <p>We are excited to inform you that the issue affecting your tasks in the application has been resolved. To continue enjoying a seamless experience, we kindly request you to update your application to the latest version.</p>
            <p>The new update includes fixes for the reported issues and enhancements to improve your experience.</p>
            <p>Click the button below to update your application now:</p>
            <p style="text-align: center;">
                <a href="https://play.google.com/store/apps/details?id=com.nexumbyte.rewardplus" class="cta-button">Update Now</a>
            </p>
            <p>Thank you for your continued support and patience.</p>
            <p>Best regards,<br>Team Reward+ </p>
        </div>
        <div class="footer">
            <p>&copy; 2024-25 Reward+. All rights reserved.</p>
           
        </div>
    </div>
</body>
</html>



    `

    return message
}