export const banMailMsg = (fullname)=>{
    const message =`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Suspension Notice</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f8f9fa;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        .header {
            background-color: #d9534f;
            padding: 15px;
            border-top-left-radius: 12px;
            border-top-right-radius: 12px;
        }
        .header h1 {
            color: #ffffff;
            font-size: 22px;
            margin: 0;
        }
        .content {
            text-align: left;
            padding: 20px;
        }
        p {
            color: #333;
            font-size: 16px;
            line-height: 1.6;
        }
        .button-container {
            text-align: center;
            margin-top: 20px;
        }
        .button {
            display: inline-block;
            background-color: #d9534f;
            color: #ffffff;
            padding: 12px 20px;
            font-size: 16px;
            font-weight: bold;
            text-decoration: none;
            border-radius: 6px;
            width: auto;
        }
        .footer {
            margin-top: 25px;
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
                font-size: 20px;
            }
            p {
                font-size: 14px;
            }
            .button {
                width: 90%;
                padding: 12px;
                font-size: 14px;
                display: block;
                text-align: center;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Important Notice: Account Suspension</h1>
        </div>
        <div class="content">
            <p>Dear ${fullname},</p>
            <p>We regret to inform you that your account has been <strong>suspended</strong> due to a <strong>violation of our policies</strong>. Our automated system has detected activities that go against our <a href="https://sites.google.com/view/reardplus-terms-and-conditions/home">terms and conditions</a>.</p>
            <p>If you believe this action was taken in error or wish to appeal, please contact our support team.</p>
            <div class="button-container">
                <a href="mailto:rewardplusofficial@gmail.com" class="button">Contact Support</a>
            </div>
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