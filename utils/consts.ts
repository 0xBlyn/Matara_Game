export const MAX_ENERGY_REFILLS_PER_DAY = 6;
export const ENERGY_REFILL_COOLDOWN = 60 * 60 * 1000; // 1 hour in milliseconds


// Multitap
export const multitapUpgradeBasePrice = 1000;
export const multitapUpgradeCostCoefficient = 2;

export const multitapUpgradeBaseBenefit = 1;
export const multitapUpgradeBenefitCoefficient = 1;

// Energy
export const energyUpgradeBasePrice = 1000;
export const energyUpgradeCostCoefficient = 2;

export const energyUpgradeBaseBenefit = 500;
export const energyUpgradeBenefitCoefficient = 1;

// Mine (profit per hour)
export const mineUpgradeBasePrice = 1000;
export const mineUpgradeCostCoefficient = 1.5;

export const mineUpgradeBaseBenefit = 100;
export const mineUpgradeBenefitCoefficient = 1.2;






export const earnData = [
  {
    category: "Social Tasks",
    description: "Perform Social Tasks to earn more Matara Tokens ($MAT) and grow your rank.",
    tasks: [
      {
        id: "1",
        title: "Report X Post",
        tokens: 25,
        type: "twitter",
        status: "pending", // can be 'pending', 'completed', or 'claimed'
        // image: "twitter",
        callToAction: "Perform Task",
        link: "https://twitter.com/example_post_1"
      },
      {
        id: "2",
        title: "Share on TikTok",
        tokens: 50,
        type: "tiktok",
        status: "pending",
        // image: "tiktok",
        callToAction: "Perform Task",
        link: "https://tiktok.com/share"
      },
      {
        id: "3",
        title: "Follow FTLD on X",
        tokens: 25,
        type: "twitter",
        status: "completed",
        // image: "twitter",
        callToAction: "Completed",
        link: "https://twitter.com/FTLD"
      },
      {
        id: "4",
        title: "Like X Post",
        tokens: 25,
        type: "twitter",
        status: "pending",
        // image: "twitter",
        callToAction: "Perform Task",
        link: "https://twitter.com/example_post_2"
      }
    ]
  }
];