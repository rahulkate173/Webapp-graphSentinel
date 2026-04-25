import AnalysisResult from '../models/analysis.model.js';

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const records = await AnalysisResult.find({ organization: userId })
      .select('analyzed_at summary fraud_rings.pattern_type suspicious_accounts.suspicion_score')
      .lean()
      .exec();

    let total_accounts_analyzed = 0;
    let total_rings = 0;
    let suspicious_accounts_this_week = 0;
    
    // Pattern counts for Pie Chart
    const patternCounts = {};
    
    // Suspicious accounts scores for Bar Graph
    const scoreBuckets = {
      '50-60': 0,
      '60-70': 0,
      '70-80': 0,
      '80-90': 0,
      '90-100': 0,
    };

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    records.forEach(record => {
      total_accounts_analyzed += record.summary?.total_accounts_analyzed || 0;
      total_rings += record.summary?.fraud_rings_detected || 0;

      // Count this week's suspicious accounts
      if (new Date(record.analyzed_at) >= oneWeekAgo) {
        suspicious_accounts_this_week += record.summary?.suspicious_accounts_flagged || 0;
      }

      // Aggregate patterns
      if (record.fraud_rings) {
        record.fraud_rings.forEach(ring => {
          const type = ring.pattern_type || 'Unknown';
          patternCounts[type] = (patternCounts[type] || 0) + 1;
        });
      }

      // Aggregate suspicion scores
      if (record.suspicious_accounts) {
        record.suspicious_accounts.forEach(acc => {
          const score = acc.suspicion_score || 0;
          if (score >= 90) scoreBuckets['90-100']++;
          else if (score >= 80) scoreBuckets['80-90']++;
          else if (score >= 70) scoreBuckets['70-80']++;
          else if (score >= 60) scoreBuckets['60-70']++;
          else if (score >= 50) scoreBuckets['50-60']++;
        });
      }
    });

    // Format for Recharts
    const pieData = Object.keys(patternCounts).map(key => ({
      name: key,
      value: patternCounts[key]
    })).sort((a, b) => b.value - a.value);

    const barData = [
      { name: '50-60', count: scoreBuckets['50-60'] },
      { name: '60-70', count: scoreBuckets['60-70'] },
      { name: '70-80', count: scoreBuckets['70-80'] },
      { name: '80-90', count: scoreBuckets['80-90'] },
      { name: '90-100', count: scoreBuckets['90-100'] },
    ];

    res.status(200).json({
      success: true,
      data: {
        total_accounts_analyzed,
        total_rings,
        suspicious_accounts_this_week,
        pieData,
        barData
      }
    });

  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
