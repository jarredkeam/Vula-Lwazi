import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Star, Clock, User, Voicemail, LayoutGrid } from 'lucide-react';

/*
  Vula Lwazi — USSD Crop Planting Advisor (prelim build)
  ------------------------------------------------
  HOW TO EXTEND THE MENU TREE (see USSD_TREE below):
  Each USSD code (e.g. "*1234#") maps to a set of named "nodes".
  A node can be one of three kinds:

  1. MENU node       -> has `options`: { "<digit user types>": "<next node id>" }
  2. TEXT-INPUT node -> has `next`: "<next node id>" and `capture`: "<varName>"
                         (accepts any typed value, stores it, then moves on)
  3. END node        -> has neither `options` nor `next` (session terminates,
                         shows only an OK button)

  Node text supports ${varName} templating, filled in from captured values.

  To add a new crop: write a template-literal block like the ones below,
  give it a unique const name, add it to USSD_TREE as a node, then add a
  line + option entry to its season's list node.
*/

const COLORS = {
  darkBlue: '#012868',
  yellow: '#fec402',
  darkGreen: '#037326',
  vividGreen: '#0a8f24',
  vividBlue: '#024ea6',
  darkBlueTint: 'rgba(1,40,104,0.06)',
  vividBlueTint: 'rgba(2,78,166,0.08)',
};

function seasonAccent(nodeId) {
  if (nodeId.startsWith('summer')) return COLORS.yellow;
  if (nodeId.startsWith('winter')) return COLORS.darkBlue;
  if (nodeId.startsWith('spring')) return COLORS.vividGreen;
  if (nodeId.startsWith('autumn')) return COLORS.darkGreen;
  return COLORS.vividBlue;
}

/* ---------------------------- SPRING (Sept-Nov) --------------------------- */

const spring_tomatoes = `Tomatoes — Spring guide

Climate: Warm days 20-27\u00b0C; full sun 6-8h; frost-free; shelter from wind
Soil: Deep, well-drained loam; pH 6.0-6.8
Fertility: Rich compost; balanced NPK, extra potash at fruiting
Water: 25-35mm/week; deep & consistent; avoid wetting leaves
Selection: Local hybrids e.g. Rodade, Floradade
Seeds: Certified disease-free seedlings; harden off before planting
Pests/Disease: Bollworm, whitefly, blight; rotate beds yearly
Weeds: Mulch well; hoe shallow near roots
Planting: Sow Sept-Nov once frost has passed; 50cm x 90cm; stake plants
Harvest: 10-12 weeks; pick fully red; store cool, out of the fridge

0. Back to list
00. Main menu`;

const spring_beans = `Green Beans — Spring guide

Climate: Warm 18-25\u00b0C; full sun; frost-sensitive; shelter from wind
Soil: Light, well-drained sandy loam; pH 6.0-7.0
Fertility: Low nitrogen (beans fix their own); add phosphorus & potash
Water: Even moisture 25mm/week; important at flowering & pod-fill
Selection: Bush or climbing types, e.g. Contender, Top Crop
Seeds: Fresh viable seed; inoculant treatment improves nodulation
Pests/Disease: Aphids, bean beetle, rust; avoid overhead watering
Weeds: Shallow hoe early; mulch once established
Planting: Sow Sept-Dec direct; rows 45cm apart, seed 8-10cm apart
Harvest: 8-10 weeks; pick young pods regularly to keep plants producing

0. Back to list
00. Main menu`;

const spring_cucumber = `Cucumber — Spring guide

Climate: Warm 21-27\u00b0C; full sun; frost-free; still air preferred
Soil: Rich, well-drained sandy loam; pH 6.0-6.8
Fertility: High organic matter; compost plus balanced fertiliser
Water: Frequent, even watering 25-35mm/week; mulch to retain moisture
Selection: Ashley, Marketmore or local hybrid slicing types
Seeds: Certified seed or healthy seedlings; sow once soil warms
Pests/Disease: Cucumber beetle, powdery mildew; ensure good airflow
Weeds: Mulch heavily — roots are shallow and sensitive
Planting: Sow Sept-Dec; hills 90cm apart or trellis 30cm apart
Harvest: 8-10 weeks; pick young & firm every 2-3 days

0. Back to list
00. Main menu`;

