export const announcementMsg = (fullname)=>{
    const message =`
 <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reward+ Engagement Email</title>
  <style>
    /* Global Styles */
    body {
      font-family: 'Arial', sans-serif;
      background-color: #f9f9f9;
      color: #333333;
      margin: 0;
      padding: 0;
    }

    /* Container */
    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    /* Header */
    .email-header {
      background-color: #341138;
      padding: 20px;
      text-align: center;
      color: white;
    }

    /* Content */
    .email-content {
      padding: 20px;
      text-align: left;
    }

    .email-content h1 {
      font-size: 24px;
      color: #341138;
    }

    .email-content p {
      font-size: 16px;
      line-height: 1.6;
    }

    /* Button */
    .cta-button-wrapper {
      text-align: center;
      margin-top: 20px;
    }

    .cta-button {
      display: inline-block;
      background-color: #341138;
      color: white;
      padding: 12px 20px;
      text-decoration: none;
      border-radius: 4px;
      font-size: 16px;
    }

    .cta-button:hover {
      background-color: #45a049;
    }

    /* Footer */
    .email-footer {
      background-color: #f1f1f1;
      padding: 10px;
      text-align: center;
      font-size: 14px;
      color: #666666;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Email Header -->
    <div class="email-header">
      <h1>Hello ${fullname}</h1>
    </div>

    <!-- Email Content -->
    <div class="email-content">
      <p>
        We hope you're enjoying your journey with Reward+. Here's a quick update: new tasks and challenges await you, along with exciting rewards up for grabs!
      </p>
      <p>
        Don't miss out on the latest rewards and exclusive offers curated just for you.
      </p>
      <div class="cta-button-wrapper">
        <a href="https://play.google.com/store/apps/details?id=com.nexumbyte.rewardplus" class="cta-button">Explore Rewards Now</a>
      </div>
    </div>

    <!-- Footer -->
    <div class="email-footer">
      <p>You received this email because you're a valued member of Reward+.</p>
    </div>
  </div>
</body>
</html>

    `
    return message
}