// Generated verbatim from the original chapter documents (see chapters/*.html). Do not hand-edit.
export const EXIT = {
 "hdr": {
  "eyebrow": "Chapter IV — The Exit",
  "h1": "Rails built outside the system",
  "lede": "Chapters I–III described the fiat machine: managed by experts, plumbed through banks, with a trap in the legal basement. This chapter is the parallel stack, engineered on the opposite premises. Read it bottom-up: <b>the bedrock first, then the two rooms built on top of it.</b> Every element carries a note on how the fiat world does the same job — because the differences are the whole point."
 },
 "stack": {
  "h2": "The stack, bottom to top",
  "lede": "One foundation, two rooms. Bitcoin's base layer settles ~7 transactions per second, globally, with every transaction verified by thousands of independent nodes — maximally trustworthy, deliberately slow. The layers above trade a measured amount of trust for speed, privacy, and usability, while the base layer remains <b>the final arbiter of truth underneath everything</b>.",
  "tiers": [
   {
    "k": "Layer 2 · Sidechain · the institutional room",
    "n": "💧 Liquid Network",
    "d": "Fast, confidential settlement for exchanges and brokers — trust a known federation of 15.",
    "href": "#liquid"
   },
   {
    "k": "Layer 2 · E-cash · the community room",
    "n": "🔐 Fedimint",
    "d": "Private community custody — a \"bank\" that mathematically cannot see your balance.",
    "href": "#fedimint"
   },
   {
    "k": "Layer 1 · The foundation",
    "n": "₿ Bitcoin base layer",
    "d": "Proof of work, ~15,000 verifying nodes, rules nobody can change alone. Everything above anchors here.",
    "href": "#bedrock"
   }
  ],
  "spectrum": "← more trustlesseach layer up trades trust for featuresmore features →",
  "fiat": "The fiat stack runs the other way up: the \"bedrock\" is a committee. The Fed sets rules at the top, banks build on the Fed, and you sit at the bottom holding IOUs — with <b>no layer you can verify and no floor you can exit to</b>. This stack puts the unchangeable part at the bottom and the trust at the top, where you can see it.",
  "fiatTitle": "Meanwhile, in the fiat world"
 },
 "bedrock": {
  "h2": "The bedrock — five properties",
  "lede": "Every Layer 2 inherits its security from these five. Understanding why the base layer has each property explains both why the L2s exist and what they sacrifice.",
  "props": [
   {
    "num": "1.",
    "title": "Proof of work — history costs energy",
    "what": "Miners expend real electricity to propose blocks; rewriting history means redoing all that work. No block producer can be cheaply bribed or threatened, and when an L2 \"pegs\" to the base layer, its final settlement is protected by the full hash rate of the network.",
    "fiatKey": "Meanwhile, in the fiat world",
    "fiat": "The ledger is secured by legal authority, not energy — so rewriting it is <b>a policy decision</b>. Bail-ins, account freezes, and the collateral sweep from Chapter III are all \"valid transactions\" there."
   },
   {
    "num": "2.",
    "title": "The UTXO model — coins with a lineage",
    "what": "Bitcoin doesn't track account balances; it tracks unspent outputs, each with a traceable history. That makes pegs precise: lock a UTXO on L1, receive L2 credit; burn the credit, unlock the UTXO. Ownership is a fact on the chain, not an entry in someone else's book.",
    "fiatKey": "Meanwhile, in the fiat world",
    "fiat": "You don't hold money or securities — you hold <b>claims on intermediaries</b>: bank IOUs, \"security entitlements\" in street name. Chapter III walked that chain of claims. Here the chain of custody is one link long: you."
   },
   {
    "num": "3.",
    "title": "Full nodes — rules by consensus",
    "what": "Roughly 15,000 public nodes independently verify every rule on every transaction. The rule set can't change without broad consensus — which is why L2s can rely on the peg: the rules guaranteeing your locked coin can't be altered by any single actor.",
    "fiatKey": "Meanwhile, in the fiat world",
    "fiat": "The rules are set by committee and can change overnight — a rate decision, an emergency facility, a UCC revision. Chapter I explained who trained the committee. Here, <b>there is no committee</b>."
   },
   {
    "num": "4.",
    "title": "Ten-minute blocks — slow, then final",
    "what": "A block every ~10 minutes; irreversible settlement after ~6 blocks (~60 minutes). Too slow for coffee — and that's the honest price of global finality. It's the main reason L2s exist: fast \"local\" finality on top, with disputes ultimately settled on the base layer's slower clock.",
    "fiatKey": "Meanwhile, in the fiat world",
    "fiat": "Payments <b>feel</b> instant but settle days later through ACH, Fedwire, and the DTCC — and stay reversible and freezable throughout. Fiat is fast provisionally and never quite final; Bitcoin is slow provisionally and then absolutely final."
   },
   {
    "num": "5.",
    "title": "Script & Taproot — the toolbox",
    "what": "Multisig, timelocks, and hash locks are the primitives every L2 is assembled from: multisig lets a federation collectively hold funds, timelocks let users reclaim coins if a federation vanishes, hash locks enable atomic swaps between layers.",
    "fiatKey": "Meanwhile, in the fiat world",
    "fiat": "The equivalent machinery is contract law — enforced by courts, after the fact, if you can afford them. Here the contract <b>enforces itself</b>: a timelock doesn't need a judge."
   }
  ]
 },
 "liquid": {
  "head": "💧 Liquid — the institutional room",
  "badge": "Sidechain · est. 2018",
  "lede": "A separate blockchain pegged to Bitcoin, built by Blockstream for exchanges, brokers, and OTC desks that need fast, confidential settlement. Think of it as <b>a high-performance settlement layer for bitcoin-native financial institutions</b>.",
  "steps": [
   {
    "t": "Peg-in: lock on L1",
    "p": "Send BTC to a multisig address controlled by the federation. After 102 Bitcoin confirmations (~17 hours), the lock is considered final."
   },
   {
    "t": "L-BTC issued",
    "p": "Functionaries confirm the lock and issue an equal amount of L-BTC on the sidechain. <b>1 L-BTC = 1 BTC, always.</b>"
   },
   {
    "t": "Settle at Liquid speed",
    "p": "Blocks every ~1 minute; two-block finality ≈ 2 minutes. Amounts and asset types are hidden by default with confidential transactions."
   },
   {
    "t": "Peg-out: reclaim on L1",
    "p": "Burn L-BTC; the federation co-signs the release of your BTC. If the federation goes unresponsive, <b>an emergency timelock lets users withdraw anyway</b>."
   }
  ],
  "feat": [
   {
    "l": "Block time",
    "v": "~1 min"
   },
   {
    "l": "Final settlement",
    "v": "~2 min"
   },
   {
    "l": "Privacy",
    "v": "Confidential txs"
   },
   {
    "l": "Trust model",
    "v": "11-of-15 multisig"
   },
   {
    "l": "Asset issuance",
    "v": "Yes — stablecoins etc."
   },
   {
    "l": "Who uses it",
    "v": "Exchanges, OTC desks"
   }
  ],
  "trust": [
   "Liquid is run by ~65 functionary companies; peg operations need 11 of 15 active signers. This is <b>not trustless</b>: if 11 of 15 collude, pegged funds can in theory be stolen. But these are known businesses with legal identities, reputations, and hardware security modules — the attack is possible in theory and economically irrational in practice.",
   "The trade: trust a <i>known federation</i> → gain speed, privacy, and assets."
  ],
  "fiat": [
   "Liquid resembles correspondent banking — a club of institutions settling among themselves — with two differences: the trust is <b>quantified and published</b> (exactly 11-of-15; inspect the contract), and there's a <b>unilateral exit</b>: the timelock escape hatch. Your bank's terms of service contain neither."
  ],
  "fiatKey": "Meanwhile, in the fiat world"
 },
 "fedimint": {
  "head": "🔐 Fedimint — the community room",
  "badge": "Federated e-cash",
  "lede": "A federated e-cash protocol: a community bank — a local circular economy, a savings group, a family — whose guardians hold the bitcoin but <b>mathematically cannot see who holds what</b>. The trick is blind signatures, invented by David Chaum in the 1980s.",
  "steps": [
   {
    "t": "Deposit via Lightning",
    "p": "Send sats to the mint over Lightning. Guardians hold the underlying BTC in a threshold multisig — your coins are now in federation custody."
   },
   {
    "t": "Receive blinded notes",
    "p": "The mint issues denominated e-cash notes (1, 2, 4, 8 sats…). They're <b>bearer instruments</b> — whoever holds the note can spend it. No accounts, no addresses."
   },
   {
    "t": "Spend privately",
    "p": "Hand notes to anyone; the recipient redeems them for fresh ones. The mint cannot link new notes to old. Fully private inside the federation."
   },
   {
    "t": "Withdraw via Lightning",
    "p": "Redeem notes back to sats any time — the federation co-signs an outbound Lightning payment and you're back on the open network."
   }
  ],
  "feat": [
   {
    "l": "Privacy",
    "v": "Blind signatures"
   },
   {
    "l": "Settlement",
    "v": "Instant, off-chain"
   },
   {
    "l": "Trust model",
    "v": "Guardian threshold"
   },
   {
    "l": "Custody",
    "v": "Federated — not yours"
   },
   {
    "l": "Lightning",
    "v": "Native"
   },
   {
    "l": "Who uses it",
    "v": "Communities, NGOs"
   }
  ],
  "trust": [
   "Guardians are typically people the community knows. Unlike a bank, they <b>cannot see</b> your balance or transactions — the cryptography guarantees it — but if all guardians collude, they can abscond with the deposited bitcoin. The custody risk is real, and so is the privacy.",
   "The trade: give up <i>self-custody</i> → gain privacy, ease of use, and community resilience."
  ],
  "fiat": [
   "Fedimint is the exact inverse of fiat banking. Your bank <b>sees everything and owes you an IOU</b>; a Fedimint sees <b>nothing</b> and holds real coins for a federation you chose. Similar custody risk — opposite information flow."
  ],
  "fiatKey": "Meanwhile, in the fiat world",
  "analogy": {
   "k": "The carbon-paper envelope — how the bank signs what it can't read",
   "ps": [
    "<b>Analogy:</b> put a note inside a carbon-paper envelope. A bank official signs the outside — the signature transfers through to the note — but never sees what's written. Open the envelope and you hold a validly signed note the bank cannot link to you.",
    "<b>In Fedimint:</b> you \"blind\" your token request before sending it to the guardians; they sign it without seeing the serial number; you unblind it into a valid e-cash note. When it's spent, guardians verify their signature but can't connect it to the issuance. Complete unlinkability."
   ]
  }
 },
 "compare": {
  "h2": "Four columns, one honest table",
  "lede": "The three bitcoin rails side by side — with the system from Chapters II–III in the fourth column, judged by the same criteria.",
  "rows": [
   [
    "",
    "₿ Bitcoin L1",
    "💧 Liquid",
    "🔐 Fedimint",
    "🏛 Fiat system"
   ],
   [
    "Speed",
    "~60 min, final",
    "~2 min, final",
    "Instant",
    "Feels instant; settles T+1/T+2"
   ],
   [
    "Finality",
    "Irreversible",
    "Irreversible",
    "Within federation",
    "Reversible & freezable"
   ],
   [
    "Fees",
    "Variable, visible",
    "Low, fixed",
    "Near zero",
    "Hidden — spreads & inflation"
   ],
   [
    "Privacy",
    "Pseudonymous",
    "Confidential",
    "Blind signatures",
    "None — full KYC surveillance"
   ],
   [
    "Trust required",
    "None",
    "11-of-15 federation",
    "Guardian federation",
    "Total — committee & courts"
   ],
   [
    "Custody",
    "Self-custody",
    "Self-custody",
    "Federated",
    "IOUs & street name"
   ],
   [
    "Rule changes",
    "Global consensus",
    "Federation",
    "Federation",
    "Committee vote, overnight"
   ],
   [
    "Censorship",
    "Resistant",
    "Federation could",
    "Federation could",
    "Routine — freezes, de-banking"
   ],
   [
    "Built for",
    "Everyone",
    "Institutions",
    "Communities",
    "Everyone, by default"
   ]
  ],
  "foot": "Read the fiat column against Chapter III: <b>\"reversible &amp; freezable\"</b> and <b>\"IOUs &amp; street name\"</b> are precisely the properties the collateral chain exploits in a crisis. The bitcoin rails don't eliminate trust — they make it <b>chosen, bounded, and visible</b>."
 },
 "gloss": [
  {
   "t": "",
   "html": "<span class=\"gt\">Peg-in / peg-out</span><p>Locking BTC on Layer 1 to receive an equivalent token on a Layer 2, and burning that token to reclaim the BTC.</p>"
  },
  {
   "t": "",
   "html": "<span class=\"gt\">Blind signature</span><p>A scheme where a signer validly signs a message without seeing its content — how Fedimint guardians issue tokens they can't trace.</p>"
  },
  {
   "t": "",
   "html": "<span class=\"gt\">Functionary</span><p>A Liquid federation member — typically an exchange or broker — running hardware signing modules that co-sign peg operations.</p>"
  },
  {
   "t": "",
   "html": "<span class=\"gt\">Guardian</span><p>A Fedimint federation member holding a share of the multisig key protecting deposits. Usually known to the community.</p>"
  },
  {
   "t": "",
   "html": "<span class=\"gt\">Confidential transactions</span><p>Liquid's cryptographic commitments that hide amounts and asset types from on-chain observers.</p>"
  },
  {
   "t": "",
   "html": "<span class=\"gt\">E-cash note</span><p>A Fedimint bearer token denominated in sats — like physical cash, spendable by whoever holds it. No accounts, no addresses.</p>"
  }
 ],
 "closer": [
  "The exit isn't a place. It's a property set: rules no committee can change, settlement no court can reverse, and trust you can count on one hand.",
  "Whether these rails carry the world or stay a lifeboat is undecided — but after Chapters I–III, you can evaluate them on the mechanics, not the marketing."
 ],
 "srcnote": "Educational overview of Bitcoin L1, the Liquid Network, and Fedimint. Figures (block times, federation thresholds, node counts) as commonly published by the respective projects. Not financial advice."
};
