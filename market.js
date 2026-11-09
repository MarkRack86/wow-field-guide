/* WoW Forever Field Guide: data-driven tabs. Market prices and watchlist, your synced character on the Build tab,
   the Skill-up and Herb zones tabs, all fed by the artifact's database (daily Auction House prices and your character). */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function plural(n, one, many) { return n.toLocaleString('en-GB') + ' ' + (n === 1 ? one : (many || one + 's')); }
  var store = {
    get: function (k, d) { try { var v = window.localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { window.localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  var reduceMotion = false;
  try { reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  var mPanel = $('#panel-market'), sPanel = $('#panel-skillup'), hPanel = $('#panel-herbs'), charBox = $('#bd-char');
  if (!mPanel) return;

    /* Generated from Blizzard's Forever game data (static-1.60.1 build), Questie's Forever object data and the guides credited on the page. */
    var NAMES = {"2447":"Peacebloom","765":"Silverleaf","2449":"Earthroot","785":"Mageroyal","2450":"Briarthorn","2452":"Swiftthistle","3820":"Stranglekelp","2453":"Bruiseweed","3355":"Wild Steelbloom","3369":"Grave Moss","3356":"Kingsblood","3357":"Liferoot","3818":"Fadeleaf","3821":"Goldthorn","3358":"Khadgar's Whisker","3819":"Wintersbite","4625":"Firebloom","8831":"Purple Lotus","8836":"Arthas' Tears","8838":"Sungrass","8839":"Blindweed","8845":"Ghost Mushroom","8846":"Gromsblood","13464":"Golden Sansam","13463":"Dreamfoil","13465":"Mountain Silversage","13466":"Plaguebloom","13467":"Icecap","13468":"Black Lotus","8153":"Wildvine","3371":"Empty Vial","3372":"Leaded Vial","8925":"Crystal Vial","18256":"Imbued Vial","2678":"Mild Spices","2692":"Hot Spices","3713":"Soothing Spices","2320":"Coarse Thread","2321":"Fine Thread","4291":"Silken Thread","4289":"Salt","2880":"Weak Flux","3466":"Strong Flux","730":"Murloc Eye","6359":"Firefin Snapper","6358":"Oily Blackmouth","6370":"Blackmouth Oil","6371":"Fire Oil","13422":"Stonescale Eel","13423":"Stonescale Oil","6522":"Deviate Fish","247754":"Minor Arcane Elixir","247755":"Elixir of Minor Force","5997":"Elixir of Minor Defense","2455":"Minor Mana Potion","2458":"Elixir of Minor Fortitude","3383":"Elixir of Wisdom","3385":"Lesser Mana Potion","6373":"Elixir of Fire Power","3827":"Mana Potion","3825":"Elixir of Lesser Fortitude","8951":"Elixir of Defense","6052":"Nature Protection Potion","6149":"Greater Mana Potion","9154":"Draught of Detect Undead","13443":"Superior Mana Potion","13445":"Elixir of Greater Defense","9264":"Elixir of Shadow Power","250943":"Major Frenzy Potion","2457":"Elixir of Minor Agility","2459":"Swiftness Potion","3390":"Elixir of Lesser Agility","13444":"Major Mana Potion","2454":"Elixir of Minor Strength","3382":"Minor Troll's Blood Elixir","4596":"Minor Discolored Healing Potion","247239":"Lesser Discolored Healing Potion","2456":"Minor Rejuvenation Potion","1251":"Linen Bandage","2581":"Heavy Linen Bandage","3530":"Wool Bandage","3531":"Heavy Wool Bandage","6450":"Silk Bandage","6451":"Heavy Silk Bandage","8544":"Mageweave Bandage","8545":"Heavy Mageweave Bandage","14529":"Runecloth Bandage","14530":"Heavy Runecloth Bandage","118":"Minor Healing Potion","858":"Lesser Healing Potion","929":"Healing Potion","1710":"Greater Healing Potion","3928":"Superior Healing Potion","13446":"Major Healing Potion","2589":"Linen Cloth","2592":"Wool Cloth","4306":"Silk Cloth","4338":"Mageweave Cloth","14047":"Runecloth","2934":"Ruined Leather Scraps","2318":"Light Leather","783":"Light Hide","2319":"Medium Leather","4232":"Medium Hide","4234":"Heavy Leather","4231":"Cured Light Hide","4233":"Cured Medium Hide","4236":"Cured Heavy Hide","2304":"Light Armor Kit","2313":"Medium Armor Kit","2996":"Bolt of Linen Cloth","2997":"Bolt of Woolen Cloth","4305":"Bolt of Silk Cloth","4339":"Bolt of Mageweave","4238":"Linen Bag","2770":"Copper Ore","2771":"Tin Ore","2775":"Silver Ore","2772":"Iron Ore","2776":"Gold Ore","3858":"Mithril Ore","2835":"Rough Stone","2836":"Coarse Stone","2840":"Copper Bar","3576":"Tin Bar","2841":"Bronze Bar","2842":"Silver Bar","3575":"Iron Bar","3577":"Gold Bar","3859":"Steel Bar","3860":"Mithril Bar","2862":"Rough Sharpening Stone","4357":"Rough Blasting Powder","4359":"Handful of Copper Bolts","4361":"Copper Tube","4363":"Copper Modulator","4364":"Coarse Blasting Powder","4371":"Bronze Tube","4375":"Whirring Bronze Gizmo","4382":"Bronze Framework","10558":"Gold Power Core","4387":"Iron Strut","10559":"Mithril Tube","10560":"Unstable Trigger","10561":"Mithril Casing","10940":"Strange Dust","11083":"Soul Dust","11137":"Vision Dust","10938":"Lesser Magic Essence","10939":"Greater Magic Essence","10998":"Lesser Astral Essence","11082":"Greater Astral Essence","11135":"Greater Mystic Essence","10978":"Small Glimmering Shard","11084":"Large Glimmering Shard","11138":"Small Glowing Shard","11139":"Large Glowing Shard","11177":"Small Radiant Shard","11178":"Large Radiant Shard","248682":"Waylaid Crate: Apprentice Herbs","248683":"Waylaid Crate: Apprentice Ore","248684":"Waylaid Crate: Apprentice Textiles","248685":"Waylaid Crate: Apprentice Curiosities","248702":"Waylaid Crate: Apprentice Fabrics","248703":"Waylaid Crate: Apprentice Ingots","248704":"Waylaid Crate: Apprentice Parts","248686":"Waylaid Crate: Journeyman Herbs","248687":"Waylaid Crate: Journeyman Ore","248688":"Waylaid Crate: Journeyman Textiles","248689":"Waylaid Crate: Journeyman Curiosities","248705":"Waylaid Crate: Journeyman Fabrics","248706":"Waylaid Crate: Journeyman Ingots","248707":"Waylaid Crate: Journeyman Parts","248690":"Waylaid Crate: Earthly Expert Herbs","248691":"Waylaid Crate: Flowering Expert Herbs","248692":"Waylaid Crate: Expert Ore","248693":"Waylaid Crate: Expert Textiles","248694":"Waylaid Crate: Expert Curiosities","248708":"Waylaid Crate: Expert Fabrics","248709":"Waylaid Crate: Expert Ingots","248710":"Waylaid Crate: Expert Parts","769":"Chunk of Boar Meat","818":"Tigerseye","1206":"Moss Agate","1210":"Shadowgem","2325":"Black Dye","2604":"Red Dye","2605":"Green Dye","2673":"Coyote Meat","2838":"Heavy Stone","3470":"Rough Grinding Stone","3478":"Coarse Grinding Stone","3486":"Heavy Grinding Stone","4246":"Fine Leather Belt","4304":"Thick Leather","4340":"Gray Dye","4377":"Heavy Blasting Powder","4470":"Simple Wood","4603":"Raw Spotted Yellowtail","5051":"Dig Rat","5500":"Iridescent Pearl","5504":"Tangy Clam Meat","6037":"Truesilver Bar","6217":"Copper Rod","6261":"Orange Dye","6338":"Silver Rod","6362":"Raw Rockscale Cod","7067":"Elemental Earth","7071":"Iron Buckle","7075":"Core of Earth","7076":"Essence of Earth","7910":"Star Ruby","7912":"Solid Stone","7966":"Solid Grinding Stone","7971":"Black Pearl","7972":"Ichor of Undeath","8170":"Rugged Leather","8343":"Heavy Silken Thread","8365":"Raw Mithril Head Trout","10505":"Solid Blasting Powder","11128":"Golden Rod","11144":"Truesilver Rod","11176":"Dream Dust","12359":"Thorium Bar","12365":"Dense Stone","12644":"Dense Grinding Stone","13760":"Raw Sunscale Salmon","13926":"Golden Pearl","14048":"Bolt of Runecloth","14256":"Felcloth","14341":"Rune Thread","14342":"Mooncloth","14343":"Small Brilliant Shard","14344":"Large Brilliant Shard","16203":"Greater Eternal Essence","16204":"Illusion Dust","16206":"Arcanite Rod","18240":"Ogre Tannin","18255":"Runn Tum Tuber","247786":"Mote of Magic","249726":"Azerothium Bar","251291":"Heavy Thorium Bar","2681":"Roasted Boar Meat","2684":"Coyote Steak","5478":"Dig Rat Stew","5527":"Goblin Deviled Clams","4594":"Rockscale Cod","274976":"Plain Ol' Paletusk","8364":"Mithril Head Trout","6887":"Spotted Yellowtail","13932":"Poached Sunscale Salmon","18254":"Runn Tum Tuber Surprise","3472":"Runed Copper Gauntlets","2857":"Runed Copper Belt","2865":"Rough Bronze Leggings","2868":"Patterned Bronze Bracers","7956":"Bronze Warhammer","3835":"Green Iron Bracers","6040":"Golden Scale Bracers","7919":"Heavy Mithril Gauntlet","7918":"Heavy Mithril Shoulder","7922":"Steel Plate Helm","7969":"Mithril Spurs","7928":"Ornate Mithril Shoulders","7931":"Mithril Coif","250543":"Shining Mithril Helm","7959":"Blight","12425":"Imperial Plate Bracers","250613":"Thorium Greatmace","12775":"Huge Thorium Battleaxe","4239":"Embossed Leather Gloves","7282":"Light Leather Pants","4249":"Dark Leather Belt","4247":"Hillman's Leather Gloves","5963":"Barbaric Leggings","5739":"Barbaric Harness","5966":"Guardian Gloves","8176":"Nightscape Headband","8193":"Nightscape Pants","15564":"Rugged Armor Kit","15083":"Wicked Leather Gauntlets","8197":"Nightscape Boots","252553":"Tooled Leather Gauntlets","2568":"Brown Linen Vest","7026":"Linen Belt","2584":"Woolen Cape","4314":"Double-Stitched Woolen Shoulders","4318":"Gloves of Meditation","6796":"Red Swashbuckler's Shirt","7051":"Earthen Vest","7058":"Crimson Silk Vest","10056":"Orange Mageweave Shirt","9998":"Black Mageweave Vest","18258":"Gordok Ogre Suit","15802":"Mooncloth Boots","6219":"Arclight Spanner","4360":"Rough Copper Bomb","4365":"Coarse Dynamite","4404":"Silver Contact","4368":"Flying Tiger Goggles","4406":"Standard Scope","4384":"Explosive Sheep","10498":"Gyromatic Micro-Adjustor","10562":"Hi-Explosive Bomb","15992":"Dense Blasting Powder","15994":"Thorium Widget","16000":"Thorium Tube","6218":"Runed Copper Rod","11288":"Greater Magic Wand","6339":"Runed Silver Rod","11130":"Runed Golden Rod","11145":"Runed Truesilver Rod","20747":"Lesser Mana Oil","16207":"Runed Arcanite Rod","249399":"Frilled Lichen","249424":"Rosecap","249274":"Stranglevine","248821":"Demonsage","248822":"Death Lotus","248823":"Marefoil","268415":"Commonplace Herb Seeds","268416":"Uncommon Herb Seeds","268417":"Unusual Herb Seeds","268418":"Scarce Herb Seeds","1288":"Large Venom Sac","2553":"Recipe: Elixir of Minor Agility","2555":"Recipe: Swiftness Potion","3384":"Minor Magic Resistance Potion","3386":"Potion of Poison Cleansing","3387":"Limited Invulnerability Potion","3388":"Lesser Troll's Blood Elixir","3389":"Elixir of Lesser Defense","3391":"Elixir of Ogre Strength","3393":"Recipe: Minor Magic Resistance Potion","3394":"Recipe: Potion of Poison Cleansing","3395":"Recipe: Limited Invulnerability Potion","3396":"Recipe: Elixir of Lesser Agility","3823":"Lesser Invisibility Potion","3824":"Shadow Oil","3826":"Troll's Blood Elixir","3828":"Draught of Detect Lesser Invisibility","3829":"Frost Oil","3830":"Recipe: Elixir of Lesser Fortitude","3831":"Recipe: Troll's Blood Elixir","3832":"Recipe: Elixir of Detect Lesser Invisibility","4342":"Purple Dye","4597":"Recipe: Minor Discolored Healing Potion","4623":"Lesser Stoneshield Potion","4624":"Recipe: Lesser Stoneshield Potion","5631":"Rage Potion","5633":"Great Rage Potion","5634":"Free Action Potion","5635":"Sharp Claw","5637":"Large Fang","5640":"Recipe: Rage Potion","5642":"Recipe: Free Action Potion","5643":"Recipe: Great Rage Potion","5996":"Draught of Water Breathing","6048":"Shadow Protection Potion","6050":"Frost Protection Potion","6051":"Holy Protection Potion","6053":"Recipe: Holy Protection Potion","6054":"Recipe: Shadow Protection Potion","6056":"Recipe: Frost Protection Potion","6057":"Recipe: Nature Protection Potion","6068":"Recipe: Shadow Oil","6211":"Recipe: Elixir of Ogre's Strength","6372":"Swim Speed Potion","6662":"Elixir of Giant Growth","6663":"Recipe: Elixir of Giant Growth","7068":"Elemental Fire","7069":"Elemental Air","7070":"Elemental Water","7078":"Essence of Fire","7080":"Essence of Water","7082":"Essence of Air","8827":"Draught of Water Walking","8949":"Elixir of Agility","8956":"Oil of Immolation","9030":"Restorative Potion","9036":"Magic Resistance Potion","9088":"Gift of Arthas","9144":"Wildvine Potion","9149":"Philosopher's Stone","9155":"Arcane Elixir","9172":"Invisibility Potion","9179":"Elixir of Greater Intellect","9187":"Elixir of Greater Agility","9197":"Draught of Dream Vision","9206":"Elixir of Greater Strength","9210":"Ghost Dye","9224":"Potion of Demon Slaying","9233":"Draught of Detect Demon","9262":"Black Vitriol","9293":"Recipe: Magic Resistance Potion","9294":"Recipe: Wildvine Potion","9295":"Recipe: Invisibility Potion","9296":"Recipe: Gift of Arthas","9297":"Recipe: Draught of Dream Vision","9298":"Recipe: Elixir of Giants","9300":"Recipe: Potion of Demon Slaying","9301":"Recipe: Elixir of Shadow Power","9302":"Recipe: Ghost Dye","9303":"Recipe: Philosopher's Stone","10286":"Heart of the Wild","10592":"Catseye Draught","12190":"Dreamless Sleep Potion","12803":"Living Essence","12804":"Powerful Mojo","12938":"Blood of Heroes","13442":"Mighty Rage Potion","13447":"Elixir of the Sages","13452":"Elixir of the Mongoose","13453":"Elixir of Brute Force","13454":"Greater Arcane Elixir","13456":"Greater Frost Protection Potion","13457":"Greater Fire Protection Potion","13458":"Greater Nature Protection Potion","13459":"Greater Shadow Protection Potion","13460":"Greater Holy Protection Potion","13461":"Greater Arcane Protection Potion","13462":"Purification Potion","13476":"Recipe: Mighty Rage Potion","13477":"Recipe: Superior Mana Potion","13478":"Recipe: Elixir of Superior Defense","13479":"Recipe: Elixir of the Sages","13481":"Recipe: Elixir of Brute Force","13491":"Recipe: Elixir of the Mongoose","13492":"Recipe: Purification Potion","13493":"Recipe: Greater Arcane Elixir","13494":"Recipe: Greater Fire Protection Potion","13495":"Recipe: Greater Frost Protection Potion","13496":"Recipe: Greater Nature Protection Potion","13497":"Recipe: Greater Arcane Protection Potion","13499":"Recipe: Greater Shadow Protection Potion","13500":"Recipe: Greater Holy Protection Potion","13501":"Recipe: Major Mana Potion","13503":"Alchemist's Stone","13506":"Flask of Petrification","13510":"Flask of the Titans","13511":"Flask of Distilled Wisdom","13512":"Flask of Supreme Power","13513":"Flask of Chromatic Resistance","13517":"Recipe: Alchemist's Stone","13518":"Recipe: Flask of Petrification","13519":"Recipe: Flask of the Titans","13520":"Recipe: Flask of Distilled Wisdom","13521":"Recipe: Flask of Supreme Power","13522":"Recipe: Flask of Chromatic Resistance","14634":"Recipe: Frost Oil","17708":"Elixir of Frost Power","17709":"Recipe: Elixir of Frost Power","18253":"Major Rejuvenation Potion","18257":"Recipe: Major Rejuvenation Potion","18294":"Draught of Greater Water Breathing","19931":"Gurubashi Mojo Madness","19943":"Massive Mojo","20002":"Greater Dreamless Sleep Potion","20004":"Major Troll's Blood Elixir","20007":"Mageblood Elixir","20008":"Living Action Potion","20011":"Recipe: Mageblood Elixir","20012":"Recipe: Greater Dreamless Sleep","20013":"Recipe: Living Action Potion","20014":"Recipe: Major Troll's Blood Elixir","21546":"Elixir of Holy Power","21547":"Recipe: Elixir of Greater Firepower","236754":"Recipe: Distilled Firewater","246948":"Distilled Firewater","247240":"Discolored Healing Potion","247241":"Greater Discolored Healing Potion","247242":"Superior Discolored Healing Potion","249409":"Cerulean Dye","249430":"Magenta Dye","249431":"Viridian Dye","250327":"Potion of Predatory Senses","250328":"Elixir of Cunning","250329":"Elixir of the Phalanx","250330":"Minor Cleric's Elixir","250331":"Lesser Cleric's Elixir","250332":"Cleric's Elixir","250333":"Greater Cleric's Elixir","250334":"Elixir of Fortitude","250335":"Elixir of Greater Fortitude","250336":"Elixir of Wicked Regeneration","250337":"Elixir of the Owl","250338":"Elixir of Sages","250339":"Minor Mageblood Elixir","250340":"Lesser Mageblood Elixir","250341":"Greater Mageblood Elixir","250342":"Lesser Arcane Elixir","250343":"Elixir of Nature Power","250344":"Elixir of Minor Spirit","250345":"Elixir of Lesser Spirit","250346":"Elixir of Spirit","250347":"Elixir of Greater Spirit","250348":"Elixir of the Whale","250349":"Elixir of Strength","250350":"Elixir of Ferocity","250351":"Elixir of the Grizzly","250353":"Elixir of Lesser Intellect","250354":"Elixir of Intellect","250363":"Recipe: Potion of Predatory Senses","250364":"Recipe: Elixir of Cunning","250365":"Recipe: Elixir of the Phalanx","250366":"Recipe: Minor Cleric's Elixir","250367":"Recipe: Lesser Cleric's Elixir","250368":"Recipe: Cleric's Elixir","250369":"Recipe: Greater Cleric's Elixir","250370":"Recipe: Elixir of Fortitude","250371":"Recipe: Elixir of Greater Fortitude","250372":"Recipe: Elixir of Wicked Regeneration","250373":"Recipe: Elixir of the Owl","250374":"Recipe: Elixir of Sages","250375":"Recipe: Minor Mageblood Elixir","250376":"Recipe: Lesser Mageblood Elixir","250377":"Recipe: Greater Mageblood Elixir","250378":"Recipe: Lesser Arcane Elixir","250379":"Recipe: Elixir of Nature Power","250380":"Recipe: Elixir of Minor Spirit","250381":"Recipe: Elixir of Lesser Spirit","250382":"Recipe: Elixir of Spirit","250383":"Recipe: Elixir of Greater Spirit","250384":"Recipe: Elixir of the Whale","250385":"Recipe: Elixir of Strength","250386":"Recipe: Elixir of Ferocity","250387":"Recipe: Elixir of the Grizzly","250388":"Recipe: Elixir of Lesser Intellect","250389":"Recipe: Elixir of Intellect","250932":"Minor Spellblasting Potion","250933":"Lesser Spellblasting Potion","250934":"Spellblasting Potion","250935":"Greater Spellblasting Potion","250936":"Superior Spellblasting Potion","250937":"Major Spellblasting Potion","250938":"Minor Frenzy Potion","250939":"Lesser Frenzy Potion","250940":"Frenzy Potion","250941":"Greater Frenzy Potion","250942":"Superior Frenzy Potion","250944":"Minor Mender's Potion","250945":"Lesser Mender's Potion","250946":"Mender's Potion","250947":"Greater Mender's Potion","250948":"Superior Mender's Potion","250949":"Major Mender's Potion","250950":"Potion of Venomous Blood","250951":"Caustic Smog Potion","250953":"Dragonfire Potion","250954":"Potion of Elemental Purging","250955":"Potion of Beast Slaying","250976":"Recipe: Minor Spellblasting Potion","250977":"Recipe: Lesser Spellblasting Potion","250978":"Recipe: Spellblasting Potion","250979":"Recipe: Greater Spellblasting Potion","250980":"Recipe: Superior Spellblasting Potion","250981":"Recipe: Major Spellblasting Potion","250982":"Recipe: Minor Frenzy Potion","250983":"Recipe: Lesser Frenzy Potion","250984":"Recipe: Frenzy Potion","250985":"Recipe: Greater Frenzy Potion","250986":"Recipe: Superior Frenzy Potion","250987":"Recipe: Major Frenzy Potion","250988":"Recipe: Minor Mender's Potion","250989":"Recipe: Lesser Mender's Potion","250990":"Recipe: Mender's Potion","250991":"Recipe: Greater Mender's Potion","250992":"Recipe: Superior Mender's Potion","250993":"Recipe: Major Mender's Potion","250994":"Recipe: Potion of Venomous Blood","250995":"Recipe: Caustic Smog Potion","250997":"Recipe: Dragonfire Potion","250998":"Recipe: Potion of Elemental Purging","250999":"Recipe: Potion of Beast Slaying","255723":"Manual: Greater Healing Potion","255725":"Manual: Superior Healing Potion","255729":"Manual: Major Healing Potion","273085":"Blueprint: Fermenter","274273":"Flask of Natural Accuracy","274274":"Flask of Natural Aggression","274275":"Flask of Natural Precision","274276":"Flask of Natural Swiftness","274277":"Recipe: Flask of Natural Accuracy","274278":"Recipe: Flask of Natural Aggression","274279":"Recipe: Flask of Natural Precision","274280":"Recipe: Flask of Natural Swiftness","279956":"Mana Well","279970":"Fermenter","9061":"Goblin Rocket Fuel","9260":"Volatile Rum","10644":"Recipe: Goblin Rocket Fuel"};
    var SELL = {"2447":10,"765":10,"2449":20,"785":20,"2450":25,"2452":15,"3820":100,"2453":25,"3355":50,"3369":25,"3356":30,"3357":75,"3818":125,"3821":150,"3358":175,"3819":100,"4625":250,"8831":300,"8836":95,"8838":60,"8839":375,"8845":375,"8846":250,"13464":100,"13463":100,"13465":150,"13466":250,"13467":250,"13468":1000,"8153":5,"3371":1,"3372":10,"8925":125,"18256":1500,"2678":1,"2692":10,"3713":40,"2320":2,"2321":25,"4291":125,"4289":12,"2880":25,"3466":500,"730":16,"6359":5,"6358":4,"6370":10,"6371":12,"13422":10,"13423":125,"6522":4,"247754":25,"247755":25,"5997":5,"2455":10,"2458":15,"3383":100,"3385":30,"6373":35,"3827":120,"3825":110,"8951":200,"6052":300,"6149":120,"9154":300,"13443":400,"13445":500,"9264":35,"250943":1,"2457":15,"2459":25,"3390":35,"13444":1500,"2454":20,"3382":10,"4596":25,"247239":25,"2456":15,"1251":10,"2581":20,"3530":28,"3531":57,"6450":200,"6451":400,"8544":400,"8545":600,"14529":500,"14530":1000,"118":5,"858":25,"929":75,"1710":125,"3928":250,"13446":1000,"2589":13,"2592":33,"4306":150,"4338":250,"14047":400,"2934":7,"2318":15,"783":50,"2319":50,"4232":125,"4234":150,"4231":110,"4233":200,"4236":225,"2304":15,"2313":200,"2996":40,"2997":100,"4305":600,"4339":1250,"4238":200,"2770":5,"2771":25,"2775":75,"2772":150,"2776":500,"3858":250,"2835":2,"2836":15,"2840":10,"3576":35,"2841":50,"2842":100,"3575":200,"3577":600,"3859":60,"3860":400,"2862":3,"4357":4,"4359":12,"4361":120,"4363":50,"4364":12,"4371":200,"4375":115,"4382":600,"10558":250,"4387":400,"10559":750,"10560":1000,"10561":1000,"10940":1,"11083":1,"11137":1,"10938":1,"10939":1,"10998":1,"11082":1,"11135":1,"10978":1,"11084":1,"11138":1,"11139":1,"11177":1,"11178":1,"769":3,"818":100,"1206":400,"1210":250,"2325":250,"2604":12,"2605":25,"2673":10,"2838":60,"3470":5,"3478":10,"3486":100,"4246":125,"4304":300,"4340":87,"4377":150,"4470":9,"4603":4,"5051":1,"5500":750,"5504":22,"6037":1250,"6217":24,"6261":250,"6338":125,"6362":4,"7067":400,"7071":100,"7075":400,"7076":400,"7910":5000,"7912":100,"7966":200,"7971":1000,"7972":400,"8170":500,"8343":500,"8365":4,"10505":250,"11128":500,"11144":1000,"11176":1,"12359":600,"12365":250,"12644":200,"13760":10,"13926":10000,"14048":2000,"14256":2000,"14341":1250,"14342":4000,"14343":1,"14344":1,"16203":1,"16204":1,"16206":1000,"18255":15,"247786":1,"249726":3000,"251291":1500,"2681":6,"2684":20,"5478":70,"5527":95,"4594":6,"274976":75,"8364":6,"6887":5,"13932":12,"18254":18,"3472":71,"2857":198,"2865":577,"2868":507,"7956":1544,"3835":1106,"6040":1315,"7919":2476,"7918":3701,"7922":1944,"7969":250,"7928":4857,"7931":7955,"250543":10255,"7959":33857,"12425":6044,"250613":48384,"12775":39949,"4239":71,"7282":599,"4249":703,"4247":1049,"5963":3151,"5739":2738,"5966":1374,"8176":2922,"8193":8708,"15564":1000,"15083":6872,"8197":7158,"2568":31,"7026":22,"2584":142,"4314":331,"4318":610,"6796":750,"7051":2696,"7058":2052,"10056":1500,"9998":4815,"15802":11648,"6219":144,"4360":60,"4365":75,"4404":25,"4368":408,"4406":600,"4384":1000,"10498":16,"10562":750,"15992":250,"15994":2500,"16000":3750,"6218":24,"11288":200,"6339":24,"11130":500,"11145":1250,"20747":1000,"16207":1250,"249399":30,"249424":95,"249274":250,"248821":225,"248822":1500,"248823":150,"268415":10,"268416":25,"268417":90,"268418":115,"1288":185,"2553":25,"2555":40,"3384":20,"3386":35,"3387":30,"3388":40,"3389":40,"3391":20,"3393":250,"3394":250,"3395":250,"3396":250,"3823":100,"3824":150,"3826":105,"3828":150,"3829":150,"3830":500,"3831":550,"3832":550,"4342":625,"4597":250,"4623":375,"4624":550,"5631":30,"5633":150,"5634":75,"5635":45,"5637":75,"5640":25,"5642":450,"5643":500,"5996":95,"6048":100,"6050":300,"6051":62,"6053":200,"6054":225,"6056":500,"6057":500,"6068":375,"6211":450,"6372":35,"6662":95,"6663":150,"7068":400,"7069":400,"7070":400,"7078":400,"7080":400,"7082":400,"8827":125,"8949":200,"8956":200,"9030":200,"9036":20,"9088":250,"9144":250,"9149":250,"9155":400,"9172":500,"9179":1000,"9187":600,"9197":600,"9206":700,"9210":750,"9224":700,"9233":500,"9262":1000,"9293":1250,"9294":2000,"9295":2000,"9296":2000,"9297":2500,"9298":2250,"9300":2500,"9301":2500,"9302":2250,"9303":2000,"10286":400,"10592":150,"12190":250,"12803":500,"12804":2000,"13442":500,"13447":1250,"13452":1250,"13453":1250,"13454":750,"13456":750,"13457":750,"13458":750,"13459":100,"13460":750,"13461":750,"13462":750,"13476":3000,"13477":3000,"13478":3250,"13479":3500,"13481":3750,"13491":4000,"13492":5000,"13493":5000,"13494":6000,"13495":6000,"13496":6000,"13497":6000,"13499":6000,"13500":6000,"13501":7500,"13503":25000,"13506":5000,"13510":5000,"13511":5000,"13512":5000,"13513":5000,"13518":10000,"13519":10000,"13520":10000,"13521":10000,"13522":10000,"14634":625,"17708":35,"17709":500,"18253":15,"18257":50000,"18294":250,"19943":2000,"20002":1000,"20004":1000,"20007":1000,"20008":600,"20011":12500,"20012":12500,"20013":12500,"20014":12500,"21546":35,"21547":2500,"236754":2500,"246948":200,"247240":75,"247241":125,"247242":250,"249409":75,"249430":250,"249431":375,"250327":100,"250328":125,"250329":125,"250330":25,"250331":50,"250332":75,"250333":100,"250334":75,"250335":100,"250336":125,"250337":125,"250338":125,"250339":25,"250340":50,"250341":100,"250342":50,"250343":125,"250344":25,"250345":50,"250346":75,"250347":100,"250348":125,"250349":75,"250350":125,"250351":125,"250353":50,"250354":75,"250364":1375,"250365":1250,"250367":475,"250369":975,"250371":1000,"250372":1425,"250373":1400,"250374":1375,"250376":375,"250377":875,"250378":600,"250379":1425,"250381":325,"250383":825,"250384":1375,"250386":1375,"250387":1500,"250388":475,"250932":1,"250933":25,"250934":25,"250935":1,"250936":1,"250937":1,"250938":1,"250939":1,"250940":1,"250941":1,"250942":1,"250944":1,"250945":1,"250946":1,"250947":1,"250948":1,"250949":1,"250950":1,"250951":1,"250953":1,"250954":1,"250955":1,"250976":100,"250978":675,"250981":1425,"250984":700,"250987":1450,"250990":650,"250991":2500,"250993":1400,"250994":1375,"250995":1325,"250997":1225,"250998":1400,"250999":2500,"255723":400,"255725":1375,"255729":20000,"273085":375,"274273":5000,"274274":5000,"274275":5000,"274276":5000};
    var VBUY = {"3371":4.0,"3372":40.0,"8925":500.0,"18256":6000.0,"2678":2.0,"2692":40.0,"3713":160.0,"2320":10.0,"2321":100.0,"4291":500.0,"8343":2000.0,"14341":5000.0,"4289":50.0,"2880":100.0,"3466":2000.0,"6217":124.0,"4470":38.0,"2604":50.0,"2605":100.0,"4340":350.0,"2325":1000.0,"6261":1000.0,"4342":2500};
    var CR = {"2454":{"r":[[2449,1],[765,1],[3371,1]],"y":1},"2458":{"r":[[2449,2],[2447,1],[3371,1]],"y":1},"3383":{"r":[[785,1],[2450,2],[3371,1]],"y":1},"3390":{"r":[[3355,1],[2452,1],[3372,1]],"y":1},"3382":{"r":[[2447,1],[2449,2],[3371,1]],"y":1},"2457":{"r":[[2452,1],[765,1],[3371,1]],"y":1},"3825":{"r":[[3355,1],[3821,1],[3372,1]],"y":1},"5997":{"r":[[765,1],[2447,1],[3371,1]],"y":1},"6373":{"r":[[6371,2],[3356,1],[3372,1]],"y":1},"8951":{"r":[[3355,1],[3821,1],[3372,1]],"y":1},"9264":{"r":[[8845,3],[8925,1]],"y":1},"13445":{"r":[[13423,2],[8838,1],[8925,1]],"y":1},"247754":{"r":[[2447,1],[3371,1]],"y":1},"247755":{"r":[[765,1],[3371,1]],"y":1},"2455":{"r":[[785,1],[2447,1],[3371,1]],"y":1},"2456":{"r":[[785,2],[2447,1],[3371,1]],"y":1},"3385":{"r":[[785,1],[3820,1],[3371,1]],"y":1},"3827":{"r":[[3820,1],[3356,1],[3372,1]],"y":1},"4596":{"r":[[3371,1],[2447,1],[730,1]],"y":1},"6149":{"r":[[3358,1],[3821,1],[3372,1]],"y":1},"13443":{"r":[[8838,2],[8839,2],[8925,1]],"y":1},"13444":{"r":[[13463,3],[13467,2],[8925,1]],"y":1},"247239":{"r":[[3371,1],[2450,1],[730,1]],"y":1},"2459":{"r":[[2452,1],[2450,1],[3371,1]],"y":1},"6052":{"r":[[3357,1],[3820,1],[3372,1]],"y":1},"250943":{"r":[[13466,3],[8839,2],[18256,1]],"y":1},"9154":{"r":[[8836,1],[8925,1]],"y":1},"6370":{"r":[[6358,2],[3371,1]],"y":1},"6371":{"r":[[6359,2],[3371,1]],"y":2},"13423":{"r":[[13422,1],[3372,1]],"y":2},"3577":{"r":[[3575,1]],"y":1},"6037":{"r":[[3860,1]],"y":1},"1251":{"r":[[2589,1]],"y":1},"2581":{"r":[[2589,2]],"y":1},"3530":{"r":[[2592,1]],"y":1},"3531":{"r":[[2592,2]],"y":1},"6450":{"r":[[4306,1]],"y":1},"6451":{"r":[[4306,2]],"y":1},"8544":{"r":[[4338,1]],"y":1},"8545":{"r":[[4338,2]],"y":1},"14529":{"r":[[14047,1]],"y":1},"14530":{"r":[[14047,2]],"y":1},"118":{"r":[[3371,1],[2678,1],[2447,1]],"y":1},"858":{"r":[[3371,1],[2678,2],[2450,1]],"y":1},"929":{"r":[[3372,1],[2692,1],[2453,1]],"y":1},"1710":{"r":[[3372,1],[2692,3],[3357,1]],"y":1},"3928":{"r":[[8925,1],[3713,1],[8838,1]],"y":1},"13446":{"r":[[8925,1],[3713,3],[13464,1]],"y":1},"3386":{"r":[[1288,1],[2453,1],[3372,1]],"y":1},"3388":{"r":[[2453,2],[2450,2],[3372,1]],"y":1},"3389":{"r":[[3355,1],[3820,1],[3372,1]],"y":1},"3391":{"r":[[2449,1],[3356,1],[3372,1]],"y":1},"3826":{"r":[[3357,1],[2453,1],[3372,1]],"y":1},"6662":{"r":[[6522,1],[2449,1],[3371,1]],"y":1},"8949":{"r":[[3820,1],[3821,1],[3372,1]],"y":1},"9155":{"r":[[8839,1],[3821,1],[8925,1]],"y":1},"9179":{"r":[[8839,1],[3358,1],[8925,1]],"y":1},"9088":{"r":[[8836,1],[8839,1],[8925,1]],"y":1},"9187":{"r":[[8838,1],[3821,1],[8925,1]],"y":1},"9206":{"r":[[8838,1],[8846,1],[8925,1]],"y":1},"9224":{"r":[[8846,1],[8845,1],[8925,1]],"y":1},"13447":{"r":[[13463,1],[13466,2],[8925,1]],"y":1},"13453":{"r":[[8846,2],[13466,2],[8925,1]],"y":1},"13452":{"r":[[13465,2],[13466,2],[8925,1]],"y":1},"13454":{"r":[[13463,3],[13465,1],[8925,1]],"y":1},"17708":{"r":[[3819,2],[3358,1],[3372,1]],"y":1},"20007":{"r":[[13463,1],[13466,2],[8925,1]],"y":1},"20004":{"r":[[8846,1],[13466,2],[8925,1]],"y":1},"21546":{"r":[[6371,3],[4625,3],[8925,1]],"y":1},"246948":{"r":[[3819,4],[8846,2],[3372,1]],"y":1},"250328":{"r":[[13463,3],[8846,2],[8925,1]],"y":1},"250329":{"r":[[13464,2],[8838,4],[8925,1]],"y":1},"250330":{"r":[[785,2],[2453,1],[3371,1]],"y":1},"250331":{"r":[[3356,2],[3357,2],[3372,1]],"y":1},"250332":{"r":[[3819,2],[4625,2],[3372,1]],"y":1},"250333":{"r":[[8836,3],[8831,1],[8925,1]],"y":1},"250334":{"r":[[3821,4],[3372,1]],"y":1},"250335":{"r":[[8838,4],[8925,1]],"y":1},"250336":{"r":[[13464,3],[13463,2],[8925,1]],"y":1},"250337":{"r":[[13463,4],[13465,2],[18256,1]],"y":1},"250338":{"r":[[13463,4],[13464,2],[18256,1]],"y":1},"250339":{"r":[[785,2],[3371,1]],"y":1},"250340":{"r":[[3356,3],[3371,1]],"y":1},"250341":{"r":[[8839,3],[8836,2],[8925,1]],"y":1},"250342":{"r":[[3356,4],[3372,1]],"y":1},"250343":{"r":[[13464,4],[8838,2],[8925,1]],"y":1},"250344":{"r":[[2449,2],[2447,1],[3371,1]],"y":1},"250345":{"r":[[3355,2],[785,1],[3371,1]],"y":1},"250346":{"r":[[3358,3],[3356,1],[3372,1]],"y":1},"250347":{"r":[[8836,3],[8831,2],[8925,1]],"y":1},"250348":{"r":[[13463,3],[8846,1],[8925,1]],"y":1},"250349":{"r":[[3355,3],[3821,1],[3372,1]],"y":1},"250350":{"r":[[8846,3],[8845,1],[8925,1]],"y":1},"250351":{"r":[[8846,3],[8839,1],[8925,1]],"y":1},"250353":{"r":[[3356,3],[3372,1]],"y":1},"250354":{"r":[[3358,3],[3372,1]],"y":1},"9144":{"r":[[8153,1],[8831,1],[8925,1]],"y":1},"12190":{"r":[[8831,3],[8925,1]],"y":1},"18253":{"r":[[10286,1],[13464,4],[13463,4],[18256,1]],"y":1},"20002":{"r":[[13463,2],[13464,1],[8925,1]],"y":1},"247240":{"r":[[3372,1],[2453,1],[730,1]],"y":1},"247241":{"r":[[3372,1],[3356,1],[730,1]],"y":1},"247242":{"r":[[8925,1],[8838,1],[730,1]],"y":1},"3384":{"r":[[785,3],[3355,1],[3371,1]],"y":1},"3823":{"r":[[3818,1],[3355,1],[3372,1]],"y":1},"4623":{"r":[[3858,1],[3821,1],[3372,1]],"y":1},"5634":{"r":[[6370,2],[3820,1],[3372,1]],"y":1},"5633":{"r":[[5637,1],[3356,1],[3372,1]],"y":1},"5631":{"r":[[5635,1],[2450,1],[3371,1]],"y":1},"6050":{"r":[[3819,1],[3821,1],[3372,1]],"y":1},"6051":{"r":[[2453,1],[2452,1],[3371,1]],"y":1},"6048":{"r":[[3369,1],[3356,1],[3372,1]],"y":1},"6372":{"r":[[2452,1],[6370,1],[3371,1]],"y":1},"8956":{"r":[[4625,1],[3821,1],[8925,1]],"y":1},"9030":{"r":[[7067,1],[3821,1],[8925,1]],"y":1},"9036":{"r":[[3358,1],[8831,1],[8925,1]],"y":1},"9172":{"r":[[8845,1],[8838,1],[8925,1]],"y":1},"13442":{"r":[[8846,3],[8925,1]],"y":1},"13462":{"r":[[13467,2],[13466,2],[8925,1]],"y":1},"13457":{"r":[[7068,1],[13463,1],[8925,1]],"y":1},"13456":{"r":[[7070,1],[13463,1],[8925,1]],"y":1},"13458":{"r":[[7067,1],[13463,1],[8925,1]],"y":1},"13461":{"r":[[11176,1],[13463,1],[8925,1]],"y":1},"13459":{"r":[[3824,1],[13463,1],[8925,1]],"y":1},"13460":{"r":[[7069,1],[13463,1],[8925,1]],"y":1},"3387":{"r":[[8839,2],[8845,1],[8925,1]],"y":1},"20008":{"r":[[13467,2],[13465,2],[10286,2],[8925,1]],"y":1},"250932":{"r":[[765,1],[2447,1],[3371,1]],"y":1},"250933":{"r":[[785,1],[765,2],[3371,1]],"y":1},"250934":{"r":[[3355,1],[3369,1],[3371,1]],"y":1},"250935":{"r":[[3356,2],[3818,1],[3372,1]],"y":1},"250936":{"r":[[3819,2],[3358,2],[3372,1]],"y":1},"250937":{"r":[[13463,2],[13465,1],[18256,1]],"y":1},"250938":{"r":[[2449,1],[765,1],[3371,1]],"y":1},"250939":{"r":[[2450,1],[2449,2],[3371,1]],"y":1},"250940":{"r":[[3818,2],[2450,2],[3372,1]],"y":1},"250941":{"r":[[4625,3],[3818,2],[3372,1]],"y":1},"250942":{"r":[[8839,3],[4625,2],[8925,1]],"y":1},"250944":{"r":[[785,2],[2453,1],[3371,1]],"y":1},"250945":{"r":[[3356,2],[3357,2],[3372,1]],"y":1},"250946":{"r":[[3819,2],[4625,2],[3372,1]],"y":1},"250947":{"r":[[8836,2],[8831,1],[8925,1]],"y":1},"250948":{"r":[[8838,2],[8836,1],[8925,1]],"y":1},"250949":{"r":[[13463,3],[8838,1],[18256,1]],"y":1},"250950":{"r":[[8846,3],[13466,2],[8925,1]],"y":1},"250951":{"r":[[8845,2],[3369,2],[8925,1]],"y":1},"250953":{"r":[[13465,2],[4625,2],[8925,1]],"y":1},"250954":{"r":[[4625,2],[3819,2],[8925,1]],"y":1},"250955":{"r":[[8846,2],[13466,2],[18256,1]],"y":1},"3828":{"r":[[3358,1],[3818,1],[3372,1]],"y":1},"5996":{"r":[[3820,1],[6370,2],[3371,1]],"y":1},"8827":{"r":[[6370,1],[3357,1],[3372,1]],"y":1},"9197":{"r":[[8831,3],[8925,1]],"y":1},"9233":{"r":[[8846,2],[8925,1]],"y":1},"10592":{"r":[[3821,1],[3818,1],[3372,1]],"y":1},"18294":{"r":[[7972,1],[8831,2],[8925,1]],"y":1},"250327":{"r":[[3818,2],[3821,2],[3372,1]],"y":1},"3824":{"r":[[3818,4],[3369,4],[3372,1]],"y":2},"3829":{"r":[[3358,4],[3819,2],[3372,1]],"y":2},"9210":{"r":[[8845,2],[4342,1],[8925,1]],"y":2},"249409":{"r":[[249399,2],[3371,1]],"y":1},"249430":{"r":[[249424,2],[3372,1]],"y":1},"249431":{"r":[[249274,2],[8925,1]],"y":1},"9149":{"r":[[3575,4],[9262,1],[8831,4],[4625,4]],"y":1},"13503":{"r":[[7078,8],[7076,8],[7082,8],[7080,8],[12803,8],[9262,2],[13468,4]],"y":1},"19931":{"r":[[12938,1],[19943,1],[12804,6],[13468,1]],"y":3},"13506":{"r":[[13423,30],[13465,10],[13468,1],[8925,1]],"y":1},"13510":{"r":[[8846,30],[13423,10],[13468,1],[8925,1]],"y":1},"13511":{"r":[[13463,30],[13467,10],[13468,1],[8925,1]],"y":1},"13512":{"r":[[13463,30],[13465,10],[13468,1],[8925,1]],"y":1},"13513":{"r":[[13467,30],[13465,10],[13468,1],[8925,1]],"y":1},"274273":{"r":[[248822,1],[248821,12],[13464,9],[18256,1]],"y":1},"274274":{"r":[[248822,1],[248821,18],[13465,6],[18256,1]],"y":1},"274275":{"r":[[248822,1],[248823,12],[13463,9],[18256,1]],"y":1},"274276":{"r":[[248822,1],[248823,18],[13467,6],[18256,1]],"y":1},"279956":{"r":[[2447,1],[3371,1]],"y":1},"279970":{"r":[[3372,1],[3356,1],[2452,1]],"y":1},"9061":{"r":[[4625,1],[9260,1],[3372,1]],"y":2}};
    var RI = {"1378":2454,"1382":2458,"1814":3383,"1817":3386,"1819":3388,"1820":3389,"1821":3390,"1822":3391,"1832":3382,"1833":2457,"1933":3825,"1934":3826,"4178":5997,"4396":6373,"4570":6662,"5997":8949,"5998":8951,"6009":9155,"6011":9179,"6012":9088,"6013":9187,"6015":9206,"6017":9264,"6018":9224,"9939":13445,"9940":13447,"9942":13453,"9952":13452,"9954":13454,"12137":17708,"12892":20007,"12895":20004,"13417":21546,"54190":246948,"54210":247754,"54211":247755,"54535":250328,"54536":250329,"54537":250330,"54538":250331,"54539":250332,"54540":250333,"54541":250334,"54542":250335,"54543":250336,"54544":250337,"54545":250338,"54546":250339,"54547":250340,"54548":250341,"54549":250342,"54550":250343,"54551":250344,"54552":250345,"54553":250346,"54554":250347,"54555":250348,"54556":250349,"54557":250350,"54558":250351,"54559":250353,"54560":250354,"1379":2455,"1380":2456,"1816":3385,"1935":3827,"2907":4596,"6000":6149,"6006":9144,"8596":12190,"9938":13443,"9961":13444,"12299":18253,"12893":20002,"52729":241650,"54197":247239,"54198":247240,"54199":247241,"54200":247242,"1383":2459,"1815":3384,"1931":3823,"2909":4623,"4004":5634,"4006":5633,"4007":5631,"4209":6049,"4210":6050,"4211":6051,"4212":6052,"4213":6048,"4395":6372,"5999":8956,"6001":9030,"6002":9036,"6010":9172,"9937":13442,"9951":13455,"9953":13462,"9955":13457,"9956":13456,"9957":13458,"9958":13461,"9959":13459,"9960":13460,"11316":3387,"12894":20008,"54655":250932,"54656":250933,"54657":250934,"54658":250935,"54659":250936,"54660":250937,"54661":250938,"54662":250939,"54663":250940,"54664":250941,"54665":250942,"54666":250943,"54667":250944,"54668":250945,"54669":250946,"54670":250947,"54671":250948,"54672":250949,"54673":250950,"54674":250951,"54676":250953,"54677":250954,"54678":250955,"1384":2460,"1936":3828,"4176":5996,"5996":8827,"6008":9154,"6014":9197,"6019":9233,"6848":10592,"12322":18294,"54533":250326,"54534":250327,"1932":3824,"1937":3829,"4393":6370,"4394":6371,"6004":9061,"6016":9210,"9936":13423,"12216":17967,"54453":249409,"54454":249430,"54455":249431,"54456":249410,"6007":9149,"9976":13503,"12876":19931,"6020":3577,"6021":6037,"9943":7078,"9944":7080,"9945":12803,"9946":7076,"9947":7080,"9948":7082,"9949":12808,"9950":7076,"13146":7068,"9840":12360,"59405":251290,"9977":13506,"9978":13510,"9979":13511,"9980":13512,"9981":13513,"58410":274273,"58411":274274,"58412":274275,"58413":274276,"49255":210708,"49863":213372,"49876":215162,"50023":217398,"50555":221024,"50600":221313,"51070":222952,"51674":233966,"51675":233965,"51676":233964,"51677":233962,"51678":233967,"51679":233968,"51680":233969,"51681":233977,"52646":279956,"57006":279970,"57031":279990,"1838":1251,"1839":2581,"1840":3530,"1841":3531,"4414":6450,"4415":6451,"5767":8544,"5768":8545,"10488":14529,"10489":14530,"14274":23684,"51728":232433,"4417":6452,"4418":6453,"12716":19440,"55741":255722,"55742":255721,"55743":255720,"55744":255719,"55745":255718,"55746":255717,"55747":255716,"55748":255715,"52641":279968,"57024":279940,"57036":279951,"54191":118,"54192":858,"54193":929,"54194":1710,"54195":3928,"54196":13446};
    var RCP = {"54210":["Minor Arcane Elixir",247754,1,[[2447,1],[3371,1]]],"54211":["Elixir of Minor Force",247755,1,[[765,1],[3371,1]]],"4178":["Elixir of Minor Defense",5997,1,[[765,1],[2447,1],[3371,1]]],"1379":["Minor Mana Potion",2455,1,[[785,1],[2447,1],[3371,1]]],"1382":["Elixir of Minor Fortitude",2458,1,[[2449,2],[2447,1],[3371,1]]],"1814":["Elixir of Wisdom",3383,1,[[785,1],[2450,2],[3371,1]]],"1816":["Lesser Mana Potion",3385,1,[[785,1],[3820,1],[3371,1]]],"4394":["Fire Oil",6371,2,[[6359,2],[3371,1]]],"4396":["Elixir of Fire Power",6373,1,[[6371,2],[3356,1],[3372,1]]],"1935":["Mana Potion",3827,1,[[3820,1],[3356,1],[3372,1]]],"1933":["Elixir of Lesser Fortitude",3825,1,[[3355,1],[3821,1],[3372,1]]],"5998":["Elixir of Defense",8951,1,[[3355,1],[3821,1],[3372,1]]],"4212":["Nature Protection Potion",6052,1,[[3357,1],[3820,1],[3372,1]]],"6000":["Greater Mana Potion",6149,1,[[3358,1],[3821,1],[3372,1]]],"6008":["Draught of Detect Undead",9154,1,[[8836,1],[8925,1]]],"9938":["Superior Mana Potion",13443,1,[[8838,2],[8839,2],[8925,1]]],"9939":["Elixir of Greater Defense",13445,1,[[13423,2],[8838,1],[8925,1]]],"6017":["Elixir of Shadow Power",9264,1,[[8845,3],[8925,1]]],"54666":["Major Frenzy Potion",250943,1,[[13466,3],[8839,2],[18256,1]]],"1838":["Linen Bandage",1251,1,[[2589,1]]],"54191":["Minor Healing Potion",118,1,[[3371,1],[2678,1],[2447,1]]],"1839":["Heavy Linen Bandage",2581,1,[[2589,2]]],"1840":["Wool Bandage",3530,1,[[2592,1]]],"1841":["Heavy Wool Bandage",3531,1,[[2592,2]]],"4414":["Silk Bandage",6450,1,[[4306,1]]],"4415":["Heavy Silk Bandage",6451,1,[[4306,2]]],"5767":["Mageweave Bandage",8544,1,[[4338,1]]],"54195":["Superior Healing Potion",3928,1,[[8925,1],[3713,1],[8838,1]]],"5768":["Heavy Mageweave Bandage",8545,1,[[4338,2]]],"10488":["Runecloth Bandage",14529,1,[[14047,1]]],"54196":["Major Healing Potion",13446,1,[[8925,1],[3713,3],[13464,1]]],"1537":["Roasted Boar Meat",2681,1,[[769,1]]],"1538":["Coyote Steak",2684,1,[[2673,1]]],"3931":["Dig Rat Stew",5478,2,[[5051,1]]],"3963":["Goblin Deviled Clams",5527,1,[[5504,1],[2692,1]]],"4392":["Rockscale Cod",4594,1,[[6362,1]]],"58469":["Plain Ol' Paletusk",274976,1,[[769,2],[2678,1]]],"11873":["Mithril Headed Trout",8364,1,[[8365,1]]],"10244":["Spotted Yellowtail",6887,1,[[4603,1]]],"10249":["Poached Sunscale Salmon",13932,1,[[13760,1]]],"12304":["Runn Tum Tuber Surprise",18254,1,[[18255,1],[3713,1]]],"1631":["Rough Sharpening Stone",2862,1,[[2835,1]]],"1856":["Rough Grinding Stone",3470,1,[[2835,2]]],"1861":["Coarse Grinding Stone",3478,1,[[2836,2]]],"1858":["Runed Copper Gauntlets",3472,1,[[2840,8],[3470,2]]],"1637":["Runed Copper Belt",2857,1,[[2840,10]]],"4390":["Silver Rod",6338,1,[[2842,1],[3470,2]]],"1639":["Rough Bronze Leggings",2865,1,[[2841,6]]],"1642":["Patterned Bronze Bracers",2868,1,[[2841,5],[3478,2]]],"5339":["Bronze Warhammer",7956,1,[[2841,8],[3466,1],[2319,1]]],"1993":["Green Iron Bracers",3835,1,[[3575,6],[2605,1]]],"4206":["Golden Scale Bracers",6040,1,[[3859,5],[3486,2]]],"5316":["Heavy Mithril Gauntlet",7919,1,[[3860,6],[4338,4]]],"5315":["Heavy Mithril Shoulder",7918,1,[[3860,8],[4234,6]]],"5319":["Steel Plate Helm",7922,1,[[3859,14],[7966,1]]],"5330":["Mithril Spurs",7969,1,[[3860,4],[7966,3]]],"5325":["Ornate Mithril Shoulders",7928,1,[[3860,12],[6037,1],[4304,6]]],"5329":["Mithril Coif",7931,1,[[3860,10],[4338,6]]],"54755":["Shining Mithril Helm",250543,1,[[3860,8],[6037,9],[3486,2],[7075,1]]],"5350":["Blight",7959,1,[[3860,28],[7972,10],[6037,10],[7966,6],[4304,6]]],"9166":["Imperial Plate Bracers",12425,1,[[12359,20],[7910,1]]],"54825":["Thorium Greatmace",250613,1,[[12359,30],[251291,4],[7076,4],[249726,10],[12644,2]]],"9441":["Huge Thorium Battleaxe",12775,1,[[12359,40],[12644,6],[8170,6]]],"1708":["Light Leather",2318,1,[[2934,3]]],"2195":["Cured Light Hide",4231,1,[[783,1],[4289,1]]],"2164":["Embossed Leather Gloves",4239,1,[[2318,3],[2320,2]]],"11756":["Medium Leather",2319,1,[[2318,4]]],"2196":["Cured Medium Hide",4233,1,[[4232,1],[4289,1]]],"2172":["Fine Leather Belt",4246,1,[[2318,6],[2320,2]]],"4993":["Light Leather Pants",7282,1,[[2318,10],[4231,1],[2321,1]]],"2175":["Dark Leather Belt",4249,1,[[4246,1],[4233,1],[2321,2],[4340,1]]],"11757":["Heavy Leather",4234,1,[[2319,5]]],"2173":["Hillman's Leather Gloves",4247,1,[[2319,14],[2321,4]]],"4161":["Barbaric Leggings",5963,1,[[4234,10],[2321,2],[1206,1]]],"4010":["Barbaric Harness",5739,1,[[4234,14],[2321,2],[7071,1]]],"4165":["Guardian Gloves",5966,1,[[4234,4],[4236,1],[4291,1]]],"5670":["Nightscape Headband",8176,1,[[4304,5],[4291,2]]],"5685":["Nightscape Pants",8193,1,[[4304,14],[4291,4]]],"10757":["Rugged Armor Kit",15564,1,[[8170,5]]],"10759":["Wicked Leather Gauntlets",15083,1,[[8170,8],[2325,1],[14341,1]]],"5691":["Nightscape Boots",8197,1,[[4304,16],[8343,2]]],"55088":["Tooled Leather Gauntlets",252553,1,[[8170,10],[14341,1],[6261,1]]],"2359":["Bolt of Linen Cloth",2996,1,[[2589,2]]],"2361":["Brown Linen Vest",2568,1,[[2996,1],[2320,1]]],"4848":["Linen Belt",7026,1,[[2996,1],[2320,1]]],"2371":["Woolen Cape",2584,1,[[2997,1],[2321,1]]],"2385":["Double-stitched Woolen Shoulders",4314,1,[[2997,3],[2321,2]]],"2389":["Gloves of Meditation",4318,1,[[2997,4],[2321,3],[3383,1]]],"2377":["Bolt of Mageweave",4339,1,[[4338,5]]],"4714":["Red Swashbuckler's Shirt",6796,1,[[4305,3],[2604,2],[4291,1]]],"4852":["Earthen Vest",7051,1,[[4305,3],[7067,1],[2321,2]]],"4872":["Crimson Silk Vest",7058,1,[[4305,4],[2604,2],[2321,2]]],"6589":["Orange Mageweave Shirt",10056,1,[[4339,1],[6261,1],[8343,1]]],"10396":["Bolt of Runecloth",14048,1,[[14047,5]]],"6580":["Black Mageweave Vest",9998,1,[[4339,2],[4291,3]]],"10487":["Mooncloth",14342,1,[[14256,2]]],"12325":["Gordok Ogre Suit",18258,1,[[14048,2],[8170,4],[18240,1],[14341,1]]],"10957":["Mooncloth Boots",15802,1,[[14048,6],[14342,4],[7971,2],[14341,1]]],"2413":["Rough Blasting Powder",4357,1,[[2835,1]]],"2417":["Handful of Copper Bolts",4359,1,[[2840,1]]],"4294":["Arclight Spanner",6219,1,[[2840,6]]],"2418":["Rough Copper Bomb",4360,2,[[2840,1],[4359,1],[4357,2],[2589,1]]],"2425":["Coarse Blasting Powder",4364,1,[[2836,1]]],"2427":["Coarse Dynamite",4365,1,[[4364,3],[2589,1]]],"2422":["Silver Contact",4404,5,[[2842,1]]],"2430":["Flying Tiger Goggles",4368,1,[[2318,6],[818,2]]],"2433":["Bronze Tube",4371,1,[[2841,2],[2880,1]]],"2435":["Standard Scope",4406,1,[[4371,1],[1206,1]]],"2441":["Heavy Blasting Powder",4377,1,[[2838,1]]],"2439":["Whirring Bronze Gizmo",4375,1,[[2841,2],[2592,1]]],"2447":["Bronze Framework",4382,1,[[2841,2],[2319,1],[2592,1]]],"2449":["Explosive Sheep",4384,1,[[4382,1],[4375,1],[4377,2],[2592,2]]],"6858":["Solid Blasting Powder",10505,1,[[7912,2]]],"6861":["Gyromatic Micro-Adjustor",10498,1,[[3859,4]]],"6862":["Mithril Tube",10559,1,[[3860,3]]],"6863":["Unstable Trigger",10560,1,[[3860,1],[4338,1],[10505,1]]],"6868":["Mithril Casing",10561,1,[[3860,3]]],"6876":["Hi-Explosive Bomb",10562,4,[[10561,2],[10560,1],[10505,2]]],"11228":["Dense Blasting Powder",15992,1,[[12365,2]]],"11231":["Thorium Widget",15994,1,[[12359,3],[14047,1]]],"11236":["Thorium Tube",16000,1,[[12359,6]]],"4291":["Runed Copper Rod",6218,1,[[6217,1],[247786,1]]],"4289":["Enchant Bracer - Inferior Stamina",0,1,[[247786,1]]],"4290":["Enchant Chest - Inferior Stamina",0,1,[[10940,1]]],"8000":["Greater Magic Wand",11288,1,[[4470,1],[10938,2]]],"4370":["Runed Silver Rod",6339,1,[[6338,1],[10940,3],[10938,4],[1210,1]]],"7425":["Enchant Bracer - Lesser Stamina",0,1,[[11083,1]]],"7502":["Runed Golden Rod",11130,1,[[11128,1],[5500,1],[11082,1],[11083,1]]],"7456":["Enchant Bracer - Lesser Strength",0,1,[[11083,1]]],"7505":["Enchant Boots - Lesser Agility",0,1,[[11083,1]]],"7522":["Enchant Bracer - Strength",0,1,[[11137,1]]],"7533":["Runed Truesilver Rod",11145,1,[[11144,1],[7971,1],[11135,1],[11137,1]]],"7657":["Enchant Cloak - Greater Defense",0,1,[[11137,1]]],"7659":["Enchant Gloves - Agility",0,1,[[11137,1]]],"7662":["Enchant Boots - Stamina",0,1,[[11137,2]]],"7665":["Enchant Chest - Superior Stamina",0,1,[[11137,3]]],"13140":["Lesser Mana Oil",20747,1,[[11176,1],[8831,1],[8925,1]]],"11376":["Enchant Shield - Greater Stamina",0,1,[[11176,6]]],"11385":["Runed Arcanite Rod",16207,1,[[16206,1],[13926,1],[16204,10],[16203,4],[14343,4],[14344,2]]],"11383":["Enchant Cloak - Superior Defense",0,1,[[16204,8]]]};
    var ROUTES = {"alch":{"n":"Alchemy","src":"Conquest Capped","url":"https://conquestcapped.com/guides/wow-forever/wow-forever-alchemy/","s":[[1,10,[[54210,9],[54211,9]],0,""],[10,55,[[4178,45]],0,""],[55,65,[[1379,10]],0,""],["T","Journeyman",75,50,10,"any Alchemy trainer, such as the one in Orgrimmar"],[65,90,[[1382,27]],1,""],[90,120,[[1814,30]],0,""],[120,130,[[1816,10]],0,""],[130,150,[[4394,20],[1816,20]],0,""],["T","Expert",150,125,20,"Doctor Herbert Halsey in Undercity if you’re Horde; Alliance players need an Expert Alchemy trainer"],[150,165,[[4396,15],[1816,22]],0,""],[165,180,[[1935,15]],0,""],[180,195,[[1935,21]],1,"Mana Potions here, because Elixir of Lesser Fortitude’s recipe is a rare world drop. If you have it, 15 of those do the same job."],[195,215,[[5998,20],[4212,20]],0,""],[215,225,[[6000,11]],0,""],["T","Artisan",225,200,35,"Rogvar in Stonard, Swamp of Sorrows"],[225,230,[[6000,6]],0,""],[230,265,[[6008,45]],1,""],[265,275,[[9938,10]],0,""],[275,290,[[9938,20],[9939,17],[6017,27]],0,""],[290,300,[[54666,17]],1,"Its recipe costs 240 Merchant’s Favor at the camp."]]},"fa":{"n":"First Aid","src":"Conquest Capped","url":"https://conquestcapped.com/guides/wow-forever/wow-forever-first-aid/","s":[[1,40,[[1838,50],[54191,43]],0,""],[40,75,[[1839,40],[54191,38]],0,""],["T","Journeyman",75,50,10,"any First Aid trainer"],[75,80,[[1839,12]],0,""],[80,115,[[1840,50]],0,""],[115,150,[[1841,50]],0,""],["T","Expert",150,125,0,"the book Expert First Aid - Under Wraps, from Balai Lok’Wein in Dustwallow Marsh, who also sells the Heavy Silk and Mageweave manuals"],[150,180,[[4414,42]],0,""],[180,210,[[4415,46]],0,""],[210,225,[[5767,17],[4415,42]],0,""],["T","Artisan",225,225,35,"the Triage quest from Doctor Gregory Victor at Hammerfall, Arathi Highlands"],[225,240,[[5767,29]],0,"Mageweave Bandages here, because Manual: Superior Healing Potion has no known source yet. If you find it, 16 Superior Healing Potions do the same job."],[240,260,[[5768,30]],0,""],[260,275,[[10488,20]],0,""],[275,300,[[54196,30]],0,"Needs Manual: Major Healing Potion, sold for 8g by Pexmit, a level 60 rare in Mount Hyjal. Without it, make Runecloth Bandages to 290, then Heavy Runecloth Bandages."]]},"cook":{"n":"Cooking","src":"MetaBot","url":"https://metabot.gg/en/wow-forever/professions/cooking","s":[[1,71,[[1537,86]],0,""],["T","Journeyman",75,50,10,"any Cooking trainer"],[71,90,[[1538,19]],0,""],["T","Expert",150,125,0,"the Expert Cookbook"],[90,170,[[3931,212]],0,"Its recipe is an item, not a trainer recipe."],[170,184,[[3963,21]],0,""],[184,185,[[4392,1]],0,""],[185,215,[[58469,36]],0,""],[215,225,[[11873,12]],0,""],["T","Artisan",225,225,35,"the Clamlette Surprise quest"],[225,290,[[10244,79]],0,""],[290,294,[[10249,5]],0,""],[294,300,[[12304,6]],0,""]]},"bs":{"n":"Blacksmithing","src":"Conquest Capped","url":"https://conquestcapped.com/guides/wow-forever/wow-forever-blacksmithing/","s":[[1,25,[[1631,30]],0,""],[25,50,[[1856,30]],0,""],[50,70,[[1861,60]],0,""],["T","Journeyman",75,50,10,"Snarl in Orgrimmar"],[70,75,[[1858,5]],0,""],[75,80,[[1637,5],[4390,5]],0,""],[80,95,[[1639,15]],0,""],[95,125,[[1642,30]],0,""],[125,150,[[5339,25]],0,""],["T","Expert",150,125,20,"Saru Steelfury in Orgrimmar"],[150,165,[[1993,15]],0,""],[165,185,[[4206,20]],0,""],[185,200,[[5316,15],[5315,15]],0,""],[200,210,[[5319,10]],0,""],[210,225,[[5330,15],[5319,20]],0,"The Mithril Spurs plan is a world drop."],["T","Artisan",225,200,35,"Brikk Keencraft in Booty Bay"],[225,230,[[5325,6]],0,"Its plan comes from the quest The Art of the Imbue."],[230,235,[[5329,6]],0,""],[235,250,[[54755,20]],1,""],[250,265,[[5350,20]],1,""],[265,280,[[9166,20],[54825,20]],1,""],[280,300,[[9441,25]],1,"Its plan is sold by Magnus Frostwake in Western Plaguelands."]]},"lw":{"n":"Leatherworking","src":"Conquest Capped","url":"https://conquestcapped.com/guides/wow-forever/wow-forever-leatherworking/","s":[[1,30,[[1708,33]],0,""],[30,55,[[2195,27]],0,""],["T","Journeyman",75,50,10,"any Leatherworking trainer"],[55,75,[[2164,21]],0,""],[75,80,[[11756,8]],0,""],[80,90,[[2196,10]],0,""],[90,100,[[2172,19]],0,""],[100,115,[[4993,24]],0,""],[115,125,[[2175,10]],0,""],[125,130,[[11757,7]],0,""],["T","Expert",150,125,20,"an Expert Leatherworking trainer"],[130,150,[[2173,21]],0,""],[150,165,[[4161,15]],0,"Its pattern is sold in Thousand Needles, Arathi Highlands and Ashenvale."],[165,175,[[4010,10]],0,""],[175,195,[[4165,26]],0,""],[195,210,[[5670,21]],0,""],["T","Artisan",225,200,35,"an Artisan Leatherworking trainer"],[210,225,[[5685,15]],0,""],[225,235,[[10757,12]],1,""],[235,255,[[10759,25],[5691,20]],1,"The Wicked Leather Gauntlets pattern is in limited supply."],[255,260,[[10759,6]],1,""],[260,280,[[55088,25]],1,"The guide hasn’t confirmed where its pattern comes from."],[280,300,[[55088,30]],1,"The guide’s pick for 280 to 300 isn’t in Forever’s recipe data yet, so this keeps to Tooled Leather Gauntlets."]]},"tail":{"n":"Tailoring","src":"MetaBot","url":"https://metabot.gg/en/wow-forever/professions/tailoring","s":[[1,34,[[2359,35]],0,""],[34,46,[[2361,12]],0,""],[46,74,[[4848,44]],0,""],["T","Journeyman",75,50,10,"any Tailoring trainer"],[74,103,[[2371,43]],0,""],[103,124,[[2385,25]],0,""],[124,142,[[2389,26]],0,""],[142,147,[[2377,6]],0,""],["T","Expert",150,125,20,"an Expert Tailoring trainer"],[147,152,[[4714,6]],0,""],[152,158,[[4852,7]],0,""],[158,170,[[4872,12]],0,""],[170,187,[[6589,18]],0,""],[187,195,[[4852,9]],0,""],[195,212,[[10396,18]],0,""],["T","Artisan",225,200,35,"an Artisan Tailoring trainer"],[212,243,[[6580,51]],0,""],[243,270,[[10487,27]],0,"Its pattern is an item, not a trainer recipe."],[270,294,[[12325,35]],0,""],[294,300,[[10957,10]],0,""]]},"eng":{"n":"Engineering","src":"Conquest Capped","url":"https://conquestcapped.com/guides/wow-forever/wow-forever-engineering/","s":[[1,30,[[2413,60]],0,""],[30,50,[[2417,30]],0,""],[50,51,[[4294,1]],0,""],["T","Journeyman",75,50,10,"any Engineering trainer"],[51,75,[[2418,30]],0,""],[75,90,[[2425,60]],0,""],[90,100,[[2427,20]],0,""],[100,105,[[2422,5],[2430,5]],0,""],[105,125,[[2433,25]],0,""],[125,135,[[2435,10]],0,""],[135,143,[[2441,30]],0,""],[143,150,[[2439,15]],0,""],["T","Expert",150,125,20,"an Expert Engineering trainer"],[150,160,[[2447,15]],0,""],[160,175,[[2449,15]],0,""],[175,194,[[6858,60]],0,""],[194,195,[[6861,1]],0,""],[195,200,[[6862,6]],0,""],["T","Artisan",225,200,35,"Buzzek Bracketswing in Gadgetzan, Tanaris"],[200,215,[[6863,20]],0,""],[215,238,[[6868,40]],0,""],[238,250,[[6876,20]],0,""],[250,260,[[11228,30]],0,""],[260,285,[[11231,35]],0,"Its schematic is sold by Sovik in Orgrimmar."],[285,300,[[11236,20]],0,"Its schematic is sold by Xizzer Fizzbolt in Everlook, Winterspring."]]},"ench":{"n":"Enchanting","src":"Conquest Capped","url":"https://conquestcapped.com/guides/wow-forever/wow-forever-enchanting/","s":[[1,2,[[4291,1]],0,""],[2,20,[[4289,18]],0,""],[20,70,[[4290,50]],0,""],["T","Journeyman",75,50,10,"any Enchanting trainer"],[70,130,[[8000,67]],0,"Sell the wands to a vendor."],[130,131,[[4370,1]],0,""],[131,150,[[7425,19]],0,""],["T","Expert",150,125,20,"an Expert Enchanting trainer"],[150,151,[[7502,1]],0,""],[151,165,[[7456,14]],0,"Buy its formula from Kulwia in Stonetalon Mountains before 150."],[165,185,[[7505,22]],0,""],[185,200,[[7522,15]],0,""],["T","Artisan",225,200,35,"Annora in Uldaman, once the enemies in her room are cleared"],[200,201,[[7533,1]],0,""],[201,220,[[7522,35]],1,""],[220,225,[[7657,5]],0,""],[225,230,[[7659,5]],0,""],[230,235,[[7662,5]],0,""],[235,250,[[7665,20]],1,""],[250,265,[[13140,20]],0,"Its formula is sold by Kania in Silithus."],[265,294,[[11376,32]],1,"Its formula is sold by Daniel Bartlett in Undercity."],[294,295,[[11385,1]],0,""],[295,300,[[11383,5]],0,""]]}};
    var HZ = [[17,"The Barrens",10,25,"H",68463330,{"785":261,"2449":163,"2453":123,"2450":121,"765":118,"2447":99,"3820":55,"3355":34,"3356":33,"3369":4}],[33,"Stranglethorn Vale",30,45,"C",27146896,{"3821":205,"3358":192,"3820":83,"3356":65,"3357":63,"3355":53,"3818":41,"8831":25}],[16,"Azshara",50,55,"C",17145753,{"13463":132,"8831":128,"8838":98,"13464":95,"13465":57,"3820":14,"3358":9,"3821":3}],[45,"Arathi Highlands",30,40,"C",8640000,{"3355":139,"3821":132,"3358":79,"3818":58,"3357":53,"3356":30,"2453":26,"3369":8,"3820":2}],[139,"Eastern Plaguelands",55,60,"C",9991588,{"13466":191,"13463":96,"13464":52,"8838":46,"8836":37,"13465":22,"13468":16,"3369":3}],[331,"Ashenvale",20,30,"C",22165623,{"2453":105,"3820":76,"785":70,"2450":70,"3356":35,"3355":23,"8831":15,"3357":12,"8846":8}],[11,"Wetlands",20,30,"A",11398242,{"2453":107,"3820":79,"3357":62,"3355":49,"2450":39,"3356":35,"785":23,"3369":18}],[8,"Swamp of Sorrows",35,45,"C",3507527,{"8839":161,"3821":98,"3358":62,"3818":49,"3357":20,"3356":10,"3820":6}],[47,"The Hinterlands",45,50,"C",9881666,{"8838":90,"3821":59,"8831":47,"13464":32,"3818":30,"3358":29,"8845":22,"3357":13,"3820":9}],[148,"Darkshore",10,20,"A",28601665,{"765":66,"785":64,"3820":58,"2450":56,"2453":43,"2449":22,"2447":20}],[40,"Westfall",10,20,"A",8166665,{"2453":91,"2450":59,"785":55,"765":32,"2449":32,"3820":29,"2447":19}],[10,"Duskwood",20,30,"A",4860000,{"2450":106,"2453":96,"3369":41,"3356":31,"785":24,"3355":18}],[36,"Alterac Mountains",30,40,"C",5226666,{"3821":82,"3357":50,"3818":45,"3358":36,"3819":34,"2453":24,"3355":17,"3356":16,"3369":7,"3820":5}],[618,"Winterspring",55,60,"C",33606665,{"13467":182,"13465":101,"13468":18}],[490,"Un’Goro Crater",50,55,"C",9126666,{"13464":99,"13463":87,"13465":71,"8838":26,"8839":16}],[14,"Durotar",1,10,"H",18638436,{"765":167,"2447":67,"2449":43,"785":17}],[406,"Stonetalon Mountains",20,30,"C",15901353,{"2453":138,"3355":96,"3356":27,"2450":22,"785":11}],[267,"Hillsbrad Foothills",25,30,"C",6826666,{"2453":109,"3820":48,"2450":37,"3356":33,"3357":20,"3355":19,"785":13,"3358":2}],[361,"Felwood",50,55,"C",22041664,{"13466":71,"8846":63,"13463":61,"13464":34,"8836":27,"8838":18,"13465":6}],[357,"Feralas",45,50,"C",32201663,{"8838":53,"3821":47,"8831":32,"3357":31,"3358":31,"3820":28,"13464":20}],[130,"Silverpine Forest",10,20,"H",11759999,{"765":54,"2453":50,"785":38,"2447":32,"2450":32,"2449":15,"3820":14}],[38,"Loch Modan",10,20,"A",5074183,{"765":83,"2453":63,"785":26,"2447":20,"2450":18,"2449":10}],[44,"Redridge Mountains",15,25,"A",3143184,{"2453":104,"2450":35,"2449":33,"785":31,"2447":8,"3357":6}],[28,"Western Plaguelands",50,60,"C",12326666,{"8836":65,"13466":45,"13463":40,"8838":19,"13465":12}],[215,"Mulgore",1,10,"H",17595936,{"765":85,"2447":62,"2449":32}],[85,"Tirisfal Glades",1,10,"H",13612733,{"765":73,"2447":62,"2449":40}],[405,"Desolace",30,40,"C",13478132,{"2453":53,"3369":23,"3820":22,"3356":19,"8846":15,"3355":13,"3357":13,"8845":13}],[12,"Elwynn Forest",1,10,"A",8033532,{"765":82,"2447":47,"2449":37}],[3,"Badlands",40,45,"C",4125105,{"3821":39,"3818":26,"3358":26,"3355":24,"3356":22,"4625":21,"8831":7}],[1,"Dun Morogh",1,10,"A",16170415,{"765":64,"2447":54,"2449":39}],[46,"Burning Steppes",55,60,"C",5717978,{"13463":57,"13464":30,"13465":28,"8838":21,"13468":19}],[141,"Teldrassil",1,10,"A",17279844,{"765":51,"2447":46,"2449":30,"785":13}],[440,"Tanaris",45,50,"C",31739998,{"4625":72,"8831":44,"3820":9}],[400,"Thousand Needles",30,40,"C",12906664,{"2453":64,"3355":42,"3356":18}],[4,"Blasted Lands",50,55,"C",7481669,{"4625":45,"8838":38,"8846":27}],[15,"Dustwallow Marsh",40,45,"C",18374999,{"3357":27,"3358":20,"3821":19,"3818":12,"3356":11,"3820":10}],[1377,"Silithus",55,60,"C",8091492,{"13464":27,"13463":26,"8838":7,"13468":7,"13465":6}],[51,"Searing Gorge",45,50,"C",3318983,{"4625":62}]];
    var RX = {"1378":["Elixir of Minor Strength","alch",2454,1,[[2449,1],[765,1],[3371,1]],40,0,"trainer",0,0,0,[],"",0],"1382":["Elixir of Minor Fortitude","alch",2458,1,[[2449,2],[2447,1],[3371,1]],50,0,"trainer",0,0,0,[],"",0],"1814":["Elixir of Wisdom","alch",3383,1,[[785,1],[2450,2],[3371,1]],90,0,"trainer",0,0,0,[],"",0],"1817":["Potion of Poison Cleansing","alch",3386,1,[[1288,1],[2453,1],[3372,1]],120,0,"item",3394,0,1,[],"A world drop from monsters; best odds from Dal Bloodclaw in Ashenvale (0.14%), and found in treasure chests",0],"1819":["Lesser Troll's Blood Elixir","alch",3388,1,[[2453,2],[2450,2],[3372,1]],125,0,"trainer",0,0,0,[],"",0],"1820":["Elixir of Lesser Defense","alch",3389,1,[[3355,1],[3820,1],[3372,1]],130,0,"trainer",0,0,0,[],"",0],"1821":["Elixir of Lesser Agility","alch",3390,1,[[3355,1],[2452,1],[3372,1]],140,0,"item",3396,0,1,[],"A world drop from monsters; best odds from Rok'Alim the Pounder in Thousand Needles (0.12%), and found in treasure chests",0],"1822":["Elixir of Ogre Strength","alch",3391,1,[[2449,1],[3356,1],[3372,1]],150,0,"item",6211,0,1,[],"Drops from Splinter Fist Firemongers in Duskwood and Mudsnout Shamans in Hillsbrad Foothills (3.9% each), and found in treasure chests",0],"1832":["Minor Troll's Blood Elixir","alch",3382,1,[[2447,1],[2449,2],[3371,1]],15,0,"trainer",0,0,0,[],"",0],"1833":["Elixir of Minor Agility","alch",2457,1,[[2452,1],[765,1],[3371,1]],50,0,"item",2553,0,1,[],"A world drop from monsters of level 5 to 25",0],"1933":["Elixir of Lesser Fortitude","alch",3825,1,[[3355,1],[3821,1],[3372,1]],175,0,"item",3830,0,1,[],"A world drop from monsters; best odds from Whirlwind Shredders in Desolace (0.08%), and found in treasure chests",0],"1934":["Troll's Blood Elixir","alch",3826,1,[[3357,1],[2453,1],[3372,1]],180,0,"item",3831,0,1,[],"Drops from Stromgarde Cavalrymen (0.16%) and Prince Galen Trollbane (0.12%) in Arathi Highlands, and found in treasure chests",0],"4178":["Elixir of Minor Defense","alch",5997,1,[[765,1],[2447,1],[3371,1]],1,0,"auto",0,0,0,[],"",0],"4396":["Elixir of Fire Power","alch",6373,1,[[6371,2],[3356,1],[3372,1]],140,0,"trainer",0,0,0,[],"",0],"4570":["Elixir of Giant Growth","alch",6662,1,[[6522,1],[2449,1],[3371,1]],90,0,"item",6663,0,1,[],"Drops from Captain Gerogg Hammertoe (1.2%) and Silithid Harvesters (0.54%) in The Barrens",0],"5997":["Elixir of Agility","alch",8949,1,[[3820,1],[3821,1],[3372,1]],185,0,"trainer",0,0,0,[],"",0],"5998":["Elixir of Defense","alch",8951,1,[[3355,1],[3821,1],[3372,1]],195,0,"trainer",0,0,0,[],"",0],"6009":["Arcane Elixir","alch",9155,1,[[8839,1],[3821,1],[8925,1]],235,0,"trainer",0,0,0,[],"",0],"6011":["Elixir of Greater Intellect","alch",9179,1,[[8839,1],[3358,1],[8925,1]],235,0,"trainer",0,0,0,[],"",0],"6012":["Gift of Arthas","alch",9088,1,[[8836,1],[8839,1],[8925,1]],240,0,"item",9296,0,1,[],"Drops from Slavering Ghouls and Skeletal Flayers in Western Plaguelands (0.9%)",0],"6013":["Elixir of Greater Agility","alch",9187,1,[[8838,1],[3821,1],[8925,1]],240,0,"trainer",0,0,0,[],"",0],"6015":["Elixir of Greater Strength","alch",9206,1,[[8838,1],[8846,1],[8925,1]],245,0,"item",9298,0,1,[],"Drops from Wave Striders in Feralas (0.16%) and Hitah'ya the Keeper in Arathi Highlands (0.1%)",0],"6017":["Elixir of Shadow Power","alch",9264,1,[[8845,3],[8925,1]],250,0,"item",9301,10000,1,[["Maria Lumere","Stormwind City","A",1],["Algernon","Undercity","H",1]],"",0],"6018":["Potion of Demon Slaying","alch",9224,1,[[8846,1],[8845,1],[8925,1]],250,0,"item",9300,10000,0,[["Rartar","Swamp of Sorrows","H",1],["Nina Lightbrew","Blasted Lands","A",1]],"",0],"9939":["Elixir of Greater Defense","alch",13445,1,[[13423,2],[8838,1],[8925,1]],265,0,"item",13478,13000,1,[["Kor'geld","Orgrimmar","H",1],["Soolie Berryfizz","Ironforge","A",1]],"",0],"9940":["Elixir of the Sages","alch",13447,1,[[13463,1],[13466,2],[8925,1]],270,0,"item",13479,0,1,[],"Drops from Scarlet Curates (2.4%) and Scarlet Enchanters (2.1%) in Eastern Plaguelands",0],"9942":["Elixir of Brute Force","alch",13453,1,[[8846,2],[13466,2],[8925,1]],275,0,"item",13481,0,1,[],"Drops from Small Brown-wrapped Packages",0],"9952":["Elixir of the Mongoose","alch",13452,1,[[13465,2],[13466,2],[8925,1]],280,0,"item",13491,0,1,[],"Drops from Jadefire Rogues in Felwood (4%) and Legashi Rogues in Azshara (3.6%)",0],"9954":["Greater Arcane Elixir","alch",13454,1,[[13463,3],[13465,1],[8925,1]],285,0,"item",13493,0,1,[],"A world drop from monsters in Felwood and Eastern Plaguelands (0.02%)",0],"12137":["Elixir of Frost Power","alch",17708,1,[[3819,2],[3358,1],[3372,1]],190,0,"item",17709,0,1,[],"Drops from Frenzied Plaguehounds in Eastern Plaguelands (0.02%)",0],"12892":["Mageblood Elixir","alch",20007,1,[[13463,1],[13466,2],[8925,1]],275,0,"item",20011,50000,0,[["Rin'wosho the Trader","Stranglethorn Vale","",0]],"You need to be Revered with the Zandalar Tribe",0],"12895":["Major Troll's Blood Elixir","alch",20004,1,[[8846,1],[13466,2],[8925,1]],290,0,"item",20014,50000,0,[["Rin'wosho the Trader","Stranglethorn Vale","",0]],"You need to be Honored with the Zandalar Tribe",0],"13417":["Elixir of Holy Power","alch",21546,1,[[6371,3],[4625,3],[8925,1]],250,0,"item",21547,0,1,[],"Drops from Dark Iron Watchmen and Slavers in Searing Gorge (1.1%)",0],"54190":["Distilled Firewater","alch",246948,1,[[3819,4],[8846,2],[3372,1]],250,0,"item",236754,0,0,[],"",0],"54210":["Minor Arcane Elixir","alch",247754,1,[[2447,1],[3371,1]],1,0,"auto",0,0,0,[],"",0],"54211":["Elixir of Minor Force","alch",247755,1,[[765,1],[3371,1]],1,0,"auto",0,0,0,[],"",0],"54535":["Elixir of Cunning","alch",250328,1,[[13463,3],[8846,2],[8925,1]],275,0,"item",250364,0,0,[["Apothecary Durelle","The Barrens","H",0],["Nina Surefire","Redridge Mountains","A",0]],"",[180,"Honored"]],"54536":["Elixir of the Phalanx","alch",250329,1,[[13464,2],[8838,4],[8925,1]],250,0,"item",250365,0,0,[["Apothecary Durelle","The Barrens","H",0],["Nina Surefire","Redridge Mountains","A",0]],"",[180,"Honored"]],"54537":["Minor Cleric's Elixir","alch",250330,1,[[785,2],[2453,1],[3371,1]],45,0,"item",250366,0,1,[],"Drops from Vile Fin Attacker in Tirisfal Glades (0.62%) and Murloc Forager in Elwynn Forest (0.03%)",0],"54538":["Lesser Cleric's Elixir","alch",250331,1,[[3356,2],[3357,2],[3372,1]],95,0,"item",250367,0,0,[["Apothecary Durelle","The Barrens","H",0],["Nina Surefire","Redridge Mountains","A",0]],"",[45,""]],"54539":["Cleric's Elixir","alch",250332,1,[[3819,2],[4625,2],[3372,1]],145,0,"item",250368,0,1,[],"",0],"54540":["Greater Cleric's Elixir","alch",250333,1,[[8836,3],[8831,1],[8925,1]],195,0,"item",250369,0,0,[["Apothecary Durelle","The Barrens","H",0],["Nina Surefire","Redridge Mountains","A",0]],"",[120,"Friendly"]],"54541":["Elixir of Fortitude","alch",250334,1,[[3821,4],[3372,1]],150,0,"item",250370,0,1,[],"",0],"54542":["Elixir of Greater Fortitude","alch",250335,1,[[8838,4],[8925,1]],200,0,"item",250371,0,0,[["Apothecary Durelle","The Barrens","H",0],["Nina Surefire","Redridge Mountains","A",0]],"",[120,"Friendly"]],"54543":["Elixir of Wicked Regeneration","alch",250336,1,[[13464,3],[13463,2],[8925,1]],285,0,"item",250372,0,0,[["Apothecary Durelle","The Barrens","H",0],["Nina Surefire","Redridge Mountains","A",0]],"",[180,"Honored"]],"54544":["Elixir of the Owl","alch",250337,1,[[13463,4],[13465,2],[18256,1]],280,0,"item",250373,0,0,[["Apothecary Durelle","The Barrens","H",0],["Nina Surefire","Redridge Mountains","A",0]],"",[180,"Honored"]],"54545":["Elixir of Sages","alch",250338,1,[[13463,4],[13464,2],[18256,1]],275,0,"item",250374,0,0,[["Apothecary Durelle","The Barrens","H",0],["Nina Surefire","Redridge Mountains","A",0]],"",[180,"Honored"]],"54546":["Minor Mageblood Elixir","alch",250339,1,[[785,2],[3371,1]],25,0,"item",250375,0,1,[],"Drops from Young Wendigo in Dun Morogh",0],"54547":["Lesser Mageblood Elixir","alch",250340,1,[[3356,3],[3371,1]],75,0,"item",250376,0,0,[["Apothecary Durelle","The Barrens","H",0],["Nina Surefire","Redridge Mountains","A",0]],"",[45,""]],"54548":["Greater Mageblood Elixir","alch",250341,1,[[8839,3],[8836,2],[8925,1]],175,0,"item",250377,0,0,[["Apothecary Durelle","The Barrens","H",0],["Nina Surefire","Redridge Mountains","A",0]],"",[120,"Friendly"]],"54549":["Lesser Arcane Elixir","alch",250342,1,[[3356,4],[3372,1]],120,0,"item",250378,0,0,[["Apothecary Durelle","The Barrens","H",0],["Nina Surefire","Redridge Mountains","A",0]],"",[45,""]],"54550":["Elixir of Nature Power","alch",250343,1,[[13464,4],[8838,2],[8925,1]],285,0,"item",250379,0,0,[["Apothecary Durelle","The Barrens","H",0],["Nina Surefire","Redridge Mountains","A",0]],"",[180,"Honored"]],"54551":["Elixir of Minor Spirit","alch",250344,1,[[2449,2],[2447,1],[3371,1]],15,0,"item",250380,0,1,[],"Drops from Gnarlpine Gardener in Teldrassil (0.1%) and Kul Tiras Sailor in Durotar (0.02%)",0],"54552":["Elixir of Lesser Spirit","alch",250345,1,[[3355,2],[785,1],[3371,1]],65,0,"item",250381,0,0,[["Apothecary Durelle","The Barrens","H",0],["Nina Surefire","Redridge Mountains","A",0]],"",[45,""]],"54553":["Elixir of Spirit","alch",250346,1,[[3358,3],[3356,1],[3372,1]],115,0,"item",250382,0,1,[],"",0],"54554":["Elixir of Greater Spirit","alch",250347,1,[[8836,3],[8831,2],[8925,1]],165,0,"item",250383,0,0,[["Apothecary Durelle","The Barrens","H",0],["Nina Surefire","Redridge Mountains","A",0]],"",[120,"Friendly"]],"54555":["Elixir of the Whale","alch",250348,1,[[13463,3],[8846,1],[8925,1]],275,0,"item",250384,0,0,[["Apothecary Durelle","The Barrens","H",0],["Nina Surefire","Redridge Mountains","A",0]],"",[180,"Honored"]],"54556":["Elixir of Strength","alch",250349,1,[[3355,3],[3821,1],[3372,1]],150,0,"item",250385,0,1,[],"",0],"54557":["Elixir of Ferocity","alch",250350,1,[[8846,3],[8845,1],[8925,1]],275,0,"item",250386,0,0,[["Apothecary Durelle","The Barrens","H",0],["Nina Surefire","Redridge Mountains","A",0]],"",[180,"Honored"]],"54558":["Elixir of the Grizzly","alch",250351,1,[[8846,3],[8839,1],[8925,1]],300,0,"item",250387,0,0,[["Apothecary Durelle","The Barrens","H",0],["Nina Surefire","Redridge Mountains","A",0]],"",[240,"Honored"]],"54559":["Elixir of Lesser Intellect","alch",250353,1,[[3356,3],[3372,1]],95,0,"item",250388,0,0,[["Apothecary Durelle","The Barrens","H",0],["Nina Surefire","Redridge Mountains","A",0]],"",[45,""]],"54560":["Elixir of Intellect","alch",250354,1,[[3358,3],[3372,1]],135,0,"item",250389,0,1,[],"",0],"1379":["Minor Mana Potion","alch",2455,1,[[785,1],[2447,1],[3371,1]],25,0,"trainer",0,0,0,[],"",0],"1380":["Minor Rejuvenation Potion","alch",2456,1,[[785,2],[2447,1],[3371,1]],40,0,"trainer",0,0,0,[],"",0],"1816":["Lesser Mana Potion","alch",3385,1,[[785,1],[3820,1],[3371,1]],120,0,"trainer",0,0,0,[],"",0],"1935":["Mana Potion","alch",3827,1,[[3820,1],[3356,1],[3372,1]],160,0,"trainer",0,0,0,[],"",0],"2907":["Minor Discolored Healing Potion","alch",4596,1,[[3371,1],[2447,1],[730,1]],50,0,"item",4597,0,0,[],"A reward from Wild Hearts, a Horde quest in Silverpine Forest",0],"6000":["Greater Mana Potion","alch",6149,1,[[3358,1],[3821,1],[3372,1]],205,0,"trainer",0,0,0,[],"",0],"6006":["Wildvine Potion","alch",9144,1,[[8153,1],[8831,1],[8925,1]],225,0,"item",9294,0,1,[],"Drops from Zalas Witherbark in Arathi Highlands (2%) and Mith'rethis the Enchanter in The Hinterlands (1.2%)",0],"8596":["Dreamless Sleep Potion","alch",12190,1,[[8831,3],[8925,1]],230,0,"trainer",0,0,0,[],"",0],"9938":["Superior Mana Potion","alch",13443,1,[[8838,2],[8839,2],[8925,1]],260,0,"item",13477,12000,1,[["Ulthir","Darnassus","A",1],["Algernon","Undercity","H",1]],"",0],"9961":["Major Mana Potion","alch",13444,1,[[13463,3],[13467,2],[8925,1]],295,0,"item",13501,30000,0,[["Magnus Frostwake","Western Plaguelands","",0]],"",0],"12299":["Major Rejuvenation Potion","alch",18253,1,[[10286,1],[13464,4],[13463,4],[18256,1]],300,0,"item",18257,0,1,[],"Drops from Molten Core",0],"12893":["Greater Dreamless Sleep Potion","alch",20002,1,[[13463,2],[13464,1],[8925,1]],275,0,"item",20012,50000,0,[["Rin'wosho the Trader","Stranglethorn Vale","",0]],"You need to be Friendly with the Zandalar Tribe",0],"54197":["Lesser Discolored Healing Potion","alch",247239,1,[[3371,1],[2450,1],[730,1]],85,0,"trainer",0,0,0,[],"",0],"54198":["Discolored Healing Potion","alch",247240,1,[[3372,1],[2453,1],[730,1]],135,0,"trainer",0,0,0,[],"",0],"54199":["Greater Discolored Healing Potion","alch",247241,1,[[3372,1],[3356,1],[730,1]],175,0,"trainer",0,0,0,[],"",0],"54200":["Superior Discolored Healing Potion","alch",247242,1,[[8925,1],[8838,1],[730,1]],230,0,"trainer",0,0,0,[],"",0],"1383":["Swiftness Potion","alch",2459,1,[[2452,1],[2450,1],[3371,1]],60,0,"item",2555,0,1,[],"A world drop from monsters of level 5 to 25, and found in treasure chests",0],"1815":["Minor Magic Resistance Potion","alch",3384,1,[[785,3],[3355,1],[3371,1]],110,0,"item",3393,0,1,[],"A world drop from monsters; best odds from Hannah Bladeleaf in The Barrens (0.22%)",0],"1931":["Lesser Invisibility Potion","alch",3823,1,[[3818,1],[3355,1],[3372,1]],165,0,"trainer",0,0,0,[],"",0],"2909":["Lesser Stoneshield Potion","alch",4623,1,[[3858,1],[3821,1],[3372,1]],215,0,"item",4624,0,1,[],"A reward from the quest Liquid Stone",0],"4004":["Free Action Potion","alch",5634,1,[[6370,2],[3820,1],[3372,1]],150,0,"item",5642,1800,1,[["Kor'geld","Orgrimmar","H",1],["Ulthir","Darnassus","A",1],["Soolie Berryfizz","Ironforge","A",1]],"",0],"4006":["Great Rage Potion","alch",5633,1,[[5637,1],[3356,1],[3372,1]],175,0,"item",5643,2000,1,[["Hagrus","Orgrimmar","H",1],["Ulthir","Darnassus","A",1]],"",0],"4007":["Rage Potion","alch",5631,1,[[5635,1],[2450,1],[3371,1]],60,0,"item",5640,100,1,[["Defias Profiteer","Westfall","",1],["Xandar Goodbeard","Loch Modan","A",1],["Hagrus","Orgrimmar","H",1],["Ranik","The Barrens","",1]],"",0],"4210":["Frost Protection Potion","alch",6050,1,[[3819,1],[3821,1],[3372,1]],190,0,"item",6056,2000,0,[["Drovnar Strongbrew","Arathi Highlands","A",1],["Glyx Brewright","Stranglethorn Vale","",1]],"",0],"4211":["Holy Protection Potion","alch",6051,1,[[2453,1],[2452,1],[3371,1]],100,0,"item",6053,800,0,[["Xandar Goodbeard","Loch Modan","A",1],["Kzixx","Duskwood","",1],["Hula'mahi","The Barrens","H",1]],"",0],"4212":["Nature Protection Potion","alch",6052,1,[[3357,1],[3820,1],[3372,1]],190,0,"item",6057,2000,0,[["Glyx Brewright","Stranglethorn Vale","",1],["Alchemist Pestlezugg","Tanaris","",1],["Logannas","Feralas","A",1],["Bronk","Feralas","H",1]],"",0],"4213":["Shadow Protection Potion","alch",6048,1,[[3369,1],[3356,1],[3372,1]],135,0,"item",6054,900,0,[["Christoph Jeffcoat","Hillsbrad Foothills","H",1],["Harklan Moongrove","Ashenvale","A",1]],"",0],"4395":["Swim Speed Potion","alch",6372,1,[[2452,1],[6370,1],[3371,1]],100,0,"trainer",0,0,0,[],"",0],"5999":["Oil of Immolation","alch",8956,1,[[4625,1],[3821,1],[8925,1]],205,0,"trainer",0,0,0,[],"",0],"6001":["Restorative Potion","alch",9030,1,[[7067,1],[3821,1],[8925,1]],210,0,"trainer",0,0,0,[],"",0],"6002":["Magic Resistance Potion","alch",9036,1,[[3358,1],[8831,1],[8925,1]],210,0,"item",9293,0,1,[],"Drops from Brutus in Stranglethorn Vale (0.2%) and Anathemus in Badlands (0.18%), and found in treasure chests",0],"6010":["Invisibility Potion","alch",9172,1,[[8845,1],[8838,1],[8925,1]],235,0,"item",9295,0,1,[],"Drops from Lord Sakrasis in Stranglethorn Vale (0.38%) and Magister Hawkhelm in Azshara (0.36%), and found in treasure chests",0],"9937":["Mighty Rage Potion","alch",13442,1,[[8846,3],[8925,1]],255,0,"item",13476,0,1,[],"Drops from Blackrock Slayers in Burning Steppes (3.8%)",0],"9953":["Purification Potion","alch",13462,1,[[13467,2],[13466,2],[8925,1]],285,0,"item",13492,0,1,[],"Drops from Lethlas in Feralas (0.62%) and Rak'shiri in Winterspring (0.24%), and found in treasure chests",0],"9955":["Greater Fire Protection Potion","alch",13457,1,[[7068,1],[13463,1],[8925,1]],290,0,"item",13494,0,1,[],"Drops from Firebrand Invokers and Pyromancers in Blackrock Spire (4.2%)",0],"9956":["Greater Frost Protection Potion","alch",13456,1,[[7070,1],[13463,1],[8925,1]],290,0,"item",13495,0,1,[],"Drops from Frostmaul Giants in Winterspring (4%)",0],"9957":["Greater Nature Protection Potion","alch",13458,1,[[7067,1],[13463,1],[8925,1]],290,0,"item",13496,0,1,[],"Drops from Rotting Behemoths (1.9%) and Decaying Horrors (0.98%) in Western Plaguelands",0],"9958":["Greater Arcane Protection Potion","alch",13461,1,[[11176,1],[13463,1],[8925,1]],290,0,"item",13497,0,1,[],"Drops from Cobalt Mageweavers in Winterspring (3.5%)",0],"9959":["Greater Shadow Protection Potion","alch",13459,1,[[3824,1],[13463,1],[8925,1]],290,0,"item",13499,0,1,[],"Drops from monsters in Eastern Plaguelands",0],"9960":["Greater Holy Protection Potion","alch",13460,1,[[7069,1],[13463,1],[8925,1]],290,0,"item",13500,0,1,[],"Drops from the Scarlet Alchemist in the Scarlet Enclave",0],"11316":["Limited Invulnerability Potion","alch",3387,1,[[8839,2],[8845,1],[8925,1]],250,0,"item",3395,0,1,[],"Drops from Witherheart the Stalker in The Hinterlands (0.46%) and Ravasaur Matriarchs in Un'Goro Crater (0.28%), and found in treasure chests",0],"12894":["Living Action Potion","alch",20008,1,[[13467,2],[13465,2],[10286,2],[8925,1]],285,0,"item",20013,50000,0,[["Rin'wosho the Trader","Stranglethorn Vale","",0]],"You need to be Exalted with the Zandalar Tribe",0],"54655":["Minor Spellblasting Potion","alch",250932,1,[[765,1],[2447,1],[3371,1]],35,0,"item",250976,0,1,[],"Drops from Kobold Geomancer in Elwynn Forest",0],"54656":["Lesser Spellblasting Potion","alch",250933,1,[[785,1],[765,2],[3371,1]],85,0,"item",250977,0,1,[],"Drops from Witchwing Windcaller in The Barrens",0],"54657":["Spellblasting Potion","alch",250934,1,[[3355,1],[3369,1],[3371,1]],135,0,"item",250978,0,0,[["Apothecary Durelle","The Barrens","H",0],["Nina Surefire","Redridge Mountains","A",0]],"",[45,""]],"54658":["Greater Spellblasting Potion","alch",250935,1,[[3356,2],[3818,1],[3372,1]],185,0,"item",250979,0,0,[["Gorhak","Desolace","H",0]],"",0],"54659":["Superior Spellblasting Potion","alch",250936,1,[[3819,2],[3358,2],[3372,1]],235,0,"item",250980,0,1,[],"",0],"54660":["Major Spellblasting Potion","alch",250937,1,[[13463,2],[13465,1],[18256,1]],285,0,"item",250981,0,0,[["Apothecary Durelle","The Barrens","H",0],["Nina Surefire","Redridge Mountains","A",0]],"",[180,"Honored"]],"54661":["Minor Frenzy Potion","alch",250938,1,[[2449,1],[765,1],[3371,1]],40,0,"item",250982,0,1,[],"Drops from Windfury Wind Witch in Mulgore (0.07%) and Bloodfeather Harpy in Teldrassil (0.03%)",0],"54662":["Lesser Frenzy Potion","alch",250939,1,[[2450,1],[2449,2],[3371,1]],90,0,"item",250983,0,1,[],"Drops from Raging Rot Hide in Silverpine Forest",0],"54663":["Frenzy Potion","alch",250940,1,[[3818,2],[2450,2],[3372,1]],140,0,"item",250984,0,0,[["Apothecary Durelle","The Barrens","H",0],["Nina Surefire","Redridge Mountains","A",0]],"",[45,""]],"54664":["Greater Frenzy Potion","alch",250941,1,[[4625,3],[3818,2],[3372,1]],190,0,"item",250985,0,0,[["Gorhak","Desolace","H",0]],"",0],"54665":["Superior Frenzy Potion","alch",250942,1,[[8839,3],[4625,2],[8925,1]],240,0,"item",250986,0,1,[],"",0],"54666":["Major Frenzy Potion","alch",250943,1,[[13466,3],[8839,2],[18256,1]],290,0,"item",250987,0,0,[["Apothecary Durelle","The Barrens","H",0],["Nina Surefire","Redridge Mountains","A",0]],"",[240,"Honored"]],"54667":["Minor Mender's Potion","alch",250944,1,[[785,2],[2453,1],[3371,1]],30,0,"item",250988,0,1,[],"Drops from Gnarlpine Mystic in Teldrassil",0],"54668":["Lesser Mender's Potion","alch",250945,1,[[3356,2],[3357,2],[3372,1]],80,0,"item",250989,0,1,[],"Drops from Theramore Preserver in The Barrens (0.02%) and Stormscale Siren in Darkshore (0.01%)",0],"54669":["Mender's Potion","alch",250946,1,[[3819,2],[4625,2],[3372,1]],130,0,"item",250990,0,0,[["Apothecary Durelle","The Barrens","H",0],["Nina Surefire","Redridge Mountains","A",0]],"",[45,""]],"54670":["Greater Mender's Potion","alch",250947,1,[[8836,2],[8831,1],[8925,1]],180,0,"item",250991,0,0,[],"",0],"54671":["Superior Mender's Potion","alch",250948,1,[[8838,2],[8836,1],[8925,1]],230,0,"item",250992,0,1,[],"",0],"54672":["Major Mender's Potion","alch",250949,1,[[13463,3],[8838,1],[18256,1]],280,0,"item",250993,0,0,[["Apothecary Durelle","The Barrens","H",0],["Nina Surefire","Redridge Mountains","A",0]],"",[180,"Honored"]],"54673":["Potion of Venomous Blood","alch",250950,1,[[8846,3],[13466,2],[8925,1]],275,0,"item",250994,0,0,[["Apothecary Durelle","The Barrens","H",0],["Nina Surefire","Redridge Mountains","A",0]],"",[180,"Honored"]],"54674":["Caustic Smog Potion","alch",250951,1,[[8845,2],[3369,2],[8925,1]],265,0,"item",250995,0,0,[["Apothecary Durelle","The Barrens","H",0],["Nina Surefire","Redridge Mountains","A",0]],"",[180,"Honored"]],"54676":["Dragonfire Potion","alch",250953,1,[[13465,2],[4625,2],[8925,1]],245,0,"item",250997,0,0,[["Apothecary Durelle","The Barrens","H",0],["Nina Surefire","Redridge Mountains","A",0]],"",[120,"Friendly"]],"54677":["Potion of Elemental Purging","alch",250954,1,[[4625,2],[3819,2],[8925,1]],280,0,"item",250998,0,0,[["Apothecary Durelle","The Barrens","H",0],["Nina Surefire","Redridge Mountains","A",0]],"",[180,"Honored"]],"54678":["Potion of Beast Slaying","alch",250955,1,[[8846,2],[13466,2],[18256,1]],280,0,"item",250999,0,0,[],"",0],"1936":["Draught of Detect Lesser Invisibility","alch",3828,1,[[3358,1],[3818,1],[3372,1]],195,0,"item",3832,0,1,[],"Drops from Witherbark Berserkers in Arathi Highlands (0.14%) and Silithid Ravagers in Thousand Needles (0.11%), and found in treasure chests",0],"4176":["Draught of Water Breathing","alch",5996,1,[[3820,1],[6370,2],[3371,1]],90,0,"trainer",0,0,0,[],"",0],"5996":["Draught of Water Walking","alch",8827,1,[[6370,1],[3357,1],[3372,1]],175,0,"trainer",0,0,0,[],"",0],"6008":["Draught of Detect Undead","alch",9154,1,[[8836,1],[8925,1]],230,0,"trainer",0,0,0,[],"",0],"6014":["Draught of Dream Vision","alch",9197,1,[[8831,3],[8925,1]],240,0,"item",9297,0,1,[],"Drops from Makrinni Snapclaws and Blood Elf Reclaimers in Azshara (0.03%), and found in treasure chests",0],"6019":["Draught of Detect Demon","alch",9233,1,[[8846,2],[8925,1]],250,0,"trainer",0,0,0,[],"",0],"6848":["Catseye Draught","alch",10592,1,[[3821,1],[3818,1],[3372,1]],200,0,"trainer",0,0,0,[],"",0],"12322":["Draught of Greater Water Breathing","alch",18294,1,[[7972,1],[8831,2],[8925,1]],215,0,"trainer",0,0,0,[],"",0],"54534":["Potion of Predatory Senses","alch",250327,1,[[3818,2],[3821,2],[3372,1]],195,0,"item",250363,0,1,[],"",0],"1932":["Shadow Oil","alch",3824,2,[[3818,4],[3369,4],[3372,1]],165,0,"item",6068,1500,0,[["Bliztik","Duskwood","",1],["Montarr","Thousand Needles","H",1]],"",0],"1937":["Frost Oil","alch",3829,2,[[3358,4],[3819,2],[3372,1]],200,0,"item",14634,2500,0,[["Bro'kin","Alterac Mountains","",1]],"",0],"6016":["Ghost Dye","alch",9210,2,[[8845,2],[4342,1],[8925,1]],245,0,"item",9302,9000,0,[["Logannas","Feralas","A",1],["Bronk","Feralas","H",1]],"",0],"54453":["Cerulean Dye","alch",249409,1,[[249399,2],[3371,1]],50,0,"trainer",0,0,0,[],"",0],"54454":["Magenta Dye","alch",249430,1,[[249424,2],[3372,1]],130,0,"trainer",0,0,0,[],"",0],"54455":["Viridian Dye","alch",249431,1,[[249274,2],[8925,1]],230,0,"trainer",0,0,0,[],"",0],"9977":["Flask of Petrification","alch",13506,1,[[13423,30],[13465,10],[13468,1],[8925,1]],300,0,"item",13518,0,1,[],"Drops from Frostmaul Giants in Winterspring (0.1%), and found in treasure chests",0],"9978":["Flask of the Titans","alch",13510,1,[[8846,30],[13423,10],[13468,1],[8925,1]],300,0,"item",13519,0,1,[],"Drops from General Drakkisath in Blackrock Spire (3%)",0],"9979":["Flask of Distilled Wisdom","alch",13511,1,[[13463,30],[13467,10],[13468,1],[8925,1]],300,0,"item",13520,40000,1,[["Pix Xizzix","Stranglethorn Vale","",0]],"",0],"9980":["Flask of Supreme Power","alch",13512,1,[[13463,30],[13465,10],[13468,1],[8925,1]],300,0,"item",13521,0,1,[],"Drops from Ras Frostwhisper in Scholomance (4%)",0],"9981":["Flask of Chromatic Resistance","alch",13513,1,[[13467,30],[13465,10],[13468,1],[8925,1]],300,0,"item",13522,40000,1,[["Pix Xizzix","Stranglethorn Vale","",0]],"",0],"58410":["Flask of Natural Accuracy","alch",274273,1,[[248822,1],[248821,12],[13464,9],[18256,1]],300,0,"item",274277,0,0,[],"",0],"58411":["Flask of Natural Aggression","alch",274274,1,[[248822,1],[248821,18],[13465,6],[18256,1]],300,0,"item",274278,0,0,[],"",0],"58412":["Flask of Natural Precision","alch",274275,1,[[248822,1],[248823,12],[13463,9],[18256,1]],300,0,"item",274279,0,0,[],"",0],"58413":["Flask of Natural Swiftness","alch",274276,1,[[248822,1],[248823,18],[13467,6],[18256,1]],300,0,"item",274280,0,0,[],"",0],"52646":["Mana Well","alch",279956,1,[[2447,1],[3371,1]],20,0,"trainer",0,0,0,[],"",0],"57006":["Fermenter","alch",279970,1,[[3372,1],[3356,1],[2452,1]],140,0,"item",273085,1500,1,[["Happy Camper","Dun Morogh","",0]],"",0],"54191":["Minor Healing Potion","fa",118,1,[[3371,1],[2678,1],[2447,1]],1,0,"trainer",0,0,0,[],"",0],"54192":["Lesser Healing Potion","fa",858,1,[[3371,1],[2678,2],[2450,1]],55,0,"trainer",0,0,0,[],"",0],"54193":["Healing Potion","fa",929,1,[[3372,1],[2692,1],[2453,1]],110,0,"trainer",0,0,0,[],"",0],"54194":["Greater Healing Potion","fa",1710,1,[[3372,1],[2692,3],[3357,1]],155,0,"item",255723,0,1,[],"",0],"54195":["Superior Healing Potion","fa",3928,1,[[8925,1],[3713,1],[8838,1]],215,0,"item",255725,0,1,[],"",0],"54196":["Major Healing Potion","fa",13446,1,[[8925,1],[3713,3],[13464,1]],275,0,"item",255729,80000,1,[["Pexmit","Mount Hyjal","",0]],"",0],"6004":["Goblin Rocket Fuel","alch",9061,2,[[4625,1],[9260,1],[3372,1]],210,0,"item",10644,0,1,[],"Engineers craft this recipe, so look for it on the Auction House",0]};

  /* Hand-written recipes for the other professions' price lists, plus every route recipe, so costs can fall back to crafting. */
  [[2840, [[2770, 1]]], [3576, [[2771, 1]]], [2841, [[2840, 1], [3576, 1]], 2], [2842, [[2775, 1]]], [3575, [[2772, 1]]], [2862, [[2835, 1]]],
    [2304, [[2318, 1]]], [2313, [[2319, 4], [2320, 1]]], [4231, [[783, 1], [4289, 1]]], [2997, [[2592, 3]]], [4238, [[2996, 3], [2320, 3]]],
    [4357, [[2835, 1]]], [4359, [[2840, 1]]], [4361, [[2840, 2], [2880, 1]]], [4364, [[2836, 1]]], [4371, [[2841, 2], [2880, 1]]],
    [10939, [[10938, 3]]], [11082, [[10998, 3]]]].forEach(function (c) { if (!CR[c[0]]) CR[c[0]] = { r: c[1], y: c[2] || 1 }; });
  Object.keys(RCP).forEach(function (rid) { var r = RCP[rid]; if (r[1] && !CR[r[1]]) CR[r[1]] = { r: r[3], y: r[2] || 1 }; });
  if (!CR[2318]) CR[2318] = { r: [[2934, 3]], y: 1 };
  var PROFS = [
    { k: 'alch', name: 'Herbalism and Alchemy',
      mats: ['Herbs, by the skill to pick them', 2447, 765, 2449, 785, 2450, 2452, 3820, 2453, 3355, 3369, 3356, 3357, 3818, 3821, 3358, 3819, 4625, 8831, 8836, 8838,
        8839, 8845, 8846, 13464, 13463, 13465, 13466, 13467, 13468,
        'Bonus finds while picking herbs', 249399, 249424, 249274, 268415, 268416, 268417, 268418,
        'Forever’s new endgame herbs', 248823, 248821, 248822,
        'Other materials', 8153, 730, 6359, 6371, 6370, 3371, 3372, 8925, 18256],
      crafts: [247754, 247755, 5997, 2454, 3382, 2455, 2456, 2458, 2457, 4596, 2459, 3383, 3385, 247239, 3390, 6371, 6373, 3827, 3825, 8951, 6052, 6149] },
    { k: 'fa', name: 'First Aid',
      mats: [2589, 2592, 4306, 4338, 14047, 2447, 2450, 2453, 3357, 2678, 2692, 3713, 3371, 3372, 8925],
      crafts: [1251, 2581, 3530, 3531, 6450, 6451, 8544, 8545, 14529, 14530, 118, 858, 929, 1710] },
    { k: 'mine', name: 'Mining and Blacksmithing', mats: [2770, 2771, 2775, 2772, 2835, 2836], crafts: [2840, 3576, 2841, 2842, 3575, 2862] },
    { k: 'lw', name: 'Skinning and Leatherworking', mats: [2934, 2318, 783, 2319, 4232, 4289, 2320], crafts: [2318, 2304, 2313, 4231] },
    { k: 'tail', name: 'Tailoring', mats: [2589, 2592, 4306, 2320], crafts: [2996, 2997, 4238] },
    { k: 'eng', name: 'Engineering', mats: [2835, 2836, 2840, 2841, 2880], crafts: [4357, 4359, 4361, 4364, 4371] },
    { k: 'ench', name: 'Enchanting', mats: [10940, 10938, 10978, 10998, 247786, 11083], crafts: [10939, 11082] }
  ];
  /* Herbalism skill each herb needs. Swiftthistle comes as a bonus from Mageroyal and Briarthorn. */
  var HERB = { 2447: 1, 765: 1, 2449: 15, 785: 50, 2450: 70, 2452: 50, 3820: 85, 2453: 100, 3355: 115, 3369: 120, 3356: 125, 3357: 150,
    3818: 160, 3821: 170, 3358: 185, 3819: 195, 4625: 205, 8831: 210, 8836: 220, 8838: 230, 8839: 235, 8845: 245, 8846: 250,
    13464: 260, 13463: 270, 13465: 280, 13466: 285, 13467: 290, 13468: 300 };
  var RANKS = [[75, 'Journeyman', 50, 10], [150, 'Expert', 125, 20], [225, 'Artisan', 200, 35]];
  var RANKS2 = [[75, 'Journeyman', 50, 10], [150, 'Expert', 125, 0], [225, 'Artisan', 225, 35]];  /* First Aid and Cooking */
  var SKORDER = ['alch', 'fa', 'cook', 'bs', 'lw', 'tail', 'eng', 'ench'];

  /* ---------- State ---------- */
  var statusEl = $('#mk-status'), alertList = $('#mk-alert-list'), profSel = $('#mk-prof');
  var chartEl = $('#mk-chart'), tipEl = $('#mk-tip'), titleEl = $('#mk-chart-title'), matsEl = $('#mk-mats'), craftsEl = $('#mk-crafts');
  var watchEl = $('#mk-watch'), watchNote = $('#mk-watch-note');
  var days = [], loaded = false, DBH = null, CH = null, WATCH = {}, readOnly = false, saving = false, again = false;
  var KNOWN = {}, KNOWNR = {};
  var prof = store.get('wowf-mkprof', 'alch');
  if (!PROFS.some(function (p) { return p.k === prof; })) prof = 'alch';
  /* Items on the price chart, in the order they were added. Each keeps its colour slot while it stays on, so colours follow items. */
  var MAXS = 6, chartIds = [], chartSlot = {};
  function freeSlot() {
    var used = chartIds.map(function (id) { return chartSlot[id]; }), first = -1, CLASH = { '1-3': 1, '1-4': 1, '1-5': 1, '2-4': 1, '2-5': 1, '3-5': 1 }; for (var s = 0; s < MAXS; s++) { if (used.indexOf(s) >= 0) continue; if (first < 0) first = s; if (!used.some(function (u) { return CLASH[Math.min(u, s) + '-' + Math.max(u, s)]; })) return s; } if (first >= 0) return first;
    return 0;
  }
  (function () {
    var v = store.get('wowf-mkchart', null);
    if (v && Array.isArray(v.ids)) v.ids.forEach(function (id) {
      id = +id;
      if (!NAMES[id] || chartIds.indexOf(id) >= 0 || chartIds.length >= MAXS) return;
      var s = v.slots ? +v.slots[id] : NaN;
      chartIds.push(id);
      chartSlot[id] = s >= 0 && s < MAXS && !chartIds.some(function (o) { return o !== id && chartSlot[o] === s; }) ? s : freeSlot();
    });
    if (!chartIds.length) { var old = +store.get('wowf-mksel', 2447); old = NAMES[old] ? old : 2447; chartIds.push(old); chartSlot[old] = 0; }
  })();
  function onChart(id) { return chartIds.indexOf(id) >= 0; }
  function saveChart() { store.set('wowf-mkchart', { ids: chartIds, slots: chartSlot }); }
  function addToChart(id) {
    if (onChart(id)) return;
    if (chartIds.length >= MAXS) { var gone = chartIds.shift(); delete chartSlot[gone]; }
    chartIds.push(id); chartSlot[id] = freeSlot(); saveChart();
  }
  function dropFromChart(id) {
    if (!onChart(id) || chartIds.length < 2) return false;
    chartIds.splice(chartIds.indexOf(id), 1); delete chartSlot[id]; saveChart();
    return true;
  }
  var skprof = store.get('wowf-skprof', 'alch');
  if (!ROUTES[skprof]) skprof = 'alch';
  var dayFmt, stampFmt;
  try { dayFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }); }
  catch (e) { dayFmt = { format: function (d) { return d.toDateString(); } }; }
  try { stampFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true }); }
  catch (e) { stampFmt = { format: function (d) { return d.toLocaleString(); } }; }

  function P() { for (var i = 0; i < PROFS.length; i++) if (PROFS[i].k === prof) return PROFS[i]; return PROFS[0]; }
  function nm(id) { return NAMES[id] || ('Item ' + id); }
  function money(c) {
    if (c == null || !isFinite(c)) return '—';
    c = Math.round(c);
    var neg = c < 0; c = Math.abs(c);
    var g = Math.floor(c / 10000), s = Math.floor((c % 10000) / 100), cp = c % 100, out = [];
    if (g) out.push(g.toLocaleString('en-GB') + 'g');
    if (s) out.push(s + 's');
    if (cp || !out.length) out.push(cp + 'c');
    return (neg ? '−' : '') + out.slice(0, 2).join(' ');
  }
  /* "1g 2s 3c", "2s50c", "2.5s", "75c"; a bare number is read as silver. */
  function parseMoney(t) {
    t = String(t || '').trim().toLowerCase().replace(/,/g, '');
    if (!t) return 0;
    if (/^[0-9]+(\.[0-9]+)?$/.test(t)) return Math.round(parseFloat(t) * 100);
    var re = /([0-9]+(?:\.[0-9]+)?)\s*([gsc])/g, m, tot = 0, used = '';
    while ((m = re.exec(t))) { tot += parseFloat(m[1]) * (m[2] === 'g' ? 10000 : m[2] === 's' ? 100 : 1); used += m[0]; }
    if (!used || t.replace(/\s+/g, '') !== used.replace(/\s+/g, '')) return null;
    return Math.round(tot);
  }
  function pct(v) { var r = Math.round(Math.abs(v) * 100); return r ? (v >= 0 ? '+' : '−') + r + '%' : '0%'; }
  function dayLabel(d) { return dayFmt.format(new Date(d + 'T12:00:00Z')); }
  function num(v) { if (v === null || v === undefined || v === '' || typeof v === 'boolean') return null; v = Number(v); return isFinite(v) && v >= 0 ? v : null; }
  function stamp(v) { var t = typeof v === 'number' ? v : Date.parse(v); return isFinite(t) ? stampFmt.format(new Date(t)) : ''; }
  function point(day, id) {
    var v = day && day.m ? day.m[id] : null;
    if (!Array.isArray(v) || num(v[1]) == null) return null;
    var p = { min: num(v[0]), med: num(v[1]), qty: num(v[2]), p20: v.length > 3 ? num(v[3]) : null, nmin: v.length > 4 ? num(v[4]) : null };
    /* The price is what the cheapest 20 cost each: about what a small stack costs, and the price you'd match to sell.
       Not the median of everything listed, which big stacks posted far above the market drag up without selling. */
    p.price = p.p20 != null && !(p.med != null && p.p20 > p.med * 3) ? p.p20 : (p.min != null ? p.min : p.med);
    return p;
  }
  var DAYX = null;  /* set for a moment to price an earlier day, for the trend lines */
  function latest() { return DAYX || (days.length ? days[days.length - 1] : null); }
  function now(id) { return point(latest(), id); }
  function median(a) {
    a = a.slice().sort(function (x, y) { return x - y; });
    var n = a.length;
    return n ? (n % 2 ? a[(n - 1) / 2] : (a[n / 2 - 1] + a[n / 2]) / 2) : null;
  }
  function usual(id) {
    var src = latest() ? latest().src : '';
    var prev = days.slice(0, days.length - 1).filter(function (d) { return d.src === src; }).slice(-7)
      .map(function (d) { var p = point(d, id); return p ? p.price : null; })
      .filter(function (v) { return v != null; });
    return prev.length >= 3 ? median(prev) : null;
  }
  function change(id) {
    var n = now(id), u = usual(id);
    if (!n || u == null || u <= 0) return null;
    return { pct: (n.price - u) / u, diff: n.price - u, base: u };
  }
  /* What a small stack costs, and roughly what you'd match to sell: the average of the cheapest 20 listed. */
  function floorP(id) {
    var n = now(id);
    if (!n) return null;
    return n.price;
  }
  function sellNet(id) { var f = floorP(id); return f == null ? null : f * 0.95; }
  /* Fewer than 20 listed: too thin to price a shopping list on. */
  function thin(id) { var n = now(id); return !n || (n.qty || 0) < 20; }
  var STRICT = false;
  function buyCost(id) {
    var v = VBUY[id], f = floorP(id);
    if (STRICT && thin(id)) f = null;
    if (v != null) return f != null ? Math.min(v, f) : v;
    return f;
  }
  /* The better of the Auction House (after its 5% cut) and a vendor, for something you made. */
  function bestOut(id) { var s = sellNet(id), v = SELL[id] || 0; return s == null ? (v || null) : Math.max(s, v); }
  function craftCost(id, depth) {
    var c = CR[id];
    if (!c || depth > 2) return null;
    var tot = 0, miss = false;
    c.r.forEach(function (r) { var u = unitCost(r[0], depth + 1); if (u == null) miss = true; else tot += u * r[1]; });
    return miss ? null : tot / (c.y || 1);
  }
  function unitCost(id, depth) {
    var b = buyCost(id), m = depth ? craftCost(id, depth || 0) : null;
    if (m != null && (b == null || m < b)) return m;
    return b;
  }
  function craftEval(id) {
    var c = CR[id], out = bestOut(id);
    if (!c) return null;
    var cost = 0, miss = false;
    c.r.forEach(function (r) { var u = GATHER[r[0]] ? (now(r[0]) ? bestOut(r[0]) : null) : unitCost(r[0], 1); if (u == null) miss = true; else cost += Math.round(u * r[1]); });
    if (out == null || miss) return null;
    var value = Math.round(out * c.y);
    return { value: value, cost: cost, diff: value - cost, vendor: (SELL[id] || 0) > (sellNet(id) || 0) };
  }
  function knows(id) { return !!KNOWN[id]; }
  function profOf(id) {
    for (var i = 0; i < PROFS.length; i++) if (PROFS[i].crafts.indexOf(id) >= 0) return PROFS[i];
    return null;
  }
  /* Best use of one unit of a material, among the crafts in the chosen profession. */
  /* Candidate crafts for a material: the profession's price list, plus every recipe in the Gold tab's craft list. */
  var RXOUT = { alch: [], fa: [] };
  Object.keys(RX).forEach(function (rid) { var r = RX[rid]; if (RXOUT[r[1]] && RXOUT[r[1]].indexOf(r[2]) < 0) RXOUT[r[1]].push(r[2]); });
  function craftCands() {
    var c = P().crafts.slice();
    (RXOUT[prof] || []).forEach(function (o) { if (c.indexOf(o) < 0) c.push(o); });
    return c;
  }
  function bestCraft(id, onlyKnown) {
    var best = null;
    craftCands().forEach(function (cid) {
      var c = CR[cid]; if (!c || cid === id || (onlyKnown && !knows(cid))) return;
      var cnt = 0, other = 0, miss = false;
      c.r.forEach(function (r) { if (r[0] === id) cnt += r[1]; else { var u = unitCost(r[0], 1); if (u == null) miss = true; else other += u * r[1]; } });
      var out = bestOut(cid);
      if (!cnt || miss || out == null) return;
      var per = (out * c.y - other) / cnt;
      if (!best || per > best.per) best = { per: per, item: cid };
    });
    return best;
  }
  function verdict(id) {
    if (VBUY[id] != null) {
      var f = floorP(id);
      return f != null && f < VBUY[id] ? { act: 'ahbuy', v: f } : { act: 'vendorbuy', v: VBUY[id] };
    }
    var inMats = P().mats.indexOf(id) >= 0, mine = !!CH && (prof === 'alch' || prof === 'fa');
    var s = sellNet(id), v = SELL[id] || 0, c = inMats ? bestCraft(id, mine) : null, any = inMats && mine ? bestCraft(id, false) : null, opts = [];
    if (s != null) opts.push({ act: 'sell', v: s });
    if (v > 0 && s != null) opts.push({ act: 'vendor', v: v });  /* only when the Auction House price is known */
    if (c && c.per > 0) opts.push({ act: 'craft', v: c.per, item: c.item });
    if (!opts.length) return null;
    opts.sort(function (a, b) { return b.v - a.v; });
    var top = opts[0];
    if (top.act === 'craft' && s != null && top.v - s < Math.max(2, s * 0.1)) top = { act: 'sell', v: s };
    if (any && any.per > top.v + Math.max(2, top.v * 0.1) && (top.act !== 'craft' || top.item !== any.item)) top.better = any;
    return top;
  }
  /* The best thing to do with an item, as a coloured label (with its word, so colour is never the only cue) and a short reason. */
  var VERB = { sell: ['Sell', 'ok'], craft: ['Craft', 'blue'], vendor: ['Vendor', 'gold'], vendorbuy: ['Buy at a vendor', ''], ahbuy: ['Buy on the AH', 'ok'] };
  function verdictHtml(id) {
    var vd = verdict(id);
    if (!vd) return '';
    var txt;
    if (vd.act === 'vendorbuy') txt = 'a vendor sells it for ' + money(vd.v);
    else if (vd.act === 'ahbuy') txt = 'cheaper here than at a vendor today (' + money(vd.v) + ')';
    else if (vd.act === 'vendor') txt = 'a vendor pays ' + money(vd.v) + ', more than the Auction House';
    else if (vd.act === 'sell') txt = money(vd.v) + ' each after the cut';
    else txt = 'into ' + nm(vd.item) + ', worth ' + money(vd.v) + ' per ' + nm(id);
    if (vd.better) txt += '. ' + nm(vd.better.item) + ' would make it worth ' + money(vd.better.per) + ' once you learn it';
    return '<span class="chip mk-verdict ' + VERB[vd.act][1] + '">' + VERB[vd.act][0] + '</span> ' + esc(txt);
  }
  function tracked() { return Object.keys(NAMES).map(Number).filter(function (id) { return now(id); }); }

  /* ---------- Trend lines: up to two weeks as a small line, with the latest point marked ---------- */
  var SPARK_N = 14;
  function trendDays() { var src = days.length ? days[days.length - 1].src : ''; return days.slice(-SPARK_N).filter(function (d) { return d.src === src; }); }
  function atDay(d, fn) { var was = DAYX; DAYX = d; try { return fn(); } finally { DAYX = was; } }
  function priceSeries(id) {
    var out = [];
    trendDays().forEach(function (d) { var p = point(d, id); if (p && p.price != null) out.push({ d: d.d, v: p.price }); });
    return out;
  }
  function evalSeries(fn) {
    var out = [];
    trendDays().forEach(function (d) { var v = atDay(d, fn); if (v != null && isFinite(v)) out.push({ d: d.d, v: v }); });
    return out;
  }
  function sparkSvg(s, what) {
    if (!s || s.length < 2) return '';
    var W = 56, H = 18, pad = 2.5, lo = Infinity, hi = -Infinity;
    s.forEach(function (p) { if (p.v < lo) lo = p.v; if (p.v > hi) hi = p.v; });
    var t0 = Date.parse(s[0].d + 'T12:00:00Z'), t1 = Date.parse(s[s.length - 1].d + 'T12:00:00Z');
    var X = function (d) { return pad + (t1 > t0 ? (Date.parse(d + 'T12:00:00Z') - t0) / (t1 - t0) : 1) * (W - 2 * pad); };
    var Y = function (v) { return hi > lo ? pad + (1 - (v - lo) / (hi - lo)) * (H - 2 * pad) : H / 2; };
    var last = s[s.length - 1], g = '';
    if (lo < 0 && hi > 0) g += '<line class="z" x1="0" x2="' + W + '" y1="' + Y(0).toFixed(1) + '" y2="' + Y(0).toFixed(1) + '"/>';
    g += '<path d="' + s.map(function (p, i) { return (i ? 'L' : 'M') + X(p.d).toFixed(1) + ' ' + Y(p.v).toFixed(1); }).join('') + '"/>';
    g += '<circle cx="' + X(last.d).toFixed(1) + '" cy="' + Y(last.v).toFixed(1) + '" r="2.4"/>';
    var lab = what + ' since ' + dayLabel(s[0].d) + ': ' + money(s[0].v) + ', now ' + money(last.v) + (hi > lo ? ' (low ' + money(lo) + ', high ' + money(hi) + ')' : ', no change');
    return '<svg class="spark" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="' + esc(lab) + '"><title>' + esc(lab) + '</title>' + g + '</svg>';
  }
  function spark(id) { return sparkSvg(priceSeries(id), nm(id)); }

  /* ---------- Under-priced listings: a cheapest listing far below that item's usual cheapest ---------- */
  function prevDays() { var src = latest() ? latest().src : ''; return days.slice(0, days.length - 1).filter(function (d) { return d.src === src; }).slice(-7); }
  function usualOf(id, k) {
    var prev = prevDays().map(function (d) { var p = point(d, id); return p && p[k] != null && (p.qty || 0) >= 10 ? p[k] : null; })
      .filter(function (v) { return v != null; });
    return prev.length >= 3 ? median(prev) : null;
  }
  function dealsStarted() { return prevDays().length >= 3; }
  function deals() {
    var d = latest();
    if (!d || d.src !== 'blizzard' || !dealsStarted()) return [];
    var out = [];
    tracked().forEach(function (id) {
      var n = now(id), u = usualOf(id, 'min'), um = usualOf(id, 'med');
      if (!n || n.min == null || !u || n.min > u * 0.6) return;
      if (um && n.med != null && n.med < um * 0.8) return;  /* the whole market fell, not just a few listings */
      if (VBUY[id] != null && VBUY[id] <= n.min) return;  /* a vendor sells it for that anyway */
      var vend = (SELL[id] || 0) > u * 0.95, gain = Math.max(u * 0.95, SELL[id] || 0) - n.min, units = n.nmin || 1, take = Math.min(units, 20);
      if (gain < 3 || gain * take < 100) return;
      out.push({ id: id, n: n, u: u, gain: gain, units: units, tot: gain * take, vend: vend });
    });
    return out.sort(function (a, b) { return b.tot - a.tot; });
  }

  /* ---------- How fast things sell: one-hour samples, about 4am and 6pm UK time ---------- */
  var SPD = [];
  function rate(id) {
    if (SPD.length < 2) return null;
    var units = 0, mins = 0;
    SPD.forEach(function (x) { units += num(x.u[id]) || 0; mins += x.w; });
    if (!mins) return null;
    var perDay = units / mins * 1440, n = now(id);
    return { perDay: perDay, units: units, hours: mins / 60, n: SPD.length, supply: perDay > 0 && n && n.qty != null ? n.qty / perDay : null };
  }
  function roundish(v) { return (v >= 100 ? Math.round(v / 10) * 10 : Math.max(1, Math.round(v))).toLocaleString('en-GB'); }
  function rateText(id) {
    var r = rate(id);
    if (!r) return '';
    if (!r.units) return 'no sales seen in ' + Math.round(r.hours) + ' hours of samples';
    var t = r.perDay >= 1 ? 'sells about ' + roundish(r.perDay) + ' a day' : 'sells about one every ' + Math.max(2, Math.round(1 / r.perDay)) + ' days';
    if (r.supply != null) t += r.supply > 30 ? ', over a month’s worth listed' : r.supply >= 1.5 ? ', ' + Math.round(r.supply) + ' days’ worth listed' : ', about a day’s worth listed';
    return t;
  }

  /* ---------- Alerts (the same rules as the scheduled refresh) ---------- */
  function alertFor(id) {
    var n = now(id); if (!n) return null;
    var w = WATCH[id], c = change(id), out = null;
    if (c) {
      var big = Math.abs(c.pct) >= (w ? 0.2 : 0.4) && Math.abs(c.diff) >= (w ? 10 : 25) && (n.qty || 0) >= (w ? 5 : 10);
      if (big) out = { kind: 'move', c: c, n: n };
    }
    if (w && n.min != null) {
      if (w.lo > 0 && n.min <= w.lo) out = { kind: 'lo', v: w.lo, n: n };
      else if (w.hi > 0 && n.min >= w.hi) out = { kind: 'hi', v: w.hi, n: n };
    }
    return out;
  }

  /* ---------- Your character (top of the Build tab) ---------- */
  /* The level and faction at the top of the page lead every tab; your synced character fills in if they can't be read. */
  function charLevel() {
    var el = document.getElementById('char-lvl'), v = el ? Math.round(+el.value) : 0;
    if (v >= 1 && v <= 60) return v;
    return CH && CH.level >= 1 ? CH.level : 1;
  }
  function charFaction() {
    var el = document.getElementById('char-fac');
    if (el && (el.value === 'Alliance' || el.value === 'Horde')) return el.value;
    return CH && CH.faction === 'Alliance' ? 'Alliance' : 'Horde';
  }
  function profSkill(name) {
    if (!CH || !Array.isArray(CH.profs)) return null;
    for (var i = 0; i < CH.profs.length; i++) if (CH.profs[i][0] === name) return { sk: CH.profs[i][1], max: CH.profs[i][2] };
    return null;
  }
  function rankHint(p, lvl, name) {
    var R = name === 'First Aid' || name === 'Cooking' ? RANKS2 : RANKS;
    for (var i = 0; i < R.length; i++) {
      var r = R[i];
      if (p.max === r[0] && p.sk >= r[0] - 25) {
        if (p.sk >= r[2] && lvl >= r[3]) return { go: true, t: 'Train ' + r[1] + ' now to go past ' + r[0] + '.' };
        return { go: false, t: r[1] + ' unlocks past ' + r[0] + ' (needs skill ' + r[2] + (r[3] ? ' and level ' + r[3] : '') + ').' };
      }
    }
    return null;
  }
  function renderChar() {
    if (!charBox) return;
    if (!CH) { charBox.hidden = true; return; }
    var c = CH, lvl = Math.round(+c.level) || 1;
    var h = '<div class="tool-head"><p class="label">Your character</p><h2 class="mk-char-h">' + esc([c.name, c.surname].filter(Boolean).join(' ')) + '</h2>' +
      '<p class="note">Level ' + lvl + ' ' + esc([c.race, c.cls].filter(Boolean).join(' ')) + (c.faction ? ' · ' + esc(c.faction) : '') + (c.ruleset ? ' · ' + esc(c.ruleset) + ' ruleset' : '') + '</p></div>';
    h += '<div class="mk-char-grid"><div class="mk-char-col"><p class="label">Professions</p><ul class="mk-kv">';
    (c.profs || []).forEach(function (p) {
      var o = { sk: +p[1] || 0, max: +p[2] || 0 }, hint = rankHint(o, lvl, p[0]), w = o.max ? Math.min(100, o.sk / o.max * 100) : 0;
      h += '<li><div class="kv-row"><span class="kv-name">' + esc(p[0]) + '</span><span class="val">' + o.sk + ' / ' + o.max + '</span></div>' +
        '<div class="bar" aria-hidden="true"><span style="width:' + w.toFixed(1) + '%"></span></div>' +
        (hint ? '<span class="mk-hint' + (hint.go ? ' go' : '') + '">' + esc(hint.t) + '</span>' : '') + '</li>';
    });
    h += '</ul><p><button type="button" class="linkish" data-goto="skillup">Plan a profession on the Skill-up tab</button></p></div>' +
      '<div class="mk-char-col"><p class="label">Reputation</p><ul class="mk-reps">';
    var tierRank = { Hated: 0, Hostile: 1, Unfriendly: 2, Neutral: 3, Friendly: 4, Honored: 5, Revered: 6, Exalted: 7 };
    (c.reps || []).slice().sort(function (a, b) { return ((tierRank[b[1]] || 0) - (tierRank[a[1]] || 0)) || ((b[2] || 0) / (b[3] || 1) - (a[2] || 0) / (a[3] || 1)); })
      .forEach(function (r) {
        h += '<li><span class="kv-name">' + esc(r[0]) + '</span><span class="val">' + esc(r[1] || '') + (+r[3] ? ' ' + (+r[2] || 0).toLocaleString('en-GB') + '/' + (+r[3]).toLocaleString('en-GB') : '') + '</span></li>';
      });
    h += '</ul>';
    var spent = 0, trees = [];
    (c.talents || []).forEach(function (t) {
      spent += +t[1] || 0;
      trees.push(esc(t[0]) + ' ' + (+t[1] || 0) + ((t[2] || []).length ? ' (' + t[2].map(function (x) { return esc(x[0]) + ' ' + (+x[1] || 0); }).join(', ') + ')' : ''));
    });
    var unspent = Math.max(0, lvl - 9) - spent;
    h += '<p class="label mk-tal-label">Talents</p><p class="mk-tal">' + (trees.length ? trees.join('; ') : 'No points spent yet') + '.' +
      (unspent > 0 ? ' <span class="mk-hint go">' + plural(unspent, 'point') + ' unspent when you last logged out.</span>' : '') + '</p>' +
      '<p><button type="button" class="linkish" data-goto="talents">See them on the Talents tab</button></p></div></div>';
    h += '<p class="note">Synced from Blizzard ' + esc(stamp(c.at)) + '. Blizzard saves your character when you log out' + (c.login ? '; your last logout was ' + esc(stamp(c.login)) : '') + '.</p>';
    charBox.innerHTML = h;
    charBox.hidden = false;
  }

  /* ---------- Market: prices ---------- */
  function renderStatus() {
    if (!loaded) return;
    var d = latest();
    if (!d) { statusEl.textContent = 'No prices yet. The refresh runs at about 4am and 6pm UK time.'; return; }
    var when = d.at && !isNaN(Date.parse(d.at)) ? stampFmt.format(new Date(d.at)) : dayLabel(d.d);
    statusEl.textContent = 'Updated ' + when + ' · ' + plural(days.length, 'day') + ' of prices · from ' + (d.src === 'blizzard' ? 'Blizzard’s Auction House data' : 'AHledger’s player scans') + '.';
  }
  function itemBtn(id, pressed) {
    return '<button type="button" class="mk-item" data-item="' + id + '"' + (pressed != null ? ' aria-pressed="' + pressed + '"' : '') + '>' + esc(nm(id)) + '</button>';
  }
  function alertLine(id, a) {
    var head = itemBtn(id) + (WATCH[id] ? ' <span class="vh">(watched)</span><span aria-hidden="true">★</span>' : '') + ': ';
    if (a.kind === 'move') return head + money(a.n.price) + ', ' + (a.c.pct >= 0 ? 'up ' : 'down ') + Math.round(Math.abs(a.c.pct) * 100) + '% on its usual ' + money(a.c.base) +
      (a.n.qty != null ? ' (' + a.n.qty.toLocaleString('en-GB') + ' listed)' : '') + '.';
    return head + 'cheapest listing ' + money(a.n.min) + ', at or ' + (a.kind === 'lo' ? 'below' : 'above') + ' your ' + money(a.v) + '.';
  }
  function renderAlerts() {
    var hits = tracked().map(function (id) { return { id: id, a: alertFor(id) }; }).filter(function (x) { return x.a; })
      .sort(function (x, y) { return (WATCH[y.id] ? 1 : 0) - (WATCH[x.id] ? 1 : 0) || (y.a.c ? Math.abs(y.a.c.pct) : 9) - (x.a.c ? Math.abs(x.a.c.pct) : 9); });
    var h = '';
    hits.slice(0, 12).forEach(function (x) { h += '<li>' + alertLine(x.id, x.a) + '</li>'; });
    if (!h) h = '<li>' + (days.length < 4 ? 'Alerts start once there are a few days of prices to compare. Prices you set on starred items work from today.' : 'Nothing unusual today.') + '</li>';
    alertList.innerHTML = h;
  }
  function chgCell(c, sp) {
    sp = sp || '';
    if (!c) return '<span class="mk-chg"><span aria-hidden="true">–</span><span class="vh">no usual price yet</span>' + sp + '</span>';
    var p = pct(c.pct);
    return '<span class="mk-chg">' + (p === '0%' ? '0%<span class="vh"> change on usual</span>' : (c.pct >= 0 ? '▲ ' : '▼ ') + p.slice(1) + '<span class="vh">' + (c.pct >= 0 ? ' up' : ' down') + ' on usual</span>') + sp + '</span>';
  }
  function star(id) {
    var on = !!WATCH[id];
    return '<button type="button" class="mk-star" data-star="' + id + '" aria-pressed="' + on + '" aria-label="Watch ' + esc(nm(id)) + '">' + (on ? '★' : '☆') + '</button>';
  }
  function subFor(id) {
    var n = now(id), sub = [];
    if (n && n.min != null && n.min < n.price) sub.push('cheapest listing ' + money(n.min));
    if (n && n.qty != null) sub.push(n.qty.toLocaleString('en-GB') + ' listed');
    if (!n) sub.push(days.length ? 'none listed today' : 'no prices yet');
    var rt = n ? rateText(id) : '';
    if (rt) sub.push(rt);
    return sub;
  }
  function swatch(id) { return onChart(id) ? '<span class="mk-sw s' + chartSlot[id] + '" aria-hidden="true"></span>' : ''; }
  function matRow(id, extra) {
    var n = now(id), al = alertFor(id), on = onChart(id), vh = verdictHtml(id);
    return '<li class="' + (on ? 'on' : '') + (al ? ' alert' : '') + '">' + star(id) + '<span class="mk-name">' + swatch(id) + itemBtn(id, on) + '</span>' +
      '<span class="mk-price">' + (n ? money(n.price) : '—') + '</span>' + chgCell(change(id), spark(id)) +
      '<span class="mk-sub">' + (vh ? vh + ' · ' : '') + esc(subFor(id).join(' · ')) + (al ? ' · <strong>alert</strong>' : '') + '</span>' + (extra || '') + '</li>';
  }
  function renderMats() {
    var h = '';
    P().mats.forEach(function (id) { h += typeof id === 'string' ? '<li class="mk-group"><span class="label">' + esc(id) + '</span></li>' : matRow(id); });
    matsEl.innerHTML = h;
  }
  function renderCrafts() {
    var h = '';
    P().crafts.forEach(function (id) {
      var c = CR[id], e = craftEval(id), name = nm(id) + (c && c.y > 1 ? ' (makes ' + c.y + ')' : '');
      var parts = c ? c.r.map(function (r) { return (r[1] > 1 ? r[1] + ' ' : '') + nm(r[0]); }).join(', ') : '';
      var chip = !e ? '<span class="chip">No price yet</span>'
        : (e.diff >= 0 ? '<span class="chip ok"><span class="nc">' + money(e.diff) + '</span> profit</span>' : '<span class="chip bad"><span class="nc">' + money(-e.diff) + '</span> loss</span>');
      var kn = CH && (prof === 'alch' || prof === 'fa') ? (knows(id) ? '<span class="chip blue">Known</span>' : '') : '';
      var sp = sparkSvg(evalSeries(function () { var x = craftEval(id); return x ? x.diff : null; }), 'Profit on ' + nm(id)), rt = rateText(id);
      h += '<li class="' + (onChart(id) ? 'on' : '') + '">' + star(id) + '<div class="mk-craft-head"><span class="mk-name">' + swatch(id) + '<button type="button" class="mk-item" data-item="' + id + '" aria-pressed="' + onChart(id) + '">' + esc(name) + '</button></span><span class="mk-chips">' + kn + chip + sp + '</span></div>' +
        '<span class="mk-sub">' + (e ? (e.vendor ? 'A vendor pays ' : 'Sells for ') + money(e.value) + (e.vendor ? '' : ' after the cut') + ' · materials ' + money(e.cost) + ' · ' : '') + esc(parts) + (rt ? ' · ' + esc(rt) : '') + '</span></li>';
    });
    craftsEl.innerHTML = h;
  }
  function renderWatch() {
    var ids = Object.keys(WATCH).map(Number).filter(function (id) { return NAMES[id]; });
    if (!ids.length) {
      watchEl.innerHTML = '';
      watchNote.textContent = readOnly ? 'Only the page’s owner can change the watchlist.' : 'Tap the star next to any item to pin it here. Starred items alert at a smaller move, and at prices you set.';
      return;
    }
    watchNote.textContent = (readOnly ? 'Only the page’s owner can change the watchlist. ' : '') + 'Set a price to be told when the cheapest listing reaches it. Write prices like 1s 50c; a plain number means silver.';
    var h = '';
    ids.sort(function (a, b) { return nm(a) < nm(b) ? -1 : 1; }).forEach(function (id) {
      var w = WATCH[id] || {};
      var set = '<div class="mk-wset">' +
        '<label>Alert below<input class="mk-money" type="text" inputmode="decimal" autocomplete="off" data-w="lo" data-wid="' + id + '" value="' + (w.lo ? esc(money(w.lo)) : '') + '" placeholder="e.g. 1s 50c"' + (readOnly ? ' disabled' : '') + '></label>' +
        '<label>Alert above<input class="mk-money" type="text" inputmode="decimal" autocomplete="off" data-w="hi" data-wid="' + id + '" value="' + (w.hi ? esc(money(w.hi)) : '') + '" placeholder="e.g. 4s"' + (readOnly ? ' disabled' : '') + '></label></div>';
      h += matRow(id, set);
    });
    watchEl.innerHTML = h;
  }
  function renderPrices() { renderStatus(); renderAlerts(); renderDeals(); renderWatch(); renderMats(); renderCrafts(); drawChart(); }

  /* ---------- Chart: up to six items, as prices or rebased to 100 on each item's first day ---------- */
  var modeEls = $$('input[name="mkmode"]'), legendEl = $('#mk-legend'), tableEl = $('#mk-table'), chartNote = $('#mk-chart-note'), liveEl = $('#mk-live');
  var cmode = store.get('wowf-mkmode', 'price') === 'index' ? 'index' : 'price';
  var pts = [], hi = -1, SER = [];
  function niceStep(range) {
    var steps = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 2500, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000];
    for (var i = 0; i < steps.length; i++) if (steps[i] >= range / 3) return steps[i];
    return steps[steps.length - 1];
  }
  function idxStep(range) {
    var steps = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000];
    for (var i = 0; i < steps.length; i++) if (steps[i] >= range / 4) return steps[i];
    return 2000;
  }
  function fmtV(v) { return cmode === 'index' ? String(Math.round(v)) : money(v); }
  function announce(t) { if (liveEl) { liveEl.textContent = ''; setTimeout(function () { liveEl.textContent = t; }, 30); } }
  function seriesFor(id) {
    var s = [];
    days.forEach(function (d) { var p = point(d, id); if (p && p.price != null) s.push({ d: d.d, min: p.min, price: p.price, p20: p.p20, qty: p.qty, src: d.src }); });
    var base = s.length ? s[0].price : null;
    s.forEach(function (p) { p.v = cmode === 'index' ? (base > 0 ? p.price / base * 100 : null) : p.price; });
    return { id: id, slot: chartSlot[id], s: s.filter(function (p) { return p.v != null; }) };
  }
  function chartTitle(ids) {
    if (ids.length === 1) return nm(ids[0]);
    if (ids.length <= 3) return ids.slice(0, -1).map(nm).join(', ') + ' and ' + nm(ids[ids.length - 1]);
    return nm(ids[0]) + ', ' + nm(ids[1]) + ' and ' + (ids.length - 2) + ' more';
  }
  function at(s, d) { for (var i = 0; i < s.length; i++) if (s[i].d === d) return s[i]; return null; }
  function renderLegend() {
    if (chartIds.length < 2) { legendEl.hidden = true; legendEl.innerHTML = ''; return; }
    legendEl.hidden = false;
    legendEl.innerHTML = chartIds.map(function (id) {
      return '<li><span class="mk-sw s' + chartSlot[id] + '" aria-hidden="true"></span><span class="lg-name">' + esc(nm(id)) + '</span>' +
        '<button type="button" class="mk-x" data-unchart="' + id + '" aria-label="Take ' + esc(nm(id)) + ' off the chart"><span aria-hidden="true">×</span></button></li>';
    }).join('');
  }
  function renderTable() {
    if (!SER.length) { tableEl.innerHTML = '<p class="note">No prices to show yet.</p>'; return; }
    var dset = {};
    SER.forEach(function (x) { x.s.forEach(function (p) { dset[p.d] = 1; }); });
    var h = '<table class="mk-table"><caption class="vh">' + esc(chartTitle(chartIds)) + ', each day</caption><thead><tr><th scope="col">Day</th>';
    SER.forEach(function (x) { h += '<th scope="col"><span class="mk-sw s' + x.slot + '" aria-hidden="true"></span>' + esc(nm(x.id)) + '</th>'; });
    h += '</tr></thead><tbody>';
    Object.keys(dset).sort().reverse().forEach(function (d) {
      h += '<tr><th scope="row">' + esc(dayLabel(d)) + '</th>';
      SER.forEach(function (x) {
        var p = at(x.s, d);
        h += '<td>' + (p ? money(p.price) + (cmode === 'index' ? ' <span class="t-idx">(' + Math.round(p.v) + ')</span>' : '') : '—') + '</td>';
      });
      h += '</tr>';
    });
    tableEl.innerHTML = h + '</tbody></table>';
  }
  function drawChart() {
    var ids = chartIds.slice();
    titleEl.textContent = chartTitle(ids);
    modeEls.forEach(function (r) { r.checked = r.value === cmode; });
    chartNote.textContent = cmode === 'index'
      ? 'Each line starts at 100 on its first day with a price, so items of any price can share the chart: 120 means 20% dearer than that first day. Hover, tap or use the arrow keys to read a day.'
      : 'What the cheapest 20 cost each, each day.' + (ids.length === 1 && usual(ids[0]) != null ? ' The dashed line is its usual price.' : '') + ' Hover, tap or use the arrow keys to read a day.';
    renderLegend();
    SER = ids.map(seriesFor).filter(function (x) { return x.s.length; });
    tipEl.hidden = true; hi = -1; pts = [];
    if (!SER.length) {
      chartEl.innerHTML = '<p class="note mk-empty">' + (loaded ? 'No prices for ' + (ids.length === 1 ? 'this item' : 'these items') + ' yet.' : 'Loading prices…') + '</p>';
      chartEl.setAttribute('aria-label', chartTitle(ids) + ': no prices yet');
      renderTable();
      return;
    }
    var dset = {};
    SER.forEach(function (x) { x.s.forEach(function (p) { dset[p.d] = 1; }); });
    var ds = Object.keys(dset).sort(), labels = SER.length > 1 && SER.length <= 4;
    var W = Math.max(280, Math.round(chartEl.clientWidth || 600)), H = 220, L = cmode === 'index' ? 40 : 56, T = 14, B = 30, R = 16;
    if (labels) R = Math.round(Math.min(W * 0.34, 20 + Math.max.apply(null, SER.map(function (x) { return nm(x.id).length; })) * 6.4));
    var u = SER.length === 1 && cmode === 'price' ? usual(SER[0].id) : null, vals = [];
    SER.forEach(function (x) { x.s.forEach(function (p) { vals.push(p.v); }); });
    if (u != null) vals.push(u);
    if (cmode === 'index') vals.push(100);
    var lo = Math.min.apply(null, vals), top = Math.max.apply(null, vals);
    if (top === lo) { lo = lo * 0.8; top = top * 1.2 || 1; }
    var padv = (top - lo) * 0.15; lo = Math.max(0, lo - padv); top = top + padv;
    var step = cmode === 'index' ? idxStep(top - lo) : niceStep(top - lo), y0 = Math.floor(lo / step) * step, y1 = Math.ceil(top / step) * step;
    lo = y0; top = y1 === y0 ? y0 + step : y1;
    var t0 = Date.parse(ds[0] + 'T12:00:00Z'), t1 = Date.parse(ds[ds.length - 1] + 'T12:00:00Z');
    var X = function (d) { return ds.length === 1 || t1 === t0 ? (L + W - R) / 2 : L + (Date.parse(d + 'T12:00:00Z') - t0) / (t1 - t0) * (W - L - R); };
    var Y = function (v) { return T + (1 - (v - lo) / (top - lo)) * (H - T - B); };
    var g = '';
    for (var v = lo; v <= top + 0.001; v += step) {
      g += '<line class="grid' + (cmode === 'index' && Math.abs(v - 100) < 0.001 ? ' base' : '') + '" x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(v).toFixed(1) + '" y2="' + Y(v).toFixed(1) + '"/>' +
        '<text class="ylab" x="' + (L - 8) + '" y="' + (Y(v) + 4).toFixed(1) + '" text-anchor="end">' + fmtV(v) + '</text>';
    }
    var xl = ds.length === 1 ? [ds[0]] : (ds.length === 2 ? [ds[0], ds[1]] : [ds[0], ds[Math.floor((ds.length - 1) / 2)], ds[ds.length - 1]]);
    xl.forEach(function (d, i) {
      var anchor = ds.length === 1 ? 'middle' : (i === 0 ? 'start' : (i === xl.length - 1 ? 'end' : 'middle'));
      g += '<text class="xlab" x="' + X(d).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="' + anchor + '">' + esc(dayLabel(d)) + '</text>';
    });
    if (u != null) {
      g += '<line class="usual" x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(u).toFixed(1) + '" y2="' + Y(u).toFixed(1) + '"/>' +
        '<text class="ulab" x="' + (W - R) + '" y="' + (Y(u) - 5).toFixed(1) + '" text-anchor="end">usual ' + money(u) + '</text>';
    }
    SER.forEach(function (x) {
      if (x.s.length > 1) g += '<path class="ln s' + x.slot + '" d="' + x.s.map(function (p, i) { return (i ? 'L' : 'M') + X(p.d).toFixed(1) + ' ' + Y(p.v).toFixed(1); }).join(' ') + '"/>';
    });
    SER.forEach(function (x) { var p = x.s[x.s.length - 1]; g += '<circle class="dot s' + x.slot + '" cx="' + X(p.d).toFixed(1) + '" cy="' + Y(p.v).toFixed(1) + '" r="4"/>'; });
    if (labels) {
      /* Names at the end of each line, nudged apart so they never overlap. */
      var room = Math.max(3, Math.floor((R - 12) / 6.4));
      var lab = SER.map(function (x) {
        var p = x.s[x.s.length - 1], t = nm(x.id);
        return { x: X(p.d) + 9, y: Y(p.v) + 4, t: t.length > room ? t.slice(0, room - 1) + '…' : t };
      }).sort(function (a, b) { return a.y - b.y; });
      for (var i = 1; i < lab.length; i++) if (lab[i].y - lab[i - 1].y < 13) lab[i].y = lab[i - 1].y + 13;
      var over = lab[lab.length - 1].y - (H - B + 2);
      if (over > 0) lab.forEach(function (l) { l.y -= over; });
      lab.forEach(function (l) { g += '<text class="dlab" x="' + l.x.toFixed(1) + '" y="' + l.y.toFixed(1) + '">' + esc(l.t) + '</text>'; });
    }
    g += '<line class="cross" id="mk-cross" x1="0" x2="0" y1="' + T + '" y2="' + (H - B) + '" visibility="hidden"/>';
    SER.forEach(function (x, i) { g += '<circle class="hot s' + x.slot + '" id="mk-hot-' + i + '" r="5" cx="0" cy="0" visibility="hidden"/>'; });
    g += '<rect id="mk-hit" x="0" y="0" width="' + W + '" height="' + H + '" fill="transparent"/>';
    chartEl.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" aria-hidden="true">' + g + '</svg>';
    pts = ds.map(function (d) {
      return { x: X(d), d: d, rows: SER.map(function (x) { var p = at(x.s, d); return p ? { id: x.id, slot: x.slot, p: p, y: Y(p.v) } : null; }) };
    });
    chartEl.setAttribute('aria-label', (cmode === 'index' ? 'Rebased to 100 on the first day. ' : '') + SER.map(function (x) {
      var a = x.s[0], b = x.s[x.s.length - 1];
      return nm(x.id) + ': ' + fmtV(b.v) + ' on ' + dayLabel(b.d) + (x.s.length > 1 ? ', from ' + fmtV(a.v) + ' on ' + dayLabel(a.d) : '');
    }).join('; ') + (u != null ? '. Usual price ' + money(u) + '.' : '.'));
    var svg = chartEl.querySelector('svg');
    function near(clientX) {
      var r = svg.getBoundingClientRect(), x = (clientX - r.left) / r.width * W, best = 0;
      for (var i = 1; i < pts.length; i++) if (Math.abs(pts[i].x - x) < Math.abs(pts[best].x - x)) best = i;
      return best;
    }
    svg.addEventListener('pointermove', function (e) { show(near(e.clientX)); });
    svg.addEventListener('pointerdown', function (e) { show(near(e.clientX)); });
    svg.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') hide(); });
    renderTable();
  }
  function show(i) {
    if (!pts.length) return;
    hi = Math.max(0, Math.min(pts.length - 1, i));
    var q = pts[hi], svg = chartEl.querySelector('svg');
    if (!svg) return;
    var cross = svg.querySelector('#mk-cross'), topY = Infinity;
    cross.setAttribute('x1', q.x.toFixed(1)); cross.setAttribute('x2', q.x.toFixed(1)); cross.setAttribute('visibility', 'visible');
    q.rows.forEach(function (r, k) {
      var hot = svg.querySelector('#mk-hot-' + k);
      if (!hot) return;
      if (!r) { hot.setAttribute('visibility', 'hidden'); return; }
      hot.setAttribute('cx', q.x.toFixed(1)); hot.setAttribute('cy', r.y.toFixed(1)); hot.setAttribute('visibility', 'visible');
      topY = Math.min(topY, r.y);
    });
    var rows = q.rows.filter(Boolean).sort(function (a, b) { return b.p.v - a.p.v; }), h = '<b>' + esc(dayLabel(q.d)) + '</b>';
    if (SER.length === 1 && rows.length) {
      var p = rows[0].p;
      h += '<br>' + (cmode === 'index' ? Math.round(p.v) + ' · ' : '') + (p.p20 != null ? money(p.price) + ' each for the cheapest 20' : 'Cheapest listing ' + money(p.price)) +
        (p.p20 != null && p.min != null && p.min < p.price ? '<br>Cheapest listing ' + money(p.min) : '') +
        (p.qty != null ? '<br>' + p.qty.toLocaleString('en-GB') + ' listed' : '') + (p.src === 'ahledger' ? '<br>From AHledger’s scans' : '');
    } else {
      rows.forEach(function (r) {
        h += '<br><span class="mk-sw s' + r.slot + '" aria-hidden="true"></span>' + esc(nm(r.id)) + ' <b>' + (cmode === 'index' ? Math.round(r.p.v) : money(r.p.price)) + '</b>' +
          (cmode === 'index' ? ' · ' + money(r.p.price) : '');
      });
      if (rows.length < SER.length) h += '<br>' + plural(SER.length - rows.length, 'item') + ' with no price that day';
    }
    tipEl.innerHTML = h;
    tipEl.hidden = false;
    var r = svg.getBoundingClientRect(), wrap = chartEl.getBoundingClientRect(), vb = svg.viewBox.baseVal;
    var sx = r.width / vb.width, sy = r.height / vb.height;
    var left = r.left - wrap.left + q.x * sx, topPx = r.top - wrap.top + (isFinite(topY) ? topY : 14) * sy;
    var tw = tipEl.offsetWidth, ww = chartEl.clientWidth;
    tipEl.style.left = Math.max(tw / 2, Math.min(ww - tw / 2, left)) + 'px';
    tipEl.style.top = Math.max(tipEl.offsetHeight + 10, topPx) + 'px';
  }
  function hide() {
    tipEl.hidden = true; hi = -1;
    var svg = chartEl.querySelector('svg');
    if (!svg) return;
    svg.querySelector('#mk-cross').setAttribute('visibility', 'hidden');
    $$('circle.hot', svg).forEach(function (c) { c.setAttribute('visibility', 'hidden'); });
  }
  chartEl.addEventListener('keydown', function (e) {
    if (!pts.length) return;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); show(hi < 0 ? pts.length - 1 : hi + (e.key === 'ArrowLeft' ? -1 : 1)); }
    else if (e.key === 'Home') { e.preventDefault(); show(0); }
    else if (e.key === 'End') { e.preventDefault(); show(pts.length - 1); }
    else if (e.key === 'Escape') { hide(); return; }
    else return;
    announce(tipEl.innerText.replace(/\s*\n\s*/g, ', '));
  });
  chartEl.addEventListener('focus', function () { if (pts.length) show(pts.length - 1); });
  chartEl.addEventListener('blur', hide);
  modeEls.forEach(function (r) {
    r.addEventListener('change', function () { if (r.checked) { cmode = r.value === 'index' ? 'index' : 'price'; store.set('wowf-mkmode', cmode); drawChart(); } });
  });

  /* ---------- Skill-up tab ---------- */
  var suProf = $('#su-prof'), suCur = $('#su-cur'), suPick = $('#su-pick'), suPickRow = $('#su-pick-row');
  var hzSkill = $('#hz-skill'), hzAll = $('#hz-all');
  function rt() { return ROUTES[skprof]; }
  function routeHerbs(r) { return r.s.some(function (st) { return st[0] !== 'T' && st[2].some(function (o) { return (RCP[o[0]] || [, , , []])[3].some(function (x) { return HERB[x[0]] != null; }); }); }); }
  function curFor(key) {
    var r = ROUTES[key], p = profSkill(r.n), saved = store.get('wowf-skcur-' + key, null);
    if (p && (!saved || saved.at !== CH.at)) { store.set('wowf-skcur-' + key, { v: p.sk, at: CH.at }); return p.sk; }
    if (saved && saved.v >= 1) return saved.v;
    return 1;
  }
  function herbSkill() {
    var p = profSkill('Herbalism'), saved = store.get('wowf-hzskill', null);
    if (p && (!saved || saved.at !== CH.at)) { store.set('wowf-hzskill', { v: p.sk, at: CH.at }); return p.sk; }
    if (saved && saved.v >= 1) return saved.v;
    return Math.min(300, Math.max(1, charLevel() * 5));
  }
  function clampSkill(v) { return Math.max(1, Math.min(300, Math.round(+v) || 1)); }
  function tile(n, lab) { return '<div class="mk-tile"><span class="t-num">' + n + '</span><span class="t-lab">' + lab + '</span></div>'; }
  function optCost(rid, n, pick) {
    var r = RCP[rid], cost = 0, miss = false;
    if (!r) return null;
    r[3].forEach(function (x) { if (pick && HERB[x[0]] != null) return; var u = unitCost(x[0], 1); if (u == null) miss = true; else cost += u * x[1] * n; });
    return miss ? null : cost;
  }
  function fillSkillProfs() {
    var mine = {};
    if (CH && Array.isArray(CH.profs)) CH.profs.forEach(function (p) { mine[p[0]] = 1; });
    suProf.innerHTML = SKORDER.map(function (k) { return '<option value="' + k + '"' + (k === skprof ? ' selected' : '') + '>' + esc(ROUTES[k].n) + (mine[ROUTES[k].n] ? ' (yours)' : '') + '</option>'; }).join('');
  }
  function renderSkill() {
    if (!sPanel) return;
    STRICT = true;
    try { drawSkill(); } finally { STRICT = false; }
  }
  function drawSkill() {
    var r = rt(), cur = clampSkill(suCur.value), lvl = charLevel(), herbs = routeHerbs(r);
    $('#su-cur-label').textContent = 'Your ' + r.n + ' skill';
    $('#su-steps-head').textContent = r.n + ', step by step';
    suPickRow.hidden = !herbs;
    var pick = herbs && suPick.checked, opts = store.get('wowf-skopt-' + skprof, {}) || {};
    var known = profSkill(r.n), maxNow = known ? known.max : null;
    var M = cur < 150 ? 150 : (cur < 225 ? 225 : 300);
    var inv = {}, shop = {}, crafts = 0, done = 0, h = '', firstNow = true, nextTxt = '', toM = 0, total = 0, gaps = 0;
    r.s.forEach(function (st, i) {
      if (st[0] === 'T') {
        var cap = st[2], need = st[3], lv = st[4];
        if ((maxNow != null && maxNow > cap) || cur > cap) return;
        var can = cur >= need && lvl >= lv;
        h += '<li class="train' + (can && firstNow ? ' now' : '') + '"><span class="sk-range">at ' + cap + '</span><div class="sk-body"><div class="sk-head"><b>Train ' + esc(st[1]) + ' ' + esc(r.n) + '</b>' +
          (can ? '<span class="chip ok">You can train now</span>' : '<span class="chip">Needs skill ' + need + (lv ? ', level ' + lv : '') + '</span>') + '</div>' +
          '<span class="mk-sub">Your skill stops at ' + cap + ' until you do. From ' + esc(st[5]) + '.</span></div></li>';
        if (can && firstNow) { nextTxt = 'Train ' + st[1]; firstNow = false; }
        return;
      }
      var a = st[0], b = st[1], o = st[2], ci = Math.min(o.length - 1, Math.max(0, +opts[i] || 0)), rid = o[ci][0], n = o[ci][1];
      var left = cur >= b ? 0 : (cur <= a ? n : Math.ceil(n * (b - cur) / (b - a)));
      if (!left) { done++; return; }
      var rec = RCP[rid], item = rec[1], y = rec[2] || 1, cost = 0, miss = false, parts = [];
      rec[3].forEach(function (x) {
        var id = x[0], needN = x[1] * left, have = Math.min(inv[id] || 0, needN);
        if (have) inv[id] -= have;
        var buy = needN - have;
        parts.push((x[1] > 1 ? x[1] + ' ' : '') + nm(id) + (have ? ' (' + have + ' made earlier)' : ''));
        if (buy > 0) {
          shop[id] = (shop[id] || 0) + buy;
          if (pick && HERB[id] != null) return;
          var u = unitCost(id, 1);
          if (u == null) miss = true; else cost += u * buy;
        }
      });
      if (item) inv[item] = (inv[item] || 0) + left * y;
      crafts += left; total += cost; if (b <= M) toM += cost; if (miss) gaps++;
      var nowCls = firstNow ? 'now' : '';
      if (firstNow) { nextTxt = rec[0] + ' ×' + left; firstNow = false; }
      var alt = '';
      if (o.length > 1) {
        alt = '<label class="sk-alt-l"><span class="vh">Recipe for ' + a + ' to ' + b + '</span><select class="select sk-alt" data-step="' + i + '">' +
          (function () {
            var oc = o.map(function (x) { return optCost(x[0], x[1], pick); }), priced = oc.filter(function (v) { return v != null; });
            var low = priced.length > 1 ? Math.min.apply(null, priced) : null;
            return o.map(function (x, k) {
              return '<option value="' + k + '"' + (k === ci ? ' selected' : '') + '>' + esc(RCP[x[0]][0]) + ' ×' + x[1] + ' · ' + (oc[k] == null ? 'not all priced' : money(oc[k]) + (oc[k] === low ? ', cheapest' : '')) + '</option>';
            }).join('');
          })() +
          '</select></label>';
      }
      var title = item ? '<button type="button" class="mk-item" data-item="' + item + '">' + esc(rec[0]) + '</button>' : esc(rec[0]);
      h += '<li class="' + nowCls + '"><span class="sk-range">' + Math.max(a, cur) + '–' + b + '</span><div class="sk-body"><div class="sk-head"><b>' + title + ' ×' + left + (y > 1 ? ' (makes ' + y + ' each)' : '') + '</b>' +
        '<span class="mk-chips">' + (KNOWNR[rid] ? '<span class="chip blue">Known</span>' : '') + '<span class="val">' + money(cost) + (miss ? '+' : '') + '</span></span></div>' +
        '<span class="mk-sub">Each: ' + esc(parts.join(', ')) + (st[3] ? '. Craft count is an estimate.' : '.') + (miss ? ' Some materials aren’t priced yet.' : '') + (st[4] ? ' ' + esc(st[4]) : '') + '</span>' + alt + '</div></li>';
    });
    if (done || cur > 1) h = '<li class="done"><span class="sk-range">1–' + cur + '</span><div class="sk-body"><span class="mk-sub">Already done.</span></div></li>' + h;
    if (cur >= 300) h = '<li class="done"><span class="sk-range">300</span><div class="sk-body"><span class="mk-sub">You’ve reached the top of ' + esc(r.n) + '.</span></div></li>';
    $('#su-steps').innerHTML = h;
    var rows = Object.keys(shop).map(Number).map(function (id) {
      var u = unitCost(id, 1), b = buyCost(id), n = now(id);
      var how = VBUY[id] != null && b === VBUY[id] ? 'vendor' : ((b == null && u != null) || (b != null && u != null && u < b - 0.01) ? 'craft' : 'ah');
      return { id: id, q: shop[id], u: u, t: u == null ? null : u * shop[id], herb: HERB[id] != null, how: how, listed: n ? (n.qty || 0) : 0 };
    }).sort(function (a, b) { return (b.t || 0) - (a.t || 0); });
    var herbN = 0, herbCost = 0, missing = [];
    rows.forEach(function (x) {
      if (x.herb) { herbN += x.q; if (x.t != null) herbCost += x.t; }
      if (x.u == null && !(pick && x.herb)) missing.push(nm(x.id));
    });
    var tiles = '';
    if (cur < 300) {
      if (M < 300) tiles += tile(money(toM), 'to reach ' + M + (pick ? ', picking your own herbs' : ''));
      tiles += tile(money(total) + (gaps ? '+' : ''), 'to reach 300' + (pick ? ', picking your own herbs' : '') + (gaps ? ', plus what isn’t priced yet' : ''));
      tiles += pick ? tile(plural(herbN, 'herb'), 'to pick on the way') : tile(plural(crafts, 'craft'), 'left to make');
      if (nextTxt) tiles += tile(esc(nextTxt), 'next');
    }
    $('#su-tiles').innerHTML = tiles;
    var resale = 0;
    Object.keys(inv).forEach(function (k) { var o = bestOut(+k); if (inv[k] > 0 && o != null) resale += o * inv[k]; });
    var sh = '';
    rows.forEach(function (x) {
      var note = x.how === 'vendor' ? 'from a vendor' : (x.how === 'craft' ? 'cheaper made from its materials' : 'Auction House');
      if (x.herb) note += ' · Herbalism ' + HERB[x.id] + (pick ? ' · you’ll pick these' : '');
      var price = pick && x.herb ? 'pick' : (x.t == null ? '—' : money(x.t));
      var each = x.u == null ? (x.listed ? 'Only ' + x.listed + ' listed, too few to price' : days.length ? 'None listed yet' : 'No prices yet') : money(x.u) + ' each';
      sh += '<li' + (pick && x.herb ? ' class="picked"' : '') + '><button type="button" class="mk-item" data-item="' + x.id + '">' + esc(nm(x.id)) + '</button><span class="mk-price">' + price + '</span>' +
        '<span class="mk-chg">×' + x.q.toLocaleString('en-GB') + '</span><span class="mk-sub">' + esc(each + ' · ' + note) + '</span></li>';
    });
    $('#su-shop').innerHTML = sh || '<li><span class="mk-sub">Nothing left to buy.</span></li>';
    $('#su-shop-note').textContent = (missing.length ? missing.length + ' of these can’t be priced yet because ' + (days.length ? 'few or none are listed' : 'there are no prices yet') + ', so they aren’t in the totals: ' + missing.join(', ') + '. Few players are that high yet, so expect these to get cheaper. ' : '') +
      (!pick && herbCost > 0 ? 'Herbs are ' + money(herbCost) + ' of the total, and you can pick them yourself. ' : '') +
      (resale > 0 ? 'Selling what you make, to the Auction House or a vendor, would bring back about ' + money(resale) + ' at today’s prices, though the market won’t take hundreds at once.' : '');
    var sy = profSkill(r.n);
    $('#su-src').innerHTML = esc(sy && sy.sk === cur ? 'Your skill, synced from your character ' + stamp(CH.at) + '. ' : (sy ? 'Your synced skill is ' + sy.sk + '; change the number to plan from somewhere else. ' : 'Enter your skill to plan from it. ')) +
      'Route from <a href="' + esc(r.url) + '" rel="noopener">' + esc(r.src) + '’s Forever guide</a>, with recipes from Blizzard’s Forever data.';
  }

  /* ---------- Herb zones tab ---------- */
  var KM2 = 0.83612736 / 1e6;
  function zoneScores(sk, lvl, fac) {
    var enemy = fac === 'Horde' ? 'A' : 'H';
    var every = HZ.filter(function (z) { return z[4] !== enemy; }).map(function (z) {
      var counts = z[6], tot = 0, can = 0, canPriced = 0, value = 0, herbs = [];
      Object.keys(counts).forEach(function (k) {
        var id = +k, c = counts[k], v = thin(id) ? null : sellNet(id), ok = HERB[id] <= sk;
        tot += c;
        if (ok) { can += c; if (v != null) { canPriced += c; value += c * v; } }
        herbs.push({ id: id, c: c, v: v, ok: ok });
      });
      var area = z[5] * KM2;
      return { z: z, tot: tot, can: can, perNode: canPriced ? value / canPriced : null, score: area ? value / area : 0, density: area ? can / area : 0,
        herbs: herbs.sort(function (a, b) { return b.c - a.c; }), here: lvl >= z[2] && lvl <= z[3], near: z[2] <= lvl + 10 && z[3] >= lvl - 5 };
    });
    /* Without prices, rank by how many herbs you can pick per square km instead. */
    var priced = every.some(function (r) { return r.score > 0; });
    if (!priced) every.forEach(function (r) { r.score = r.density; });
    /* 100 is the best zone your faction can farm at your skill, whether or not it's shown, so scores don't shift with the filter. */
    var best = Math.max.apply(null, every.map(function (r) { return r.score; }));
    if (!(best > 0)) best = 1;
    return { every: every, priced: priced, best: best };
  }
  function renderZones() {
    if (!hPanel) return;
    var sk = clampSkill(hzSkill.value), lvl = charLevel(), all = hzAll.checked, fac = charFaction();
    var zs = zoneScores(sk, lvl, fac), every = zs.every, priced = zs.priced, best = zs.best;
    var rows = every.filter(function (r) { return all || r.near; });
    rows.sort(function (a, b) { return b.score - a.score || b.density - a.density; });
    var h = '';
    rows.forEach(function (r) {
      var z = r.z, rating = Math.round(r.score / best * 100), share = r.tot ? Math.round(r.can / r.tot * 100) : 0;
      var chips = '<span class="chip' + (r.here ? ' ok' : '') + '">Lv ' + z[2] + '–' + z[3] + '</span>' + (z[2] > lvl ? '<span class="chip">Above your level</span>' : '') + (z[4] === 'C' ? '' : '<span class="chip">' + (z[4] === 'H' ? 'Horde' : 'Alliance') + '</span>');
      var mix = r.herbs.map(function (x) {
        var sh = x.c / r.tot * 100;
        return (x.ok ? '' : '[') + nm(x.id) + ' ' + (sh < 0.5 ? 'under 1' : Math.round(sh)) + '%' + (x.ok ? (x.v != null ? ' (' + money(x.v) + ')' : ' (not priced)') : ', needs ' + HERB[x.id] + ']');
      }).join(' · ');
      h += '<li class="' + (r.here ? 'on' : '') + '"><span class="hz-name"><b>' + esc(z[1]) + '</b> <span class="mk-chips">' + chips + '</span></span>' +
        '<span class="mk-price">' + (r.perNode == null ? '—' : money(r.perNode)) + '</span><span class="mk-chg">' + rating + '<span class="vh"> out of 100</span></span>' +
        '<div class="hz-bar bar" aria-hidden="true"><span style="width:' + Math.max(rating, r.score > 0 ? 2 : 0) + '%"></span></div>' +
        '<span class="mk-sub">You can pick ' + share + '% of its ' + r.tot.toLocaleString('en-GB') + ' herb spawn points, about ' + r.density.toFixed(1) + ' per square km.</span>' +
        '<span class="mk-sub">' + esc(mix) + '</span></li>';
    });
    $('#hz-list').innerHTML = h || '<li><span class="mk-sub">No zones to show.</span></li>';
    var next = Object.keys(HERB).map(Number).filter(function (id) { return HERB[id] > sk && id !== 2452; }).sort(function (a, b) { return HERB[a] - HERB[b]; })[0];
    var sy = profSkill('Herbalism'), nv = next ? sellNet(next) : null;
    $('#hz-src').textContent = (sy && sy.sk === sk ? 'Skill synced from your character ' + stamp(CH.at) + '. ' : (sy ? 'Your synced skill is ' + sy.sk + '. ' : '')) +
      (next ? 'Your next herb is ' + nm(next) + ' at ' + HERB[next] + (nv != null ? ', selling for ' + money(nv) + ' after the cut' : '') + '. ' : '') +
      (priced ? '' : 'There are no prices to go on yet, so zones are ranked by how many herbs you can pick per square km. ') +
      (all ? 'Showing every zone you can safely farm as ' + fac + '.' : 'Showing zones around level ' + lvl + '.');
  }

  /* Forever's bonus finds from picking herbs. Where they come from: wow-professions.com and Warcraft Tavern's Forever Herbalism pages. */
  var BONUS = [
    [249399, 'Found while picking Earthroot, Mageroyal and Briarthorn; guides also name Stranglekelp, Bruiseweed and Kingsblood.', 15],
    [249424, 'Found while picking Fadeleaf and Goldthorn, and probably Kingsblood (guides disagree).', 125],
    [249274, 'A scarce find from higher herbs. Which ones isn’t documented yet.', 0],
    [268415, 'Found while picking Peacebloom and Silverleaf. Planted in a Greenhouse (Herbalism 140), they grow Peacebloom or Earthroot.', 1],
    [268416, 'Found while picking Briarthorn; they grow Silverleaf or Kingsblood.', 70], [268417, '', 0], [268418, '', 0]
  ];
  function renderBonus() {
    var el = $('#hz-bonus');
    if (!el) return;
    var sk = clampSkill(hzSkill.value), h = '';
    BONUS.forEach(function (b) {
      var id = b[0], n = now(id), v = n ? sellNet(id) : null;
      var when = b[2] ? (sk >= b[2] ? '<span class="chip ok">You can find these</span>' : '<span class="chip">From skill ' + b[2] + '</span>') : '';
      h += '<li><span class="hz-name"><button type="button" class="mk-item" data-item="' + id + '">' + esc(nm(id)) + '</button> <span class="mk-chips">' + when + '</span></span>' +
        '<span class="mk-price">' + (v == null ? '—' : money(v)) + '</span><span class="mk-chg">' + (n && n.qty != null ? n.qty.toLocaleString('en-GB') + '<span class="vh"> listed</span>' : '—') + '</span>' +
        (b[1] ? '<span class="mk-sub">' + esc(b[1]) + '</span>' : '') + '</li>';
    });
    el.innerHTML = h;
  }

  /* ---------- Watchlist storage ---------- */
  function cleanWatch(o) {
    var out = {};
    if (o && typeof o === 'object') Object.keys(o).forEach(function (k) {
      if (!NAMES[k]) return;
      var w = o[k] && typeof o[k] === 'object' ? o[k] : {};
      out[k] = { lo: num(w.lo) || null, hi: num(w.hi) || null };
    });
    return out;
  }
  function saveWatch() {
    if (!DBH || readOnly) { store.set('wowf-watch', WATCH); return; }
    if (saving) { again = true; return; }
    saving = true;
    DBH.doc('config/watch').set({ items: cleanWatch(WATCH), at: new Date().toISOString() }).then(function () {
      saving = false;
      if (again) { again = false; saveWatch(); }
    }, function (e) {
      saving = false; again = false;
      if (e && e.code === 'invalid_argument') { readOnly = true; WATCH = store.get('wowf-watch-server', {}) || {}; }
      watchNote.textContent = readOnly ? 'Only the page’s owner can change the watchlist.' : 'Couldn’t save the watchlist just now. Try again in a moment.';
      renderAlerts(); renderWatch(); renderMats(); renderCrafts();
    });
  }
  function toggleWatch(id, listId) {
    if (readOnly) return;
    var wasIdx = listId === 'mk-watch' ? $$('#mk-watch [data-star]').map(function (b) { return +b.getAttribute('data-star'); }).indexOf(id) : -1;
    if (WATCH[id]) delete WATCH[id]; else WATCH[id] = { lo: null, hi: null };
    saveWatch(); renderAlerts(); renderWatch(); renderMats(); renderCrafts();
    var b = listId ? $('#' + listId + ' [data-star="' + id + '"]') : null;
    if (!b && listId === 'mk-watch') { var rest = $$('#mk-watch [data-star]'); b = rest[Math.min(Math.max(0, wasIdx), rest.length - 1)] || null; }
    if (b) b.focus(); else if (listId === 'mk-watch') { watchNote.setAttribute('tabindex', '-1'); watchNote.focus(); }
  }

  /* ---------- Events ---------- */
  function chartChanged(msg, focusSel) {
    renderWatch(); renderMats(); renderCrafts(); drawChart();
    if (msg) announce(msg);
    if (focusSel) { var f = $(focusSel); if (f) f.focus(); }
  }
  function choose(id, fromOtherTab) {
    id = +id;
    if (!NAMES[id]) return;
    var was = onChart(id);
    addToChart(id);
    if (fromOtherTab) { var t = document.getElementById('tab-market'); if (t) t.click(); }
    chartChanged(was ? '' : nm(id) + ' added to the chart.');
    try { chartEl.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' }); } catch (e) {}
  }
  function toggleChart(id, b) {
    var ul = b.closest('ul'), sel = ul && ul.id ? '#' + ul.id + ' [data-item="' + id + '"]' : '';
    if (onChart(id)) {
      if (!dropFromChart(id)) { announce('At least one item stays on the chart.'); return; }
      chartChanged(nm(id) + ' taken off the chart.', sel);
    } else {
      var full = chartIds.length >= MAXS ? nm(chartIds[0]) : '';
      addToChart(id);
      chartChanged(nm(id) + ' added to the chart' + (full ? ', replacing ' + full + ': it holds six at once.' : '.'), sel);
    }
  }
  PROFS.forEach(function (p) { var o = document.createElement('option'); o.value = p.k; o.textContent = p.name; profSel.appendChild(o); });
  profSel.value = prof;
  profSel.addEventListener('change', function () {
    prof = profSel.value; store.set('wowf-mkprof', prof);
    renderMats(); renderCrafts();
  });
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target : null;
    if (!t) return;
    var s = t.closest('[data-star]');
    if (s && mPanel.contains(s)) { var ul = s.closest('ul'); toggleWatch(+s.getAttribute('data-star'), ul && ul.id ? ul.id : ''); return; }
    var x = t.closest('[data-unchart]');
    if (x && mPanel.contains(x)) {
      var gone = +x.getAttribute('data-unchart'), pos = chartIds.indexOf(gone);
      if (dropFromChart(gone)) {
        var next = chartIds[Math.min(pos, chartIds.length - 1)];
        chartChanged(nm(gone) + ' taken off the chart.', chartIds.length > 1 ? '[data-unchart="' + next + '"]' : '#mk-chart');
      }
      return;
    }
    var rg = t.closest('[data-rxgo]');
    if (rg) { openRecipe(rg.getAttribute('data-rxgo')); return; }
    var b = t.closest('[data-item]');
    if (!b) return;
    var id = +b.getAttribute('data-item');
    if (!mPanel.contains(b)) { choose(id, true); return; }
    if (alertList.contains(b) || (dealsEl && dealsEl.contains(b))) {
      var owner = PROFS.filter(function (p) { return p.mats.indexOf(id) >= 0 || p.crafts.indexOf(id) >= 0; })[0];
      if (owner && owner.k !== prof && P().mats.indexOf(id) < 0 && P().crafts.indexOf(id) < 0) { prof = owner.k; profSel.value = prof; store.set('wowf-mkprof', prof); }
      choose(id, false);
      return;
    }
    toggleChart(id, b);
  });
  mPanel.addEventListener('change', function (e) {
    var t = e.target;
    if (!t || !t.classList.contains('mk-money')) return;
    var id = +t.getAttribute('data-wid'), k = t.getAttribute('data-w'), v = parseMoney(t.value);
    if (v === null) { t.setAttribute('aria-invalid', 'true'); watchNote.textContent = 'Write prices like 2s 50c, 75c or 1g 5s.'; return; }
    t.removeAttribute('aria-invalid');
    if (!WATCH[id]) return;
    WATCH[id][k] = v || null;
    t.value = v ? money(v) : '';
    saveWatch(); renderAlerts();
  });
  if (sPanel) {
    sPanel.addEventListener('change', function (e) {
      var t = e.target;
      if (!t) return;
      if (t === suProf) { skprof = suProf.value; store.set('wowf-skprof', skprof); suCur.value = String(curFor(skprof)); renderSkill(); return; }
      if (t.classList.contains('sk-alt')) { var o = store.get('wowf-skopt-' + skprof, {}) || {}; o[t.getAttribute('data-step')] = +t.value; store.set('wowf-skopt-' + skprof, o); renderSkill(); return; }
      if (t === suCur) { suCur.value = String(clampSkill(suCur.value)); store.set('wowf-skcur-' + skprof, { v: clampSkill(suCur.value), at: CH ? CH.at : '' }); renderSkill(); renderCraftList(); renderGoldStrips(); return; }
      if (t === suPick) { store.set('wowf-skpick', suPick.checked); renderSkill(); }
    });
  }
  if (hPanel) {
    hPanel.addEventListener('change', function (e) {
      var t = e.target;
      if (t === hzSkill) { hzSkill.value = String(clampSkill(hzSkill.value)); store.set('wowf-hzskill', { v: clampSkill(hzSkill.value), at: CH ? CH.at : '' }); renderZones(); renderBonus(); }
      else if (t === hzAll) { store.set('wowf-hzall', hzAll.checked); renderZones(); }
    });
  }

  /* ---------- Gold: what to craft with your herbs, and today's herb prices for each level ---------- */
  /* RX rows: [name, profession, item made, how many, reagents, skill to learn, skill estimated, how it's learned
     ('auto' | 'trainer' | 'item'), recipe item, its vendor price, tradeable, vendors [name, zone, faction, limited stock],
     drop or quest note, Merchant's Favor [cost, reputation] or 0]. */
  var gPanel = document.getElementById('panel-gold'), gcList = $('#gc-list'), gcMore = $('#gc-more'), gcStat = $('#gc-status'), gcNextSub = $('#gc-next-sub');
  var GATHER = {};
  Object.keys(HERB).forEach(function (k) { GATHER[k] = 1; });
  [249399, 249424, 249274, 248821, 248822, 248823, 8153].forEach(function (k) { GATHER[k] = 1; });
  var RXP = { alch: 'Alchemy', fa: 'First Aid' }, GC_TOP = 6;
  var gcScope = store.get('wowf-gcscope', 'now'), gcAll = false, gcOpen = {};
  if (['now', 'next', 'all'].indexOf(gcScope) < 0) gcScope = 'now';
  function listAnd(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  function fac() { return charFaction() === 'Alliance' ? 'A' : 'H'; }
  function rxCap(p) { var s = profSkill(RXP[p]); return s && s.max ? s.max : 75; }
  function rxState(rid) {
    var r = RX[rid];
    if (KNOWNR[rid] || (r[7] === 'auto' && profSkill(RXP[r[1]]))) return 'known';
    return curFor(r[1]) >= r[5] ? 'learn' : 'later';
  }
  function rxReach(p) { return Math.max(rxCap(p), curFor(p) + 50); }
  function inScope(rid) {
    var r = RX[rid], st = rxState(rid);
    if (gcScope === 'now') return st !== 'later';
    if (gcScope === 'next') return st !== 'later' || r[5] <= rxReach(r[1]);
    return true;
  }
  /* Sums for one craft. Herbs count at what they'd fetch (you'd sell them otherwise); other reagents at what they cost. */
  function rxEval(rid) {
    var r = RX[rid], n = now(r[2]);
    if (!n) return null;
    var value = Math.round(bestOut(r[2]) * r[3]), herbs = 0, other = 0, miss = false, parts = [];
    r[4].forEach(function (x) {
      var id = x[0], c = x[1], herb = !!GATHER[id], v = herb ? (now(id) ? bestOut(id) : null) : unitCost(id, 1);
      if (v != null) v = Math.round(v * c) / c;
      if (v == null) miss = true; else if (herb) herbs += v * c; else other += v * c;
      parts.push({ id: id, c: c, v: v, herb: herb });
    });
    return { n: n, value: value, herbs: herbs, other: other, miss: miss, profit: miss ? null : value - herbs - other, parts: parts };
  }
  function costHow(p) {
    if (p.v == null) return 'no price today';
    if (p.herb) return 'would sell for';
    var b = buyCost(p.id), m = craftCost(p.id, 1);
    if (m != null && (b == null || m < b)) return 'to make';
    return VBUY[p.id] != null && b === VBUY[p.id] ? 'from a vendor' : 'on the Auction House';
  }
  function repNote(name) {
    if (!CH || !Array.isArray(CH.reps)) return '';
    for (var i = 0; i < CH.reps.length; i++) if (CH.reps[i][0] === name && CH.reps[i][1]) return ' (you’re ' + CH.reps[i][1] + ')';
    return '';
  }
  function rxSource(rid, e) {
    var r = RX[rid], st = rxState(rid), pn = RXP[r[1]], f = fac();
    if (st === 'known') return '<p>You know this recipe.</p>';
    if (r[7] === 'auto') return '<p>It comes with ' + pn + '.</p>';
    if (r[7] === 'trainer') return '<p>Any ' + pn + ' trainer teaches it from skill ' + (r[6] ? 'about ' : '') + r[5] + '.</p>';
    var h = '<p><strong>' + esc(r[8] ? nm(r[8]) : 'A recipe') + '</strong> teaches it, from ' + pn + ' ' + r[5] + '.', cost = null;
    if (r[13]) {
      var camp = f === 'H' ? 'Durotar Supply and Logistics' : 'the Azeroth Commerce Authority';
      h += (f === 'H' ? ' Apothecary Durelle sells it for ' + r[13][0] + ' Merchant’s Favor at the Durotar Supply and Logistics camp, just outside the west gate of the Crossroads in The Barrens.'
        : ' Nina Surefire sells it for ' + r[13][0] + ' Merchant’s Favor at the Azeroth Commerce Authority camp, at Three Corners in Redridge Mountains.') +
        (r[13][1] ? ' You need to be ' + esc(r[13][1]) + ' with ' + camp + esc(repNote(f === 'H' ? 'Durotar Supply and Logistics' : 'Azeroth Commerce Authority')) + '.' : '');
    } else if (r[11].length) {
      var mine = r[11].filter(function (v) { return !v[2] || v[2] === f; });
      if (mine.length) {
        h += ' Sold by ' + esc(listAnd(mine.map(function (v) { return v[0] + ' in ' + v[1]; }))) + (r[9] ? ' for ' + money(r[9]) : '') +
          (mine.some(function (v) { return v[3]; }) ? ', a few at a time until they restock' : '') + '.';
        if (r[9]) cost = r[9];
      } else h += ' Only ' + (f === 'H' ? 'Alliance' : 'Horde') + ' vendors sell it.';
    }
    if (r[12]) h += ' ' + esc(r[12]) + '.';
    if (!r[13] && !r[11].length && !r[12]) h += ' Where it drops isn’t documented yet.';
    if (r[10] && r[8]) {
      var a = now(r[8]);
      if (a && a.min != null) { h += ' On the Auction House from ' + money(a.min) + ' in the latest snapshot (' + plural(a.qty || 1, 'listed', 'listed') + ').'; cost = cost == null ? a.min : Math.min(cost, a.min); }
      else h += ' None on the Auction House in the latest snapshot.';
    }
    if (cost != null && e && e.profit > 0) {
      var k = Math.max(1, Math.ceil(cost / e.profit));
      h += ' At today’s prices it pays for itself after ' + plural(k, 'craft') + '.';
    }
    return h + '</p>';
  }
  function rxBody(rid, e) {
    var r = RX[rid], vend = (SELL[r[2]] || 0) > (sellNet(r[2]) || 0);
    var h = '<table class="gc-sums"><caption class="vh">The sums for one ' + esc(r[0]) + '</caption><tbody>' +
      '<tr><th scope="row">' + r[3] + ' ' + esc(nm(r[2])) + '</th><td>' + (vend ? 'a vendor pays more' : 'sells for, after the 5% cut') + '</td><td class="m">' + money(e.value) + '</td></tr>';
    e.parts.forEach(function (p) {
      h += '<tr><th scope="row">' + p.c + ' ' + esc(nm(p.id)) + '</th><td>' + costHow(p) + '</td><td class="m">' + (p.v == null ? '—' : '−' + money(p.v * p.c)) + '</td></tr>';
    });
    h += '<tr class="tot"><th scope="row">' + (e.miss ? 'Profit' : e.profit >= 0 ? 'Profit' : 'Loss') + '</th><td>a craft</td><td class="m">' + (e.miss ? '—' : money(Math.abs(e.profit))) + '</td></tr></tbody></table>';
    var say = [];
    if (!e.miss && e.herbs > 0) {
      var x = (e.value - e.other) / e.herbs;
      say.push('Crafting turns ' + money(e.herbs) + ' of herbs into ' + money(e.value - e.other) +
        (x >= 1.1 ? ', ' + (x >= 10 ? Math.round(x) : x.toFixed(1)) + ' times what they’d sell for.' : x <= 0.9 ? ', less than they’d sell for: sell the herbs instead.' : ', about what they’d sell for.'));
    }
    if (e.miss) say.push('Some materials have no price in the latest snapshot, so there’s no total.');
    if (e.n.qty != null && e.n.qty < 10) say.push('Only ' + e.n.qty + ' listed, so the price is rough and it may sell slowly.');
    else if (e.n.qty != null) say.push(e.n.qty.toLocaleString('en-GB') + ' listed.');
    var rt = rateText(r[2]);
    if (rt) say.push(rt.charAt(0).toUpperCase() + rt.slice(1) + '.');
    h += '<p>' + esc(say.join(' ')) + '</p>' + rxSource(rid, e);
    var ids = [r[2]].concat(r[4].filter(function (x) { return GATHER[x[0]]; }).map(function (x) { return x[0]; }));
    h += '<p class="gc-hist">Price history: ' + ids.map(function (id) { return itemBtn(id); }).join(' · ') + '</p>';
    return h;
  }
  function rxRow(rid, e) {
    var r = RX[rid], st = rxState(rid);
    var chip = st === 'known' ? '<span class="chip blue">Known</span>' : st === 'learn' ? '<span class="chip ok">Can learn</span>' : '<span class="chip">Skill ' + r[5] + '</span>';
    var fig = e.miss ? '<span class="gc-fig na">no total</span>' : '<span class="gc-fig' + (e.profit < 0 ? ' neg' : '') + '">' + (e.profit >= 0 ? '+' : '') + money(e.profit) +
      '<span class="vh">' + (e.profit >= 0 ? ' profit' : ' loss') + ' a craft</span></span>';
    var mats = r[4].map(function (x) { return (x[1] > 1 ? x[1] + ' ' : '') + nm(x[0]); }).join(', ') + (e.n.qty != null && e.n.qty < 10 ? ' · only ' + e.n.qty + ' listed' : '');
    var sp = sparkSvg(evalSeries(function () { var x = rxEval(rid); return x && !x.miss ? x.profit : null; }), 'Profit on ' + r[0]);
    return '<li><details class="gc-row" data-rx="' + rid + '" data-keep="gc-' + rid + '"' + (gcOpen[rid] ? ' open' : '') + '><summary><span class="gc-head"><span class="gc-name">' + esc(r[0]) + '</span>' +
      (r[1] === 'fa' ? '<span class="gc-tag">First Aid</span>' : '') + chip + '</span><span class="gc-figs">' + fig + sp + '</span><span class="gc-mats"><span class="vh">Needs </span>' + esc(mats) + '</span></summary>' +
      '<div class="gc-body">' + rxBody(rid, e) + '</div></details></li>';
  }
  function renderCraftList() {
    if (!gcList || !gcMore || !gcStat) return;
    $$('input[name="gcscope"]', gPanel).forEach(function (i) { i.checked = i.value === gcScope; });
    if (gcNextSub) gcNextSub.textContent = 'to Alchemy ' + rxReach('alch');
    var d = latest();
    if (!d) { gcList.innerHTML = ''; gcMore.hidden = true; gcStat.textContent = loaded ? 'No prices yet, so there’s nothing to compare.' : 'Waiting for prices…'; return; }
    var rows = [], none = [];
    Object.keys(RX).forEach(function (rid) {
      if (!inScope(rid)) return;
      var e = rxEval(rid);
      if (e) rows.push({ rid: rid, e: e }); else none.push(RX[rid][0]);
    });
    rows.sort(function (a, b) {
      return (a.e.miss ? 1 : 0) - (b.e.miss ? 1 : 0) || (b.e.profit || 0) - (a.e.profit || 0) || RX[a.rid][5] - RX[b.rid][5];
    });
    var good = rows.filter(function (x) { return !x.e.miss && x.e.profit > 0; }).length;
    var show = gcAll ? rows : rows.slice(0, GC_TOP);
    gcList.innerHTML = show.map(function (x) { return rxRow(x.rid, x.e); }).join('') +
      (gcAll && none.length ? '<li class="gc-none"><p class="note">Nothing listed in the latest snapshot, so no price: ' + esc(none.sort().join(', ')) + '.</p></li>' : '');
    if (window.wowfApplyOpen) window.wowfApplyOpen(gcList);
    gcMore.hidden = rows.length <= GC_TOP && !none.length;
    gcMore.textContent = gcAll ? 'Show the top ' + GC_TOP : 'Show all ' + rows.length + (none.length ? ', and ' + none.length + ' with nothing listed' : '');
    gcMore.setAttribute('aria-expanded', gcAll ? 'true' : 'false');
    var when = d.at && !isNaN(Date.parse(d.at)) ? stampFmt.format(new Date(d.at)) : dayLabel(d.d);
    gcStat.textContent = rows.length ? good + ' of ' + plural(rows.length, 'craft') + ' make a profit at prices from ' + when + '.' : 'None of these sell on the Auction House right now.';
  }
  /* A strip of today's prices for the herbs (and crates) each level's section names, and the best craft you can make now with them. */
  var GNAME = null, BONUSH = { 2452: 1, 249399: 1, 249424: 1, 249274: 1, 8153: 1 };
  function goldNames() {
    if (GNAME) return GNAME;
    GNAME = [];
    Object.keys(GATHER).forEach(function (id) { if (NAMES[id]) GNAME.push([+id, NAMES[id], 0]); });
    Object.keys(NAMES).forEach(function (id) { var m = /^Waylaid Crate: (.+)$/.exec(NAMES[id]); if (m) GNAME.push([+id, m[1], 1]); });
    GNAME.sort(function (a, b) { return b[1].length - a[1].length; });
    return GNAME;
  }
  function renderGoldStrips() {
    if (!gPanel) return;
    $$('.gb-live', gPanel).forEach(function (el) {
      var body = el.closest('.more-body'), herbP = el.previousElementSibling;
      if (!body || !herbP) return;
      var allTxt = Array.prototype.filter.call(body.children, function (c) { return c !== el; }).map(function (c) { return c.textContent; }).join(' ').replace(/’/g, "'");
      var herbTxt = herbP.textContent.replace(/’/g, "'"), herbs = [], crates = [];
      goldNames().forEach(function (g) {
        var hay = g[2] || BONUSH[g[0]] ? allTxt : herbTxt;
        if (hay.indexOf(g[1]) >= 0) { (g[2] ? crates : herbs).push(g[0]); if (!g[2]) herbTxt = herbTxt.split(g[1]).join(' '); }
      });
      var priced = herbs.filter(function (id) { return now(id); }).sort(function (a, b) { return floorP(b) - floorP(a); });
      var cr = crates.filter(function (id) { return now(id); });
      if (!priced.length && !cr.length) { el.hidden = true; el.innerHTML = ''; return; }
      var h = '<p><span class="label">Today</span> ' + priced.map(function (id) { return '<span class="gb-pair">' + esc(nm(id)) + ' <span class="mk-price">' + money(floorP(id)) + '</span></span>'; }).join(' · ') +
        (cr.length ? (priced.length ? ' · ' : '') + cr.map(function (id) { return '<span class="gb-pair">an empty ' + esc(NAMES[id].replace(/^Waylaid Crate: /, '')) + ' crate <span class="mk-price">' + money(floorP(id)) + '</span></span>'; }).join(' · ') : '') + '</p>';
      var best = null;
      Object.keys(RX).forEach(function (rid) {
        var r = RX[rid];
        var hs = r[4].filter(function (x) { return GATHER[x[0]]; });
        if (rxState(rid) === 'later' || !hs.length || !hs.every(function (x) { return herbs.indexOf(x[0]) >= 0; })) return;
        var e = rxEval(rid);
        if (e && !e.miss && e.profit > 0 && (!best || e.profit > best.e.profit)) best = { rid: rid, e: e };
      });
      if (best) h += '<p>Best craft you can make or learn now from these: ' + esc(RX[best.rid][0]) + ', +' + money(best.e.profit) + ' a craft. What to craft, above, has the sums.</p>';
      el.innerHTML = h; el.hidden = false;
    });
  }
  if (gPanel) {
    gPanel.addEventListener('change', function (e) {
      var t = e.target;
      if (t && t.name === 'gcscope' && t.checked) { gcScope = t.value; store.set('wowf-gcscope', gcScope); gcAll = false; renderCraftList(); }
    });
    if (gcMore) gcMore.addEventListener('click', function () {
      gcAll = !gcAll; renderCraftList();
      if (!gcAll) { try { $('#gc').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' }); } catch (e) {} }
      gcMore.focus();
    });
    if (gcList) gcList.addEventListener('toggle', function (e) {
      var dt = e.target;
      if (dt && dt.classList && dt.classList.contains('gc-row')) { if (dt.open) gcOpen[dt.getAttribute('data-rx')] = 1; else delete gcOpen[dt.getAttribute('data-rx')]; }
    }, true);
    document.addEventListener('wowf:gold-rendered', renderGoldStrips);
  }

  /* ---------- Under-priced listings (Market tab) ---------- */
  var dealsEl = $('#mk-deals'), dealsNote = $('#mk-deals-note');
  function dealSub(x) {
    return (x.units > 1 ? x.units.toLocaleString('en-GB') + ' at this price' : 'One at this price') + ' · usually ' + money(x.u) + ' at the cheapest · ' +
      (x.vend ? 'a vendor pays ' + money(SELL[x.id]) + ' each' : 'relist at about ' + money(x.u) + ' to make ' + money(x.gain) + ' each after the cut');
  }
  function renderDeals() {
    if (!dealsEl || !dealsNote) return;
    var d = latest();
    if (!loaded) return;
    if (!d) { dealsEl.innerHTML = ''; dealsNote.textContent = 'No prices yet.'; return; }
    if (!dealsStarted()) { dealsEl.innerHTML = ''; dealsNote.textContent = 'This starts once there are three days of prices to compare.'; return; }
    var list = deals(), snap = d.at ? when(Date.parse(d.at)) : dayLabel(d.d);
    dealsEl.innerHTML = list.slice(0, 8).map(function (x) {
      var off = Math.round((1 - x.n.min / x.u) * 100);
      return '<li><span class="mk-name">' + itemBtn(x.id) + '</span><span class="mk-price">' + money(x.n.min) + '</span>' +
        '<span class="mk-chg">−' + off + '%<span class="vh"> below its usual cheapest</span>' + spark(x.id) + '</span>' +
        '<span class="mk-sub">' + esc(dealSub(x)) + '</span></li>';
    }).join('');
    dealsNote.textContent = list.length ? 'From the ' + snap + ' snapshot. Cheap listings go fast, so some may have sold since.' : 'Nothing far below its usual price in the ' + snap + ' snapshot.';
  }

  /* ---------- Freshness (under the timers): when prices, your character and the hotfix notes were last refreshed ---------- */
  var freshEl = $('#fresh-body'), hmFmt, wdFmt;
  try { hmFmt = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true }); } catch (e) { hmFmt = { format: function (d) { return d.toLocaleTimeString(); } }; }
  try { wdFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'short' }); } catch (e) { wdFmt = { format: function (d) { return d.toDateString().slice(0, 3); } }; }
  function when(t) {
    var d = new Date(t), n = new Date();
    if (isNaN(d.getTime())) return '';
    var hm = hmFmt.format(d).replace(/\s+/g, '').replace(':00', '').toLowerCase();
    if (d.toDateString() === n.toDateString()) return hm;
    if (new Date(n.getTime() - 864e5).toDateString() === d.toDateString()) return 'yesterday ' + hm;
    return wdFmt.format(d) + ' ' + hm;
  }
  /* UK clock time to a timestamp: GMT in winter, an hour ahead from the last Sunday in March to the last Sunday in October. */
  function ukTime(y, mo, d, h, mi) {
    var t = Date.UTC(y, mo, d, h, mi);
    function lastSun(m) { var x = new Date(Date.UTC(y, m + 1, 0)); return Date.UTC(y, m, x.getUTCDate() - x.getUTCDay(), 2); }
    return t >= lastSun(2) && t < lastSun(9) ? t - 36e5 : t;
  }
  var MON = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
  function hotfixAt() {
    var p = document.getElementById('panel-updates');
    var m = p ? /Snapshot taken on (?:[A-Za-z]+,? )?(\d{1,2}) ([A-Za-z]{3})[a-z]*(?: (\d{4}))?(?:,? at (\d{1,2})(?:[:.](\d{2}))? ?([ap]m))?/i.exec(p.textContent) : null;
    if (!m) return null;
    var nowD = new Date(), mo = MON[m[2].toLowerCase()];
    if (mo == null) return null;
    var y = m[3] ? +m[3] : nowD.getUTCFullYear();
    if (!m[3] && mo > nowD.getUTCMonth() + 1) y--;
    var h = m[4] ? (+m[4] % 12) + (/pm/i.test(m[6] || '') ? 12 : 0) : 4;
    return ukTime(y, mo, +m[1], h, m[5] ? +m[5] : 0);
  }
  function renderFresh() {
    if (!freshEl) return;
    var d = days.length ? days[days.length - 1] : null, nowT = Date.now(), parts = [];
    function part(label, t, maxH, tab, extra) {
      if (t == null || isNaN(t)) return '<button type="button" class="fr" data-goto="' + tab + '">' + label + ' <span class="fr-t">not yet</span></button>';
      var late = nowT - t > maxH * 36e5;
      return '<button type="button" class="fr' + (late ? ' late' : '') + '" data-goto="' + tab + '">' + (late ? '<span class="fr-i" aria-hidden="true">!</span>' : '') + label +
        ' <span class="fr-t">' + esc(when(t)) + '</span>' + (late ? ' <span class="fr-l">late</span>' : '') + (extra || '') + '</button>';
    }
    if (!loaded) parts.push('<span class="fr">Prices <span class="fr-t">loading</span></span>');
    else parts.push(part('Prices', d ? Date.parse(d.at || (d.d + 'T04:00:00Z')) : null, 16, 'market', d && d.src !== 'blizzard' ? ' <span class="fr-l">from the backup source</span>' : ''));
    if (CH || loaded) parts.push(part('Character', CH && CH.at ? Date.parse(CH.at) : null, 16, 'build'));
    parts.push(part('Hotfixes', hotfixAt(), 30, 'updates'));
    var h = parts.join('<span class="fr-sep" aria-hidden="true">·</span>');
    if (h !== lastFresh) { lastFresh = h; freshEl.innerHTML = h; }
  }
  var lastFresh = '';
  setInterval(renderFresh, 60000);

  /* ---------- Gear check (Build tab): cheap Auction House upgrades for what your character has on ---------- */
  var gearEl = $('#bd-gear'), GEARCFG = null;
  var SLOTN = { HEAD: 'Head', NECK: 'Neck', SHOULDER: 'Shoulders', BACK: 'Back', CHEST: 'Chest', WRIST: 'Wrists', HANDS: 'Hands', WAIST: 'Waist',
    LEGS: 'Legs', FEET: 'Feet', FINGER: 'Rings', TRINKET: 'Trinkets', MAIN_HAND: 'Main hand', OFF_HAND: 'Off hand', RANGED: 'Ranged or relic' };
  var WTS = [['str', 'Strength', 'Enhancement Shaman, Warrior, Retribution Paladin'], ['agi', 'Agility', 'Hunter, Rogue, Feral Druid'],
    ['int', 'Spell damage', 'Elemental Shaman, Mage, Warlock, Shadow Priest'], ['heal', 'Healing', 'Restoration Shaman and Druid, Holy Priest and Paladin']];
  var QUAL = { P: 'Poor', C: 'Common', U: 'Uncommon', R: 'Rare', E: 'Epic', L: 'Legendary' };
  function wName(k) { for (var i = 0; i < WTS.length; i++) if (WTS[i][0] === k) return WTS[i][1]; return 'Strength'; }
  function wUnit(k) { return k === 'agi' ? 'Agility' : k === 'int' || k === 'heal' ? 'Intellect' : 'Strength'; }
  function gearPicks() {
    var g = CH && CH.gear, out = [];
    if (!g || !g.slots || typeof g.slots !== 'object') return out;
    Object.keys(g.slots).forEach(function (s) {
      (g.slots[s].up || []).forEach(function (u) { var p = num(u[4]), gain = num(u[5]); if (p && gain) out.push({ slot: s, u: u, per: gain / p }); });
    });
    return out;
  }
  function renderGear() {
    if (!gearEl) return;
    var g = CH && CH.gear;
    if (!g || !g.slots || typeof g.slots !== 'object') { gearEl.hidden = true; return; }
    var want = GEARCFG && GEARCFG.spec ? GEARCFG.spec : g.spec, who = CH.name || 'your character', ups = [], none = [];
    var h = '<div class="tool-head"><p class="label">Gear check · level ' + (+g.lvl || charLevel()) + '</p><h3>Cheap upgrades on the Auction House</h3>' +
      '<p class="note">The cheapest listings in each slot that beat what ' + esc(who) + ' has on, scored for ' + esc(wName(g.spec).toLowerCase()) + '. A gain of +5 is worth about 5 ' + wUnit(g.spec) +
      '. Items with random stats, such as “of the Bear”, are left out: Blizzard’s data doesn’t say which stats they rolled.</p></div>';
    h += '<div class="cb-field gear-w"><label for="gear-spec">Score gear for</label><select id="gear-spec" class="select"' + (readOnly ? ' disabled' : '') + '>' +
      WTS.map(function (w) { return '<option value="' + w[0] + '"' + (w[0] === want ? ' selected' : '') + '>' + esc(w[1] + ': ' + w[2]) + '</option>'; }).join('') + '</select></div>';
    if (want !== g.spec) h += '<p class="mk-hint go">Saved. The picks below are still for ' + esc(wName(g.spec).toLowerCase()) + '; the next refresh, at about 4am or 6pm UK time, picks for ' + esc(wName(want).toLowerCase()) + '.</p>';
    Object.keys(SLOTN).forEach(function (s) { var x = g.slots[s]; if (!x) return; if (x.up && x.up.length) ups.push(s); else none.push(SLOTN[s]); });
    var top = [], seenS = {};
    gearPicks().sort(function (a, b) { return b.per - a.per; }).forEach(function (x) { if (!seenS[x.slot] && top.length < 3) { seenS[x.slot] = 1; top.push(x); } });
    if (top.length) {
      h += '<div class="gear-best"><p class="label">Best value right now</p><ul class="gear-ups">' + top.map(function (x) {
        var u = x.u;
        return '<li><span class="gear-name">' + esc(u[1]) + '</span><span class="mk-price">' + money(u[4]) + '</span><span class="chip ok"><span class="nc">+' + (+u[5]).toFixed(1) + '</span><span class="vh"> gain</span></span>' +
          '<span class="mk-sub">' + esc(SLOTN[x.slot] + ' · ' + (QUAL[u[2]] ? QUAL[u[2]] + ' · ' : '') + 'level ' + (+u[3] || 1) + (u[6] ? ' · ' + u[6] : '')) + '</span></li>';
      }).join('') + '</ul></div>';
    }
    if (ups.length) {
      h += '<details class="more" data-keep="gear-all"><summary>Every slot with an upgrade (' + ups.length + ')</summary><div class="more-body"><ul class="gear-list">';
      ups.forEach(function (s) {
        var x = g.slots[s], cur = (x.cur || []).map(function (c) { return c[1] || 'Item ' + c[0]; });
        h += '<li><div class="gear-slot"><span class="kv-name">' + SLOTN[s] + '</span><span class="note">' + (cur.length ? 'Now: ' + esc(listAnd(cur)) : 'Empty now') + '</span></div><ul class="gear-ups">';
        var shown = x.up.length > 2 ? [x.up[0], x.up[x.up.length - 1]] : x.up;  /* the cheapest and the biggest */
        shown.forEach(function (u) {
          h += '<li><span class="gear-name">' + esc(u[1]) + '</span><span class="mk-price">' + money(u[4]) + '</span><span class="chip ok"><span class="nc">+' + (+u[5]).toFixed(1) + '</span><span class="vh"> gain</span></span>' +
            '<span class="mk-sub">' + esc((QUAL[u[2]] ? QUAL[u[2]] + ' · ' : '') + 'level ' + (+u[3] || 1) + (u[6] ? ' · ' + u[6] : '')) + '</span></li>';
        });
        h += '</ul></li>';
      });
      h += '</ul></div></details>';
    } else h += '<p>Nothing on the Auction House beats your gear right now.</p>';
    if (none.length) h += '<p class="note">No upgrades listed for: ' + esc(listAnd(none)) + '.</p>';
    h += '<p class="note">Checked ' + esc(stamp(CH.at)) + ' against that hour’s listings. Gains count stats only, so look at an item in game before you buy.</p>';
    gearEl.innerHTML = h;
    gearEl.hidden = false;
    if (window.wowfApplyOpen) window.wowfApplyOpen(gearEl);
  }
  if (gearEl) gearEl.addEventListener('change', function (e) {
    var t = e.target;
    if (!t || t.id !== 'gear-spec') return;
    var v = t.value;
    if (!DBH || readOnly || !WTS.some(function (w) { return w[0] === v; })) return;
    GEARCFG = { spec: v };
    function again() { renderGear(); var s2 = document.getElementById('gear-spec'); if (s2) s2.focus(); }
    DBH.doc('config/gear').set({ spec: v, at: new Date().toISOString() }).then(null, function (err) { if (err && err.code === 'invalid_argument') readOnly = true; GEARCFG = null; again(); });
    again();
  });

  /* ---------- Today tab: the cards that come from data ---------- */
  var tdPanel = document.getElementById('panel-today'), SEEN = null;
  function seenIds() {
    var ids = {};
    Object.keys(WATCH).forEach(function (k) { ids[k] = 1; });
    PROFS[0].mats.concat(PROFS[0].crafts, PROFS[1].crafts).forEach(function (k) { if (typeof k === 'number') ids[k] = 1; });
    return Object.keys(ids).map(Number).filter(function (id) { return NAMES[id]; });
  }
  function snapNow() {
    var d = latest(), x = { at: Date.now(), d: d ? d.d : '', pat: d ? d.at : '', p: {}, hf: hotfixAt() };
    if (d) seenIds().forEach(function (id) { var n = now(id); if (n && n.price != null) x.p[id] = n.price; });
    if (CH) { x.lvl = +CH.level || null; x.prof = {}; (CH.profs || []).forEach(function (p) { x.prof[p[0]] = +p[1] || 0; }); }
    return x;
  }
  /* What you saw at the end of your last visit. A visit ends after three hours away. */
  function seenBase() {
    if (!loaded) return SEEN ? SEEN.prev : null;
    if (!SEEN) {
      var st = store.get('wowf-seen', null) || {}, cur = st.cur && typeof st.cur.at === 'number' ? st.cur : null;
      SEEN = cur && Date.now() - cur.at <= 3 * 36e5 ? { prev: st.prev && typeof st.prev.at === 'number' ? st.prev : null } : { prev: cur };
    }
    var c = snapNow();
    if (SEEN.cur && !CH && SEEN.cur.prof) { c.lvl = SEEN.cur.lvl; c.prof = SEEN.cur.prof; }
    SEEN.cur = c;
    store.set('wowf-seen', SEEN);
    return SEEN.prev;
  }
  function changesHtml(base) {
    if (!base) return '<li class="note">From your next visit, this lists what changed while you were away: levels, skill points, price moves and new hotfix notes.</li>';
    var out = [];
    if (CH && base.lvl && +CH.level > base.lvl) out.push('<li>Level <b>' + base.lvl + ' → ' + (+CH.level) + '</b></li>');
    if (CH && base.prof) (CH.profs || []).forEach(function (p) { var was = base.prof[p[0]]; if (was != null && +p[1] > was) out.push('<li>' + esc(p[0]) + ' <b>' + was + ' → ' + (+p[1]) + '</b></li>'); });
    var moves = [];
    Object.keys(base.p || {}).forEach(function (k) {
      var id = +k, n = now(id), was = num(base.p[k]);
      if (!n || n.price == null || !was || (n.qty || 0) < 10) return;
      var c = (n.price - was) / was;
      if (Math.abs(c) >= 0.15 && Math.abs(n.price - was) >= 5) moves.push({ id: id, c: c, was: was, p: n.price, w: WATCH[id] ? 1 : 0 });
    });
    moves.sort(function (a, b) { return b.w - a.w || Math.abs(b.c) - Math.abs(a.c); });
    moves.slice(0, 5).forEach(function (m) {
      out.push('<li>' + itemBtn(m.id) + (m.w ? ' <span aria-hidden="true">★</span><span class="vh">(watched)</span>' : '') + ' ' + (m.c > 0 ? 'up ' : 'down ') + Math.round(Math.abs(m.c) * 100) + '%: ' + money(m.was) + ' → <b>' + money(m.p) + '</b></li>');
    });
    var hf = hotfixAt();
    if (hf && base.hf && hf > base.hf) out.push('<li>New hotfix notes on the <button type="button" class="linkish" data-goto="updates">Updates tab</button>.</li>');
    var head = '<li class="note">Since ' + esc(when(base.at)) + ':</li>';
    return out.length ? head + out.join('') : '<li>Nothing much has changed since ' + esc(when(base.at)) + '.</li>';
  }
  function topCrafts(n) {
    var rows = [];
    Object.keys(RX).forEach(function (rid) {
      if (rxState(rid) === 'later') return;
      var e = rxEval(rid);
      if (e && !e.miss && e.profit > 0) rows.push({ rid: rid, e: e });
    });
    return rows.sort(function (a, b) { return b.e.profit - a.e.profit; }).slice(0, n);
  }
  function renderToday() {
    if (!tdPanel) return;
    var el, base = seenBase(), lvl = charLevel();
    if ((el = $('#td-who'))) el.textContent = CH && CH.name ? CH.name + ' · level ' + (+CH.level || lvl) + ' ' + (CH.cls || '') : 'Today in Azeroth';
    if ((el = $('#td-changes-list'))) el.innerHTML = loaded ? changesHtml(base) : '<li class="note">Loading today’s data…</li>';
    if ((el = $('#td-next-mk'))) {
      var hp = '';
      if (CH) (CH.profs || []).forEach(function (p) {
        var o = { sk: +p[1] || 0, max: +p[2] || 0 }, hint = rankHint(o, +CH.level || lvl, p[0]);
        if (hint) hp += '<li><span class="td-k">' + esc(p[0]) + ' ' + o.sk + '/' + o.max + '</span><span class="' + (hint.go ? 'mk-hint go' : '') + '">' + esc(hint.t) + '</span></li>';
      });
      el.innerHTML = hp;
    }
    if ((el = $('#td-crafts-list'))) {
      var tc = loaded && latest() ? topCrafts(3) : [];
      el.innerHTML = tc.length ? tc.map(function (x) {
        var r = RX[x.rid], st = rxState(x.rid);
        return '<li><span class="td-row"><button type="button" class="linkish td-strong" data-rxgo="' + x.rid + '">' + esc(r[0]) + '</button><span class="mk-price">+' + money(x.e.profit) + '</span></span>' +
          '<span class="note td-n">' + (st === 'known' ? 'You know it' : 'You can learn it') + ' · ' + esc(r[4].map(function (m) { return (m[1] > 1 ? m[1] + ' ' : '') + nm(m[0]); }).join(', ')) + '</span></li>';
      }).join('') : '<li class="note">' + (!loaded ? 'Waiting for prices…' : !latest() ? 'No prices yet.' : 'Nothing you can make now turns a profit at the latest prices.') + '</li>';
    }
    if ((el = $('#td-herbs-body'))) {
      var zs = zoneScores(herbSkill(), lvl, charFaction()), byScore = function (a, b) { return b.score - a.score || b.density - a.density; };
      var zr = zs.every.filter(function (r) { return r.near && r.z[2] <= lvl + 2; }).sort(byScore)[0] || zs.every.filter(function (r) { return r.near; }).sort(byScore)[0];
      if (zr) {
        var mix = zr.herbs.filter(function (x) { return x.ok; }).slice(0, 3).map(function (x) { return nm(x.id) + ' ' + Math.round(x.c / zr.tot * 100) + '%'; });
        el.innerHTML = '<p class="td-row"><b>' + esc(zr.z[1]) + '</b><span class="mk-price">' + (zr.perNode == null ? '' : money(zr.perNode) + '<span class="vh"> a node</span>') + '</span></p>' +
          '<p class="note td-n">Level ' + zr.z[2] + '–' + zr.z[3] + (zr.z[2] > lvl ? ', above your level' : '') + ' · at Herbalism ' + herbSkill() + (zr.perNode == null ? '' : ', about that much a herb after the cut') + (mix.length ? ' · mostly ' + esc(listAnd(mix)) : '') + '</p>';
      } else el.innerHTML = '<p class="note">No herb zones near your level.</p>';
    }
    if ((el = $('#td-deals-list'))) {
      var dl = deals().slice(0, 3);
      el.innerHTML = dl.length ? dl.map(function (x) {
        return '<li><span class="td-row">' + itemBtn(x.id) + '<span class="mk-price">' + money(x.n.min) + '</span></span><span class="note td-n">' + esc(dealSub(x)) + '</span></li>';
      }).join('') : '<li class="note">' + (!loaded ? 'Waiting for prices…' : dealsStarted() ? 'Nothing far below its usual price right now.' : 'This starts once there are three days of prices to compare.') + '</li>';
    }
    if ((el = $('#td-gear-list'))) {
      var gp = gearPicks(), seenSlot = {}, best = [];
      gp.sort(function (a, b) { return b.per - a.per; }).forEach(function (x) { if (!seenSlot[x.slot] && best.length < 3) { seenSlot[x.slot] = 1; best.push(x); } });
      el.innerHTML = best.length ? best.map(function (x) {
        return '<li><span class="td-row"><span class="td-strong">' + esc(x.u[1]) + '</span><span class="mk-price">' + money(x.u[4]) + '</span></span><span class="note td-n">' + esc(SLOTN[x.slot] || x.slot) + ' · +' + (+x.u[5]).toFixed(1) + ' on ' + esc(wName(CH.gear.spec)) + ' scoring</span></li>';
      }).join('') : '<li class="note">' + (CH && CH.gear ? 'Nothing on the Auction House beats your gear for less right now.' : 'This fills in after the next refresh reads your gear.') + '</li>';
    }
  }

  /* ---------- Search: items, recipes, herb zones and skill-up routes (the page adds tabs, sections, talents and quests) ---------- */
  function openRecipe(rid) {
    if (!RX[rid] || !gcList) return;
    if (!inScope(rid)) { gcScope = 'all'; store.set('wowf-gcscope', gcScope); }
    gcAll = true; gcOpen[rid] = 1; renderCraftList();
    var dt = gcList.querySelector('[data-rx="' + rid + '"]');
    if (dt) dt.open = true;
    if (window.wowfGo) window.wowfGo('gold', dt ? dt.querySelector('summary') : $('#gc'));
  }
  function zoneLi(name) { return $$('#hz-list li').filter(function (li) { var b = li.querySelector('.hz-name b'); return b && b.textContent === name; })[0] || null; }
  function openZone(name) {
    var li = zoneLi(name);
    if (!li && hzAll && !hzAll.checked) { hzAll.checked = true; store.set('wowf-hzall', true); renderZones(); li = zoneLi(name); }
    if (window.wowfGo) window.wowfGo('herbs', li || $('#hz-list'));
  }
  function openRoute(k) {
    if (!ROUTES[k] || !suProf) return;
    skprof = k; store.set('wowf-skprof', skprof); fillSkillProfs(); suProf.value = k; suCur.value = String(curFor(skprof)); renderSkill();
    if (window.wowfGo) window.wowfGo('skillup', suProf);
  }
  window.WOWF_SEARCH = window.WOWF_SEARCH || [];
  window.WOWF_SEARCH.push(function () {
    var out = [], enemy = charFaction() === 'Horde' ? 'A' : 'H';
    Object.keys(NAMES).forEach(function (k) {
      var id = +k, n = now(id);
      out.push({ t: NAMES[k], k: 'Item', s: n ? money(n.price) + ' at the latest prices' : 'not listed in the latest snapshot', go: function () { choose(id, true); } });
    });
    Object.keys(RX).forEach(function (rid) { var r = RX[rid]; out.push({ t: r[0], k: 'Recipe', s: RXP[r[1]] + ' ' + r[5] + ', on the Gold tab', go: function () { openRecipe(rid); } }); });
    HZ.forEach(function (z) { if (z[4] !== enemy) out.push({ t: z[1], k: 'Herb zone', s: 'level ' + z[2] + '–' + z[3], go: function () { openZone(z[1]); } }); });
    SKORDER.forEach(function (k) { if (ROUTES[k]) out.push({ t: ROUTES[k].n + ' skill-up route', k: 'Skill-up', s: '', go: function () { openRoute(k); } }); });
    return out;
  });

  var lastW = 0;
  function onResize() { var w = chartEl.clientWidth; if (w && Math.abs(w - lastW) > 1) { lastW = w; drawChart(); } }
  try { new ResizeObserver(onResize).observe(chartEl); } catch (e) { window.addEventListener('resize', onResize); }

  function fillInputs() {
    if (document.activeElement !== suCur) suCur.value = String(curFor(skprof));
    if (document.activeElement !== hzSkill) hzSkill.value = String(herbSkill());
  }
  suPick.checked = !!store.get('wowf-skpick', false);
  hzAll.checked = !!store.get('wowf-hzall', false);
  WATCH = cleanWatch(store.get('wowf-watch', {}));
  fillSkillProfs(); fillInputs();
  function renderAll() {
    renderChar(); renderGear(); renderPrices(); renderSkill(); renderZones(); renderBonus(); renderCraftList(); renderGoldStrips(); renderFresh(); renderToday();
  }
  renderAll();
  /* The page's class, faction and level can change while this runs: re-read them for the herb zones and skill-up rows. */
  document.addEventListener('wowf:char-changed', function () { renderZones(); renderSkill(); renderCraftList(); renderGoldStrips(); renderToday(); });
  document.addEventListener('wowf:tab', function (e) { if (e && e.detail && e.detail.token === 'today') renderToday(); });

  /* ---------- Data ---------- */
  function fail(msg) { loaded = true; clearTimeout(timer); renderAll(); statusEl.textContent = msg; }
  var timer = setTimeout(function () { if (!loaded) statusEl.textContent = 'Prices can’t be reached yet. They’ll appear once the page loads its data.'; }, 10000);
  function onDays(snap) {
    loaded = true; clearTimeout(timer);
    days = snap.docs.map(function (doc) {
      var v = doc.data() || {};
      return { d: String(v.d || doc.id), at: typeof v.at === 'string' ? v.at : '', src: v.src === 'blizzard' ? 'blizzard' : 'ahledger', m: v.m && typeof v.m === 'object' ? v.m : {} };
    }).filter(function (d) { return /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(d.d); })
      .sort(function (a, b) { return a.d < b.d ? -1 : (a.d > b.d ? 1 : 0); });
    renderAll();
  }
  function onWatch(snap) {
    var d = snap && snap.exists ? snap.data() : null;
    var items = cleanWatch(d && d.items);
    store.set('wowf-watch-server', items);
    if (!saving && !again) { WATCH = items; store.set('wowf-watch', WATCH); renderAlerts(); renderWatch(); renderMats(); renderCrafts(); }
  }
  function onChar(snap) {
    var d = snap && snap.exists ? snap.data() : null;
    if (!d || !d.name) return;
    CH = d; KNOWN = {}; KNOWNR = {};
    (d.profs || []).forEach(function (p) { (p[3] || []).forEach(function (rid) { KNOWNR[rid] = 1; if (RI[rid]) KNOWN[RI[rid]] = 1; }); });
    try {
      if (store.get('wowf-sync-applied', '') !== d.at) {
        store.set('wowf-sync-applied', d.at);
        document.dispatchEvent(new CustomEvent('wowf:sync', { detail: { lvl: d.level, cls: d.cls, fac: d.faction } }));
      }
      document.dispatchEvent(new CustomEvent('wowf:talents', { detail: { name: d.name, cls: d.cls, level: d.level, talents: d.talents || [], at: d.at } }));
      if (Array.isArray(d.qdone)) document.dispatchEvent(new CustomEvent('wowf:questlog', { detail: { done: d.qdone, now: Array.isArray(d.qnow) ? d.qnow : [], at: d.at } }));
    } catch (e) {}
    fillSkillProfs(); fillInputs(); renderAll();
  }
  function onSpeed(snap) {
    SPD = snap.docs.map(function (doc) { var v = doc.data() || {}; return { at: String(v.at || ''), w: num(v.w), u: v.u && typeof v.u === 'object' ? v.u : {} }; })
      .filter(function (x) { return x.w && x.w <= 180 && !isNaN(Date.parse(x.at)); });
    renderMats(); renderWatch(); renderCrafts(); renderCraftList();
  }
  function onGearCfg(snap) {
    var d = snap && snap.exists ? snap.data() : null;
    GEARCFG = d && typeof d.spec === 'string' && WTS.some(function (w) { return w[0] === d.spec; }) ? { spec: d.spec } : null;
    renderGear();
  }
  function onQuests(snap) {
    var d = snap && snap.exists ? snap.data() : null;
    if (d && d.done && typeof d.done === 'object') { try { document.dispatchEvent(new CustomEvent('wowf:quests', { detail: { done: d.done } })); } catch (e) {} }
  }
  document.addEventListener('wowf:quests-save', function (e) {
    var done = e && e.detail && e.detail.done, clean = {};
    if (!DBH || readOnly || !done || typeof done !== 'object') return;
    Object.keys(done).forEach(function (k) { if (/^[A-Za-z0-9-]{1,80}$/.test(k) && typeof done[k] === 'boolean') clean[k] = done[k]; });
    DBH.doc('config/quests').set({ done: clean, at: new Date().toISOString() }).then(null, function (err) { if (err && err.code === 'invalid_argument') readOnly = true; });
  });
  /* ---------- Where the data comes from ----------
     Prices, the character and the sell-speed samples are read from data/latest.json, next to this page. The GitHub
     Actions refresh writes it twice a day; Claude's sync copies it into the Claude artifact. Settings (watchlist,
     gear stat, quest ticks) are saved in the artifact's database when the page runs inside Claude. Anywhere else
     they start from the copies in data/latest.json, and changes stay in this browser. */
  var LOCAL = 'wowf-local:';
  function fileDb(files, live) {
    var docs = (files && files.docs) || {};
    function clone(v) { return v == null ? undefined : JSON.parse(JSON.stringify(v)); }
    function localCopy(path) { try { var t = localStorage.getItem(LOCAL + path); return t ? JSON.parse(t) : undefined; } catch (e) { return undefined; } }
    function setting(path) {  /* the newer of the file copy and this browser's copy */
      var f = docs[path], l = localCopy(path);
      return l && (!f || String(l.at || '') >= String(f.at || '')) ? l : f;
    }
    function snap(path, v) { return { id: path.split('/').pop(), exists: v != null, data: function () { return clone(v); } }; }
    function later(f) { setTimeout(f, 0); }
    function doc(path) {
      var isSetting = path.indexOf('config/') === 0;
      if (isSetting && live) return live.doc(path);
      function read() { return isSetting ? setting(path) : docs[path]; }
      return {
        id: path.split('/').pop(), path: path,
        get: function () { return Promise.resolve(snap(path, read())); },
        onSnapshot: function (next) { later(function () { next(snap(path, read())); }); return function () {}; },
        set: function (v) {
          if (!isSetting) return Promise.reject({ code: 'invalid_argument' });
          try { localStorage.setItem(LOCAL + path, JSON.stringify(v)); } catch (e) {}
          return Promise.resolve();
        }
      };
    }
    function collection(coll) {
      function query(order, lim) {
        function run() {
          var list = Object.keys(docs).filter(function (p) { return p.indexOf(coll + '/') === 0 && p.split('/').length === 2; })
            .map(function (p) { return snap(p, docs[p]); });
          if (order) list.sort(function (a, b) {
            var x = (a.data() || {})[order[0]], y = (b.data() || {})[order[0]], c = x < y ? -1 : (x > y ? 1 : 0);
            return order[1] === 'desc' ? -c : c;
          });
          if (lim != null) list = list.slice(0, lim);
          return { docs: list, size: list.length, empty: !list.length, forEach: function (f) { list.forEach(f); } };
        }
        return {
          orderBy: function (field, dir) { return query([field, dir === 'desc' ? 'desc' : 'asc'], lim); },
          limit: function (n) { return query(order, n); },
          get: function () { return Promise.resolve(run()); },
          onSnapshot: function (next) { later(function () { next(run()); }); return function () {}; }
        };
      }
      return query(null, null);
    }
    return { doc: doc, collection: collection };
  }
  function loadFiles() {
    var el = document.getElementById('wowf-data');  /* the single-file offline copy carries its data inside the page */
    if (el) { try { return Promise.resolve(JSON.parse(el.textContent)); } catch (e) { return Promise.reject(e); } }
    return fetch('data/latest.json', { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  }
  function liveDb() {
    try {
      if (window.claude && typeof window.claude.use === 'function') return window.claude.use('db').then(function (db) { return db || null; }, function () { return null; });
    } catch (e) {}
    return Promise.resolve(null);
  }
  Promise.all([loadFiles().then(null, function () { return null; }), liveDb()]).then(function (r) {
    var files = r[0], db = fileDb(files, r[1]);
    DBH = db;
    if (files) {
      db.collection('prices').orderBy('d', 'desc').limit(120).onSnapshot(onDays, function () { fail('Prices couldn’t load. Try opening the page again later.'); });
      db.doc('char/current').onSnapshot(onChar, function () {});
      db.collection('speed').orderBy('at', 'desc').limit(14).onSnapshot(onSpeed, function () {});
    } else fail('Prices couldn’t load. Try opening the page again later.');
    db.doc('config/watch').onSnapshot(onWatch, function () {});
    db.doc('config/quests').onSnapshot(onQuests, function () {});
    db.doc('config/gear').onSnapshot(onGearCfg, function () {});
  });
})();
