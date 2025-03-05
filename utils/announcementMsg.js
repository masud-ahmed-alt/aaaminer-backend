export const announcementMsg = (fullname)=>{
    const message =`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exciting Updates from Reward+</title>
  <style>
    /* Global Styles */
    body {
      font-family: 'Arial', sans-serif;
      background-color: #f4f4f4;
      color: #333;
      margin: 0;
      padding: 0;
    }

    /* Container */
    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    /* Header */
    .email-header {
      background-color: #4A148C;
      padding: 25px;
      text-align: center;
      color: white;
      font-size: 22px;
      font-weight: bold;
    }

    /* Content */
    .email-content {
      padding: 20px;
      text-align: left;
    }

    .email-content h2 {
      font-size: 22px;
      color: #4A148C;
    }

    .email-content p {
      font-size: 16px;
      line-height: 1.6;
    }

    /* Button */
    .cta-button-wrapper {
      text-align: center;
      margin: 20px 0;
    }

    .cta-button {
      display: inline-block;
      background-color: #4A148C;
      color: white;
      padding: 14px 24px;
      text-decoration: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: bold;
    }

    .cta-button:hover {
      background-color: #7B1FA2;
    }

    /* Footer */
    .email-footer {
      background-color: #f1f1f1;
      padding: 15px;
      text-align: center;
      font-size: 14px;
      color: #555;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Email Header -->
    <div class="email-header">
      Exciting News, ${fullname}!
    </div>

    <!-- Email Content -->
    <div class="email-content">
      <h2>Your Rewards Just Got Better!</h2>
      <p>
        We're thrilled to announce that the redeem functionality is now live on Reward+! Your points are more valuable than ever—exchange them for exclusive rewards and special offers today.
      </p>
      <p>
        More ways to earn, new challenges, and personalized deals are waiting for you. Stay engaged and keep unlocking bigger perks!
      </p>
      <p>
        Log in now to explore the latest updates. Your next big reward is just a click away!
      </p>
      <div class="cta-button-wrapper">
        <a href="https://play.google.com/store/apps/details?id=com.nexumbyte.rewardplus" class="cta-button">Claim Your Rewards</a>
      </div>
    </div>

    <!-- Footer -->
    <div class="email-footer">
      <p>You're receiving this email because you're a valued member of Reward+.</p>
    </div>
  </div>
</body>
</html>

    `
    return message
}