export const announcementMsg = (fullname)=>{
    const message =`
 <!DOCTYPE html>
<html>
<head>
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
            background-color: #ffffff;
            border: 1px solid #ddd;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #ff9933;
            color: #ffffff;
            padding: 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 20px;
            text-align: center;
            color: #333333;
            background-color: #ffffff; /* Ensures the middle part is white */
        }
        .content p {
            font-size: 16px;
            line-height: 1.5;
        }
        .footer {
            background-color: #128807;
            color: #ffffff;
            padding: 10px;
            text-align: center;
            font-size: 14px;
        }
        .flag {
            display: block;
            margin: 0 auto 20px;
            width: 100px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Happy Republic Day!</h1>
        </div>
        <div class="content">
            <img class="flag" src="https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/1920px-Flag_of_India.svg.png" alt="Indian Flag">
            <p>Let’s celebrate the spirit of unity, freedom, and progress as we honor the values that make our nation great. 🇮🇳</p>
            <p>Wishing you and your loved ones a joyous Republic Day filled with pride and patriotism!</p>
            <p>Warm regards,<br><strong>Team Reward+</strong></p>
        </div>
        <div class="footer">
            Jai Hind! 🇮🇳
        </div>
    </div>
</body>
</html>

    `
    return message
}