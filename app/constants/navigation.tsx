type NavType = {
  name: string;
  to: string;
};

export const Navigation: NavType[] = [
  { name: "Pay", to: "/pay" },
  { name: "Connect", to: "/connect" },
  { name: "About", to: "/about" },
];