const spring_sweetcorn = `Sweetcorn (Mielies) — Spring guide

Climate: Warm 20-30\u00b0C; full sun; frost-free; shelter from strong wind
Soil: Deep, fertile, well-drained loam; pH 5.8-7.0
Fertility: High nitrogen demand; compost plus top-dress at knee-high
Water: 25-30mm/week; critical at tasselling & cob-fill
Selection: Choose SA-adapted hybrids for your rainfall zone
Seeds: Certified hybrid seed for uniform, disease-tolerant crop
Pests/Disease: Maize stalk borer, fall armyworm; scout weekly
Weeds: Keep weed-free for first 6 weeks — critical for yield
Planting: Sow Sept-Nov; block-plant for pollination, 25cm x 75cm
Harvest: 10-12 weeks; kernels milky when pressed with a nail

0. Back to list
00. Main menu`;

const spring_chillies = `Chillies & Peppers — Spring guide

Climate: Warm 20-28\u00b0C; full sun; frost-tender; shelter from wind
Soil: Well-drained sandy loam; pH 6.0-6.8
Fertility: Moderate nitrogen; extra potassium & calcium at fruiting
Water: Even moisture 20-25mm/week; avoid waterlogging
Selection: California Wonder (sweet), Serrano (hot) suit SA gardens
Seeds: Start certified seed in trays 6-8 weeks before planting out
Pests/Disease: Aphids, thrips, bacterial spot; rotate with non-solanums
Weeds: Mulch around plants; hand-weed close to stems
Planting: Transplant Sept-Nov after frost; 45cm x 60cm spacing
Harvest: 10-12 weeks; pick green or let ripen to full colour

0. Back to list
00. Main menu`;

/* ---------------------------- SUMMER (Dec-Feb) ---------------------------- */

const summer_watermelon = `Watermelon — Summer guide

Climate: Hot 24-30\u00b0C; full sun; long frost-free season needed
Soil: Deep, sandy loam, well-drained; pH 6.0-6.8
Fertility: Moderate nitrogen early, more potash as fruit forms
Water: Deep watering 25-40mm/week; reduce as fruit ripens
Selection: Sugar Baby, Charleston Gray suit SA summers
Seeds: Certified seed; sow direct once soil is warm
Pests/Disease: Aphids, fruit fly, powdery mildew; rotate cucurbits
Weeds: Mulch around root zone; hand-weed while vines are young
Planting: Sow Nov-Dec; hills 2m apart to allow room for vines
Harvest: 12-16 weeks; ripe when nearest tendril dries & browns

0. Back to list
00. Main menu`;

const summer_pumpkin = `Pumpkin & Butternut — Summer guide

Climate: Warm 20-28\u00b0C; full sun; frost-free growing period
Soil: Fertile, well-drained loam; pH 6.0-6.8
Fertility: High organic matter; compost-rich planting holes
Water: Deep watering 25-30mm/week; less once fruit is set
Selection: Waltham Butternut, local pumpkin cultivars
Seeds: Certified seed sown direct into warm soil
Pests/Disease: Squash bug, powdery mildew; avoid wetting foliage
Weeds: Mulch to smother weeds around sprawling vines
Planting: Sow Nov-Jan; hills 1.5-2m apart, 2-3 seeds per hill
Harvest: 14-18 weeks; skin hard, stem dry & corky before storing

0. Back to list
00. Main menu`;

const summer_sweetpotato = `Sweet Potato — Summer guide

Climate: Hot 24-30\u00b0C; full sun; long, frost-free growing season
Soil: Light, sandy loam, well-drained; avoid heavy clay
Fertility: Low nitrogen (promotes leaves not tubers); potash-rich
Water: Moderate, even watering; reduce 3-4 weeks before harvest
Selection: Use certified virus-free vine cuttings ("slips")
Seeds: Propagated from healthy slips, not true seed
Pests/Disease: Sweet potato weevil; rotate & use clean planting material
Weeds: Vines smother weeds once established; weed early on
Planting: Plant slips Nov-Dec; ridges 1m apart, slips 30cm apart
Harvest: 16-20 weeks; lift before frost; cure in a warm, humid spot

0. Back to list
00. Main menu`;

const summer_okra = `Okra — Summer guide

Climate: Hot 24-32\u00b0C; full sun; very frost-sensitive
Soil: Well-drained sandy loam; pH 6.0-6.8
Fertility: Moderate nitrogen; balanced fertiliser at flowering
Water: Regular 20-25mm/week; fairly drought-tolerant once established
Selection: Local or Clemson Spineless type varieties
Seeds: Soak seed overnight before sowing to aid germination
Pests/Disease: Aphids, bollworm; inspect pods regularly
Weeds: Hoe early; mulch once plants are established
Planting: Sow Nov-Jan; rows 60cm apart, plants 30cm apart
Harvest: 8-10 weeks; pick pods young & tender every 2 days

0. Back to list
00. Main menu`;

