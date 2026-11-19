// Real site content, moved verbatim from the original index.html hub script.
export const CH = [
  {
    key:'ideas', num:'I', roman:'I', name:'The Ideas', color:'var(--ideas)', hex:'#E0B458',
    tag:'Where the doctrine came from',
    src:'From Heidelberg to Harvard',
    syn:'<b>The Ideas</b> — how German-trained economists built America\u2019s institutions and textbooks, and the myths that hardened inside them.',
    desc:'How German-trained economists built the institutions, pipelines, and textbooks that shaped American economic thought \u2014 and the myths that hardened inside the system along the way. Trace the people, the events, and the throughline.',
    stats:'<i>27</i> events \u00b7 <i>12</i> myths vs. reality \u00b7 key transmission figures'
  },
  {
    key:'machine', num:'II', roman:'II', name:'The Machine', color:'var(--machine)', hex:'#38BDF8',
    tag:'How money actually moves',
    src:'EconPlumb \u2014 economic flow model',
    syn:'<b>The Machine</b> \u2014 the economy as plumbing: 12 chambers, 27 pipes. Open any chamber, follow any pipe, or run a shock and watch stress spread.',
    desc:'The economy drawn as plumbing \u2014 households, firms, banks, the Fed, and the overnight markets almost nobody sees. Click any chamber for a plain-English read of what it does, follow its pipes for the deep dives, then run one of six shocks and step through exactly how stress travels.',
    stats:'<i>12</i> chambers \u00b7 <i>27</i> pipes \u00b7 <i>6</i> shock scenarios'
  },
  {
    key:'trap', num:'III', roman:'III', name:'The Trap', color:'var(--trap)', hex:'#F2545B',
    tag:'What the plumbing does in a crisis',
    src:'The Great Taking \u2014 visual analysis',
    syn:'<b>The Trap</b> \u2014 the legal architecture that routes \u201cyour\u201d assets upward, automatically and with priority, when the system breaks.',
    desc:'Your assets don\u2019t sit safely in \u201cyour\u201d account \u2014 they flow through a chain of legal relationships built so that, in crisis, collateral moves upward with legal priority. The architecture assumes an elastic unit of account. Walk the eight steps that built the mechanism, then flip the chain between normal times and crisis.',
    stats:'<i>8</i> legal steps \u00b7 normal vs. crisis chain \u00b7 precedents & key actors'
  },
  {
    key:'exit', num:'IV', roman:'IV', name:'The Exit', color:'var(--exit)', hex:'#F7931A',
    tag:'Rails built outside the system',
    src:'The parallel stack \u2014 Bitcoin L1, Liquid, Fedimint',
    syn:'<b>The Exit</b> \u2014 the parallel stack, bottom to top: a scarce base layer, then Liquid and Fedimint \u2014 each element contrasted with the elastic system it sits beside.',
    desc:'The parallel stack, read bottom-up: five bedrock properties of a monetary base that cannot be expanded by committee, then the two rooms built on top \u2014 Liquid for institutions, Fedimint for communities. Every element carries a \u201cmeanwhile, in the fiat world\u201d note. The final table puts the elastic system in a fourth column and judges both by the same criteria.',
    stats:'<i>5</i> bedrock properties \u00b7 <i>2</i> layer-2 rooms \u00b7 <i>4</i>-column reckoning vs. fiat'
  }
];

export const DET = {
  key:'detour', num:'◆', name:'The Detour', hex:'#7FC69A',
  tag:'Salamanca, 1544–1605',
  src:'The School of Salamanca',
  syn:'<b>The Detour</b> \u2014 three centuries before Heidelberg, Spanish friars derived subjective value, the quantity theory, and market prices while confronting a sudden expansion of the money supply. Then history buried them.',
  desc:'The buried prologue to Chapter I. While judging the morality of contracts in an empire suddenly flooded with American silver, the theologians of Salamanca worked out subjective value, the quantity theory of money, and purchasing-power parity \u2014 centuries early. Five theses, each with a token showing where the same logic is still running today.',
  stats:'<i>5</i> theses \u00b7 <i>5</i> tokens to today \u00b7 <i>1</i> rediscovery, 1952'
};
export const ALL_CH = CH.concat([DET]);


export const YEAR_TEXTS = {
  year1971: '<b>1971 — The constraint breaks.</b> Nixon closes the gold window. The dollar is no longer backed by anything scarce. From this point forward, money can be created by policy. Every boom, bailout, and “crisis response” after this date happens under the new rules.',
  year1987: '<b>1987 — Black Monday.</b> The market drops 22% in a single day. The Fed responds by flooding the system with liquidity. The pattern is set: when leveraged bets go bad, new money is created to protect the center. The first receivers of that money are not ordinary savers.',
  year2000: '<b>2000 — Dot-com peak.</b> Cheap credit and the promise of a new era drive valuations far beyond earnings. When the bubble bursts, the response is the same: lower rates, more liquidity. The people closest to the new money recover first. Everyone else eats the lost years.',
  year2008: '<b>2008 — The system cracks in public.</b> Housing credit expanded for years because money was cheap and abundant. When it collapsed, the institutions that created and packaged the risk were protected with newly created money. Homeowners and workers absorbed the real losses. Classic Cantillon: the center is rescued, the periphery pays.'
};


