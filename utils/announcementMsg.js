export const announcementMsg = (fullname) => {
  const message = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Special Rewards Just for You!</title>
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
      background: linear-gradient(135deg, #008080, #006666);
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
      color: #008080;
      font-size: 22px;
      margin-bottom: 18px;
    }

    .email-content p {
      font-size: 16px;
      margin-bottom: 20px;
      color: #555;
    }

    .highlight {
      color: #008080;
      font-weight: 600;
    }

    .cta-button-wrapper {
      text-align: center;
      margin-top: 32px;
    }

    .cta-button {
      display: inline-block;
      background-color: #008080;
      color: #ffffff;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 10px;
      font-size: 17px;
      font-weight: 600;
      transition: background 0.3s ease;
    }

    .cta-button:hover {
      background-color: #006666;
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
      🎁 Exciting Rewards Await, ${fullname}!
    </div>

    <!-- Content -->
    <div class="email-content">
      <h2>🎉 Unlock Exclusive Rewards Today!</h2>
      <p>
        We appreciate you being part of the <span class="highlight">Reward+</span> community! To show our gratitude, we’ve prepared **special gifts, personalized offers, and exciting rewards** just for you!
      </p>
      <p>
        Complete challenges, earn points, and unlock premium perks. Don’t miss out on this opportunity to maximize your benefits!
      </p>
      <p>
        Open the app now and claim your **Bonus Rewards** before they expire!
      </p>

      <div class="cta-button-wrapper">
        <a href="https://play.google.com/store/apps/details?id=com.nexumbyte.rewardplus" class="cta-button">
          Claim Your Rewards Now
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div class="email-footer">
      <p>You’re receiving this because you’re a valued member of the Reward+ community.</p>
      <p>Unlock your exclusive rewards today!</p>
    </div>
  </div>
</body>
</html>
  `;
  return message;
};
