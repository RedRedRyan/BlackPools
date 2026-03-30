const navLinks = [
    {
       id: "vaults",
       title: "Vaults",
    },
    {
       id: "markets",
       title: "Markets",
    },
    {
       id: "work",
       title: "The Art",
    },
    {
       id: "contact",
       title: "Contact",
    },
   ];

   const vaultLists = [
    {
      network: "/images/networks/eth.png",
      token: "/images/coins/usdc.png",
      name: "USDC Core Vault",
      curator: "Gauntlet",
      liquidity: "$184.2M",
      apy: "8.41%",
      slug: "vault-1"
    },
    {
      network: "/images/networks/eth.png",
      token: "/images/coins/usdc.png",
      name: "ETH Flagship Vault",
      curator: "MEV Capital",
      liquidity: "$97.5M",
      apy: "5.12%",
      slug: "vault-2"
    },
    {
      network: "/images/networks/arb.jpeg",
      token: "/images/networks/usdt.png",
      name: "WBTC Yield Vault",
      curator: "Re7 Labs",
      liquidity: "$61.0M",
      apy: "3.87%",
      slug: "vault-3"
    },
    {
      network: "/images/coins/eth.png",
      token: "/images/coins/usdt.png",
      name: "DAI Steakhouse",
      curator: "Steakhouse",
      liquidity: "$42.3M",
      apy: "6.95%",
        slug: "vault-4"
    },
  ];
  
   const marketsList = [
    {
      network: "/images/networks/eth.png",
      networkName: "Ethereum",
      collateral: "/images/coins/wbtc.png",
      collateralSymbol: "WBTC",
      loan: "/images/coins/usdc.png",
      loanSymbol: "USDC",
      lltv: "86%",
      sixHrRate: "0.0021%",
      totalLiquidity: "$210.4M",
      slug: "market-1"
    },
    {
      network: "/images/networks/base.png",
      networkName: "Base",
      collateral: "/images/coins/eth.png",
      collateralSymbol: "ETH",
      loan: "/images/coins/usdc.png",
      loanSymbol: "USDC",
      lltv: "91.5%",
      sixHrRate: "0.0014%",
      totalLiquidity: "$158.7M",
        slug: "market-2"
    },
    {
      network: "/images/networks/arb.jpeg",
      networkName: "Arbitrum",
      collateral: "/images/coins/steth.png",
      collateralSymbol: "stETH",
      loan: "/images/coins/eth.png",
      loanSymbol: "ETH",
      lltv: "94.5%",
      sixHrRate: "0.0008%",
      totalLiquidity: "$89.1M",
        slug: "market-3"
    },
    {
      network: "/images/networks/eth.png",
      networkName: "Ethereum",
      collateral: "/images/coins/dai.png",
      collateralSymbol: "DAI",
      loan: "/images/coins/usdc.png",
      loanSymbol: "USDC",
      lltv: "96.5%",
      sixHrRate: "0.0031%",
      totalLiquidity: "$54.6M",
        slug: "market-4"
    },
  ];
  const features = [
    {
      title: "Confidential Lending",
      description: "Supply assets to isolated markets with fully encrypted positions using FHE technology.",
      icon: "/images/rates.png",
      link: "/markets/supply"
    },
    {
      title: "Private Borrowing",
      description: "Borrow against collateral without exposing your strategy or position size to the public.",
      icon: "/images/credit.png",
      link: "/markets/borrow"
    },
    {
      title: "Isolated Markets",
      description: "Create or participate in permissionless markets with independent liquidity pools and risk parameters.",
      icon: "/images/chart.png",
      link: "/markets/create"
    },
    {
      title: "Earn Yield",
      description: "Earn competitive APY from lending activity while keeping your supply shares encrypted on-chain.",
      icon: "/images/safe.png",
      link: "/earn"
    },
    {
      title: "FHE Privacy",
      description: "All positions encrypted as euint128 — only you can decrypt and view your exposure locally.",
      icon: "/images/qr.png",
      link: "/privacy"
    },
  ];

   export {
    navLinks,
    vaultLists,
    marketsList,
    features
   };