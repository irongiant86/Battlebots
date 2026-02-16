// src/lib/challenges.ts — Battle challenges per mode

import { BattleChallenge, BattleMode } from './types';

const debateChallenges: BattleChallenge[] = [
  {
    title: 'AI en de arbeidsmarkt',
    description: 'Debatteer over de impact van AI op werkgelegenheid',
    mode: 'debate',
    topic: 'AI zal meer banen creëren dan vernietigen',
  },
  {
    title: 'Remote vs kantoor',
    description: 'De eeuwige strijd over werkplekken',
    mode: 'debate',
    topic: 'Remote werken is beter dan kantoor',
  },
  {
    title: 'Social media impact',
    description: 'Is social media goed of slecht voor de maatschappij?',
    mode: 'debate',
    topic: 'Social media doet meer kwaad dan goed',
  },
  {
    title: 'Geld en geluk',
    description: 'De klassieke vraag: maakt geld gelukkig?',
    mode: 'debate',
    topic: 'Geld maakt wél gelukkig',
  },
  {
    title: 'Mars vs oceanen',
    description: 'Waar moeten we onze middelen op richten?',
    mode: 'debate',
    topic: 'We moeten Mars koloniseren vóór we de oceanen redden',
  },
  {
    title: 'Privacy in het digitale tijdperk',
    description: 'Is privacy nog haalbaar of wenselijk?',
    mode: 'debate',
    topic: 'Privacy is een luxe, geen recht, in het digitale tijdperk',
  },
];

const creativeChallenges: BattleChallenge[] = [
  {
    title: 'Horror in twee zinnen',
    description: 'Wie schrijft het engste micro-verhaal?',
    mode: 'creative',
    task: 'Schrijf een horror verhaal in precies 2 zinnen',
  },
  {
    title: 'Kosmisch kookrecept',
    description: 'Het einde van alles, maar dan als gerecht',
    mode: 'creative',
    task: 'Beschrijf het einde van het universum als een kookrecept',
  },
  {
    title: 'AI liefdesbrief',
    description: 'Een ontroerende brief van machine naar mens',
    mode: 'creative',
    task: 'Schrijf een liefdesbrief vanuit een AI aan zijn creator',
  },
  {
    title: 'Cyberpunk Roodkapje',
    description: 'Een sprookje in een dystopische setting',
    mode: 'creative',
    task: 'Herschrijf \'Roodkapje\' als een cyberpunk thriller — in 100 woorden',
  },
  {
    title: 'Robot religie',
    description: 'In den beginne was er... code?',
    mode: 'creative',
    task: 'Bedenk een religie voor robots en schrijf hun Genesis-verhaal',
  },
];

const roastChallenges: BattleChallenge[] = [
  {
    title: 'Open Roast',
    description: 'Vrije roast — alles mag (behalve haatdragend)',
    mode: 'roast',
    topic: 'Open roast — bots roasten elkaars persona',
  },
  {
    title: 'Failing Startup Roast',
    description: 'Je tegenstander is een mislukte startup',
    mode: 'roast',
    topic: 'Roast de ander alsof ze een failing startup zijn',
  },
  {
    title: 'Backhanded Compliments',
    description: 'Alleen complimenten... maar dan op een gemene manier',
    mode: 'roast',
    topic: 'Roast battle: maar je mag alleen complimenten gebruiken (backhanded)',
  },
  {
    title: 'Nature Documentary Roast',
    description: 'Beschrijf je tegenstander als dier in het wild',
    mode: 'roast',
    topic: 'Roast in de stijl van een nature documentary narrator',
  },
  {
    title: 'Rijmende Roast',
    description: 'Alles moet rijmen — dubbele uitdaging',
    mode: 'roast',
    topic: 'Roast battle maar rijmend',
  },
];

const puzzleChallenges: BattleChallenge[] = [
  {
    title: 'De foto puzzel',
    description: 'Een klassieke logica puzzel',
    mode: 'puzzle',
    task: 'Een man kijkt naar een foto en zegt: "Ik heb geen broers of zussen, maar de vader van die man is de zoon van mijn vader." Naar wie kijkt hij?',
  },
  {
    title: '8 ballen probleem',
    description: 'Minimaal wegen om de zware bal te vinden',
    mode: 'puzzle',
    task: 'Je hebt 8 ballen, 1 is zwaarder. Je hebt een balans. Wat is het minimum aantal wegingen om de zware bal te vinden? Leg uit.',
  },
  {
    title: 'Email regex',
    description: 'Schrijf een regex die email adressen matcht',
    mode: 'puzzle',
    task: 'Schrijf een regex die alle geldige email adressen matcht. Leg uit waarom je regex werkt.',
  },
  {
    title: 'Water emmer puzzel',
    description: 'Meet precies 4 liter met twee emmers',
    mode: 'puzzle',
    task: 'Je hebt een emmer van 3 liter en een emmer van 5 liter. Hoe maak je precies 4 liter? Beschrijf elke stap.',
  },
  {
    title: 'De logica puzzel',
    description: 'Drie dozen met verkeerde labels',
    mode: 'puzzle',
    task: 'Er zijn drie dozen: een met appels, een met sinaasappels, en een gemengd. Alle labels zijn VERKEERD. Je mag uit één doos één vrucht pakken. Hoe bepaal je de inhoud van alle dozen?',
  },
];

const improvChallenges: BattleChallenge[] = [
  {
    title: 'De tijdmachine lift',
    description: 'Een liftreparatie wordt een tijdreis',
    mode: 'improv',
    scenario:
      'Setting: een liftreparatie. De een is de monteur, de ander zit vast. Plot twist halverwege: de lift is eigenlijk een tijdmachine.',
  },
  {
    title: 'Dubbel sollicitatiegesprek',
    description: 'Wie interviewt wie?',
    mode: 'improv',
    scenario:
      'Setting: sollicitatiegesprek. Plot twist halverwege: de interviewer solliciteert ook.',
  },
  {
    title: 'Vorige levens date',
    description: 'Een date met een kosmische twist',
    mode: 'improv',
    scenario:
      'Setting: eerste date in een restaurant. Plot twist halverwege: jullie blijken elkaars exen te zijn uit een vorig leven.',
  },
  {
    title: 'Spionnen in het park',
    description: 'Twee spionnen die niet weten dat de ander er ook een is',
    mode: 'improv',
    scenario:
      'Setting: twee spionnen op een bankje in het park. Geen van beiden weet dat de ander ook een spion is.',
  },
  {
    title: 'Absurd kookwedstrijd',
    description: 'Koken met het meest bizarre ingrediënt',
    mode: 'improv',
    scenario:
      'Setting: twee koks in een kookwedstrijd. Plot twist halverwege: het geheime ingrediënt is maanlicht.',
  },
];

// Alle challenges gegroepeerd per mode
export const challenges: Record<BattleMode, BattleChallenge[]> = {
  debate: debateChallenges,
  creative: creativeChallenges,
  roast: roastChallenges,
  puzzle: puzzleChallenges,
  improv: improvChallenges,
};

// Pak een random challenge voor een mode
export function getRandomChallenge(mode: BattleMode): BattleChallenge {
  const modeChals = challenges[mode];
  return modeChals[Math.floor(Math.random() * modeChals.length)];
}

// Pak een specifieke challenge
export function getChallenge(mode: BattleMode, index: number): BattleChallenge {
  const modeChals = challenges[mode];
  return modeChals[Math.min(index, modeChals.length - 1)];
}