const summer_sugarbeans = `Sugar Beans (Dry Beans) — Summer guide

Climate: Warm 18-27\u00b0C; full sun; frost-free growing period
Soil: Well-drained loam; pH 6.0-7.0
Fertility: Low nitrogen; phosphorus boosts pod & seed set
Water: 20-25mm/week; reduce once pods begin drying down
Selection: Certified bush varieties suited to summer-rainfall areas
Seeds: Certified disease-free seed; treat with inoculant
Pests/Disease: Bean fly, rust; rotate away from legumes yearly
Weeds: Keep weed-free for first 5-6 weeks; shallow cultivation
Planting: Sow Nov-Dec; rows 50cm apart, seed 10cm apart
Harvest: 14-16 weeks; pull once pods & leaves have dried out

0. Back to list
00. Main menu`;

/* ---------------------------- AUTUMN (Mar-May) ---------------------------- */

const autumn_onions = `Onions — Autumn guide

Climate: Cool 13-24\u00b0C; full sun; tolerates light frost
Soil: Fertile, well-drained loam; pH 6.0-6.8
Fertility: Moderate nitrogen early, potash for bulb development
Water: Even moisture 15-20mm/week; stop once tops fall over
Selection: Short/intermediate-day varieties suit SA latitudes
Seeds: Use certified seedlings or sets for reliable bulbing
Pests/Disease: Thrips, downy mildew; rotate with non-alliums
Weeds: Shallow roots compete poorly with weeds — hoe often
Planting: Transplant Mar-May; rows 30cm apart, plants 10cm apart
Harvest: 20-24 weeks; lift when tops yellow & fall; cure in shade

0. Back to list
00. Main menu`;

const autumn_garlic = `Garlic — Autumn guide

Climate: Cool 10-24\u00b0C; full sun; needs a cold spell to bulb well
Soil: Loose, well-drained loam; pH 6.0-7.0
Fertility: Compost-rich bed; moderate nitrogen, good potash
Water: Regular watering; stop 2-3 weeks before harvest
Selection: SA-adapted softneck varieties suit mild winters
Seeds: Plant large, healthy cloves from certified stock
Pests/Disease: Generally pest-hardy; watch for rust in wet seasons
Weeds: Mulch well; shallow roots need a weed-free bed
Planting: Plant cloves Mar-May, 15cm apart, 5cm deep
Harvest: 24-28 weeks; lift when lower leaves brown; cure 2-3 weeks

0. Back to list
00. Main menu`;

const autumn_spinach = `Spinach (Swiss Chard) — Autumn guide

Climate: Cool 10-24\u00b0C; full sun to light shade; frost-tolerant
Soil: Fertile, well-drained loam; pH 6.0-7.0
Fertility: High nitrogen for leafy growth; compost regularly
Water: Even moisture 15-20mm/week; avoid letting it dry out
Selection: Fordhook Giant Swiss chard grows well countrywide
Seeds: Sow certified seed direct or raise seedlings
Pests/Disease: Leaf miner, aphids; remove affected leaves promptly
Weeds: Hoe shallowly between rows; mulch to retain moisture
Planting: Sow Mar-May; rows 30cm apart, plants 20cm apart
Harvest: 8-10 weeks; pick outer leaves regularly for continuous crop

0. Back to list
00. Main menu`;

const autumn_broccoli = `Broccoli — Autumn guide

Climate: Cool 15-22\u00b0C; full sun; tolerates light frost
Soil: Fertile, well-drained loam; pH 6.0-7.0
Fertility: High nitrogen early, potash as heads form
Water: Consistent 20-25mm/week; irregular watering causes bolting
Selection: Green Sprouting Calabrese type suits SA autumns
Seeds: Raise certified seedlings, transplant at 4-5 true leaves
Pests/Disease: Cabbage moth, aphids; net young plants
Weeds: Mulch to suppress weeds & conserve moisture
Planting: Transplant Mar-May; 45cm x 60cm spacing
Harvest: 10-14 weeks; cut central head before florets open

0. Back to list
00. Main menu`;

