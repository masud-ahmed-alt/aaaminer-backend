export const homePage = () => {
    const message = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reward+ Official</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 20px;
                background-color: #f4f4f4;
                margin: 0;
            }
            .container {
                background: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
                max-width: 600px;
                margin: auto;
            }
            h1 {
                color: #2c3e50;
            }
            p {
                color: #555;
                font-size: 16px;
            }
            .buttons {
                margin-top: 20px;
            }
            .buttons a {
                text-decoration: none;
                display: inline-block;
                margin: 10px;
                padding: 10px 20px;
                color: white;
                background: #3498db;
                border-radius: 5px;
                transition: 0.3s;
            }
            .buttons a:hover {
                background: #2980b9;
            }
            .features, .testimonials {
                margin-top: 30px;
                text-align: left;
            }
            .features ul {
                list-style-type: none;
                padding: 0;
            }
            .features li {
                background: #ecf0f1;
                margin: 5px 0;
                padding: 10px;
                border-radius: 5px;
            }
            .testimonial {
                background: #e8f5e9;
                padding: 15px;
                margin-top: 10px;
                border-radius: 5px;
            }
            @media (max-width: 768px) {
                .container {
                    width: 90%;
                    padding: 15px;
                }
                .buttons a {
                    display: block;
                    width: 100%;
                    margin: 5px 0;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Welcome to Reward+</h1>
            <p>Your ultimate rewards app that helps you earn points and redeem them for exciting offers. Join us and make the most out of every purchase!</p>
            <div class="buttons">
                <a href="https://rewardplus.site/" target="_blank">Official Site</a>
                <a href="https://play.google.com/store/apps/details?id=com.nexumbyte.rewardplus" target="_blank">Get on Play Store</a>
            </div>
            
            <div class="features">
                <h2>Why Choose Reward+?</h2>
                <ul>
                    <li>Earn points on every purchase</li>
                    <li>Redeem points for discounts and gifts</li>
                    <li>Exclusive member-only deals</li>
                    <li>Track your rewards effortlessly</li>
                </ul>
            </div>
            
            <div class="testimonials">
                <h2>What Our Users Say</h2>
                <div class="testimonial">
                    <p>"Reward+ has changed the way I shop! I love earning points and getting discounts on my favorite products." - Sarah W.</p>
                </div>
                <div class="testimonial">
                    <p>"Super easy to use and the rewards are fantastic. Highly recommend it!" - James D.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
    return message;
};