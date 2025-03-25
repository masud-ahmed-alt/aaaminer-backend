export const announcementMsg = (fullname) => {
  const message = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Exciting Rewards Await!</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f6fa;
      color: #333;
    }

    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.07);
    }

    .email-header {
      background: linear-gradient(135deg, #ff9800, #f44336);
      padding: 36px 24px;
      text-align: center;
      color: #ffffff;
      font-size: 26px;
      font-weight: bold;
      line-height: 1.4;
    }

    .email-content {
      padding: 32px 26px;
      line-height: 1.75;
    }

    .email-content h2 {
      color: #d84315;
      font-size: 22px;
      margin-bottom: 18px;
    }

    .email-content p {
      font-size: 16px;
      margin-bottom: 20px;
      color: #555;
    }

    .highlight {
      color: #ff9800;
      font-weight: 600;
    }

    .cta-button-wrapper {
      text-align: center;
      margin-top: 32px;
    }

    .cta-button {
      display: inline-block;
      background-color: #ff9800;
      color: #ffffff;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 10px;
      font-size: 17px;
      font-weight: 600;
      transition: background 0.3s ease;
    }

    .cta-button:hover {
      background-color: #f57c00;
    }

    .email-footer {
      background-color: #f0f0f0;
      padding: 24px;
      text-align: center;
      font-size: 14px;
      color: #777;
      border-top: 1px solid #e0e0e0;
    }

    .email-footer p {
      margin: 6px 0;
    }

    @media (max-width: 600px) {
      .email-content, .email-header, .email-footer {
        padding-left: 18px;
        padding-right: 18px;
      }

      .cta-button {
        padding: 12px 24px;
        font-size: 16px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="email-header">
      🎉 Big News, ${fullname}! Your Next Reward is Waiting!
    </div>

    <!-- Content -->
    <div class="email-content">
      <h2>🚀 Exclusive Rewards Just for You!</h2>
      <p>
        Exciting updates just dropped in <span class="highlight">Reward+</span>! Now, you can turn your points into **exclusive deals, personalized offers, and amazing rewards** like never before.
      </p>
      <p>
        But wait, there’s more! We’ve added new ways to **earn faster, complete fun challenges, and unlock premium perks**—just for you!
      </p>
      <p>
        Your next big reward is only a tap away. Open the app now and see what’s waiting for you!  
      </p>

      <div class="cta-button-wrapper">
        <a href="https://play.google.com/store/apps/details?id=com.nexumbyte.rewardplus" class="cta-button">
          Open the App & Redeem Now
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div class="email-footer">
      <p>You’re receiving this because you’re a valued member of the Reward+ community.</p>
      <p>Update your app now to unlock the latest features and experiences!</p>
    </div>
  </div>
</body>
</html>

  `;
  return message;
};