const autumn_carrots = `Carrots — Autumn guide

Climate: Cool 15-21\u00b0C; full sun; tolerates light frost
Soil: Deep, loose, stone-free sandy loam; pH 6.0-6.8
Fertility: Avoid fresh manure (causes forking); moderate potash
Water: Even, consistent watering 15-20mm/week
Selection: Chantenay or Nantes types for home gardens
Seeds: Sow certified seed thinly, direct — dislikes transplanting
Pests/Disease: Carrot fly; rotate away from previous carrot beds
Weeds: Weed by hand when young — hoeing can damage roots
Planting: Sow Mar-May; rows 30cm apart, thin to 5cm apart
Harvest: 12-16 weeks; lift once roots reach full colour & size

0. Back to list
00. Main menu`;

/* ---------------------------- WINTER (Jun-Aug) ----------------------------- */

const winter_cabbage = `Cabbage — Winter guide

Climate: Cool 15-20\u00b0C; full sun; frost-hardy once established
Soil: Fertile, well-drained loam; pH 6.0-7.0
Fertility: High nitrogen early, potash as heads form
Water: Consistent 20-25mm/week; irregular watering splits heads
Selection: Drumhead or Copenhagen Market for SA winters
Seeds: Raise certified seedlings; transplant at 4-5 true leaves
Pests/Disease: Cabbage moth, aphids, diamondback moth; net plants
Weeds: Mulch and hoe shallow around shallow roots
Planting: Transplant Jun-Aug; 45cm x 45cm spacing
Harvest: 12-16 weeks; cut when heads feel firm & solid

0. Back to list
00. Main menu`;

const winter_cauliflower = `Cauliflower — Winter guide

Climate: Cool 15-20\u00b0C; full sun; frost-tolerant, dislikes heat swings
Soil: Fertile, well-drained loam; pH 6.5-7.0
Fertility: High nitrogen & boron; steady feeding for even heads
Water: Consistent 20-25mm/week; stress causes small, poor heads
Selection: Snowball type suited to SA winter climates
Seeds: Certified seedlings; transplant at 4-5 true leaves
Pests/Disease: Cabbage moth, clubroot; rotate brassica beds
Weeds: Mulch well; keep bed weed-free for even head growth
Planting: Transplant Jun-Aug; 50cm x 60cm spacing
Harvest: 12-16 weeks; cut when curds are tight & white

0. Back to list
00. Main menu`;

const winter_broadbeans = `Broad Beans — Winter guide

Climate: Cool 10-20\u00b0C; full sun; very frost-hardy
Soil: Well-drained loam; pH 6.0-7.0
Fertility: Low nitrogen (self-fixing); good phosphorus for pods
Water: Moderate, even watering 15-20mm/week
Selection: Aquadulce overwinters well in SA's colder regions
Seeds: Certified seed sown direct; treat with inoculant
Pests/Disease: Black bean aphid; pinch out growing tips to deter
Weeds: Hoe shallow while young; mulch once plants are tall
Planting: Sow Apr-Jun; rows 60cm apart, seed 20cm apart
Harvest: 14-16 weeks; pick pods while young & tender

0. Back to list
00. Main menu`;

const winter_peas = `Peas — Winter guide

Climate: Cool 10-18\u00b0C; full sun; frost-tolerant
Soil: Well-drained loam; pH 6.0-7.5
Fertility: Low nitrogen (self-fixing); moderate potash & phosphorus
Water: Even watering 15-20mm/week, critical at flowering
Selection: Greenfeast or snap-pea types for SA gardens
Seeds: Certified seed; treat with inoculant before sowing
Pests/Disease: Aphids, powdery mildew; provide good airflow
Weeds: Shallow hoe early; mulch once vines climb the support
Planting: Sow May-Jul; rows 45cm apart, support with trellis
Harvest: 10-12 weeks; pick pods young & sweet, regularly

0. Back to list
00. Main menu`;

const winter_lettuce = `Lettuce — Winter guide

Climate: Cool 10-20\u00b0C; full sun to part shade; light frost-tolerant
Soil: Fertile, well-drained loam; pH 6.0-7.0
Fertility: Moderate nitrogen for fast, leafy growth
Water: Frequent light watering 15-20mm/week; keep evenly moist
Selection: Loose-leaf or butterhead types for winter growing
Seeds: Certified seed or seedlings; succession-sow every 2-3 weeks
Pests/Disease: Aphids, slugs & snails; check undersides of leaves
Weeds: Shallow hoe often — roots sit close to the surface
Planting: Sow Jun-Aug; rows 30cm apart, plants 25cm apart
Harvest: 6-8 weeks; pick outer leaves or cut whole head at maturity

0. Back to list
00. Main menu`;

