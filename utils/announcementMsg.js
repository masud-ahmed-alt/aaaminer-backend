export const announcementMsg = (fullname, header, h2, p1, p2, p3, btn_text, btn_url) => {
  const message = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Important Update from Reward+</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f0f4f8;
      font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      color: #1e293b;
    }

    .email-container {
      max-width: 640px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
    }

    .email-header {
      background: linear-gradient(135deg, #14b8a6, #2563eb);
      padding: 40px 30px;
      text-align: center;
      color: #ffffff;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .email-content {
      padding: 36px 30px;
    }

    .email-content h2 {
      color: #0f172a;
      font-size: 22px;
      margin-bottom: 20px;
    }

    .email-content p {
      font-size: 16px;
      color: #334155;
      margin-bottom: 18px;
      line-height: 1.6;
    }

    .cta-button-wrapper {
      text-align: center;
      margin-top: 32px;
    }

    .cta-button {
      display: inline-block;
      background-color: #2563eb;
      color: #ffffff;
      text-decoration: none;
      padding: 14px 36px;
      border-radius: 12px;
      font-size: 17px;
      font-weight: 600;
      transition: background 0.3s ease;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }

    .cta-button:hover {
      background-color: #1d4ed8;
    }

    .email-footer {
      background-color: #f8fafc;
      padding: 24px 20px;
      text-align: center;
      font-size: 14px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
    }

    .email-footer p {
      margin: 6px 0;
    }

    @media (max-width: 600px) {
      .email-content, .email-header, .email-footer {
        padding-left: 20px;
        padding-right: 20px;
      }

      .email-header {
        font-size: 24px;
        padding: 32px 20px;
      }

      .cta-button {
        padding: 12px 28px;
        font-size: 16px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="email-header">
      ${header}, ${fullname}!
    </div>

    <!-- Content -->
    <div class="email-content">
      <h2>${h2}</h2>
      <p>${p1}</p>
      <p>${p2}</p>
      <p>${p3}</p>

      <div class="cta-button-wrapper">
        <a href="${btn_url}" class="cta-button">
          ${btn_text}
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
