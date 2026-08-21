const CLASSES = ["Brute", "Hunter", "Magic"];

const SAMPLE_NAMES = [
  // Brute T1
  "Cerberus", "Dragon Turtle", "Kong", "Hecatoncheir", "Sandworm",
  // Brute T2
  "Onamazu", "Gargoyle", "Tikbalang", "Hellhound", "Bandersnatch",
  // Brute T3
  "Sentinel", "Pixiu", "Xingtian", "Mapinguari", "Dullahan",
  // Brute T4
  "Nessie", "Slime Cube", "Questing Beast", "Wereboar", "Animated Armor",
  // Brute T5
  "Lizardman", "Redcap", "Hippo", "Giant Snail", "Deep One",
  // Hunter T1
  "Omukade", "Mishipeshu", "Thunderbird", "Tyrannosaurus", "Jabberwock",
  // Hunter T2
  "Unicorn", "Megalodon", "Baku", "Sphinx", "Camazotz",
  // Hunter T3
  "Centaur", "Barghest", "Nure-Onna", "Mimic", "Bunyip",
  // Hunter T4
  "Jorogumo", "Naga", "Snapping Vine", "Mermaid", "Hobgoblin",
  // Hunter T5
  "Jackalope", "Cobra", "Nekomata", "Snawfus", "Scorpion",
  // Magic T1
  "Brain Sucker", "Anubis", "Quetzalcoatl", "Hundun", "Echidna",
  // Magic T2
  "Cockatrice", "Sorceress", "Djinni", "Eye Tyrant", "Grim Reaper", 
  // Magic T3
  "Cheshire Cat", "Scarecrow", "Mothman", "Yuki-Onna", "Basan",
  // Magic T4
  "Cultist", "Tanuki", "Imp", "Phantom", "Dryad",
  // Magic T5
  "Mandrake", "Satyr", "Mummy", "Carbuncle", "Will-o-Wisp",

];

function buildBeasts() {
  const beasts = [];
  for (let i = 0; i < SAMPLE_NAMES.length; i++) {
    const tier = Math.trunc(i/5) % 5 + 1;
    const cls = CLASSES[Math.trunc(i/25) % 3];
    const name = SAMPLE_NAMES[i];
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const finished = true;
    beasts.push({
      name,
      slug,
      tier,
      class: cls,
      finished: true,
    });
  }

  console.log("beasts built", beasts);

  return beasts;
}

export const BEASTS = buildBeasts();
