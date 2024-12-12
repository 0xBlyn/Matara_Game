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


export interface TaskData {
  id: string;
  title: string;
  description: string;
  tokens: number;
  type: string;
  callToAction: string;
  link: string;
  taskStartTimestamp: Date | null;
}

export const earnData = [
  {
    category: "Social Tasks",
    tasks: [
      {
        id: "1",
        title: "Report X Post",
        description: "Report a specific X post to help maintain community standards",
        tokens: 25,
        type: "twitter",
        callToAction: "Perform Task",
        link: "https://twitter.com/example_post_1",
        taskStartTimestamp: null
      },
      {
        id: "2",
        title: "Share on TikTok",
        description: "Share our content on your TikTok account",
        tokens: 50,
        type: "tiktok",
        callToAction: "Perform Task",
        link: "https://tiktok.com/share",
        taskStartTimestamp: null
      }
    ]
  }
];