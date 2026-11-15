/* WoW Forever Field Guide: the Consumables, Camp, Blueprints, Legacy and Map tabs. First versions, 15 Nov 2026.
   Prices, recipes and your character come from market.js (window.WOWF_M). Facts come from the guides in each tab's
   Sources line; where they only cover Classic, or nobody has published a number yet, the tab says so. */
(function () {
  'use strict';
  var M = window.WOWF_M;
  if (!M) return;
  var esc = M.esc, money = M.money, nm = M.nm, store = M.store, plural = M.plural;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function skill(name) { var p = M.profSkill(name); return p ? p.sk : 0; }
  function lvl() { return M.charLevel(); }
  function myName() { var ch = M.ch(); return ch && ch.name ? ch.name : 'You'; }
  function tracked(id) { return typeof id === 'number' && !!M.NAMES[id]; }
  function sale(id) { return tracked(id) ? M.sellNet(id) : null; }
  function buy(id) { return tracked(id) ? M.buyCost(id) : null; }
  function cheapest(id) { var n = tracked(id) ? M.now(id) : null; return n ? (n.min != null ? n.min : n.price) : null; }
  function listed(id) { var n = tracked(id) ? M.now(id) : null; return n && n.qty != null ? n.qty : null; }
  function item(id, label) { return tracked(id) ? '<button type="button" class="mk-item" data-item="' + id + '">' + esc(label || nm(id)) + '</button>' : esc(label || nm(id)); }
  function andList(a) { return a.length < 2 ? (a[0] || '') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  function mins(m) {
    if (m < 1) return Math.round(m * 60) + ' seconds';
    if (m >= 60) return (m % 60 ? (m / 60).toFixed(1) : m / 60) + (m === 60 ? ' hour' : ' hours');
    return m + ' min';
  }
  function src(list) {
    return '<span class="label">Sources</span> ' + list.map(function (s) { return '<a href="' + esc(s[1]) + '" rel="noopener" target="_blank">' + esc(s[0]) + '</a>'; }).join(' · ');
  }
  /* The recipe that makes an item, if the guide knows one (Alchemy or First Aid). */
  var RXBY = {};
  Object.keys(M.RX).forEach(function (rid) { var o = M.RX[rid][2]; if (!RXBY[o] || M.RX[rid][5] < M.RX[RXBY[o]][5]) RXBY[o] = rid; });
  function profOf(rid) { return M.RX[rid][1] === 'fa' ? 'First Aid' : 'Alchemy'; }
  function saved(key, dflt) { var v = store.get(key, dflt); return v && typeof v === 'object' ? v : dflt; }
  function keepFocus(root, fn) {
    var a = document.activeElement, key = a && root.contains(a) ? a.getAttribute('data-k') : null;
    fn();
    if (key) { var b = root.querySelector('[data-k="' + key + '"]'); if (b) b.focus(); }
  }
  /* Tables that stack into cards on a phone keep their table roles, so screen readers still read them as tables. */
  function thead(cols) { return '<thead><tr role="row">' + cols.map(function (c) { return '<th scope="col" role="columnheader"' + (c[1] ? ' class="' + c[1] + '"' : '') + '>' + c[0] + '</th>'; }).join('') + '</tr></thead>'; }
  function rowh(html) { return '<th scope="row" role="rowheader">' + html + '</th>'; }
  function cell(html, cls, label) { return '<td role="cell"' + (cls ? ' class="' + cls + '"' : '') + (label ? ' data-l="' + esc(label) + '"' : '') + '>' + html + '</td>'; }
  function busy(root) { var a = document.activeElement; return a && root && root.contains(a) && /INPUT|SELECT|TEXTAREA/.test(a.tagName); }

  /* =====================================================================================================
     Consumables. src: F = a Forever tooltip in a guide; C = the Classic value (Forever kept the recipe);
     C? = Classic value for an item Forever renamed, so check the tooltip.
     ===================================================================================================== */
  var KIT = [
    { id: 2454, slot: 'str', fx: '+4 Strength', min: 60, lv: 1, src: 'C', v: 4, u: 'Strength', note: 'Classic’s Elixir of Lion’s Strength, renamed.' },
    { id: 6662, slot: 'str', fx: '+8 Strength, and you grow 30% bigger', min: 20, lv: 8, src: 'C', v: 8, u: 'Strength', note: 'The recipe drops from mobs in the Barrens.' },
    { id: 3391, slot: 'str', fx: '+8 Strength', min: 60, lv: 20, src: 'C', v: 8, u: 'Strength', note: 'Lasts three times as long as Giant Growth.' },
    { id: 250349, slot: 'str', fx: '+10 Strength', min: 30, lv: null, src: 'F', v: 10, u: 'Strength', note: 'New in Forever (Alchemy 150). Its level isn’t published yet.' },
    { id: 9206, slot: 'str', fx: '+25 Strength', min: 60, lv: 48, src: 'F', v: 25, u: 'Strength', note: 'Classic’s Elixir of Giants, renamed, and needing level 48 instead of 38.' },
    { id: 250351, slot: 'str', fx: '+25 Strength and 2% crit chance', min: 30, lv: 55, src: 'F', v: 25, u: 'Strength', note: 'Recipe for 240 Merchant’s Favor at Honored.' },
    { id: 250350, slot: 'str', fx: '+18 Strength and +18 Agility', min: 30, lv: 55, src: 'F', v: 18, u: 'Strength and Agility', note: 'Recipe for 180 Merchant’s Favor at Honored.' },
    { id: 2457, slot: 'agi', fx: '+4 Agility', min: 60, lv: 2, src: 'C', v: 4, u: 'Agility', note: 'Unchanged from Classic.' },
    { id: 3390, slot: 'agi', fx: '+8 Agility', min: 60, lv: 18, src: 'C', v: 8, u: 'Agility', note: 'Unchanged from Classic.' },
    { id: 8949, slot: 'agi', fx: '+15 Agility', min: 60, lv: 27, src: 'C', v: 15, u: 'Agility', note: '' },
    { id: 2458, slot: 'hp', fx: '+27 maximum health', min: 60, lv: 2, src: 'C', v: 27, u: 'maximum health', note: '' },
    { id: 3825, slot: 'hp', fx: '+120 maximum health', min: 60, lv: 25, src: 'F', v: 120, u: 'maximum health', note: 'Classic’s Elixir of Fortitude, renamed.' },
    { id: 5997, slot: 'arm', fx: '+50 armour', min: 60, lv: 1, src: 'C', v: 50, u: 'armour', note: '' },
    { id: 3389, slot: 'arm', fx: '+150 armour', min: 60, lv: 16, src: 'C?', v: 150, u: 'armour', note: 'Classic’s Elixir of Defense, renamed in Forever, so check the tooltip.' },
    { id: 250939, slot: 'burst', fx: '+9 attack power for 30 seconds', min: 0.5, lv: null, any: true, src: 'F', v: 9, note: 'A potion, so it shares the potion cooldown with healing potions.' },
    { id: 929, slot: 'heal', fx: '280 to 360 health, at once', min: 0, lv: 12, src: 'C', v: 3, note: 'First Aid makes healing potions in Forever, not Alchemy.' },
    { id: 858, slot: 'heal', fx: '140 to 180 health, at once', min: 0, lv: 3, src: 'C', v: 2, note: 'First Aid makes it.' },
    { id: 247239, slot: 'heal', fx: '320 health at once, then 75% of that as damage over time', min: 0, lv: null, any: true, src: 'F', v: 1, note: 'Alchemy’s Discolored line.' },
    { id: 3385, slot: 'mana', fx: '280 to 360 mana, at once', min: 0, lv: 14, src: 'C', v: 1, note: '' }
  ];
  var SLOTS = [
    ['str', 'Strength elixir', 'Strength is your attack power, so this is the one elixir to keep up.'],
    ['agi', 'Agility elixir', 'Crit chance and a little armour.'],
    ['hp', 'Health elixir', ''],
    ['arm', 'Armour elixir', ''],
    ['burst', 'Attack power potion', 'For a pull that might go wrong.'],
    ['heal', 'Healing potion', ''],
    ['mana', 'Mana potion', 'For shocks and emergency heals.']
  ];
  /* The highest Cooking recipes, by skill, from wow.gg's Forever list (the stat each gives isn't published). */
  var FOOD = [['Crocolisk Steak', 80], ['Dry Pork Ribs', 80], ['Murloc Fin Soup', 90], ['Clam Chowder', 90], ['Redridge Goulash', 100], ['Seasoned Wolf Kabob', 100],
    ['Big Bear Steak', 110], ['Succulent Pork Ribs', 110], ['Lean Venison', 110], ['Gooey Spider Cake', 110], ['Crocolisk Gumbo', 120], ['Hot Lion Chops', 125],
    ['Lean Wolf Steak', 125], ['Curiously Tasty Omelet', 130], ['Heavy Crocolisk Stew', 150], ['Tasty Lion Steak', 150]];
  var KIT_SRC = [['Warcraft Wiki (Forever tooltips)', 'https://warcraft.wiki.gg/wiki/Category:Forever_items'], ['Mobalytics alchemy', 'https://mobalytics.gg/wow-forever/guides/alchemy-profession-guide'],
    ['Metaforge (renamed elixirs)', 'https://metaforge.app/wow-forever/database/recipes/recipe-elixir-of-giants'], ['WoWWiki elixirs (Classic values)', 'https://wowwiki.fandom.com/el/wiki/Elixir'],
    ['WoWWiki potions (Classic values)', 'https://wowwiki.fandom.com/el/wiki/Potion'], ['Icy Veins: First Aid healing potions', 'https://www.icy-veins.com/wow-forever/news/healing-potions-now-crafted-by-first-aid-in-wow-forever/'],
    ['Icy Veins cooking', 'https://www.icy-veins.com/wow-forever/cooking'], ['Icy Veins alchemy (Mixology)', 'https://www.icy-veins.com/wow-forever/alchemy'],
    ['wow-professions camping', 'https://www.wow-professions.com/forever/camping-guide'], ['wow.gg cooking', 'https://wow.gg/guides/wow-forever-new-recipes-cooking'],
    ['Blizzard: raids', 'https://news.blizzard.com/en-gb/article/24303009']];

  function isElixir(k) { return /Elixir/.test(nm(k.id)); }
  function alchemist() { return skill('Alchemy') > 0; }
  function kitPicks() {
    var L = lvl(), out = {};
    SLOTS.forEach(function (s) {
      var c = KIT.filter(function (k) { return k.slot === s[0] && (k.lv == null ? k.any : k.lv <= L); })
        .sort(function (a, b) { return (b.v || 0) - (a.v || 0) || (b.min || 0) - (a.min || 0); });
      out[s[0]] = c;
    });
    return out;
  }
  function getLine(k) {
    var rid = RXBY[k.id], st = rid ? M.rxState(rid) : null, bits = [], c = cheapest(k.id), q = listed(k.id);
    if (rid && st === 'known') {
      var e = M.rxEval(rid), cost = e && !e.miss ? e.herbs + e.other : null;
      var each = cost != null ? cost / (M.RX[rid][3] || 1) : null;
      bits.push('You know the recipe' + (each != null ? ': about ' + money(each) + ' of materials each' : '') + '.' +
        (each != null && c != null && c < each * 0.9 ? ' Buying is cheaper than making it today.' : ''));
    } else if (rid) {
      var r = M.RX[rid], p = profOf(rid), sk = skill(p);
      bits.push((st === 'learn' ? 'You can learn it now' : 'Recipe at ' + p + ' ' + r[5]) + (sk ? ' (you’re ' + sk + ')' : '') +
        (r[7] === 'trainer' ? ', from a trainer.' : r[7] === 'auto' ? '.' : ', from a recipe you find or buy.'));
    }
    bits.push(c != null ? 'Cheapest listing ' + money(c) + (q != null ? ', ' + q.toLocaleString('en-GB') + ' listed.' : '.') : 'None listed in the latest read.');
    return bits.join(' ');
  }
  function kitCard(slot, list) {
    var s = SLOTS.filter(function (x) { return x[0] === slot; })[0], k = list[0];
    if (!k) return '';
    var h = '<li class="pl-card"><p class="label">' + esc(s[1]) + '</p><p class="pl-pick">' + item(k.id) +
      '<span class="pl-fx">' + esc(k.fx + (k.min >= 1 ? ' · ' + mins(k.min) : '') + (k.lv ? ' · level ' + k.lv : ' · level not published')) + '</span></p>';
    if (alchemist() && isElixir(k) && k.v && k.u) h += '<p class="pl-mix">' + esc('With your Mixology: +' + Math.floor(k.v * 1.25) + ' ' + k.u + ' for ' + mins(k.min * 2) + '.') + '</p>';
    h += '<p class="pl-get">' + esc(getLine(k)) + '</p>';
    var note = [s[2], k.note, k.src === 'C' ? 'Classic value.' : k.src === 'C?' ? '' : ''].filter(Boolean).join(' ');
    if (note) h += '<p class="note">' + esc(note) + '</p>';
    if (list[1]) h += '<p class="pl-alt">' + 'Also: ' + item(list[1].id) + esc(' (' + list[1].fx + (list[1].min >= 1 ? ', ' + mins(list[1].min) : '') + ')' + (cheapest(list[1].id) != null ? ', ' + money(cheapest(list[1].id)) : '')) + '</p>';
    return h + '</li>';
  }
  function foodCard() {
    var ck = skill('Cooking'), top = FOOD.filter(function (f) { return f[1] <= ck; }).slice(-4).reverse().map(function (f) { return f[0]; });
    return '<li class="pl-card"><p class="label">Food</p><p class="pl-pick">Anything you cook<span class="pl-fx">Eat for 10 seconds: Well Fed gives 5% more experience from kills for 15 minutes, plus the food’s own stat.</span></p>' +
      (ck ? '<p class="pl-get">' + esc('The highest recipes in reach at your Cooking (' + ck + '): ' + andList(top) + '. Pick one with Strength or Stamina; the tooltip shows which.') + '</p>' : '') +
      '<p class="note">The experience bonus counts kills, not quest rewards. The Gourmand Legacy perk makes food buffs last up to a third longer.</p></li>';
  }
  function campCard() {
    var can = [];
    if (skill('Fishing') >= 20) can.push('Fish Bowl');
    if (skill('First Aid') >= 20) can.push('First Aid Kit (Stamina)');
    if (skill('Alchemy') >= 20) can.push('Mana Well (mana regeneration)');
    if (skill('Herbalism') >= 20) can.push('Incense Candle (Intellect)');
    var fish = skill('Fishing') >= 20;
    return '<li class="pl-card"><p class="label">Camp buff</p><p class="pl-pick">' + (fish ? 'Fish Bowl, from your Fishing' : 'Fish Bowl (Fishing 20)') +
      '<span class="pl-fx">+8% to all stats for an hour once you’ve sat by the fire for a minute. Made from a Raw Brilliant Smallfish and an Empty Vial.</span></p>' +
      (can.length > 1 ? '<p class="pl-get">' + esc('You can also place ' + andList(can.filter(function (c) { return c !== 'Fish Bowl'; })) + ', but each player adds one camp item an hour.') + '</p>' : '') +
      '<p class="note">It doesn’t stack with Blessing of Kings. Skip the Sharpening Wheel: it doesn’t stack with your Strength of Earth Totem.</p></li>';
  }
  var kitNow = $('#kit-now'), kitBuy = $('#kit-buy'), kitSum = $('#kit-buy-sum'), kitNext = $('#kit-next');
  var TARGET = saved('wowf-kit-target', {});
  function buyRows() {
    var picks = kitPicks(), ids = [], seen = {};
    function add(id, why) { if (!seen[id] && tracked(id)) { seen[id] = 1; ids.push([id, why]); } }
    SLOTS.forEach(function (s) {
      var k = picks[s[0]][0];
      if (!k) return;
      add(k.id, s[1]);
      var rid = RXBY[k.id];
      if (rid && M.rxState(rid) === 'known') M.RX[rid][4].forEach(function (x) { if (M.HERB[x[0]] != null) add(x[0], 'for ' + nm(k.id)); });
    });
    return ids;
  }
  function renderKitBuy() {
    if (!kitBuy || busy(kitBuy)) return;
    var rows = buyRows(), hits = [];
    var h = '<table class="pl-table"><caption class="vh">Your buy list, with the most you’d pay</caption><thead><tr><th scope="col">Item</th><th scope="col" class="num">Cheapest</th>' +
      '<th scope="col">Most you’d pay</th><th scope="col">Now</th></tr></thead><tbody>';
    rows.forEach(function (r) {
      var id = r[0], c = cheapest(id), t = TARGET[id], ok = t > 0 && c != null && c <= t, st = '';
      if (ok) { st = '<span class="chip ok">At or under</span>'; hits.push(nm(id) + ' ' + money(c)); }
      else if (t > 0 && c != null) st = esc(money(c - t) + ' over');
      else if (c == null) st = esc('None listed');
      h += '<tr><th scope="row">' + item(id) + '<span class="pl-why">' + esc(r[1]) + '</span></th><td class="num">' + (c != null ? money(c) : '—') + '</td>' +
        '<td><input class="pl-in" type="text" inputmode="decimal" data-tid="' + id + '" data-k="t' + id + '" aria-label="' + esc('Most you’d pay for ' + nm(id)) + '" placeholder="e.g. 45c" value="' + (t > 0 ? esc(money(t)) : '') + '"></td>' +
        '<td>' + st + '</td></tr>';
    });
    kitBuy.innerHTML = h + '</tbody></table>';
    if (kitSum) kitSum.textContent = !M.latest() ? 'Waiting for prices…' : hits.length ? (hits.length === 1 ? 'At or under your price now: ' : hits.length + ' at or under your price now: ') + andList(hits) + '.' : 'Nothing is at or under the prices you’ve set.';
  }
  function renderKit() {
    if (!kitNow) return;
    var L = lvl(), picks = kitPicks();
    $('#kit-h').textContent = 'Your kit at level ' + L;
    $('#kit-who').textContent = (M.ch() ? myName() + ' is an Enhancement Shaman: Strength first, then Agility and health.' : 'For an Enhancement Shaman: Strength first, then Agility and health.') +
      (alchemist() ? ' You’re an alchemist, so Mixology makes elixirs you drink 25% stronger and last twice as long.' : '') +
      ' Tap a name for its price chart.';
    var h = '';
    SLOTS.forEach(function (s) { h += kitCard(s[0], picks[s[0]]); });
    kitNow.innerHTML = h + foodCard() + campCard();
    var next = KIT.filter(function (k) { return k.lv != null && k.lv > L; }).sort(function (a, b) { return a.lv - b.lv; }), byLv = {};
    next.forEach(function (k) { (byLv[k.lv] = byLv[k.lv] || []).push(k); });
    var nh = Object.keys(byLv).map(Number).sort(function (a, b) { return a - b; }).map(function (v) {
      return '<li><b>Level ' + v + '</b>: ' + byLv[v].map(function (k) { return item(k.id) + esc(' (' + k.fx + (k.min >= 1 ? ', ' + mins(k.min) : '') + ')'); }).join('; ') + '</li>';
    }).join('');
    var unk = KIT.filter(function (k) { return k.lv == null && !k.any; });
    if (unk.length) nh += '<li><b>Level not published</b>: ' + unk.map(function (k) { return item(k.id) + esc(' (' + k.fx + ')'); }).join('; ') + '</li>';
    nh += '<li><b>Level 60</b>: the first raids, Barrow Deeps, Hyjal Summit and Onyxia’s Lair, open on Wednesday 9 December.</li>';
    kitNext.innerHTML = nh;
    $('#kit-know').innerHTML = [
      'Two elixirs of different kinds, like Strength and Agility, usually stack; two Strength elixirs don’t. Check the buff bar if you’re unsure.',
      'Potions share one cooldown, so an attack power potion and a healing potion compete.',
      'Your weapon imbues (Rockbiter, Flametongue, Windfury) use the temporary enchant slot, so sharpening stones won’t help you.',
      'Strength of Earth Totem is your Strength buff, so the Sharpening Wheel camp buff adds nothing on top.'
    ].map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');
    renderKitBuy();
  }
  if (kitBuy) kitBuy.addEventListener('change', function (e) {
    var t = e.target, id = t && t.getAttribute('data-tid');
    if (!id) return;
    var v = M.parseMoney(t.value);
    if (v == null) { t.setAttribute('aria-invalid', 'true'); return; }
    t.removeAttribute('aria-invalid');
    if (v > 0) TARGET[id] = v; else delete TARGET[id];
    store.set('wowf-kit-target', TARGET);
    keepFocus(kitBuy, function () { var a = document.activeElement; if (a) a.blur(); renderKitBuy(); });
  });

  /* =====================================================================================================
     Camp items, from wow-professions.com's camping guide:
     [profession, tier, item, skill, what it does, materials [[item id or name, count]], 'trainer' or 'boss|place' or '?', blueprint id]
     ===================================================================================================== */
  var CAMP = [
    ['Cooking', 1, 'Basic Campfire Kit', 1, 'The campfire: room for 3 camp items (a Journeyman Kit 5, an Expert Kit 10)', [[4470, 1]], 'trainer'],
    ['Cooking', 2, 'Cookie’s Feast', 140, 'Stamina food for everyone at the camp', [['Mystery Meat', 2], ['Heavy Kodo Meat', 1], [3713, 1]], 'Cookie|The Deadmines'],
    ['Cooking', 3, 'Iron Oven', 300, 'Needed for the most advanced Cooking recipes', [['Simple Flour', 10], ['Refreshing Spring Water', 5], [3713, 4]], 'Quartermaster Zigris|Lower Blackrock Spire'],
    ['Alchemy', 1, 'Mana Well', 20, 'Mana regeneration buff', [[2447, 1], [3371, 1]], 'trainer'],
    ['Alchemy', 2, 'Fermenter', 140, 'Needed for some Alchemy recipes', [[3372, 1], [3356, 1], [2452, 1]], 'Rath’mael|Ruins of Lordaeron', 273085],
    ['Alchemy', 3, 'Alchemy Laboratory', 300, 'Needed for some Alchemy recipes', [['Lich’s Index Finger', 1], [8925, 1], [13463, 2]], '?'],
    ['Herbalism', 1, 'Incense Candle', 20, 'Intellect buff (not with Arcane Intellect)', [[2447, 1], [765, 1]], 'trainer'],
    ['Herbalism', 2, 'Greenhouse', 140, 'Grows a herb from one seed, plus the Incense Candle buff', [[4470, 2], [8836, 1], [8831, 1]], 'Shadetooth|Excavation Site: Wetlands'],
    ['Herbalism', 3, 'Seed Hybridizer', 300, 'Multiplies seeds or combines them into rarer ones', [[13465, 4], [8925, 1], [14047, 2]], '?'],
    ['First Aid', 1, 'First Aid Kit', 20, 'Stamina buff (not with Power Word: Fortitude)', [[1251, 3], ['Refreshing Spring Water', 1]], 'trainer'],
    ['First Aid', 2, 'Toxin Study', 140, 'Healing potions and anti-venom, plus the First Aid Kit buff', [['Anti-Venom', 1], [8544, 2], [4470, 2]], 'Commander Springvale|Shadowfang Keep'],
    ['First Aid', 3, 'Plague Doctor’s Laboratory', 300, 'Healing potions and poultices', [[4470, 2], ['Strong Anti-Venom', 2], [14530, 5]], '?'],
    ['Fishing', 1, 'Fish Bowl', 20, '+8% to all stats (not with Blessing of Kings)', [['Raw Brilliant Smallfish', 1], [3371, 1]], 'trainer'],
    ['Fishing', 2, 'Fishing Rack', 140, 'Uncommon fish for an hour, and lures', [[4470, 2], [8925, 1], [8365, 2]], 'Gelihast|Blackfathom Deeps'],
    ['Fishing', 3, 'Fishing Hut', 300, 'Rare fish for an hour, and lures', [[4470, 5], [14048, 2], ['Seasonal Fish Steaks', 1]], '?'],
    ['Blacksmithing', 1, 'Sharpening Wheel', 20, 'Strength buff (not with Strength of Earth Totem)', [[2835, 1], [2840, 1]], 'trainer'],
    ['Blacksmithing', 2, 'Anvil', 140, 'An anvil, plus the Sharpening Wheel buff', [[2841, 5], ['Coarse Grinding Stone', 2], [2319, 2]], 'Gilnid|The Deadmines'],
    ['Blacksmithing', 3, 'Master Forge', 300, 'Needed for many Blacksmithing recipes', [['Golem Heart', 1], [12359, 5], [8170, 2]], 'Golem Lord Argelmach|Blackrock Depths'],
    ['Enchanting', 1, 'Enchanted Lute', 20, 'Armour, all stats and resistances buff', [[4470, 1], [10940, 1]], 'trainer'],
    ['Enchanting', 2, 'Arcane Salvager', 140, 'Better disenchanting', [['Vision Dust', 2], ['Lesser Nether Essence', 1]], 'Shade of the Archmage|City of Dalaran'],
    ['Enchanting', 3, 'Arcane Forge', 300, 'Needed for some Enchanting recipes', [['Maker’s Spark', 1], ['Large Brilliant Shard', 2], ['Greater Eternal Essence', 4]], '?'],
    ['Engineering', 1, 'Reagent Bot', 20, 'A vendor for class reagents and profession supplies', [['Handful of Copper Bolts', 1], ['Copper Tube', 1]], 'trainer'],
    ['Engineering', 2, 'Repair Bot', 140, 'Repairs for everyone at the camp', [['Whirring Bronze Gizmo', 2], ['Bronze Tube', 1], [4234, 1]], 'Sneed|The Deadmines'],
    ['Engineering', 3, 'Anarchist’s Workbench', 300, 'Needed for some Engineering recipes', [['Essence of Anarchy', 1], ['Thorium Widget', 2]], '?'],
    ['Leatherworking', 1, 'Camp Tent', 20, 'Rested experience up to 5% of a level, once an hour', [[2318, 5]], 'trainer'],
    ['Leatherworking', 2, 'Tanning Rack', 125, 'Needed for many Leatherworking recipes; others below 140 can use yours', [[2319, 5], [2321, 3], [4470, 2]], 'Razorclaw the Butcher|Shadowfang Keep'],
    ['Leatherworking', 3, 'Sewing Machine', 300, 'Needed for many Leatherworking recipes', [['Undeath Engine', 1], [8170, 5], ['Rune Thread', 1]], '?'],
    ['Mining', 1, 'Lodestone', 20, 'Melee attack power buff', [[2835, 1], [2840, 1]], 'trainer'],
    ['Mining', 2, 'Rock Garden', 140, 'Spawns a common mining node over time, plus the Lodestone buff', [[2838, 2], [2772, 1], [2842, 1]], 'Relic Guardian|Excavation Site: Wetlands'],
    ['Mining', 3, 'Molten Foundry', 300, 'Needed for Smelt Heavy Thorium', [[12359, 5], ['Dense Stone', 2], ['Truesilver Bar', 1]], '?'],
    ['Skinning', 1, 'Camp Chair', 20, '+2% crit chance', [[2318, 3], [4470, 2]], 'trainer'],
    ['Skinning', 2, 'Field Guide', 140, 'A book anyone can read to learn Track Beasts', [[2319, 3], ['Slimy Murloc Scale', 2], [2321, 1]], 'Lady Anacondra|Wailing Caverns'],
    ['Skinning', 3, 'Trapper’s Workbench', 300, 'A workbench with a trap', [[4470, 2], [4234, 4], ['Iron Bar', 1]], '?'],
    ['Tailoring', 1, 'Faction Banner', 20, 'Spirit buff for your faction', [[2996, 1], [2320, 1]], 'trainer'],
    ['Tailoring', 2, 'Spinning Wheel', 140, 'Needed for many Tailoring recipes', [[4470, 2], [4305, 5], [2321, 3]], 'Unstable Sentinel|City of Dalaran'],
    ['Tailoring', 3, 'Loom', 300, 'Needed for many Tailoring recipes', [['Bottled Screams', 1], [14048, 4], [4470, 4]], 'Baroness Anastari|Stratholme']
  ];
  var CAMP_SRC = [['wow-professions camping guide', 'https://www.wow-professions.com/forever/camping-guide'], ['Method: herb seeds', 'https://www.method.gg/wow-forever/how-herb-seeds-work-in-wow-forever-herbalism-greenhouse-and-seed-hybridizer'],
    ['Icy Veins: Greenhouse', 'https://www.icy-veins.com/wow-forever/news/greenhouse-blueprint-found-how-herbalism-seeds-work-in-wow-forever/'], ['Warcraft Tavern: Legacy (Field Guide)', 'https://www.warcrafttavern.com/forever/guides/legacy/'],
    ['allthings.how camping', 'https://allthings.how/?p=198891']];
  function myProfs() { var ch = M.ch(); return ch && Array.isArray(ch.profs) ? ch.profs.map(function (p) { return p[0]; }) : []; }
  function matText(mats) {
    var cost = 0, part = false, words = [];
    mats.forEach(function (m) {
      var id = m[0], c = m[1], b = typeof id === 'number' ? buy(id) : null;
      words.push((c > 1 ? c + ' ' : '') + (typeof id === 'number' ? nm(id) : id));
      if (b != null) cost += b * c; else part = true;
    });
    return { words: words.join(', '), cost: cost, part: part };
  }
  function learnText(c) {
    if (c[6] === 'trainer') return c[1] === 1 ? 'A trainer, or the Camping 101 quest' : 'A trainer';
    if (c[6] === '?') return 'Blueprint: where it drops isn’t known yet';
    var w = c[6].split('|');
    return 'Blueprint from ' + w[0] + ', ' + w[1];
  }
  function renderCampItems() {
    var el = $('#camp-items');
    if (!el) return;
    var mine = myProfs(), rows = CAMP.filter(function (c) { return mine.indexOf(c[0]) >= 0; });
    if (!rows.length) rows = CAMP.filter(function (c) { return c[1] === 1; });
    var h = '<table class="pl-table pl-stack" role="table"><caption class="vh">Camp items for your professions</caption>' +
      thead([['Item'], ['Skill', 'num'], ['Does'], ['Materials today'], ['Learn from']]) + '<tbody>';
    var prof = '';
    rows.forEach(function (c) {
      var sk = skill(c[0]), m = matText(c[5]), have = sk >= c[3];
      if (c[0] !== prof) { prof = c[0]; h += '<tr class="pl-grp" role="row"><th scope="rowgroup" role="rowheader" colspan="5">' + esc(prof + (sk ? ' · yours ' + sk : '')) + '</th></tr>'; }
      var chip = c[6] === 'trainer' ? (have ? '<span class="chip ok">You can make it</span>' : '<span class="chip">' + esc((c[3] - sk) + ' more skill') + '</span>')
        : have ? '<span class="chip gold">Blueprint needed</span>' : '<span class="chip">' + esc((c[3] - sk) + ' more skill') + '</span>';
      h += '<tr role="row">' + rowh(esc(c[2]) + '<span class="pl-why">Tier ' + c[1] + '</span>') + cell(String(c[3]), 'num pl-top', 'Skill') + cell(esc(c[4]), 'pl-span') +
        cell(esc(m.words) + '<span class="pl-why">' + (m.cost ? esc((m.part ? 'From ' : '') + money(m.cost) + (m.part ? ' plus untracked items' : '')) : esc('No prices tracked')) + '</span>', 'pl-span', 'Materials') +
        cell(chip + '<span class="pl-why">' + esc(learnText(c)) + '</span>', 'pl-span') + '</tr>';
    });
    el.innerHTML = h + '</tbody></table>';
    var note = $('#camp-note');
    if (note) note.textContent = mine.length ? 'For ' + andList(mine) + '. Materials are priced at the cheaper of a vendor or the latest Auction House read. The Blueprints tab lists every profession’s blueprints.' : 'Your professions arrive with the next character sync; until then this lists the Tier 1 items.';
  }
  /* Greenhouse: one seed per Greenhouse; it lasts 15 minutes and the herb takes 8. What each seed grows: wow-professions and Warcraft Tavern's Herbalism pages. */
  var SEEDS = [[268415, [2447, 2449]], [268416, [765, 3356]], [268417, []], [268418, []]];
  function ghCost() { var m = matText(CAMP.filter(function (c) { return c[2] === 'Greenhouse'; })[0][5]); return m.part ? null : m.cost; }
  function renderGreenhouse() {
    var st = $('#gh-status'), calc = $('#gh-calc'), sum = $('#gh-sum');
    if (!st || !calc) return;
    var hs = skill('Herbalism'), cost = ghCost(), pick = Math.max(1, Math.min(10, +($('#gh-pick') || {}).value || 2)), per = Math.max(1, Math.min(10, +($('#gh-per') || {}).value || 1));
    st.innerHTML = '<ul class="plain pl-list">' +
      '<li>' + (hs >= 140 ? '<span class="chip ok">Skill</span> ' + esc('Your Herbalism (' + hs + ') is enough: it needs 140.') : '<span class="chip">Skill</span> ' + esc('It needs Herbalism 140' + (hs ? '; you’re ' + hs : '') + '.')) + '</li>' +
      '<li><span class="chip gold">Blueprint</span> ' + esc('Blueprint: Greenhouse drops from Shadetooth at the Excavation Site in the Wetlands (about 8% of kills in the beta).') + '</li>' +
      '<li><span class="chip">Cost</span> ' + esc(cost != null ? 'One Greenhouse takes 2 Simple Wood, an Arthas’ Tears and a Purple Lotus: ' + money(cost) + ' at today’s prices. You can’t pick those herbs until Herbalism 220 and 210.' : 'No price today for one of its materials.') + '</li>' +
      '<li><span class="chip">How</span> ' + esc('Place it by a campfire; it lasts 15 minutes. Plant one seed, and the herb is ready to pick after 8 minutes. All camp items share a 1-hour cooldown, so that’s one seed an hour.') + '</li></ul>';
    var h = '<table class="pl-table pl-stack" role="table"><caption class="vh">Planting a seed against selling it</caption>' +
      thead([['Seed'], ['Sells for', 'num'], ['Grows'], ['One pick', 'num'], ['Plant vs sell', 'num'], ['After the Greenhouse', 'num']]) + '<tbody>', best = null;
    SEEDS.forEach(function (s) {
      var sv = sale(s[0]), herbs = s[1], vals = herbs.map(sale).filter(function (v) { return v != null; });
      var pv = vals.length ? pick * vals.reduce(function (a, b) { return a + b; }, 0) / vals.length : null;
      var vs = pv != null && sv != null ? pv - sv : null, net = vs != null && cost != null ? vs - cost / per : null;
      if (net != null && (!best || net > best.net)) best = { id: s[0], net: net };
      h += '<tr role="row">' + rowh(item(s[0])) + cell(sv != null ? money(sv) : '—', 'num pl-span', 'Sells for') +
        cell(herbs.length ? herbs.map(function (x) { return item(x); }).join(' or ') : esc('Not published yet'), 'pl-span', 'Grows') +
        cell(pv != null ? money(pv) : '—', 'num pl-span', 'One pick') + cell(vs != null ? money(vs) : '—', 'num pl-span' + (vs == null ? '' : vs >= 0 ? ' pl-ok' : ' pl-bad'), 'Plant vs sell') +
        cell(net != null ? money(net) : '—', 'num pl-top' + (net == null ? '' : net >= 0 ? ' pl-ok' : ' pl-bad'), 'After the Greenhouse') + '</tr>';
    });
    calc.innerHTML = h + '</tbody></table>';
    if (sum) sum.textContent = cost == null ? 'Planting can’t be priced until all the Greenhouse’s materials have a price.' :
      best && best.net >= 0 ? 'At today’s prices, planting ' + nm(best.id) + ' beats selling it by ' + money(best.net) + ', after the Greenhouse.' :
      'At today’s prices no seed pays for a Greenhouse: sell the seeds, or plant them only when you’d place a Greenhouse anyway for its Intellect buff. Plant vs sell compares one pick of the herb with the seed’s price; the last column also takes off a Greenhouse.';
  }
  ['gh-pick', 'gh-per'].forEach(function (k) { var e = document.getElementById(k); if (e) e.addEventListener('input', renderGreenhouse); });
  /* Camp timer: kept in this browser. */
  var ctOut = $('#ct-out'), ctTick = null;
  function hm(t) { return new Date(t).toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' }); }
  function until(t) { var m = Math.round((t - Date.now()) / 60000); return m > 0 ? 'in ' + plural(m, 'minute') : 'now'; }
  function renderTimer() {
    if (!ctOut) return;
    var c = saved('wowf-camp', null), clear = $('#ct-clear');
    if (!c || !c.at) { ctOut.innerHTML = '<li class="note">No camp item placed yet.</li>'; if (clear) clear.hidden = true; return; }
    if (clear) clear.hidden = false;
    var cd = 60 * (1 - 0.08 * (c.fg || 0)), rows = [];
    if (c.what === 'gh') {
      var ready = c.at + 8 * 60000, gone = c.at + 15 * 60000;
      rows.push(['Herb ready to pick', ready], ['Greenhouse gone', gone]);
    } else rows.push(['Camp item gone (most last 15 minutes)', c.at + 15 * 60000]);
    rows.push(['Your next camp item', c.at + cd * 60000]);
    ctOut.innerHTML = rows.map(function (r) { return '<li><b>' + esc(hm(r[1])) + '</b> ' + esc(r[0] + ' (' + (r[1] <= Date.now() ? 'done' : until(r[1])) + ')') + '</li>'; }).join('') +
      '<li class="note">' + esc('Placed at ' + hm(c.at) + '. The cooldown is ' + Math.round(cd) + ' minutes' + (c.fg ? ' with Field Guide ' + c.fg + ' (8% a rank, as the guides describe it).' : '.')) + '</li>';
  }
  if ($('#ct-go')) $('#ct-go').addEventListener('click', function () {
    store.set('wowf-camp', { at: Date.now(), what: ($('#ct-what') || {}).value || 'gh', fg: +(($('#ct-fg') || {}).value || 0) });
    renderTimer();
  });
  if ($('#ct-clear')) $('#ct-clear').addEventListener('click', function () { store.set('wowf-camp', null); renderTimer(); $('#ct-go').focus(); });
  ['ct-what', 'ct-fg'].forEach(function (k) {
    var e = document.getElementById(k), c = saved('wowf-camp', null);
    if (e && c && c[k === 'ct-what' ? 'what' : 'fg'] != null) e.value = String(c[k === 'ct-what' ? 'what' : 'fg']);
  });
  function renderCamp() { renderCampItems(); renderGreenhouse(); renderTimer(); }

  /* =====================================================================================================
     Blueprints: the Tier 2 and 3 camp items above, ticked off in this browser; and a crafting-for-tips helper.
     ===================================================================================================== */
  var HAVE = saved('wowf-bp-have', {});
  function bpTable(rows, cap) {
    var h = '<table class="pl-table pl-stack" role="table"><caption class="vh">' + esc(cap) + '</caption>' +
      thead([['Blueprint'], ['Skill', 'num'], ['Drops from'], ['On the AH', 'num'], ['Have it']]) + '<tbody>';
    rows.forEach(function (c) {
      var sk = skill(c[0]), w = c[6] === '?' ? null : c[6].split('|'), p = c[7] ? cheapest(c[7]) : null, k = 'bp' + c[2].replace(/[^a-z]/gi, '');
      h += '<tr role="row">' + rowh(esc('Blueprint: ' + c[2]) + '<span class="pl-why">' + esc(c[0] + ' · ' + c[4]) + '</span>') +
        cell(c[3] + (sk ? '<span class="pl-why">' + esc('you ' + sk) + '</span>' : ''), 'num pl-span', 'Skill') +
        cell(w ? esc(w[0]) + '<span class="pl-why">' + esc(w[1]) + '</span>' : esc('Not known yet'), 'pl-span', 'Drops from') +
        cell(c[7] ? (p != null ? money(p) : esc('None listed')) : '—', 'num pl-span' + (c[7] ? '' : ' pl-nil'), 'On the AH') +
        cell('<label class="mk-check pl-have"><input type="checkbox" data-bp="' + esc(c[2]) + '" data-k="' + k + '"' + (HAVE[c[2]] ? ' checked' : '') + '><span class="pl-have-t">Have it</span><span class="vh">' + esc(': Blueprint: ' + c[2]) + '</span></label>', 'pl-top') + '</tr>';
    });
    return h + '</tbody></table>';
  }
  function renderBlueprints() {
    var mineEl = $('#bp-mine'), otherEl = $('#bp-other'), sum = $('#bp-sum');
    if (!mineEl) return;
    var mine = myProfs(), bps = CAMP.filter(function (c) { return c[1] >= 2; });
    var m = bps.filter(function (c) { return mine.indexOf(c[0]) >= 0; }), o = bps.filter(function (c) { return mine.indexOf(c[0]) < 0; });
    mineEl.innerHTML = m.length ? bpTable(m, 'Blueprints for your professions') : '<p class="note">Your professions arrive with the next character sync.</p>';
    otherEl.innerHTML = bpTable(o, 'Blueprints for other professions');
    var got = m.filter(function (c) { return HAVE[c[2]]; }).length, hunt = m.filter(function (c) { return !HAVE[c[2]] && c[6] !== '?' && skill(c[0]) >= c[3]; });
    if (sum) sum.textContent = m.length ? 'You have ' + got + ' of ' + m.length + '.' + (hunt.length ? ' Worth hunting now, since you have the skill: ' + andList(hunt.map(function (c) { var w = c[6].split('|'); return c[2] + ' (' + w[0] + ', ' + w[1] + ')'; })) + '.' : '') +
      ' Each tier also keeps the Tier 1 buff of its profession.' : '';
  }
  document.addEventListener('change', function (e) {
    var t = e.target, k = t && t.getAttribute && t.getAttribute('data-bp');
    if (!k) return;
    if (t.checked) HAVE[k] = true; else delete HAVE[k];
    store.set('wowf-bp-have', HAVE);
    var root = $('#panel-bp');
    keepFocus(root, renderBlueprints);
  });
  var tipRx = $('#tip-rx'), tipN = $('#tip-n'), tipPct = $('#tip-pct'), tipOut = $('#tip-out');
  function fillTipRecipes() {
    if (!tipRx) return;
    var cur = tipRx.value, list = Object.keys(M.RX).filter(function (rid) { return M.rxState(rid) === 'known'; })
      .sort(function (a, b) { return M.RX[a][0] < M.RX[b][0] ? -1 : 1; });
    tipRx.innerHTML = list.length ? list.map(function (rid) { return '<option value="' + rid + '">' + esc(M.RX[rid][0] + ' (' + profOf(rid) + ')') + '</option>'; }).join('') : '<option value="">No known recipes yet</option>';
    if (cur && list.indexOf(cur) >= 0) tipRx.value = cur;
    else { var lf = list.filter(function (rid) { return /Frenzy/.test(M.RX[rid][0]); })[0]; if (lf) tipRx.value = lf; }
  }
  function renderTips() {
    if (!tipOut || !tipRx) return;
    var rid = tipRx.value, n = Math.max(1, Math.min(200, Math.round(+tipN.value) || 1)), pct = +tipPct.value || 10;
    if (!rid || !M.RX[rid]) { tipOut.innerHTML = '<p class="note">Your recipes arrive with the next character sync.</p>'; return; }
    var r = M.RX[rid], e = M.rxEval(rid), crafts = Math.ceil(n / (r[3] || 1));
    if (!e || e.miss) { tipOut.innerHTML = '<p class="note">' + esc('There’s no price today for something ' + r[0] + ' needs.') + '</p>'; return; }
    var val = e.value * crafts, mats = (e.herbs + e.other) * crafts, tip = Math.max(10, Math.round(val * pct / 100 / 5) * 5), mine = mats + tip, each = mine / (crafts * (r[3] || 1));
    var line = 'Crafting ' + r[0] + ': your mats + ' + money(tip) + ' tip, or ' + money(each) + ' each with mine. /w ' + myName();
    tipOut.innerHTML = '<ul class="plain pl-list">' +
      '<li>' + esc(n + ' × ' + nm(r[2]) + ' would sell for ' + money(val) + ' after the Auction House cut.') + '</li>' +
      '<li>' + esc('Their materials are worth ' + money(mats) + ': herbs at what they’d sell for, vials and the rest at what they cost.') + '</li>' +
      '<li><b>' + esc('With their materials: ask ' + money(tip) + ' (' + pct + '% of the value, at least 10c).') + '</b></li>' +
      '<li><b>' + esc('With yours: ' + money(mine) + ', about ' + money(each) + ' each.') + '</b>' +
      (M.now(r[2]) && each > (M.now(r[2]).min != null ? M.now(r[2]).min : M.now(r[2]).price) ? '<span class="pl-why">' + esc('That’s more than the cheapest listing (' + money(M.now(r[2]).min != null ? M.now(r[2]).min : M.now(r[2]).price) + '), so most buyers will bring their own materials or buy it there.') + '</span>' : '') +
      '</li></ul>' +
      '<div class="pl-form"><label class="pl-wide" for="tip-line">For trade chat<textarea class="pl-paste" id="tip-line" rows="3" readonly>' + esc(line) + '</textarea></label>' +
      '<button type="button" class="btn small ghost" id="tip-copy">Copy</button></div><p class="note" id="tip-copied" aria-live="polite"></p>';
  }
  [tipRx, tipN, tipPct].forEach(function (e) { if (e) e.addEventListener('change', renderTips); });
  if (tipN) tipN.addEventListener('input', renderTips);
  document.addEventListener('click', function (e) {
    if (!e.target || e.target.id !== 'tip-copy') return;
    var inp = $('#tip-line'), msg = $('#tip-copied');
    function done(ok) { if (msg) msg.textContent = ok ? 'Copied.' : 'Select the line and copy it.'; }
    try { navigator.clipboard.writeText(inp.value).then(function () { done(true); }, function () { inp.select(); done(false); }); } catch (x) { inp.select(); done(false); }
  });
  var BP_SRC = [['wow-professions camping guide', 'https://www.wow-professions.com/forever/camping-guide'], ['Warcraft Wiki: Blueprint: Tanning Rack', 'https://warcraft.wiki.gg/wiki/Blueprint:_Tanning_Rack'],
    ['Warcraft Wiki: Blueprint: Greenhouse', 'https://warcraft.wiki.gg/wiki/Blueprint:_Greenhouse'], ['Expcarry: Tanning Rack', 'https://expcarry.com/wow-forever-tanning-rack-blueprint']];
  function renderBp() { renderBlueprints(); fillTipRecipes(); renderTips(); }

  /* =====================================================================================================
     Legacy: tiers, ranks and prerequisites from Warcraft Wiki; effects from Warcraft Tavern; Bountiful Harvest's
     20% a rank from Mobalytics and Icy Veins. [tree, tier, perk, ranks, needs, effect]
     ===================================================================================================== */
  var LEG = [
    ['Professions', 1, 'Working Overtime', 5, '', 'A 4% better chance of a skill-up from any primary, secondary or class tradeskill.'],
    ['Professions', 1, 'Bountiful Harvest', 5, '', '20% more Scarce materials from Mining, Herbalism and Skinning, each rank.'],
    ['Professions', 2, 'Bartering', 2, '', 'Vendor items cost 5% less gold.'],
    ['Professions', 2, 'Performance Bonus', 3, 'Bountiful Harvest', 'A 5% chance of double Merchant’s Favor when you hand in a crate.'],
    ['Professions', 3, 'Master Chef', 1, '', 'Cooking recipes have a 10% chance to make one more.'],
    ['Professions', 3, 'Dedicated Study', 1, 'Bartering', '+1 skill in your lowest primary or secondary tradeskill.'],
    ['Professions', 3, 'Luremaster', 2, '', 'A 25% chance of an extra fish while a lure is on.'],
    ['Adventure', 1, 'Well Rested', 5, '', 'Rested experience builds 4% faster and its cap is 4% higher.'],
    ['Adventure', 1, 'Thrill of Adventure', 5, '', 'Kills restore 1% of your health and mana over 10 seconds (not in dungeons, raids or battlegrounds).'],
    ['Adventure', 2, 'High Alert', 2, '', 'See stealth as if you were a level higher, each rank.'],
    ['Adventure', 2, 'Talented', 5, 'Well Rested', 'Talent points start a level sooner each rank: from level 9 at rank 1 to level 5 at rank 5. Still 51 in all.'],
    ['Adventure', 2, 'Field Guide', 3, '', 'The camp items’ cooldown is 8% shorter.'],
    ['Adventure', 2, 'Field Medicine', 2, '', 'Recently Bandaged is 5 seconds shorter (not in dungeons, raids or battlegrounds).'],
    ['Adventure', 3, 'Frequent Flier', 3, 'Field Guide', 'Flight paths cost half and fly 20% faster.'],
    ['Resourcefulness', 1, 'Gourmand', 3, '', 'Food buffs last 33% longer.'],
    ['Resourcefulness', 1, 'The Quick and the Dead', 2, '', 'Run 5% faster while dead; helpful spells cost nothing for a minute after you’re raised.'],
    ['Resourcefulness', 1, 'Reinforce', 5, '', '8% less durability lost when you die.'],
    ['Resourcefulness', 2, 'For Great Honor', 5, '', '2% more Honor Points.'],
    ['Resourcefulness', 2, 'Permanence', 2, 'Gourmand', 'Long party and raid buffs from class abilities, and camp rest benefits, last 50% longer.'],
    ['Resourcefulness', 2, 'Diplomat', 5, '', '2% more reputation.'],
    ['Resourcefulness', 3, 'Reagent Economy', 1, 'The Quick and the Dead', 'Class abilities need no vendor reagents, and Tier 1 camp items need no materials.']
  ];
  var CAP = 16, TREES = ['Professions', 'Adventure', 'Resourcefulness'];
  var PRESET = {
    lvl: { 'Well Rested': 5, 'Talented': 5, 'Thrill of Adventure': 5, 'Field Guide': 1 },
    gath: { 'Bountiful Harvest': 5, 'Working Overtime': 5, 'Performance Bonus': 3, 'Bartering': 2, 'Dedicated Study': 1 }
  };
  var LGS = saved('wowf-legacy', null);
  if (!LGS || !LGS.lvl || !LGS.gath) LGS = { cur: 'lvl', lvl: JSON.parse(JSON.stringify(PRESET.lvl)), gath: JSON.parse(JSON.stringify(PRESET.gath)) };
  function perk(name) { return LEG.filter(function (p) { return p[2] === name; })[0]; }
  function used(set) { return Object.keys(set).reduce(function (a, k) { return a + (set[k] || 0); }, 0); }
  function dependents(set, name) { return LEG.filter(function (p) { return p[4] === name && (set[p[2]] || 0) > 0; }); }
  function renderLegacyStatus() {
    var el = $('#lg-status');
    if (!el) return;
    var L = lvl(), al = skill('Alchemy'), fa = skill('First Aid'), ck = skill('Cooking'), near = [];
    if (L < 25) near.push('level 25 (you’re ' + L + ')');
    if (al && al < 150) near.push('Alchemy 150 (you’re ' + al + ')');
    var done = L >= 25 || al >= 150, sec = [];
    if (fa && fa < 150) sec.push('First Aid 150 (you’re ' + fa + ')');
    if (ck && ck < 150) sec.push('Cooking 150 (you’re ' + ck + ')');
    el.innerHTML = '<p>' + esc(done ? 'You’ve likely earned your first Legacy Point. Open Legacy with Y, or the Legacy button in the menu.' :
      'Legacy opens with your first Legacy Point, from level 25 on any character or 150 in a non-gathering tradeskill. Nearest for you: ' + andList(near) + '.') + '</p>' +
      (sec.length ? '<p class="note">' + esc('Guides also list First Aid and Cooking at 150, 225 and 300: ' + andList(sec) + '.') + '</p>' : '') +
      '<p class="note">Points are earned across your account (65 so far) and spent per character, up to 16 each at launch. A respec happens at your class trainer.</p>';
  }
  function renderLegacy() {
    var trees = $('#lg-trees');
    if (!trees) return;
    var set = LGS[LGS.cur], u = used(set);
    $$('input[name="lgset"]').forEach(function (r) { r.checked = r.value === LGS.cur; });
    $('#lg-used').textContent = 'This loadout uses ' + u + ' of ' + CAP + ' points.' + (u === CAP ? ' That’s the cap.' : '');
    keepFocus(trees, function () {
      trees.innerHTML = TREES.map(function (tr) {
        var pts = LEG.filter(function (p) { return p[0] === tr; }).reduce(function (a, p) { return a + (set[p[2]] || 0); }, 0);
        return '<div class="pl-tree"><h4>' + esc(tr) + ' <span class="pl-why">' + esc(plural(pts, 'point')) + '</span></h4>' + LEG.filter(function (p) { return p[0] === tr; }).map(function (p) {
          var r = set[p[2]] || 0, needOk = !p[4] || (set[p[4]] || 0) > 0, canUp = r < p[3] && u < CAP && needOk, deps = dependents(set, p[2]), canDown = r > 0 && !(r === 1 && deps.length);
          var key = p[2].replace(/[^a-z]/gi, '');
          return '<div class="pl-perk' + (r ? ' on' : '') + '"><span class="pl-perk-n">' + esc(p[2]) + '<span class="pl-why">' + esc('Tier ' + p[1] + (p[4] ? ' · needs ' + p[4] : '')) + '</span></span>' +
            '<span class="pl-steps"><button type="button" class="pl-step" data-lg="' + esc(p[2]) + '" data-d="-1" data-k="m' + key + '" aria-disabled="' + !canDown + '" aria-label="' + esc('One less ' + p[2]) + '"' + (deps.length && r === 1 ? ' title="' + esc(deps.map(function (d) { return d[2]; }).join(', ') + ' needs it') + '"' : '') + '>−</button>' +
            '<span class="pl-rank" aria-label="' + esc(r + ' of ' + p[3]) + '">' + r + '/' + p[3] + '</span>' +
            '<button type="button" class="pl-step" data-lg="' + esc(p[2]) + '" data-d="1" data-k="p' + key + '" aria-disabled="' + !canUp + '" aria-label="' + esc('One more ' + p[2]) + '"' + (!needOk ? ' title="' + esc('Needs ' + p[4]) + '"' : '') + '>+</button></span>' +
            '<span class="pl-fx">' + esc(p[5]) + '</span></div>';
        }).join('') + '</div>';
      }).join('');
    });
    var other = LGS[LGS.cur === 'lvl' ? 'gath' : 'lvl'], diff = [];
    LEG.forEach(function (p) { var d = (set[p[2]] || 0) - (other[p[2]] || 0); if (d) diff.push((d > 0 ? '+' : '−') + Math.abs(d) + ' ' + p[2]); });
    $('#lg-diff').textContent = diff.length ? 'Against your ' + (LGS.cur === 'lvl' ? 'gathering' : 'levelling') + ' loadout: ' + diff.join(', ') + '. Swapping means a respec at your class trainer each way.' : 'Both loadouts are the same.';
    renderBH();
  }
  if ($('#lg-trees')) $('#lg-trees').addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-lg]') : null;
    if (!b || b.getAttribute('aria-disabled') === 'true') return;
    var set = LGS[LGS.cur], name = b.getAttribute('data-lg'), p = perk(name), d = +b.getAttribute('data-d'), r = set[name] || 0;
    if (d > 0 && r < p[3] && used(set) < CAP) set[name] = r + 1;
    if (d < 0 && r > 0) { if (r === 1) delete set[name]; else set[name] = r - 1; }
    store.set('wowf-legacy', LGS);
    renderLegacy();
  });
  $$('input[name="lgset"]').forEach(function (r) { r.addEventListener('change', function () { LGS.cur = r.value; store.set('wowf-legacy', LGS); renderLegacy(); }); });
  if ($('#lg-reset')) $('#lg-reset').addEventListener('click', function () { LGS[LGS.cur] = JSON.parse(JSON.stringify(PRESET[LGS.cur])); store.set('wowf-legacy', LGS); renderLegacy(); });
  /* Bountiful Harvest: what the extra Scarce finds are worth, and how long a swap takes to pay for two respecs. */
  var SCARCE = [[249399, 15], [249424, 125], [249274, 0]];
  function renderBH() {
    var out = $('#bh-out'), sum = $('#bh-sum');
    if (!out) return;
    var f = Math.max(0, +($('#bh-n') || {}).value || 0), costIn = $('#bh-cost'), cost = M.parseMoney(costIn ? costIn.value : '10g'), hs = skill('Herbalism') || M.herbSkill();
    if (costIn) { if (cost == null) costIn.setAttribute('aria-invalid', 'true'); else costIn.removeAttribute('aria-invalid'); }
    var can = SCARCE.filter(function (s) { return s[1] && hs >= s[1] && sale(s[0]) != null; }), avg = can.length ? can.reduce(function (a, s) { return a + sale(s[0]); }, 0) / can.length : null;
    if (avg == null) { out.innerHTML = '<p class="note">No prices for the Scarce herbs you can find yet.</p>'; if (sum) sum.textContent = ''; return; }
    var h = '<table class="pl-table"><caption class="vh">What Bountiful Harvest adds in an hour of picking</caption><thead><tr><th scope="col">Ranks</th>' +
      '<th scope="col" class="num">Extra finds an hour</th><th scope="col" class="num">Gold an hour</th><th scope="col" class="num">Hours to repay two respecs</th></tr></thead><tbody>';
    for (var r = 1; r <= 5; r++) {
      var extra = f * 0.2 * r, g = extra * avg, pay = cost && g > 0 ? 2 * cost / g : null;
      h += '<tr><th scope="row">' + r + '<span class="pl-why">+' + (20 * r) + '%</span></th><td class="num">' + extra.toFixed(1) + '</td><td class="num">' + money(g) + '</td><td class="num">' + (pay != null ? (pay < 100 ? pay.toFixed(1) : Math.round(pay)) : '—') + '</td></tr>';
    }
    out.innerHTML = h + '</tbody></table>';
    if (sum) sum.textContent = 'Priced at ' + andList(can.map(function (s) { return nm(s[0]) + ' (' + money(sale(s[0])) + ')'; })) + ' after the cut, the Scarce herbs you can find at Herbalism ' + hs + '. ' +
      'It only adds Scarce materials, not ordinary herbs. Guides disagree on the respec price (10 gold in one beta, rising with each reset in another), so check it at your trainer.';
  }
  ['bh-n', 'bh-cost'].forEach(function (k) { var e = document.getElementById(k); if (e) e.addEventListener('input', renderBH); });
  var LG_SRC = [['Warcraft Wiki: Legacy System', 'https://warcraft.wiki.gg/wiki/Legacy_System'], ['Warcraft Tavern: Legacy', 'https://www.warcrafttavern.com/forever/guides/legacy/'],
    ['Mobalytics: Bountiful Harvest', 'https://mobalytics.gg/wow-forever/guides/legacy-system-guide'], ['Gamerblurb: resetting Legacy', 'https://gamerblurb.com/guides/wow-forever-how-to-reset-legacy-points'],
    ['Warcraft Tavern: 8 Oct beta notes', 'https://www.warcrafttavern.com/forever/news/city-of-dalaran-dungeon-legacy-points-now-live-in-the-wow-forever-beta/']];

  /* Map: a plain link card in index.html. Wowhead won't let other sites show its map in a frame (tried 15 Nov 2026),
     so there is no code for it here, only its search entry below. */

  /* ---------- Wiring ---------- */
  var PANELS = ['#panel-kit', '#panel-camp', '#panel-bp', '#panel-legacy'];
  PANELS.forEach(function (p) {
    var el = $(p);
    if (el) el.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-item]') : null;
      if (b && el.contains(b)) M.choose(+b.getAttribute('data-item'), true);
    });
  });
  function setSrc(id, list) { var e = document.getElementById(id); if (e) e.innerHTML = src(list); }
  setSrc('kit-src', KIT_SRC); setSrc('camp-src', CAMP_SRC); setSrc('bp-src', BP_SRC); setSrc('lg-src', LG_SRC);
  function renderAll() { renderKit(); renderCamp(); renderBp(); renderLegacyStatus(); renderLegacy(); }
  renderAll();
  document.addEventListener('wowf:prices', renderAll);
  document.addEventListener('wowf:char-changed', renderAll);
  document.addEventListener('wowf:sync', function () { setTimeout(renderAll, 0); });
  document.addEventListener('wowf:tab', function (e) { if (e && e.detail && e.detail.token === 'camp') renderTimer(); });
  ctTick = setInterval(function () { var p = $('#panel-camp'); if (p && !p.hidden) renderTimer(); }, 20000);
  window.WOWF_SEARCH = window.WOWF_SEARCH || [];
  window.WOWF_SEARCH.push(function () {
    var go = function (tok, sel) { return function () { if (window.wowfGo) window.wowfGo(tok, document.querySelector(sel)); }; };
    var out = [
      { t: 'Consumables for your level', k: 'Consumables', s: 'elixirs, potions, food and camp buffs', go: go('consumables', '#kit-h') },
      { t: 'Greenhouse', k: 'Camp', s: 'planting seeds against selling them', go: go('camp', '#gh-block h3') },
      { t: 'Camp timer', k: 'Camp', s: 'when your herb and next camp item are ready', go: go('camp', '#ct-go') },
      { t: 'Blueprints', k: 'Blueprints', s: 'where each camp blueprint drops', go: go('blueprints', '#bp-mine') },
      { t: 'Crafting for tips', k: 'Blueprints', s: 'a fair tip and a trade chat line', go: go('blueprints', '#tip-rx') },
      { t: 'Legacy perks', k: 'Legacy', s: 'levelling and gathering loadouts', go: go('legacy', '#lg-trees') },
      { t: 'Bountiful Harvest', k: 'Legacy', s: 'is swapping it in worth it?', go: go('legacy', '#bh-n') },
      { t: 'World map', k: 'Map', s: 'flight paths, boats, zeppelins, dungeons and raids', go: go('map', '#map-open') }
    ];
    LEG.forEach(function (p) { out.push({ t: p[2], k: 'Legacy perk', s: p[5], go: go('legacy', '#lg-trees') }); });
    CAMP.forEach(function (c) { out.push({ t: c[2], k: 'Camp item', s: c[0] + ' ' + c[3], go: go(c[1] >= 2 ? 'blueprints' : 'camp', c[1] >= 2 ? '#bp-mine' : '#camp-items') }); });
    return out;
  });
})();
