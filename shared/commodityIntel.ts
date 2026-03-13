// Static intelligence data for each commodity — supply chain, key players, risk context

export interface SupplyChainStage {
  stage: string;
  description: string;
  keyPlayers: string[];
  keyCountries: string[];
}

export interface KeyPlayer {
  company: string;
  country: string;
  role: string; // e.g. "Producer", "Processor", "Explorer"
  details: string; // production capacity, market share, etc.
}

export interface CommodityIntel {
  id: string;
  name: string;
  overview: string; // 1-2 sentence market context
  supplyChain: SupplyChainStage[];
  keyPlayers: KeyPlayer[];
  demandDrivers: string[];
  riskFactors: string[];
}

export const COMMODITY_INTEL: Record<string, CommodityIntel> = {
  lithium: {
    id: "lithium",
    name: "Lithium",
    overview: "Essential for EV batteries and energy storage. Global demand projected to grow 5x by 2030 driven by electric vehicle adoption.",
    supplyChain: [
      { stage: "Mining", description: "Hard rock (spodumene) and brine extraction", keyPlayers: ["Albemarle", "SQM", "Pilbara Minerals", "Ganfeng"], keyCountries: ["Australia", "Chile", "China", "Argentina"] },
      { stage: "Processing", description: "Conversion to lithium carbonate/hydroxide", keyPlayers: ["Ganfeng Lithium", "Tianqi Lithium", "Albemarle", "Livent"], keyCountries: ["China", "Chile", "USA", "Australia"] },
      { stage: "Battery Mfg", description: "Cathode production & cell assembly", keyPlayers: ["CATL", "LG Energy", "Panasonic", "BYD", "Samsung SDI"], keyCountries: ["China", "S. Korea", "Japan", "USA", "Europe"] },
      { stage: "End Use", description: "EVs, grid storage, consumer electronics", keyPlayers: ["Tesla", "BYD", "VW Group", "Hyundai", "Apple"], keyCountries: ["Global"] },
    ],
    keyPlayers: [
      { company: "Albemarle", country: "USA", role: "Producer", details: "World's largest lithium producer, ~100 ktpa LCE capacity" },
      { company: "SQM", country: "Chile", role: "Producer", details: "Major brine producer from Atacama, ~180 ktpa LCE capacity" },
      { company: "Ganfeng Lithium", country: "China", role: "Integrated", details: "Largest Chinese lithium company, mining to battery recycling" },
      { company: "Pilbara Minerals", country: "Australia", role: "Producer", details: "Largest independent hard-rock lithium producer, Pilgangoora mine" },
      { company: "Tianqi Lithium", country: "China", role: "Producer", details: "Major producer with stake in Greenbushes mine (Australia)" },
      { company: "Arcadium Lithium", country: "USA", role: "Producer", details: "Formed from Livent-Allkem merger, diversified global operations" },
    ],
    demandDrivers: ["EV adoption acceleration", "Grid-scale energy storage", "Consumer electronics", "Government subsidies for EVs"],
    riskFactors: ["China controls 65% of processing", "Brine extraction water usage concerns", "Price volatility from supply surges", "DLE technology disruption potential"],
  },

  nickel: {
    id: "nickel",
    name: "Nickel",
    overview: "Critical for stainless steel and high-energy-density EV batteries. Indonesia dominates global supply with ~50% of production.",
    supplyChain: [
      { stage: "Mining", description: "Laterite and sulfide ore extraction", keyPlayers: ["Vale", "Norilsk Nickel", "BHP", "Glencore"], keyCountries: ["Indonesia", "Philippines", "Russia", "Australia", "Canada"] },
      { stage: "Processing", description: "Smelting, HPAL, and refining to Class 1/2 nickel", keyPlayers: ["Tsingshan", "CNGR", "BHP Nickel West", "Sumitomo"], keyCountries: ["Indonesia", "China", "Japan", "Australia"] },
      { stage: "Battery/Steel", description: "Nickel sulfate for NCM batteries, ferronickel for steel", keyPlayers: ["CATL", "POSCO", "Eramet"], keyCountries: ["China", "S. Korea", "Japan", "Europe"] },
      { stage: "End Use", description: "Stainless steel (65%), EV batteries (15%), alloys", keyPlayers: ["Global steel mills", "EV OEMs"], keyCountries: ["Global"] },
    ],
    keyPlayers: [
      { company: "Tsingshan", country: "China/Indonesia", role: "Integrated", details: "World's largest stainless steel & nickel producer, pioneer of NPI-to-matte conversion" },
      { company: "Vale", country: "Brazil/Canada", role: "Producer", details: "Major Class 1 nickel producer, Sudbury & Voisey's Bay operations" },
      { company: "Norilsk Nickel", country: "Russia", role: "Producer", details: "Largest high-grade nickel producer, Norilsk & Kola operations" },
      { company: "BHP", country: "Australia", role: "Producer", details: "Nickel West operations in Western Australia" },
      { company: "Glencore", country: "Switzerland", role: "Integrated", details: "Major trader & producer, Murrin Murrin, Koniambo operations" },
    ],
    demandDrivers: ["Stainless steel demand (China)", "EV battery chemistry shift to high-nickel", "Aerospace & defense alloys"],
    riskFactors: ["Indonesian export policy changes", "Russian supply sanctions risk", "Class 1 vs Class 2 price divergence", "LFP batteries reducing nickel demand in some EV segments"],
  },

  cobalt: {
    id: "cobalt",
    name: "Cobalt",
    overview: "Key battery material concentrated in DRC (70% of supply). Ethical sourcing and supply security are major concerns.",
    supplyChain: [
      { stage: "Mining", description: "Mostly by-product of copper/nickel mining", keyPlayers: ["Glencore", "CMOC", "Barrick Gold", "ERG"], keyCountries: ["DRC", "Indonesia", "Australia", "Philippines"] },
      { stage: "Processing", description: "Refining to cobalt sulfate and metal", keyPlayers: ["Huayou Cobalt", "CNGR", "Umicore", "Glencore"], keyCountries: ["China", "Finland", "Belgium", "DRC"] },
      { stage: "Battery Mfg", description: "NCM and NCA cathode production", keyPlayers: ["CATL", "LG Energy", "Samsung SDI", "Umicore"], keyCountries: ["China", "S. Korea", "Japan"] },
      { stage: "End Use", description: "EV batteries, superalloys, electronics", keyPlayers: ["Tesla", "Apple", "Boeing"], keyCountries: ["Global"] },
    ],
    keyPlayers: [
      { company: "Glencore", country: "Switzerland", role: "Producer", details: "World's largest cobalt producer, Mutanda & Katanga mines in DRC" },
      { company: "CMOC Group", country: "China", role: "Producer", details: "Tenke Fungurume mine in DRC, rapidly growing output" },
      { company: "Huayou Cobalt", country: "China", role: "Processor", details: "Largest cobalt refiner globally, integrated from mine to battery materials" },
      { company: "Umicore", country: "Belgium", role: "Processor", details: "Leading cobalt refiner and recycler, cathode material producer" },
    ],
    demandDrivers: ["EV battery production growth", "Energy storage systems", "Superalloys for aerospace"],
    riskFactors: ["DRC political instability & artisanal mining", "ESG/child labor scrutiny", "Battery chemistry shift away from cobalt (LFP, high-nickel)", "China controls 80% of refining"],
  },

  copper: {
    id: "copper",
    name: "Copper",
    overview: "Fundamental industrial metal essential for electrification. Demand expected to double by 2035 driven by EVs, renewables, and grid expansion.",
    supplyChain: [
      { stage: "Mining", description: "Open-pit and underground copper ore extraction", keyPlayers: ["Codelco", "Freeport-McMoRan", "BHP", "Glencore", "Southern Copper"], keyCountries: ["Chile", "Peru", "DRC", "USA", "Indonesia"] },
      { stage: "Smelting", description: "Copper concentrate to blister/anode copper", keyPlayers: ["Jiangxi Copper", "Tongling", "Aurubis", "Freeport"], keyCountries: ["China", "Japan", "Germany", "USA", "Chile"] },
      { stage: "Refining", description: "Electrolytic refining to 99.99% cathode", keyPlayers: ["Jiangxi Copper", "Aurubis", "Codelco", "Hindalco"], keyCountries: ["China", "Chile", "Japan", "Germany"] },
      { stage: "End Use", description: "Wiring, motors, electronics, construction, EVs", keyPlayers: ["Global manufacturers"], keyCountries: ["Global"] },
    ],
    keyPlayers: [
      { company: "Codelco", country: "Chile", role: "Producer", details: "State-owned, world's largest copper producer (~1.6 Mtpa)" },
      { company: "Freeport-McMoRan", country: "USA", role: "Producer", details: "Grasberg (Indonesia) & Morenci (USA), ~2 Mtpa copper" },
      { company: "BHP", country: "Australia", role: "Producer", details: "Escondida (Chile, world's largest copper mine), Olympic Dam" },
      { company: "Glencore", country: "Switzerland", role: "Integrated", details: "Major producer & trader, operations in DRC, Peru, Australia" },
      { company: "Southern Copper", country: "Mexico", role: "Producer", details: "Largest copper reserves globally, Peru & Mexico operations" },
    ],
    demandDrivers: ["Electrification & grid expansion", "EV production (3-4x more copper per vehicle)", "Renewable energy (wind, solar)", "Data centers & AI infrastructure"],
    riskFactors: ["Grade decline at major mines", "Permitting delays for new projects", "Chile/Peru political risk & royalty changes", "Substitution risk in some applications"],
  },

  aluminum: {
    id: "aluminum",
    name: "Aluminum",
    overview: "Most produced non-ferrous metal. Energy-intensive smelting makes it sensitive to electricity costs and carbon policy.",
    supplyChain: [
      { stage: "Mining", description: "Bauxite ore extraction", keyPlayers: ["Rio Tinto", "Alcoa", "South32", "CBG"], keyCountries: ["Australia", "Guinea", "China", "Brazil", "India"] },
      { stage: "Refining", description: "Bayer process: bauxite to alumina", keyPlayers: ["Alcoa", "Rio Tinto", "Chalco", "Hindalco"], keyCountries: ["Australia", "China", "Brazil", "India"] },
      { stage: "Smelting", description: "Hall-Héroult electrolysis: alumina to aluminum", keyPlayers: ["Rusal", "Chalco", "Rio Tinto", "Hindalco", "EGA"], keyCountries: ["China", "Russia", "India", "UAE", "Canada"] },
      { stage: "End Use", description: "Transport, packaging, construction, electrical", keyPlayers: ["Global manufacturers"], keyCountries: ["Global"] },
    ],
    keyPlayers: [
      { company: "Chalco (Aluminum Corp of China)", country: "China", role: "Integrated", details: "Largest aluminum producer, vertically integrated" },
      { company: "Rusal", country: "Russia", role: "Smelter", details: "Largest ex-China aluminum producer, hydropower-based smelting" },
      { company: "Rio Tinto", country: "Australia/Canada", role: "Integrated", details: "Major bauxite miner & aluminum smelter, Canadian hydro operations" },
      { company: "Alcoa", country: "USA", role: "Integrated", details: "Pioneer of aluminum industry, bauxite to smelting" },
      { company: "Hindalco (Novelis)", country: "India", role: "Integrated", details: "India's largest aluminum producer, Novelis subsidiary for rolling" },
    ],
    demandDrivers: ["Vehicle lightweighting", "Packaging growth", "Solar panel frames", "Construction"],
    riskFactors: ["Energy cost volatility", "Chinese overcapacity", "Sanctions on Russian aluminum", "Carbon border adjustment mechanisms"],
  },

  graphite: {
    id: "graphite",
    name: "Graphite",
    overview: "Essential anode material for lithium-ion batteries. China dominates 65% of mining and 90%+ of processing.",
    supplyChain: [
      { stage: "Mining", description: "Natural flake graphite extraction", keyPlayers: ["Syrah Resources", "Nouveau Monde", "NextSource", "Tirupati"], keyCountries: ["China", "Mozambique", "Brazil", "Madagascar", "Canada"] },
      { stage: "Processing", description: "Purification & spheronization for battery-grade", keyPlayers: ["BTR New Material", "Shanghai Putailai", "Showa Denko"], keyCountries: ["China", "Japan", "USA (emerging)"] },
      { stage: "Synthetic", description: "Petroleum coke to synthetic graphite", keyPlayers: ["Showa Denko", "GrafTech", "Tokai Carbon"], keyCountries: ["China", "Japan", "USA"] },
      { stage: "End Use", description: "EV battery anodes, refractories, lubricants", keyPlayers: ["CATL", "Panasonic", "LG Energy"], keyCountries: ["Global"] },
    ],
    keyPlayers: [
      { company: "BTR New Material", country: "China", role: "Processor", details: "World's largest anode material producer" },
      { company: "Syrah Resources", country: "Australia/Mozambique", role: "Producer", details: "Balama mine (Mozambique), Vidalia processing plant (USA)" },
      { company: "Nouveau Monde Graphite", country: "Canada", role: "Integrated", details: "Matawinie mine & Bécancour processing, North American supply chain" },
      { company: "Shanghai Putailai", country: "China", role: "Processor", details: "Major anode material supplier to CATL" },
    ],
    demandDrivers: ["EV battery anode demand", "Energy storage", "Fuel cells", "Nuclear applications"],
    riskFactors: ["China export restrictions on graphite", "Processing concentration risk", "Synthetic graphite cost competition", "Environmental concerns in processing"],
  },

  "rare-earths": {
    id: "rare-earths",
    name: "Rare Earths",
    overview: "Group of 17 elements critical for magnets, electronics, and defense. China controls ~60% of mining and ~90% of processing.",
    supplyChain: [
      { stage: "Mining", description: "REE ore extraction from hard rock, ion-adsorption clay", keyPlayers: ["Northern Rare Earth", "MP Materials", "Lynas", "China Rare Earth Group"], keyCountries: ["China", "USA", "Australia", "Myanmar"] },
      { stage: "Separation", description: "Solvent extraction to individual rare earth oxides", keyPlayers: ["China Rare Earth Group", "Lynas", "Shin-Etsu"], keyCountries: ["China", "Malaysia", "Japan", "Estonia (emerging)"] },
      { stage: "Magnet Mfg", description: "NdFeB permanent magnet production", keyPlayers: ["JL Mag", "Zhong Ke San Huan", "TDK", "Shin-Etsu"], keyCountries: ["China", "Japan", "Germany (emerging)"] },
      { stage: "End Use", description: "EV motors, wind turbines, electronics, defense", keyPlayers: ["Tesla", "Vestas", "Siemens Gamesa", "Lockheed Martin"], keyCountries: ["Global"] },
    ],
    keyPlayers: [
      { company: "China Rare Earth Group", country: "China", role: "Integrated", details: "State-consolidated mega-entity, largest global REE producer" },
      { company: "Northern Rare Earth", country: "China", role: "Integrated", details: "World's largest individual REE company, Bayan Obo mine" },
      { company: "Lynas Rare Earths", country: "Australia", role: "Integrated", details: "Largest non-Chinese REE producer, Mt Weld mine + Malaysia processing" },
      { company: "MP Materials", country: "USA", role: "Producer", details: "Mountain Pass mine, only US REE producer, building magnetics facility" },
    ],
    demandDrivers: ["EV traction motors (NdFeB magnets)", "Offshore wind turbines", "Defense & aerospace", "Consumer electronics"],
    riskFactors: ["China export controls & processing monopoly", "Geopolitical weaponization risk", "Long permitting timelines for new projects", "Radioactive thorium by-product management"],
  },

  "iron-ore": {
    id: "iron-ore",
    name: "Iron Ore",
    overview: "Primary raw material for steelmaking. Market dominated by Australia and Brazil, with China consuming ~70% of seaborne trade.",
    supplyChain: [
      { stage: "Mining", description: "Open-pit iron ore extraction, beneficiation", keyPlayers: ["Vale", "Rio Tinto", "BHP", "Fortescue"], keyCountries: ["Australia", "Brazil", "India", "South Africa"] },
      { stage: "Pelletizing", description: "Conversion to pellets for blast furnaces & DRI", keyPlayers: ["Vale", "LKAB", "Samarco", "Cleveland-Cliffs"], keyCountries: ["Brazil", "Sweden", "USA", "Bahrain"] },
      { stage: "Steelmaking", description: "BF-BOF and EAF steel production", keyPlayers: ["Baowu Steel", "ArcelorMittal", "Nippon Steel", "POSCO"], keyCountries: ["China", "India", "Japan", "EU", "USA"] },
      { stage: "End Use", description: "Construction, automotive, infrastructure, machinery", keyPlayers: ["Global manufacturers"], keyCountries: ["Global"] },
    ],
    keyPlayers: [
      { company: "Vale", country: "Brazil", role: "Producer", details: "World's largest iron ore producer, ~320 Mtpa capacity" },
      { company: "Rio Tinto", country: "Australia", role: "Producer", details: "Pilbara operations, ~330 Mtpa iron ore shipments" },
      { company: "BHP", country: "Australia", role: "Producer", details: "Western Australia Iron Ore, ~280 Mtpa" },
      { company: "Fortescue", country: "Australia", role: "Producer", details: "Low-cost Pilbara producer, ~190 Mtpa, expanding into green iron" },
    ],
    demandDrivers: ["Chinese steel demand (property, infrastructure)", "Indian industrialization", "Green steel transition (DRI/HBI)", "Global infrastructure spending"],
    riskFactors: ["China demand slowdown risk", "Vale dam safety concerns", "Green steel disruption to traditional BF route", "Price sensitivity to Chinese stimulus policy"],
  },

  steel: {
    id: "steel",
    name: "Steel",
    overview: "World's most important structural material. Global production ~1.9 Bt/year, with China producing over 50%.",
    supplyChain: [
      { stage: "Raw Materials", description: "Iron ore, coking coal, scrap, DRI", keyPlayers: ["Vale", "BHP", "Glencore", "scrap dealers"], keyCountries: ["Australia", "Brazil", "India", "USA"] },
      { stage: "Steelmaking", description: "BF-BOF (70%) and EAF (30%) routes", keyPlayers: ["Baowu", "ArcelorMittal", "Nippon Steel", "POSCO", "Nucor"], keyCountries: ["China", "India", "Japan", "EU", "USA"] },
      { stage: "Rolling & Finishing", description: "Hot/cold rolling, galvanizing, coating", keyPlayers: ["Same as steelmaking + specialty mills"], keyCountries: ["Global"] },
      { stage: "End Use", description: "Construction (50%), automotive, energy, machinery", keyPlayers: ["Global manufacturers"], keyCountries: ["Global"] },
    ],
    keyPlayers: [
      { company: "Baowu Steel", country: "China", role: "Producer", details: "World's largest steel producer, ~130 Mtpa capacity" },
      { company: "ArcelorMittal", country: "Luxembourg", role: "Producer", details: "Largest ex-China producer, global operations, ~70 Mtpa" },
      { company: "Nippon Steel", country: "Japan", role: "Producer", details: "Japan's largest, ~50 Mtpa, acquiring US Steel" },
      { company: "Nucor", country: "USA", role: "Producer", details: "Largest US steelmaker, EAF-based, ~25 Mtpa" },
      { company: "POSCO", country: "South Korea", role: "Producer", details: "Innovative steelmaker, ~40 Mtpa, HyREX green steel development" },
    ],
    demandDrivers: ["Construction & infrastructure", "Automotive production", "Energy transition infrastructure", "Emerging market urbanization"],
    riskFactors: ["Chinese overcapacity & dumping", "Trade tariffs & protectionism", "Decarbonization costs (Scope 1+2 emissions)", "Scrap availability for EAF growth"],
  },

  gold: {
    id: "gold",
    name: "Gold",
    overview: "Safe-haven asset and store of value. Central bank buying at record levels; mine supply relatively flat at ~3,600 t/year.",
    supplyChain: [
      { stage: "Mining", description: "Open-pit and underground gold mining", keyPlayers: ["Newmont", "Barrick Gold", "Agnico Eagle", "Gold Fields"], keyCountries: ["China", "Australia", "Russia", "Canada", "USA", "South Africa"] },
      { stage: "Refining", description: "Doré bars to 99.99% fine gold", keyPlayers: ["Valcambi", "PAMP", "Heraeus", "Royal Canadian Mint"], keyCountries: ["Switzerland", "UK", "Canada", "Japan"] },
      { stage: "Trading", description: "LBMA, COMEX, Shanghai Gold Exchange", keyPlayers: ["HSBC", "JP Morgan", "ICBC", "UBS"], keyCountries: ["UK", "USA", "China", "Switzerland"] },
      { stage: "End Use", description: "Jewelry (50%), investment (25%), central banks (15%), tech (10%)", keyPlayers: ["Central banks", "ETF providers", "jewelers"], keyCountries: ["India", "China", "USA", "Europe"] },
    ],
    keyPlayers: [
      { company: "Newmont", country: "USA", role: "Producer", details: "World's largest gold miner, ~6 Moz/year after Newcrest acquisition" },
      { company: "Barrick Gold", country: "Canada", role: "Producer", details: "Second-largest gold miner, ~4.5 Moz/year, Nevada Gold Mines JV" },
      { company: "Agnico Eagle", country: "Canada", role: "Producer", details: "~3.5 Moz/year, Canada-focused with growing international portfolio" },
      { company: "Gold Fields", country: "South Africa", role: "Producer", details: "~2.3 Moz/year, operations in Australia, South Africa, Ghana, Chile" },
    ],
    demandDrivers: ["Central bank reserve diversification", "Geopolitical uncertainty & inflation hedge", "Indian/Chinese jewelry demand", "De-dollarization trend"],
    riskFactors: ["Real interest rate rises", "USD strength", "Regulatory risk on artisanal mining", "Declining ore grades at major mines"],
  },

  uranium: {
    id: "uranium",
    name: "Uranium",
    overview: "Fuel for nuclear power, experiencing renaissance due to energy security and decarbonization goals. Supply deficit emerging.",
    supplyChain: [
      { stage: "Mining", description: "ISR, open-pit, underground uranium extraction", keyPlayers: ["Kazatomprom", "Cameco", "Orano", "Uranium One"], keyCountries: ["Kazakhstan", "Canada", "Namibia", "Australia", "Uzbekistan"] },
      { stage: "Conversion", description: "U3O8 to UF6 for enrichment", keyPlayers: ["Cameco", "Orano", "ConverDyn"], keyCountries: ["Canada", "France", "USA"] },
      { stage: "Enrichment", description: "LEU production for reactor fuel", keyPlayers: ["Rosatom (TENEX)", "Urenco", "Orano", "CNNC"], keyCountries: ["Russia", "UK/Germany/Netherlands", "France", "China"] },
      { stage: "End Use", description: "Nuclear power generation (~440 reactors globally)", keyPlayers: ["EDF", "Exelon", "CGNPC", "KEPCO", "Rosatom"], keyCountries: ["USA", "France", "China", "Russia", "Japan"] },
    ],
    keyPlayers: [
      { company: "Kazatomprom", country: "Kazakhstan", role: "Producer", details: "World's largest uranium producer, ~45% of global ISR output" },
      { company: "Cameco", country: "Canada", role: "Integrated", details: "Second-largest producer, McArthur River & Cigar Lake mines" },
      { company: "Orano", country: "France", role: "Integrated", details: "Mining (Niger, Canada) + conversion & enrichment services" },
      { company: "Sprott Physical Uranium Trust", country: "Canada", role: "Investor", details: "Largest physical uranium fund, significant market influence" },
    ],
    demandDrivers: ["Nuclear power renaissance (60+ reactors under construction)", "Energy security post-Ukraine", "SMR technology development", "Data center power demand"],
    riskFactors: ["Russian enrichment dependency (40% of global)", "Kazakhstan production disruption risk", "Public opposition to nuclear", "Long lead times for new mines (10+ years)"],
  },

  vanadium: {
    id: "vanadium",
    name: "Vanadium",
    overview: "Used in high-strength steel alloys and emerging vanadium redox flow batteries (VRFBs) for grid storage.",
    supplyChain: [
      { stage: "Mining", description: "By-product of iron ore, titanomagnetite, and stone coal", keyPlayers: ["Pangang Group", "Largo Resources", "Bushveld Minerals"], keyCountries: ["China", "Russia", "South Africa", "Brazil"] },
      { stage: "Processing", description: "V2O5 and ferrovanadium production", keyPlayers: ["Pangang Group", "EVRAZ", "Largo", "Glencore"], keyCountries: ["China", "Russia", "South Africa", "Brazil"] },
      { stage: "End Use", description: "HSLA steel (90%), VRFBs (5%), chemicals, aerospace", keyPlayers: ["Steel mills", "Rongke Power", "Invinity Energy"], keyCountries: ["China", "USA", "Europe"] },
    ],
    keyPlayers: [
      { company: "Pangang Group", country: "China", role: "Integrated", details: "Largest vanadium producer globally, iron ore by-product" },
      { company: "Largo Resources", country: "Brazil", role: "Producer", details: "High-purity V2O5 from Maracás Menchen mine, expanding into VRFBs" },
      { company: "Bushveld Minerals", country: "South Africa", role: "Integrated", details: "Primary vanadium producer + VRFB energy storage division" },
    ],
    demandDrivers: ["High-strength steel demand", "Vanadium redox flow batteries for grid storage", "Aerospace applications", "China rebar standard enforcement"],
    riskFactors: ["China supply dominance (55%)", "Substitution by niobium in steel", "VRFB cost competitiveness vs lithium-ion", "Small market size = high volatility"],
  },

  antimony: {
    id: "antimony",
    name: "Antimony",
    overview: "Strategic minor metal used in flame retardants, ammunition, and batteries. China produces ~55% and recently restricted exports.",
    supplyChain: [
      { stage: "Mining", description: "Stibnite ore extraction, often with gold", keyPlayers: ["Hunan Nonferrous", "Mandalay Resources", "Perpetua Resources"], keyCountries: ["China", "Tajikistan", "Russia", "Myanmar", "Turkey"] },
      { stage: "Processing", description: "Antimony trioxide and metal production", keyPlayers: ["Hunan Nonferrous", "Campine", "US Antimony"], keyCountries: ["China", "Belgium", "USA"] },
      { stage: "End Use", description: "Flame retardants (60%), lead-acid batteries, ammunition, glass", keyPlayers: ["Chemical companies", "defense contractors"], keyCountries: ["USA", "EU", "China", "Japan"] },
    ],
    keyPlayers: [
      { company: "Hunan Nonferrous Metals", country: "China", role: "Integrated", details: "Largest antimony producer, controls significant Chinese output" },
      { company: "Perpetua Resources", country: "USA", role: "Developer", details: "Stibnite Gold Project (Idaho), potential strategic US supply" },
      { company: "US Antimony Corp", country: "USA", role: "Processor", details: "Only US antimony smelter, small-scale producer" },
      { company: "Campine", country: "Belgium", role: "Processor", details: "European antimony recycler and processor" },
    ],
    demandDrivers: ["Flame retardant demand (electronics, textiles)", "Military & ammunition applications", "Lead-acid battery antimonial lead", "Solar panel glass clarification"],
    riskFactors: ["China export restrictions (2024+)", "Critical mineral classification driving stockpiling", "Very limited non-Chinese supply", "Substitution in some flame retardant applications"],
  },

  oil: {
    id: "oil",
    name: "Oil (Crude)",
    overview: "World's most traded commodity. OPEC+ manages supply; demand driven by transport, petrochemicals, and emerging markets.",
    supplyChain: [
      { stage: "Exploration", description: "Seismic survey, appraisal drilling", keyPlayers: ["ExxonMobil", "Shell", "SLB", "Halliburton"], keyCountries: ["USA", "Saudi Arabia", "UAE", "Brazil", "Guyana"] },
      { stage: "Production", description: "Onshore, offshore, deepwater, shale extraction", keyPlayers: ["Saudi Aramco", "ExxonMobil", "Chevron", "Shell", "TotalEnergies"], keyCountries: ["USA", "Saudi Arabia", "Russia", "Iraq", "UAE", "Brazil"] },
      { stage: "Refining", description: "Crude to gasoline, diesel, jet fuel, petrochemicals", keyPlayers: ["Reliance Industries", "Saudi Aramco", "Sinopec", "Valero"], keyCountries: ["USA", "China", "India", "Saudi Arabia"] },
      { stage: "End Use", description: "Transport (55%), petrochemicals (15%), industry, power", keyPlayers: ["Global economy"], keyCountries: ["Global"] },
    ],
    keyPlayers: [
      { company: "Saudi Aramco", country: "Saudi Arabia", role: "Integrated", details: "World's largest oil company, ~12 mb/d capacity, lowest cost producer" },
      { company: "ExxonMobil", country: "USA", role: "Integrated", details: "Largest western IOC, Permian Basin leader, Pioneer acquisition" },
      { company: "Chevron", country: "USA", role: "Integrated", details: "Major IOC, Permian Basin, Tengiz (Kazakhstan), Hess acquisition" },
      { company: "Shell", country: "UK/Netherlands", role: "Integrated", details: "Largest LNG trader, major deepwater operator" },
      { company: "TotalEnergies", country: "France", role: "Integrated", details: "Diversifying into LNG & renewables while maintaining upstream" },
    ],
    demandDrivers: ["Emerging market economic growth", "Petrochemical feedstock demand", "Aviation fuel recovery", "OPEC+ supply management"],
    riskFactors: ["OPEC+ policy unpredictability", "EV adoption reducing transport demand", "Geopolitical disruptions (Middle East, Russia)", "Energy transition policy acceleration"],
  },

  gas: {
    id: "gas",
    name: "Natural Gas / LNG",
    overview: "Bridge fuel for energy transition. LNG trade growing rapidly as Europe diversifies from Russian pipeline gas.",
    supplyChain: [
      { stage: "Production", description: "Conventional and unconventional gas extraction", keyPlayers: ["Gazprom", "ExxonMobil", "Qatar Energy", "Shell", "Chesapeake"], keyCountries: ["USA", "Russia", "Qatar", "Iran", "Australia"] },
      { stage: "Liquefaction", description: "LNG export terminal operations", keyPlayers: ["QatarEnergy", "Cheniere", "Shell", "TotalEnergies", "Woodside"], keyCountries: ["Qatar", "USA", "Australia", "Russia"] },
      { stage: "Shipping", description: "LNG tanker fleet operations", keyPlayers: ["QatarEnergy Shipping", "MOL", "Flex LNG", "GasLog"], keyCountries: ["Qatar", "Japan", "Norway", "Greece"] },
      { stage: "Regasification & End Use", description: "Power generation, heating, industrial, petrochemical", keyPlayers: ["Utilities", "JERA", "Uniper"], keyCountries: ["EU", "Japan", "S. Korea", "China", "India"] },
    ],
    keyPlayers: [
      { company: "QatarEnergy", country: "Qatar", role: "Integrated", details: "Largest LNG producer, North Field expansion to ~126 Mtpa by 2027" },
      { company: "Cheniere Energy", country: "USA", role: "LNG Exporter", details: "Largest US LNG exporter, Sabine Pass & Corpus Christi" },
      { company: "Shell", country: "UK/Netherlands", role: "Integrated", details: "World's largest LNG trader by volume" },
      { company: "ExxonMobil", country: "USA", role: "Integrated", details: "Major LNG via Papua New Guinea, Golden Pass (US), Mozambique" },
    ],
    demandDrivers: ["European energy security (replacing Russian gas)", "Asian demand growth (China, India)", "Power generation fuel switching from coal", "Industrial & petrochemical feedstock"],
    riskFactors: ["LNG supply glut risk post-2026 from new projects", "Russia-Europe gas politics", "Methane emissions & climate policy", "Henry Hub-Asian spot price disconnect"],
  },
};
