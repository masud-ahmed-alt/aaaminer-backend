export const announcementMsg = (fullname) => {
  const message = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Exciting Updates from Reward+</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Helvetica Neue', Arial, sans-serif;
      background-color: #f9f9f9;
      color: #333;
    }

    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
    }

    .email-header {
      background: linear-gradient(135deg, #6a1b9a, #4a148c);
      padding: 30px 20px;
      text-align: center;
      color: #fff;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .email-content {
      padding: 30px 24px;
      line-height: 1.7;
    }

    .email-content h2 {
      color: #4a148c;
      font-size: 22px;
      margin-bottom: 18px;
    }

    .email-content p {
      font-size: 16px;
      margin-bottom: 18px;
      color: #444;
    }

    .highlight {
      color: #6a1b9a;
      font-weight: 600;
    }

    .cta-button-wrapper {
      text-align: center;
      margin-top: 30px;
    }

    .cta-button {
      display: inline-block;
      background-color: #6a1b9a;
      color: #fff;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      transition: background 0.3s ease;
    }

    .cta-button:hover {
      background-color: #8e24aa;
    }

    .email-footer {
      background-color: #fafafa;
      padding: 20px;
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
        padding-left: 16px;
        padding-right: 16px;
      }

      .cta-button {
        padding: 12px 24px;
        font-size: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="email-header">
      Big News for You, ${fullname}!
    </div>

    <!-- Content -->
    <div class="email-content">
      <h2>🚀 Reward+ Just Got Even Better!</h2>
      <p>
        The brand-new <span class="highlight">Redeem</span> feature is now live! You can now turn your points into exciting rewards, exclusive deals, and special offers—starting today.
      </p>
      <p>
        But that’s just the beginning. We’re rolling out new ways to earn, surprise challenges, and perks tailored just for you. It’s the most rewarding version of Reward+ yet.
      </p>
      <p>
        Ready to explore? Tap below and start redeeming your points now—your next reward is only a click away.
      </p>

      <div class="cta-button-wrapper">
        <a href="https://play.google.com/store/apps/details?id=com.nexumbyte.rewardplus" class="cta-button">
          Explore & Redeem Now
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div class="email-footer">
      <p>You received this email because you're a valued member of the Reward+ community.</p>
      <p>Update your app to enjoy the newest features and experiences!</p>
    </div>
  </div>
</body>
</html>

  `;
  return message;
}
