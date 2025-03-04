export const unbanMailMsg = (fullname)=>{
    const message =`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Reinstatement Notice</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f4f7f9;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        .header {
            background-color: #28a745;
            padding: 20px;
            border-top-left-radius: 12px;
            border-top-right-radius: 12px;
        }
        .header h1 {
            color: #ffffff;
            font-size: 24px;
            margin: 0;
            font-weight: bold;
        }
        .content {
            text-align: left;
            padding: 20px;
        }
        p {
            color: #444;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 15px;
        }
        .button-container {
            text-align: center;
            margin: 25px 0;
        }
        .button {
            display: inline-block;
            background-color: #28a745;
            color: #ffffff;
            padding: 14px 25px;
            font-size: 16px;
            font-weight: bold;
            text-decoration: none;
            border-radius: 8px;
            transition: 0.3s ease-in-out;
        }
        .button:hover {
            background-color: #218838;
        }
        .footer {
            margin-top: 30px;
            font-size: 13px;
            color: #777;
            text-align: center;
        }
        a {
            color: #007bff;
            text-decoration: none;
        }
        .regards {
            font-size: 16px;
            font-weight: bold;
            margin-top: 20px;
            text-align: left;
        }

        /* Responsive Design */
        @media (max-width: 600px) {
            .container {
                width: 90%;
                padding: 10px;
            }
            .header h1 {
                font-size: 22px;
            }
            p {
                font-size: 15px;
            }
            .button {
                width: 90%;
                padding: 14px;
                font-size: 15px;
                text-align: center;
                display: block;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Account Reinstated Successfully</h1>
        </div>
        <div class="content">
            <p>Dear ${fullname},</p>
            <p>We are pleased to inform you that your account has been <strong>successfully reinstated</strong>. After reviewing your case, we have determined that your account is now in good standing, and all restrictions have been lifted.</p>
            <p>You can now log in and continue using our services without any interruptions.</p>
            <div class="button-container">
                <a href="https://play.google.com/store/apps/details?id=com.nexumbyte.rewardplus" class="button">Login to Your Account</a>
            </div>
            <p>If you have any further questions, feel free to reach out to our support team.</p>
            <p class="regards">With regards,<br><strong>Team Reward+</strong></p>
        </div>
        <div class="footer">
            <p>&copy; 2025 Reward+. All Rights Reserved.</p>
        </div>
    </div>
</body>
</html>


    `
    return message
}