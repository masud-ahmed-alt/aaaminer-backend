export const announcementMsg = (fullname)=>{
    const message =`
  <!DOCTYPE html>
<html>
<head>
    <title>Exciting Rewards Await You!</title>
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
        .button-container {
            text-align: center;
        }
        .cta-button {
            display: inline-block;
            margin: 20px 0;
            padding: 12px 20px;
            background-color: #ff5722;
            color: white;
            font-weight: bold;
            text-decoration: none;
            border-radius: 4px;
        }
        .cta-button:hover {
            background-color: #e64a19;
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
            <h1>Don’t Miss Out on Exciting Rewards!</h1>
        </div>
        <div class="content">
            <h2>Hi ${fullname},</h2>
            <p>Get ready to take your Reward+ experience to the next level! Here’s what’s waiting for you:</p>
            <ul>
                <li><strong>Scratch and Win:</strong> Don’t forget to scratch your scratch cards daily for exciting rewards!</li>
                <li><strong>Complete Your Tasks:</strong> Stay ahead of the competition by completing your tasks and earning points.</li>
                <li><strong>Climb the Leaderboard:</strong> Reach the top and unlock exclusive benefits and recognition!</li>
            </ul>
            <p>Your journey to the top starts now. Every action counts, so let’s make it happen!</p>
            <div class="button-container">
                <a href="https://play.google.com/store/apps/details?id=com.nexumbyte.rewardplus" class="cta-button">Start Earning Rewards</a>
            </div>
        </div>
        <div class="footer">
            <p>Thank you for being a valued part of the Reward+ community.</p>
            <p>&copy; 2025 Reward+ | All rights reserved</p>
        </div>
    </div>
</body>
</html>


    `
    return message
}