/* ------------------------------- USSD TREE -------------------------------- */

const USSD_TREE = {
  '*1234#': {
    root: {
      text: 'Welcome to Vula Lwazi\nFree planting advice for SA growing conditions.\n\nWhich season are you planting for?\n1. Summer\n2. Winter\n3. Spring\n4. Autumn',
      options: { '1': 'summer', '2': 'winter', '3': 'spring', '4': 'autumn' },
    },

    summer: {
      text: 'Summer crops (Dec-Feb):\n1. Watermelon\n2. Pumpkin & Butternut\n3. Sweet Potato\n4. Okra\n5. Sugar Beans\n\n0. Main menu',
      options: { '1': 'summer_watermelon', '2': 'summer_pumpkin', '3': 'summer_sweetpotato', '4': 'summer_okra', '5': 'summer_sugarbeans', '0': 'root' },
    },
    summer_watermelon: { text: summer_watermelon, options: { '0': 'summer', '00': 'root' } },
    summer_pumpkin: { text: summer_pumpkin, options: { '0': 'summer', '00': 'root' } },
    summer_sweetpotato: { text: summer_sweetpotato, options: { '0': 'summer', '00': 'root' } },
    summer_okra: { text: summer_okra, options: { '0': 'summer', '00': 'root' } },
    summer_sugarbeans: { text: summer_sugarbeans, options: { '0': 'summer', '00': 'root' } },

    winter: {
      text: 'Winter crops (Jun-Aug):\n1. Cabbage\n2. Cauliflower\n3. Broad Beans\n4. Peas\n5. Lettuce\n\n0. Main menu',
      options: { '1': 'winter_cabbage', '2': 'winter_cauliflower', '3': 'winter_broadbeans', '4': 'winter_peas', '5': 'winter_lettuce', '0': 'root' },
    },
    winter_cabbage: { text: winter_cabbage, options: { '0': 'winter', '00': 'root' } },
    winter_cauliflower: { text: winter_cauliflower, options: { '0': 'winter', '00': 'root' } },
    winter_broadbeans: { text: winter_broadbeans, options: { '0': 'winter', '00': 'root' } },
    winter_peas: { text: winter_peas, options: { '0': 'winter', '00': 'root' } },
    winter_lettuce: { text: winter_lettuce, options: { '0': 'winter', '00': 'root' } },

    spring: {
      text: 'Spring crops (Sept-Nov):\n1. Tomatoes\n2. Green Beans\n3. Cucumber\n4. Sweetcorn\n5. Chillies & Peppers\n\n0. Main menu',
      options: { '1': 'spring_tomatoes', '2': 'spring_beans', '3': 'spring_cucumber', '4': 'spring_sweetcorn', '5': 'spring_chillies', '0': 'root' },
    },
    spring_tomatoes: { text: spring_tomatoes, options: { '0': 'spring', '00': 'root' } },
    spring_beans: { text: spring_beans, options: { '0': 'spring', '00': 'root' } },
    spring_cucumber: { text: spring_cucumber, options: { '0': 'spring', '00': 'root' } },
    spring_sweetcorn: { text: spring_sweetcorn, options: { '0': 'spring', '00': 'root' } },
    spring_chillies: { text: spring_chillies, options: { '0': 'spring', '00': 'root' } },

    autumn: {
      text: 'Autumn crops (Mar-May):\n1. Onions\n2. Garlic\n3. Spinach\n4. Broccoli\n5. Carrots\n\n0. Main menu',
      options: { '1': 'autumn_onions', '2': 'autumn_garlic', '3': 'autumn_spinach', '4': 'autumn_broccoli', '5': 'autumn_carrots', '0': 'root' },
    },
    autumn_onions: { text: autumn_onions, options: { '0': 'autumn', '00': 'root' } },
    autumn_garlic: { text: autumn_garlic, options: { '0': 'autumn', '00': 'root' } },
    autumn_spinach: { text: autumn_spinach, options: { '0': 'autumn', '00': 'root' } },
    autumn_broccoli: { text: autumn_broccoli, options: { '0': 'autumn', '00': 'root' } },
    autumn_carrots: { text: autumn_carrots, options: { '0': 'autumn', '00': 'root' } },
  },

  '*100#': {
    root: {
      text: 'Vula Lwazi\nFree seasonal planting advice matched to South African growing conditions.\n\nDial *1234# to get started.',
    },
  },
};

