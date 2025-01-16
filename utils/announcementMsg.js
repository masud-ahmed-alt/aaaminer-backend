export const announcementMsg = (fullname)=>{
    const message =`
    <!DOCTYPE html>
<html>
<head>
    <title>Exciting Announcement!</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background-color: #007bff;
            color: white;
            text-align: center;
            padding: 20px;
        }
        .header h1 {
            margin: 0;
        }
        .content {
            padding: 20px;
            color: #333;
            line-height: 1.6;
        }
        .content h2 {
            color: #007bff;
        }
        .cta-button {
            display: inline-block;
            margin: 20px 0;
            padding: 10px 20px;
            background-color: #28a745;
            color: white;
            text-decoration: none;
            border-radius: 4px;
        }
        .footer {
            text-align: center;
            padding: 10px;
            background: #f8f9fa;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Great News 🎉</h1>
        </div>
        <div class="content">
            <h2>Hello ${fullname},</h2>
            <p>We’re thrilled to share that the redemption functionality you’ve been waiting for is almost ready to launch! 🚀</p>
            <p>Take this opportunity to <strong>complete your tasks</strong> and <strong>refer your friends</strong> to climb to the top of the leaderboard. Incredible rewards and exclusive deals are waiting for the top performers!</p>
            <p>Let’s make this moment count!</p>
            <a href="https://play.google.com/store/apps/details?id=com.nexumbyte.rewardplus" class="cta-button">Complete Tasks Now</a>
        </div>
        <div class="footer">
            <p>Thank you for being a valued part of our community.</p>
            <p>&copy; 2025 Reward+ | All rights reserved</p>
        </div>
    </div>
</body>
</html>

    `
    return message
}