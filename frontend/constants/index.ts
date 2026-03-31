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
       id: "dashboard",
       title: "Dashboard",
    },

   ];
   const socials = [
    {
       name: "Fhenix",
       icon: "https://cdn.prod.website-files.com/6864e9aed9e0a3fac7810db8/68a473dd63e0265d2d6cf9a3_(fhenix_)%20(16).svg",
       url: "https://www.fhenix.io/",
    },
   ];
   const vaultLists = [
    {
      network: "https://www.cryptologos.xyz/data/svg/eth.svg",
      token: "https://www.cryptologos.xyz/data/svg/usdc.svg",
      name: "USDC Core Vault",
      curator: "Gauntlet",
      liquidity: "$184.2M",
      apy: "8.41%",
      slug: "vault-1"
    },
    {
      network: "https://www.cryptologos.xyz/data/svg/eth.svg",
      token: "https://www.cryptologos.xyz/data/svg/usdc.svg",
      name: "ETH Flagship Vault",
      curator: "MEV Capital",
      liquidity: "$97.5M",
      apy: "5.12%",
      slug: "vault-2"
    },
    {
      network: "https://www.cryptologos.xyz/data/svg/defi-arbitrum-bridge.png",
      token: "https://www.cryptologos.xyz/data/svg/usdt.svg",
      name: "WBTC Yield Vault",
      curator: "Re7 Labs",
      liquidity: "$61.0M",
      apy: "3.87%",
      slug: "vault-3"
    },
    {
      network: "https://www.cryptologos.xyz/data/svg/eth.svg",
      token: "https://www.cryptologos.xyz/data/svg/usdt.svg",
      name: "DAI Steakhouse",
      curator: "Steakhouse",
      liquidity: "$42.3M",
      apy: "6.95%",
        slug: "vault-4"
    },
  ];
  
   const marketsList = [
    {
      network: "https://www.cryptologos.xyz/data/svg/eth.svg",
      networkName: "Ethereum",
      collateral: "https://www.cryptologos.xyz/data/svg/wbtc.svg",
      collateralSymbol: "WBTC",
      loan: "/images/coins/usdc.png",
      loanSymbol: "USDC",
      lltv: "86%",
      sixHrRate: "0.0021%",
      totalLiquidity: "$210.4M",
      slug: "market-1"
    },
    {
      network: "/images/networks/base.jpeg",
      networkName: "Base",
      collateral: "https://www.cryptologos.xyz/data/svg/eth.svg",
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
      collateral: "https://www.cryptologos.xyz/data/svg/steth.svg",
      collateralSymbol: "stETH",
      loan: "https://www.cryptologos.xyz/data/svg/eth.svg",
      loanSymbol: "ETH",
      lltv: "94.5%",
      sixHrRate: "0.0008%",
      totalLiquidity: "$89.1M",
        slug: "market-3"
    },
    {
      network: "https://www.cryptologos.xyz/data/svg/eth.svg",
      networkName: "Ethereum",
      collateral: "https://www.cryptologos.xyz/data/svg/dai.svg",
      collateralSymbol: "DAI",
      loan: "https://www.cryptologos.xyz/data/svg/usdc.svg",
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
    features,
    socials
   };