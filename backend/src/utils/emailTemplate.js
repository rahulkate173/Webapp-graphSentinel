export const generateFraudAlertEmail = (highRiskRings, suspiciousAccounts, organizationName) => {
  const totalRings = highRiskRings.length;
  
  // Calculate stats per ring
  const ringsData = highRiskRings.map(ring => {
    let totalAmount = 0;
    
    // Find all suspicious accounts belonging to this ring
    const accountsInRing = (suspiciousAccounts || []).filter(
      acc => acc.ring_id === ring.ring_id
    );

    // Sum transactions amounts
    accountsInRing.forEach(acc => {
      (acc.transactions || []).forEach(tx => {
        totalAmount += Number(tx.amount) || 0;
      });
    });

    return {
      ringId: ring.ring_id || 'Unknown',
      riskScore: ring.risk_score,
      accountCount: ring.member_accounts?.length || accountsInRing.length || 0,
      totalAmount: totalAmount
    };
  });

  const totalAccounts = ringsData.reduce((sum, r) => sum + r.accountCount, 0);
  const totalAmountStr = ringsData.reduce((sum, r) => sum + r.totalAmount, 0).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  });

  const ringCardsHtml = ringsData.map(ring => `
    <div style="background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; margin-bottom: 16px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <h3 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 16px; border-bottom: 1px solid #f0f0f0; padding-bottom: 8px;">
            <span style="color: #d32f2f; margin-right: 8px;">●</span> Ring ID: ${ring.ringId}
        </h3>
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 4px 0; color: #666; font-size: 14px; width: 50%;">Risk Score:</td>
                <td style="padding: 4px 0; color: #d32f2f; font-size: 14px; font-weight: bold; text-align: right;">${ring.riskScore}</td>
            </tr>
            <tr>
                <td style="padding: 4px 0; color: #666; font-size: 14px;">Accounts Involved:</td>
                <td style="padding: 4px 0; color: #1a1a1a; font-size: 14px; font-weight: bold; text-align: right;">${ring.accountCount}</td>
            </tr>
            <tr>
                <td style="padding: 4px 0; color: #666; font-size: 14px;">Total Amount:</td>
                <td style="padding: 4px 0; color: #1a1a1a; font-size: 14px; font-weight: bold; text-align: right;">₹${ring.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</td>
            </tr>
        </table>
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Suspicious Activity Alert</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f7fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333333;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 40px; margin-bottom: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background-color: #1a237e; padding: 24px 30px; text-align: center;">
            <div style="color: #ffffff; font-size: 24px; font-weight: bold; margin-bottom: 8px; letter-spacing: 0.5px;">
                <span style="color: #ffffff;">Graph</span><span style="color: #ef5350;">Sentinal</span>
            </div>
            <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 500;">🚨 Suspicious Activity Alert</h1>
        </div>

        <!-- Content -->
        <div style="padding: 30px;">
            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5;">
                Hello ${organizationName || 'Team'},
            </p>
            <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.5;">
                Our system has detected high-risk transaction rings that require your immediate attention. Details of the detected suspicious activity are summarized below.
            </p>

            <!-- Summary Card -->
            <div style="background-color: #f8f9fa; border-left: 4px solid #d32f2f; padding: 20px; border-radius: 4px; margin-bottom: 30px;">
                <h2 style="margin: 0 0 16px 0; font-size: 16px; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.5px;">Alert Summary</h2>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 6px 0; color: #555; font-size: 14px;">High-Risk Rings:</td>
                        <td style="padding: 6px 0; color: #d32f2f; font-size: 14px; font-weight: bold; text-align: right;">${totalRings}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #555; font-size: 14px;">Accounts Involved:</td>
                        <td style="padding: 6px 0; color: #1a1a1a; font-size: 14px; font-weight: bold; text-align: right;">${totalAccounts}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #555; font-size: 14px;">Total Transaction Volume:</td>
                        <td style="padding: 6px 0; color: #1a1a1a; font-size: 14px; font-weight: bold; text-align: right;">₹${totalAmountStr}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #555; font-size: 14px;">Time of Detection:</td>
                        <td style="padding: 6px 0; color: #1a1a1a; font-size: 14px; font-weight: bold; text-align: right;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST)</td>
                    </tr>
                </table>
            </div>

            <!-- Ring Details -->
            <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #1a1a1a;">Detected Fraud Rings</h2>
            <div style="margin-bottom: 30px;">
                ${ringCardsHtml}
            </div>

            <!-- CTA Section -->
            <div style="text-align: center; margin-top: 40px; margin-bottom: 20px;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/fraud-rings" style="display: inline-block; background-color: #d32f2f; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; box-shadow: 0 2px 4px rgba(211, 47, 47, 0.3);">View on Website</a>
                <p style="margin: 16px 0 0 0; font-size: 13px; color: #777;">
                    Click above to review these rings in the GraphSentinal dashboard.
                </p>
            </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f1f3f4; padding: 24px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">
                This is an automated alert from <strong>GraphSentinal</strong>. Please do not reply directly to this email.
            </p>
            <p style="margin: 0; font-size: 12px; color: #999;">
                For support, contact <a href="mailto:support@graphsentinal.com" style="color: #1a237e; text-decoration: none;">support@graphsentinal.com</a>
            </p>
        </div>

    </div>
</body>
</html>
  `.trim();
};