export const NUGGETS = [
  {
    badge: 'Price control',
    phrase: '“Rent control keeps housing affordable”',
    body: `
      <p>When the government caps what landlords can charge, fewer people want to build or maintain rental housing. Supply shrinks. The apartments that remain go to whoever has the best connections or luck, not to the people who need them most.</p>
      <p><b>Real examples:</b> San Francisco, New York, and Stockholm all have long-running rent controls. All three have severe housing shortages, black markets for leases, and long waiting lists. Cities that avoided heavy controls (Houston, Tokyo) kept building and stayed more affordable relative to incomes.</p>
      <p>This keeps getting worse because the money itself is being diluted. As the dollar buys less, rents feel more painful — so the demand for controls grows, even while the controls themselves reduce the number of places to live.</p>
      <div class="mech">Real driver: <b>new money enters → prices rise → people demand controls → supply falls further</b>. The money printer is the quiet cause; rent control is the visible reaction.</div>
    `
  },
  {
    badge: 'Labor floor',
    phrase: '“We need a living wage / higher minimum wage”',
    body: `
      <p>A higher legal minimum wage makes it illegal to hire anyone whose work is worth less than that number. The people with the least experience and fewest skills are the first ones who stop getting hired.</p>
      <p><b>Real examples:</b> After large minimum-wage hikes in Seattle and California, studies found reduced hours and fewer entry-level jobs for teens and low-skill workers. Fast-food chains accelerated automation (ordering kiosks, robotic fryers) in the same period. The people the policy claimed to help were often the ones priced out.</p>
      <p>The reason the pressure never stops is that the dollar keeps losing value. Every few years the same wage buys less food and rent, so the political demand for “another raise” returns — even if productivity didn’t change.</p>
      <div class="mech">Real driver: <b>diluting the money → real wages feel lower → demand for higher legal floors</b>. The floor fights a symptom. The printer creates the symptom.</div>
    `
  },
  {
    badge: 'Capital levy',
    phrase: '“Tax the rich / make them pay their fair share”',
    body: `
      <p>Calls to “tax the rich” treat big piles of wealth as if they just appeared. In reality, a large part of the gap comes from who gets the new money first. Banks, large institutions, and governments receive freshly created dollars before prices rise. Everyone else gets the higher prices later.</p>
      <p><b>Real examples:</b> After 2008 and again in 2020–21, massive new money creation coincided with soaring asset prices (stocks, housing, private equity). Households that already owned assets got richer on paper. Households that rented and held cash fell further behind. France’s wealth tax in the 2010s led to capital flight of thousands of high earners — the base shrank and the middle eventually paid more.</p>
      <p>That sequence (the Cantillon effect) quietly moves purchasing power toward the well-connected. The public is then told the problem is greedy rich people — while the money creation that widened the gap continues.</p>
      <div class="mech">Real driver: <b>new money goes to the connected first → they buy assets early → everyone else pays higher prices</b>. The tax debate rarely names the printer.</div>
    `
  },
  {
    badge: 'Stimulus',
    phrase: '“Government must invest / stimulate the economy”',
    body: `
      <p>When government “stimulates,” the money still has to come from somewhere. It can tax you, borrow (future taxes), or create new money. Creating new money is the easiest political option because the cost is hidden in higher prices later.</p>
      <p><b>Real examples:</b> 2008–09 bank bailouts and QE protected the balance sheets of the largest institutions first. 2020 stimulus checks and PPP loans were followed by the highest inflation in 40 years — the new money hit asset prices and then consumer prices. Contractors and asset owners near the spending recovered fastest; savers and wage earners on fixed incomes absorbed the loss of purchasing power.</p>
      <p>That new money doesn’t land evenly. It lands first with government contractors, banks, and whoever is closest to the spending. By the time it reaches ordinary workers and savers, prices have already moved.</p>
      <div class="mech">Real driver: <b>create money → spend it near the center → prices rise at the edges</b>. What looks like help is often a hidden transfer from the outside to the inside.</div>
    `
  },
  {
    badge: 'Relative position',
    phrase: '“Wealth inequality is the defining crisis of our time”',
    body: `
      <p>Most people are better off in absolute terms than their grandparents were. The political fight is increasingly about relative gaps — who has more compared to whom.</p>
      <p><b>Real examples:</b> From 2009 to 2021 the Fed’s balance sheet grew from under $1T to nearly $9T. In the same window, the S&P 500 and home prices in major metros rose dramatically. Households that already owned stocks and real estate saw their net worth jump. Households that did not were left competing for the same assets with diluted dollars. The measured wealth gap widened — then the gap itself was blamed on personal character instead of on who received the new money first.</p>
      <p>This is the Cantillon effect in plain sight: first receivers win, last receivers lose.</p>
      <div class="mech">Real driver: <b>Cantillon effect — first receivers win, last receivers lose</b>. The inequality conversation almost never starts with who gets the new money first.</div>
    `
  },

  {
    badge: 'Moral framing',
    phrase: '“Tax the rich / make them pay their fair share”',
    body: `
      <p>The visible target is high measured wealth. The quieter sequence is the Cantillon effect: new money reaches asset owners and intermediaries first. By the time it arrives at wages and consumer prices, purchasing power has already moved. Higher statutory rates on the residual do not reverse that flow; they often increase complexity, deferral, and exit.</p>
      <p>The political residual is expanded administrative reach over whatever base remains.</p>
      <div class="mech">Real driver: <b>new money lands unevenly → measured gaps widen → moral language targets the residual → discretion grows</b>.</div>
    `
  },
  {
    badge: 'Rights language',
    phrase: '“Housing is a human right”',
    body: `
      <p>Declaring a good a right does not create more of it. Mandating below-market units raises the cost of the remaining units or reduces total construction. Cities with the strongest inclusionary rules consistently show constrained supply and high market rents.</p>
      <p>The monetary expansion that bids up land and materials is left untouched. The residual is greater discretion over who may build and who may occupy.</p>
      <div class="mech">Real driver: <b>elastic money + restricted supply → prices rise → rights language expands control rather than quantity</b>.</div>
    `
  },
  {
    badge: 'Residual blame',
    phrase: '“Corporate greed is driving prices”',
    body: `
      <p>Margins are treated as the cause. In sectors flooded with new money and protected by barriers to entry, prices rise. Blaming the residual “greed” directs attention away from the flow of new money and the rules that limit competition.</p>
      <p>The political payoff is selective enforcement and the moral high ground, while the underlying machinery continues.</p>
      <div class="mech">Real driver: <b>monetary expansion + barriers → higher prices → blame assigned to the residual actor</b>.</div>
    `
  },
  {
    badge: 'Cross-subsidy',
    phrase: '“We need affordable housing mandates”',
    body: `
      <p>Forcing builders to sell some units cheap does not create free housing. The builder has to make up the lost money somewhere — usually by charging more for the other units or by building fewer total homes.</p>
      <p><b>Real examples:</b> Inclusionary zoning rules in California and New York City have been repeatedly shown to reduce overall housing production. Developers either raise prices on market-rate units or walk away from projects. The “affordable” units that do get built are often allocated by lottery — while the total number of homes stays lower than it would have been without the mandate.</p>
      <p>Meanwhile the money keeps being diluted, so the underlying pressure on housing costs never goes away. Mandates fight the symptom; they leave the cause untouched.</p>
      <div class="mech">Real driver: <b>money dilution pushes asset prices up → politics demands “affordable” rules → total supply falls</b>. The printer and the mandate work in the same direction: fewer homes at higher prices.</div>
    `
  }
];

