export const announcementMsg = (fullname)=>{
    const message =`
   <!DOCTYPE html>
<html>
<head>
    <title>Important Update Request!</title>
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
            <h1>Update Your Profile!</h1>
        </div>
        <div class="content">
            <h2>Hi ${fullname},</h2>
            <p>We’ve noticed some of your profile information might be outdated, and we want to ensure you get the most out of Reward+.</p>
            <p>Keeping your profile up-to-date helps us provide you with the best personalized experience, timely notifications, and exclusive offers!</p>
            <p>It only takes a minute, and it’s the easiest way to stay connected to all the exciting features we’re rolling out.</p>
            <div class="button-container">
                <a href="https://play.google.com/store/apps/details?id=com.nexumbyte.rewardplus" class="cta-button">Update Profile Now</a>
            </div>
        </div>
        <div class="footer">
            <p>We appreciate your continued support in making Reward+ amazing.</p>
            <p>&copy; 2025 Reward+ | All rights reserved</p>
        </div>
    </div>
</body>
</html>

    `
    return message
}