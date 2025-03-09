export const announcementMsg = (fullname) => {
  const message = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exciting Updates from Reward+</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      background-color: #f4f4f4;
      color: #333;
      margin: 0;
      padding: 0;
    }

    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .email-header {
      background-color: #4A148C;
      padding: 25px;
      text-align: center;
      color: white;
      font-size: 22px;
      font-weight: bold;
    }

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
      margin-bottom: 16px;
    }

    .cta-button-wrapper {
      text-align: center;
      margin: 30px 0;
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
    <!-- Header -->
    <div class="email-header">
      Big News for You, ${fullname}!
    </div>

    <!-- Content -->
    <div class="email-content">
      <h2>Reward+ Just Got Even Better!</h2>
      <p>
        We're excited to share that the *Redeem* feature is now live on Reward+! That means your points can now be turned into exclusive rewards, amazing deals, and exciting offers—starting today.
      </p>
      <p>
        That’s not all—look out for new ways to earn, exciting challenges, and personalized perks made just for you. The Reward+ experience is now more rewarding than ever!
      </p>
      <p>
        Tap below to explore what's new and start redeeming your points. Don’t miss out—your next reward is just a click away.
      </p>

      <div class="cta-button-wrapper">
        <a href="https://play.google.com/store/apps/details?id=com.nexumbyte.rewardplus" class="cta-button">
          Explore & Redeem Now
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div class="email-footer">
      <p>You’re receiving this email because you're a valued member of the Reward+ community.</p>
      <p>Make sure your app is up-to-date to enjoy the latest features!</p>
    </div>
  </div>
</body>
</html>
  `;
  return message;
}
