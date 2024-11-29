export const getMessage = (subject,name, otp)=>{
    const message=`
    
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Email</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #fff;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #202128;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            padding: 20px;
            text-align: center;
        }
        h1 {
            color: #fff;
        }
        p {
            color: #fff;
            font-size: 16px;
        }
        .otp-code {
            font-size: 24px;
            font-weight: bold;
            color: #007BFF;
            margin: 20px 0;
        }
        .note {
            font-size: 14px;
            color: #999;
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #aaa;
        }
        .btn {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #007BFF;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <h1>${subject}</h1>
        <p>Hello, <strong>${name}</strong></p>
        <p>Your One-Time Password (OTP) is:</p>
        <div class="otp-code">${otp}</div>
        <p class="note">This OTP will expire in 15 minutes.</p>
        <br><br><br>
        <div class="footer">
            <p>If you did not request this, please ignore this email.</p>
            <p>&copy; 2024 <strong>Reward+ Labs Inc.</strong>. All rights reserved.</p>
        </div>
    </div>
</body>
</html>




    `

    return message
}