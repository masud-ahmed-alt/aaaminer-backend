export const announcementMsg = (fullname) => {
  const message = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Exciting News from Reward+</title>
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
      background: linear-gradient(135deg, #7b1fa2, #512da8);
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
      color: #512da8;
      font-size: 22px;
      margin-bottom: 18px;
    }

    .email-content p {
      font-size: 16px;
      margin-bottom: 20px;
      color: #555;
    }

    .highlight {
      color: #7b1fa2;
      font-weight: 600;
    }

    .cta-button-wrapper {
      text-align: center;
      margin-top: 32px;
    }

    .cta-button {
      display: inline-block;
      background-color: #7b1fa2;
      color: #ffffff;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 10px;
      font-size: 17px;
      font-weight: 600;
      transition: background 0.3s ease;
    }

    .cta-button:hover {
      background-color: #9c27b0;
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
      🎉 Hey ${fullname}, Something Awesome Just Landed!
    </div>

    <!-- Content -->
    <div class="email-content">
      <h2>✨ Meet the All-New <span class="highlight">Redeem</span> Experience</h2>
      <p>
        We’ve just launched one of our most exciting features yet! Now you can turn your points into amazing rewards, exclusive deals, and personalized offers—starting today.
      </p>
      <p>
        But that’s not all. We’re introducing new ways to earn faster, exciting challenges, and perks tailored just for you. Your Reward+ journey is about to get even more rewarding.
      </p>
      <p>
        What are you waiting for? Dive into the app and discover what’s waiting for you—your next reward is just a tap away.
      </p>

      <div class="cta-button-wrapper">
        <a href="https://play.google.com/store/apps/details?id=com.nexumbyte.rewardplus" class="cta-button">
          Redeem Your Rewards Now
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
