// Generated verbatim from the original chapter documents (see chapters/*.html). Do not hand-edit.
export const steps = [
    {num:"01", year:"1960s–1973", title:"Dematerialization", detail:"Physical stock certificates were phased out and replaced with electronic book-entry records held centrally by the Depository Trust Company (DTC). This removed direct ownership proof for investors.", context:"Led by William Dentzer Jr. (CIA background, appointed by Nelson Rockefeller). Investors now hold claims against intermediaries instead of direct title."},
    {num:"02", year:"1994", title:"Security Entitlement Replaces Ownership", detail:"Uniform Commercial Code (UCC) Articles 8 & 9 were rewritten in all 50 U.S. states. 'Ownership' of securities became a 'security entitlement' — a contractual right, not property.", context:"Drafted by a very small group of experts. This change subordinated investor claims to those of secured creditors in insolvency."},
    {num:"03", year:"2002–2014", title:"Global Legal Harmonization", detail:"The U.S. model spread worldwide via the Hague Securities Convention, EU Financial Collateral Directive, and Central Securities Depositories Regulation (CSDR).", context:"Even countries with strong property rights traditions (e.g., Sweden, Finland) adjusted laws, often through obscure cross-references."},
    {num:"04", year:"2010s–present", title:"Automated Collateral Management Systems", detail:"Central clearing parties (CCPs) and international central securities depositories (ICSDs like Euroclear, Clearstream) gained real-time visibility and automated sweeping capabilities for collateral.", context:"In stress, collateral moves 'free of payment' to meet margin calls at CCP level."},
    {num:"05", year:"2005", title:"Bankruptcy Safe Harbor Provisions", detail:"U.S. Bankruptcy Code amended (BAPCPA) to protect transfers of securities and derivatives to 'protected' counterparties from being clawed back as fraudulent conveyances.", context:"Only large financial institutions qualify. Client assets can be moved without challenge."},
    {num:"06", year:"Ongoing", title:"Deliberately Undercapitalized CCPs", detail:"DTCC (which clears nearly all U.S. trades) holds limited equity relative to the trillions in securities it custodians. New CCPs can be pre-positioned.", context:"The design allows failure and orderly transfer of collateral to surviving secured parties."},
    {num:"07", year:"2009–present", title:"Derivatives Loaded into Deposit-Taking Banks", detail:"Major banks (JPMorgan, Bank of America) moved tens of trillions in derivatives into their FDIC-insured retail banking subsidiaries with regulatory approval.", context:"In failure, FDIC insurance is tiny compared to exposure. Derivatives have super-priority."},
    {num:"08", year:"Now", title:"CBDC as the Control Layer", detail:"Over 137 countries (representing ~98% of global GDP) are exploring or piloting Central Bank Digital Currencies.", context:"BIS has stated CBDC gives central banks 'absolute control' over rules and enforcement technology."}
];
export const scenariosData = [
    {risk:"High", title:"Retail Brokerage Accounts", parallel:"MF Global (2011) — $1.6B client funds swept; Lehman (2008) — client assets used by JPM as secured creditor", desc:"You hold a security entitlement, not titled property. Assets are pooled at DTC and can be used to satisfy higher-priority claims."},
    {risk:"High", title:"Bank Deposits", parallel:"Cyprus 2013 bail-in; SVB/First Republic 2023", desc:"You are an unsecured creditor. Derivatives moved into deposit subsidiaries create massive exposure far beyond FDIC coverage (~2¢ on the dollar in systemic failure)."},
    {risk:"High", title:"Pensions & 401(k)s", parallel:"UK LDI crisis 2022 near-miss; Argentina pension nationalization", desc:"Underlying securities go through the same DTC/CCP chain. 'Segregated' offers limited real protection."},
    {risk:"Moderate", title:"Mortgaged Real Estate", parallel:"2008–2012 U.S. foreclosure wave (robo-signing, Blackstone bulk purchases)", desc:"Deflation increases real debt burden. Financed assets are vulnerable to margin/foreclosure cascades."}
];
export const actorsData = [
    {name:"William Dentzer Jr.", role:"CIA operative → DTC Chairman (22 years)", context:"Oversaw full dematerialization with no prior banking experience. Appointed via Nelson Rockefeller influence."},
    {name:"James S. Rogers", role:"Principal drafter of UCC Article 8 (1994)", context:"Rewrote property law for securities across the U.S. and helped export it globally via Hague Convention."},
    {name:"Jamie Dimon", role:"CEO JPMorgan Chase", context:"JPM acted as prime broker, custodian, and secured creditor in Lehman collapse — ruled 'protected class' with priority."},
    {name:"Augustin Carstens", role:"BIS General Manager", context:"Publicly described CBDC as giving central banks 'absolute control' with enforcement technology."}
];
export const CHAIN = [
  {name:'You',      normal:'security entitlement', crisis:'claim subordinated', dim:true,  x:70},
  {name:'Broker',   normal:'street name',          crisis:'claim subordinated', dim:true,  x:240},
  {name:'DTC/DTCC', normal:'sole registered owner',crisis:'collateral pooled',  dim:true,  x:410},
  {name:'CCP',      normal:'clearing',             crisis:'priority claims',    dim:false, x:580},
  {name:'Protected',normal:'secured parties',      crisis:'JPM · Goldman · BIS',dim:false, x:750},
];
export const READ = {
  normal:'In normal times the chain is invisible. You see holdings in an app; legally you hold a <b>security entitlement</b> against your broker, who holds in <b>street name</b>, while <b>DTC</b> is the sole registered owner of nearly everything. It works — until it\u2019s stressed.',
  crisis:'In a crisis the arrows turn on. Collateral sweeps <span class="red">upward, automatically and with legal priority</span>: entitlement holders become unsecured creditors, while CCPs and the <b>protected class</b> of secured parties take first — a hierarchy written into law decades in advance.'
};