function resolveText(text, data) {
  return text.replace(/\$\{(\w+)\}/g, (_, key) => (data[key] !== undefined ? data[key] : ''));
}

const KEYS = [
  { digit: '1', letters: '' },
  { digit: '2', letters: 'ABC' },
  { digit: '3', letters: 'DEF' },
  { digit: '4', letters: 'GHI' },
  { digit: '5', letters: 'JKL' },
  { digit: '6', letters: 'MNO' },
  { digit: '7', letters: 'PQRS' },
  { digit: '8', letters: 'TUV' },
  { digit: '9', letters: 'WXYZ' },
  { digit: '*', letters: '' },
  { digit: '0', letters: '+' },
  { digit: '#', letters: '' },
];

export default function USSDSimulator() {
  const [dialed, setDialed] = useState('');
  const [callState, setCallState] = useState('idle'); // idle | calling | ussd-loading | ussd | invalid
  const [tab, setTab] = useState('keypad');
  const [ussd, setUssd] = useState(null);
  const [invalidCode, setInvalidCode] = useState('');

  const zeroTimer = useRef(null);
  const zeroLongPress = useRef(false);
  const delTimer = useRef(null);
  const delLongPress = useRef(false);

  useEffect(() => {
    let t;
    if (callState === 'ussd-loading') {
      t = setTimeout(() => setCallState('ussd'), 700);
    } else if (callState === 'calling') {
      t = setTimeout(() => endCall(), 2500);
    }
    return () => clearTimeout(t);
  }, [callState]);

  function pressDigit(d) {
    if (callState !== 'idle') return;
    setDialed((prev) => prev + d);
  }

  function handleZeroDown() {
    if (callState !== 'idle') return;
    zeroLongPress.current = false;
    zeroTimer.current = setTimeout(() => {
      zeroLongPress.current = true;
      setDialed((prev) => prev + '+');
    }, 500);
  }
  function handleZeroUp() {
    clearTimeout(zeroTimer.current);
    if (!zeroLongPress.current && callState === 'idle') {
      setDialed((prev) => prev + '0');
    }
  }

  function handleDelDown() {
    if (callState !== 'idle' || !dialed) return;
    delLongPress.current = false;
    delTimer.current = setTimeout(() => {
      delLongPress.current = true;
      setDialed('');
    }, 500);
  }
  function handleDelUp() {
    clearTimeout(delTimer.current);
    if (!delLongPress.current && callState === 'idle') {
      setDialed((prev) => prev.slice(0, -1));
    }
  }

  function placeCall() {
    if (!dialed) return;
    if (USSD_TREE[dialed]) {
      setUssd({ code: dialed, currentNodeId: 'root', data: {}, input: '', error: '' });
      setCallState('ussd-loading');
    } else if (/^\*[0-9*#]*#$/.test(dialed)) {
      setInvalidCode(dialed);
      setCallState('invalid');
    } else {
      setCallState('calling');
    }
  }

  function endCall() {
    setCallState('idle');
    setDialed('');
  }

  function dismissInvalid() {
    setCallState('idle');
    setDialed('');
    setInvalidCode('');
  }

  function ussdSubmit() {
    const tree = USSD_TREE[ussd.code];
    const node = tree[ussd.currentNodeId];
    const value = ussd.input.trim();
    if (!value) return;

    if (node.options) {
      const nextId = node.options[value];
      if (!nextId) {
        setUssd((u) => ({ ...u, error: 'Invalid selection. Please try again.', input: '' }));
        return;
      }
      setUssd((u) => ({ ...u, currentNodeId: nextId, input: '', error: '' }));
    } else if (node.next) {
      setUssd((u) => ({
        ...u,
        currentNodeId: node.next,
        data: { ...u.data, [node.capture]: value },
        input: '',
        error: '',
      }));
    }
  }

  function ussdCancel() {
    setUssd(null);
    endCall();
  }

  function ussdClose() {
    setUssd(null);
    endCall();
  }

  const activeNode = ussd ? USSD_TREE[ussd.code][ussd.currentNodeId] : null;
  const isEnd = activeNode && !activeNode.options && !activeNode.next;

  return (
    <div className="w-full flex justify-center bg-gray-100 py-10 px-4">
      <div className="w-full max-w-sm rounded-3xl p-3 shadow-2xl select-none" style={{ backgroundColor: COLORS.darkBlue }}>
        {/* dynamic island */}
        <div className="flex justify-center mb-1">
          <div className="w-24 h-5 rounded-full -mb-5 mt-2 relative z-10 border" style={{ backgroundColor: COLORS.darkBlue, borderColor: 'rgba(255,255,255,0.15)' }} />
        </div>

        <div className="bg-white rounded-2xl overflow-hidden relative" style={{ height: '650px' }}>
          {/* status bar */}
          <div className="flex items-center justify-between px-6 pt-3 pb-1 text-xs font-semibold" style={{ color: COLORS.darkBlue }}>
            <span>9:41</span>
            <span className="flex items-center gap-1">
              <span>{'\u25cf\u25cf\u25cf'}</span>
              <span>Wi-Fi</span>
              <span className="rounded-sm px-1 border" style={{ borderColor: COLORS.darkBlue }}>100%</span>
            </span>
          </div>

          {/* content area */}
          <div className="h-full flex flex-col" style={{ paddingBottom: '78px' }}>
            {tab !== 'keypad' && (
              <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-2" style={{ color: COLORS.darkBlue, opacity: 0.5 }}>
                {tab === 'favorites' && <Star size={36} />}
                {tab === 'recents' && <Clock size={36} />}
                {tab === 'contacts' && <User size={36} />}
                {tab === 'voicemail' && <Voicemail size={36} />}
                <p className="text-sm font-medium capitalize">{tab}</p>
                <p className="text-xs">Not wired up in this demo — tap Keypad to try a USSD code.</p>
              </div>
            )}

            {tab === 'keypad' && callState !== 'calling' && (
              <div className="flex-1 flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-end pb-4 px-6">
                  <p className="font-mono text-3xl tracking-wide min-h-[2.5rem] break-all text-center" style={{ color: COLORS.darkBlue }}>
                    {dialed || ' '}
                  </p>
                  {!dialed && (
                    <p className="text-xs text-gray-400 mt-1 text-center">Enter a code, e.g. *1234# or *100#</p>
                  )}
                  {dialed && (
                    <button
                      onPointerDown={handleDelDown}
                      onPointerUp={handleDelUp}
                      onPointerLeave={() => clearTimeout(delTimer.current)}
                      className="mt-2 text-xl active:opacity-60"
                      style={{ color: COLORS.vividBlue }}
                      aria-label="Delete"
                    >
                      {'\u232b'}
                    </button>
                  )}
                  {!dialed && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => setDialed('*1234#')}
                        className="text-xs rounded-full px-3 py-1 font-medium text-white active:opacity-80"
                        style={{ backgroundColor: COLORS.vividGreen }}
                      >
                        Try *1234#
                      </button>
                      <button
                        onClick={() => setDialed('*100#')}
                        className="text-xs rounded-full px-3 py-1 font-medium active:opacity-70"
                        style={{ backgroundColor: COLORS.vividBlueTint, color: COLORS.vividBlue }}
                      >
                        About *100#
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 justify-items-center px-6">
                  {KEYS.map((k) => (
                    <button
                      key={k.digit}
                      onClick={k.digit === '0' ? undefined : () => pressDigit(k.digit)}
                      onPointerDown={k.digit === '0' ? handleZeroDown : undefined}
                      onPointerUp={k.digit === '0' ? handleZeroUp : undefined}
                      onPointerLeave={k.digit === '0' ? () => clearTimeout(zeroTimer.current) : undefined}
                      className="w-16 h-16 rounded-full flex flex-col items-center justify-center active:opacity-70"
                      style={{ backgroundColor: COLORS.darkBlueTint }}
                    >
                      <span className="text-2xl leading-none" style={{ color: COLORS.darkBlue }}>{k.digit}</span>
                      <span className="text-xs tracking-widest leading-none mt-1" style={{ color: COLORS.vividBlue }}>{k.letters}</span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-3 justify-items-center items-center px-6 py-4">
                  <div />
                  <button
                    onClick={placeCall}
                    disabled={!dialed}
                    className="w-16 h-16 rounded-full flex items-center justify-center active:opacity-80"
                    style={{ backgroundColor: COLORS.vividGreen, opacity: dialed ? 1 : 0.35 }}
                  >
                    <Phone size={26} className="text-white" fill="white" />
                  </button>
                  <div />
                </div>
              </div>
            )}

            {tab === 'keypad' && callState === 'calling' && (
              <div className="flex-1 flex flex-col items-center justify-between py-10">
                <div className="flex flex-col items-center gap-3 mt-6">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.darkBlueTint }}>
                    <User size={44} style={{ color: COLORS.darkBlue, opacity: 0.5 }} />
                  </div>
                  <p className="text-xl font-mono" style={{ color: COLORS.darkBlue }}>{dialed}</p>
                  <p className="text-sm text-gray-400 animate-pulse">calling… (demo)</p>
                </div>
                <button
                  onClick={endCall}
                  className="w-16 h-16 rounded-full flex items-center justify-center active:opacity-80"
                  style={{ backgroundColor: COLORS.darkBlue }}
                >
                  <PhoneOff size={26} className="text-white" />
                </button>
              </div>
            )}

            {/* USSD loading */}
            {callState === 'ussd-loading' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                <div className="w-64 bg-white rounded-2xl shadow-xl px-5 py-6 flex flex-col items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full animate-spin"
                    style={{ border: `3px solid ${COLORS.vividBlueTint}`, borderTopColor: COLORS.vividBlue }}
                  />
                  <p className="text-sm text-gray-600">Sending USSD code…</p>
                </div>
              </div>
            )}

            {/* USSD menu */}
            {callState === 'ussd' && activeNode && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 px-4">
                <div className="w-72 bg-white rounded-2xl overflow-hidden shadow-xl">
                  <div style={{ height: '5px', backgroundColor: seasonAccent(ussd.currentNodeId) }} />
                  <div className="px-4 pt-3 pb-3 text-center">
                    <p className="text-sm font-semibold" style={{ color: COLORS.darkBlue }}>{ussd.code}</p>
                    <div className="mt-2 max-h-64 overflow-y-auto text-left">
                      <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed">
                        {resolveText(activeNode.text, ussd.data)}
                      </p>
                    </div>
                    {!isEnd && (
                      <input
                        autoFocus
                        type={activeNode.mask ? 'password' : 'text'}
                        inputMode={activeNode.options ? 'numeric' : 'text'}
                        value={ussd.input}
                        onChange={(e) => setUssd((u) => ({ ...u, input: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && ussdSubmit()}
                        className="mt-3 w-full border-b text-center text-sm py-1 focus:outline-none"
                        style={{ borderColor: COLORS.vividBlueTint }}
                      />
                    )}
                    {ussd.error && <p className="mt-1 text-xs" style={{ color: COLORS.yellow, backgroundColor: COLORS.darkBlue, borderRadius: '4px', padding: '2px 4px' }}>{ussd.error}</p>}
                  </div>
                  <div className="flex border-t border-gray-200">
                    {isEnd ? (
                      <button onClick={ussdClose} className="w-full py-3 font-semibold text-sm active:bg-gray-100" style={{ color: COLORS.vividBlue }}>
                        OK
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={ussdCancel}
                          className="flex-1 py-3 text-sm border-r border-gray-200 active:bg-gray-100"
                          style={{ color: COLORS.darkBlue }}
                        >
                          Cancel
                        </button>
                        <button onClick={ussdSubmit} className="flex-1 py-3 font-semibold text-sm active:bg-gray-100" style={{ color: COLORS.vividBlue }}>
                          Send
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* invalid MMI code alert */}
            {callState === 'invalid' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 px-4">
                <div className="w-64 bg-white rounded-2xl overflow-hidden shadow-xl">
                  <div className="px-4 pt-4 pb-3 text-center">
                    <p className="text-sm font-semibold" style={{ color: COLORS.darkBlue }}>Connection Problem or Invalid MMI Code</p>
                    <p className="mt-2 text-xs text-gray-400">{invalidCode}</p>
                  </div>
                  <div className="flex border-t border-gray-200">
                    <button onClick={dismissInvalid} className="w-full py-3 font-semibold text-sm active:bg-gray-100" style={{ color: COLORS.vividBlue }}>
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* tab bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center py-2">
            {[
              { id: 'favorites', label: 'Favorites', Icon: Star },
              { id: 'recents', label: 'Recents', Icon: Clock },
              { id: 'contacts', label: 'Contacts', Icon: User },
              { id: 'keypad', label: 'Keypad', Icon: LayoutGrid },
              { id: 'voicemail', label: 'Voicemail', Icon: Voicemail },
            ].map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="flex flex-col items-center gap-1 px-2"
                style={{ color: tab === id ? COLORS.vividGreen : '#9ca3af' }}
              >
                <Icon size={20} />
                <span className="text-xs">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
