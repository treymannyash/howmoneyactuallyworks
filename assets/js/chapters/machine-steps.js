// Step cards for Chapter II (copy is verbatim from the original chapter where marked in each card footnote).
export const MSTEPS = [
 {
  "id": "meet",
  "tall": false,
  "n": "Chapter II",
  "kicker": "The Machine",
  "html": "<h1 id=\"h-meet\">How money <em>actually</em> moves</h1>\n<p class=\"lede\">The economy is plumbing: <b>12 chambers</b> connected by <b>27 pipes</b>.</p>\n<p>Scroll to follow the money, one pipe at a time. Drag the model to look around, and click any chamber label to read what it does.</p>",
  "src": "Headline and first sentence are from the site's Chapter II. The rest of this line is new copy."
 },
 {
  "id": "loop",
  "tall": false,
  "n": "1 / 6",
  "kicker": "The loop you live in",
  "html": "<h2 id=\"h-loop\">You spend. They pay. Repeat.</h2>\n<p class=\"lede\">Start with the simplest circuit: households and the firms they work for and buy from. Tap a pipe.</p>\n<div aria-label=\"Pipes in this step\" class=\"pills\" data-pipes=\"households_firms,firms_households\" role=\"group\"></div>\n<div class=\"pipe-read\" data-read=\"\"></div>",
  "src": "Pipe text is verbatim from Chapter II. Step title and intro are paraphrased."
 },
 {
  "id": "bank",
  "tall": true,
  "n": "2 / 6",
  "kicker": "Banks",
  "html": "<h2 id=\"h-bank\">Your deposit becomes someone's loan</h2>\n<p class=\"lede\">Deposits flow in, loans flow out. Now drain the tank and watch the lending pipes.</p>\n<div aria-label=\"Pipes in this step\" class=\"pills\" data-pipes=\"households_banks,banks_firms,banks_households\" role=\"group\"></div>\n<div class=\"pipe-read\" data-read=\"\"></div>\n<div class=\"widget\">\n<label for=\"drain\"><span>Deposits leaving the bank</span><output id=\"drainOut\">0%</output></label>\n<input aria-describedby=\"drainRead\" id=\"drain\" max=\"100\" min=\"0\" type=\"range\" value=\"0\"/>\n<div class=\"ends\"><span>calm</span><span>bank run</span></div>\n<div class=\"meter-l\"><span>Lending capacity</span><span id=\"capOut\">full</span></div>\n<div aria-hidden=\"true\" class=\"meter\"><i id=\"capBar\"></i></div>\n<p aria-live=\"polite\" class=\"readout\" id=\"drainRead\"></p>\n<div class=\"row\"><button class=\"btn\" id=\"panic\">▶ Start a run</button><button class=\"btn ghost\" id=\"calm\">↺ Calm</button></div>\n</div>",
  "src": "Illustrative widget — it shows the direction of the effect, not a forecast. Pipe text and the quoted line are verbatim from the site."
 },
 {
  "id": "fed",
  "tall": true,
  "n": "3 / 6",
  "kicker": "The Fed",
  "html": "<h2 id=\"h-fed\">One dial sets the price of money</h2>\n<p class=\"lede\">Turn the Fed's dial and see which pipes open or narrow.</p>\n<div aria-label=\"Pipes in this step\" class=\"pills\" data-pipes=\"fed_banks,banks_households\" role=\"group\"></div>\n<div class=\"pipe-read\" data-read=\"\"></div>\n<div class=\"widget\">\n<label for=\"rate\"><span>Fed policy rate</span><output id=\"rateOut\">middle</output></label>\n<input aria-describedby=\"rateRead\" id=\"rate\" max=\"100\" min=\"0\" type=\"range\" value=\"50\"/>\n<div class=\"ends\"><span>cheaper borrowing</span><span>pricier borrowing</span></div>\n<div class=\"meter-l\"><span>Credit flowing</span><span id=\"credOut\">normal</span></div>\n<div aria-hidden=\"true\" class=\"meter\"><i id=\"credBar\" style=\"width:60%\"></i></div>\n<p aria-live=\"polite\" class=\"readout\" id=\"rateRead\"></p>\n</div>",
  "src": "Illustrative widget — direction only, no numbers implied. Pipe text and quoted lines are verbatim from the site."
 },
 {
  "id": "bonds",
  "tall": false,
  "n": "4 / 6",
  "kicker": "Treasury & debt",
  "html": "<h2 id=\"h-bonds\">Bonds: how the bills get paid</h2>\n<p class=\"lede\">When the government spends more than it collects, it borrows. Follow the IOUs.</p>\n<div aria-label=\"Pipes in this step\" class=\"pills\" data-pipes=\"treasury_banks,banks_treasury,foreign_treasury,treasury_government\" role=\"group\"></div>\n<div class=\"pipe-read\" data-read=\"\"></div>",
  "src": "Pipe text is verbatim from Chapter II. Step title and intro are paraphrased."
 },
 {
  "id": "night",
  "tall": false,
  "n": "5 / 6",
  "kicker": "The overnight plumbing",
  "html": "<h2 id=\"h-night\">The pipes almost nobody sees</h2>\n<p class=\"lede\">Every night, banks and funds swap cash for collateral. It's the first pipe to seize when trouble starts.</p>\n<div aria-label=\"Pipes in this step\" class=\"pills\" data-pipes=\"fed_repo,repo_banks,repo_moneymkt,moneymkt_banks\" role=\"group\"></div>\n<div class=\"pipe-read\" data-read=\"\"></div>",
  "src": "Pipe text is verbatim from Chapter II. Step title and intro are paraphrased."
 },
 {
  "id": "shock",
  "tall": true,
  "n": "6 / 6",
  "kicker": "Shock lab",
  "html": "<h2 id=\"h-shock\">Now break it</h2>\n<p class=\"lede\">Pick one of the site's six shocks and step through how stress travels. Nothing is a forecast.</p>\n<div aria-label=\"Choose a shock\" class=\"scen\" id=\"scen\" role=\"group\"></div>\n<div aria-hidden=\"true\" class=\"dots\" id=\"sdots\"></div>\n<div aria-live=\"polite\" class=\"stepbox\" data-t=\"idle\" id=\"sbox\"><span class=\"bd\">Ready</span><h3>Pick a shock, then press Start</h3><p>Stressed chambers glow and pulse; pipes thin and the flow drains.</p></div>\n<div class=\"row\"><button class=\"btn\" id=\"sgo\">▶ Start</button><button class=\"btn ghost\" id=\"snext\">Next step →</button><button class=\"btn ghost\" id=\"sreset\">↺ Reset</button></div>\n<div class=\"tiles\" hidden=\"\" id=\"tiles\"></div>",
  "src": "Scenario titles, step text and end-state figures are verbatim from Chapter II's shock data. The bank tank level during the Bank Run is illustrative."
 },
 {
  "id": "quiz",
  "tall": true,
  "n": "Check yourself",
  "kicker": "",
  "html": "<h2 id=\"h-quiz\">What did you pick up?</h2>\n<p class=\"lede\" id=\"qq\" style=\"color:var(--ink)\"></p>\n<div class=\"q-opts\" id=\"qopts\"></div>\n<p aria-live=\"polite\" class=\"fb\" id=\"qfb\"></p>\n<div class=\"row\"><button class=\"btn\" hidden=\"\" id=\"qnext\">Next →</button><button class=\"btn ghost\" hidden=\"\" id=\"qagain\">↺ Try again</button></div>",
  "src": "Questions are new. Every answer and explanation is taken from the site's own Chapter II text."
 }
];