/* U.S. M2 money stock, seasonally adjusted, in trillions of dollars.
   Source: Board of Governors of the Federal Reserve System, via FRED series M2SL
   (https://fred.stlouisfed.org/series/M2SL). December value of each year; 2026 = Sep 2026,
   the latest observation when this was built. */
export const M2=[[1971,0.71],[1972,0.8],[1973,0.86],[1974,0.9],[1975,1.02],[1976,1.15],[1977,1.27],[1978,1.37],[1979,1.47],[1980,1.6],[1981,1.76],[1982,1.91],[1983,2.12],[1984,2.31],[1985,2.49],[1986,2.73],[1987,2.83],[1988,2.99],[1989,3.15],[1990,3.27],[1991,3.37],[1992,3.43],[1993,3.48],[1994,3.49],[1995,3.63],[1996,3.82],[1997,4.03],[1998,4.38],[1999,4.64],[2000,4.93],[2001,5.44],[2002,5.78],[2003,6.07],[2004,6.42],[2005,6.69],[2006,7.08],[2007,7.48],[2008,8.2],[2009,8.51],[2010,8.82],[2011,9.68],[2012,10.49],[2013,11.06],[2014,11.72],[2015,12.39],[2016,13.24],[2017,13.89],[2018,14.39],[2019,15.35],[2020,19.12],[2021,21.49],[2022,21.27],[2023,20.75],[2024,21.46],[2025,22.33],[2026,23.41]];
export const EVS=[[1971,'Nixon ends gold convertibility'],[1987,'Black Monday'],[2000,'Dot-com peak'],[2008,'Global financial crisis']];
