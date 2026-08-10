import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.resolve('src/data');

// Static Kana Data (Base, Dakuon, Yoon)
const KANA_DATA = {
  hiragana: {
    base: [
      { character: 'あ', romaji: 'a' }, { character: 'い', romaji: 'i' }, { character: 'う', romaji: 'u' }, { character: 'え', romaji: 'e' }, { character: 'お', romaji: 'o' },
      { character: 'か', romaji: 'ka' }, { character: 'き', romaji: 'ki' }, { character: 'く', romaji: 'ku' }, { character: 'け', romaji: 'ke' }, { character: 'こ', romaji: 'ko' },
      { character: 'さ', romaji: 'sa' }, { character: 'し', romaji: 'shi' }, { character: 'す', romaji: 'su' }, { character: 'せ', romaji: 'se' }, { character: 'そ', romaji: 'so' },
      { character: 'た', romaji: 'ta' }, { character: 'ち', romaji: 'chi' }, { character: 'つ', romaji: 'tsu' }, { character: 'て', romaji: 'te' }, { character: 'と', romaji: 'to' },
      { character: 'な', romaji: 'na' }, { character: 'に', romaji: 'ni' }, { character: 'ぬ', romaji: 'nu' }, { character: 'ね', romaji: 'ne' }, { character: 'の', romaji: 'no' },
      { character: 'は', romaji: 'ha' }, { character: 'ひ', romaji: 'hi' }, { character: 'ふ', romaji: 'fu' }, { character: 'へ', romaji: 'he' }, { character: 'ほ', romaji: 'ho' },
      { character: 'ま', romaji: 'ma' }, { character: 'み', romaji: 'mi' }, { character: 'む', romaji: 'mu' }, { character: 'め', romaji: 'me' }, { character: 'も', romaji: 'mo' },
      { character: 'や', romaji: 'ya' }, { character: 'ゆ', romaji: 'yu' }, { character: 'よ', romaji: 'yo' },
      { character: 'ら', romaji: 'ra' }, { character: 'り', romaji: 'ri' }, { character: 'る', romaji: 'ru' }, { character: 'れ', romaji: 're' }, { character: 'ろ', romaji: 'ro' },
      { character: 'わ', romaji: 'wa' }, { character: 'を', romaji: 'wo' }, { character: 'ん', romaji: 'n' }
    ],
    dakuon: [
      { character: 'が', romaji: 'ga' }, { character: 'ぎ', romaji: 'gi' }, { character: 'ぐ', romaji: 'gu' }, { character: 'げ', romaji: 'ge' }, { character: 'ご', romaji: 'go' },
      { character: 'ざ', romaji: 'za' }, { character: 'じ', romaji: 'ji' }, { character: 'ず', romaji: 'zu' }, { character: 'ぜ', romaji: 'ze' }, { character: 'ぞ', romaji: 'zo' },
      { character: 'だ', romaji: 'da' }, { character: 'ぢ', romaji: 'dji' }, { character: 'づ', romaji: 'dzu' }, { character: 'で', romaji: 'de' }, { character: 'ど', romaji: 'do' },
      { character: 'ば', romaji: 'ba' }, { character: 'び', romaji: 'bi' }, { character: 'ぶ', romaji: 'bu' }, { character: 'べ', romaji: 'be' }, { character: 'ぼ', romaji: 'bo' },
      { character: 'ぱ', romaji: 'pa' }, { character: 'ぴ', romaji: 'pi' }, { character: 'ぷ', romaji: 'pu' }, { character: 'ぺ', romaji: 'pe' }, { character: 'ぽ', romaji: 'po' }
    ],
    yoon: [
      { character: 'きゃ', romaji: 'kya' }, { character: 'きゅ', romaji: 'kyu' }, { character: 'きょ', romaji: 'kyo' },
      { character: 'しゃ', romaji: 'sha' }, { character: 'しゅ', romaji: 'shu' }, { character: 'しょ', romaji: 'sho' },
      { character: 'ちゃ', romaji: 'cha' }, { character: 'ちゅ', romaji: 'chu' }, { character: 'ちょ', romaji: 'cho' },
      { character: 'にゃ', romaji: 'nya' }, { character: 'にゅ', romaji: 'nyu' }, { character: 'にょ', romaji: 'nyo' },
      { character: 'ひゃ', romaji: 'hya' }, { character: 'ひゅ', romaji: 'hyu' }, { character: 'ひょ', romaji: 'hyo' },
      { character: 'みゃ', romaji: 'mya' }, { character: 'みゅ', romaji: 'myu' }, { character: 'みょ', romaji: 'myo' },
      { character: 'りゃ', romaji: 'rya' }, { character: 'りゅ', romaji: 'ryu' }, { character: 'りょ', romaji: 'ryo' },
      { character: 'ぎゃ', romaji: 'gya' }, { character: 'ぎゅ', romaji: 'gyu' }, { character: 'ぎょ', romaji: 'gyo' },
      { character: 'じゃ', romaji: 'ja' }, { character: 'じゅ', romaji: 'ju' }, { character: 'じょ', romaji: 'jo' },
      { character: 'びゃ', romaji: 'bya' }, { character: 'びゅ', romaji: 'byu' }, { character: 'びょ', romaji: 'byo' },
      { character: 'ぴゃ', romaji: 'pya' }, { character: 'ぴゅ', romaji: 'pyu' }, { character: 'ぴょ', romaji: 'pyo' }
    ]
  }
};

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {}
}

async function downloadGrammar() {
  console.log('Downloading N5 Grammar...');
  const res = await fetch('https://raw.githubusercontent.com/gauravaccentureproducts/JLPTSuccess/master/N5/data/grammar.json');
  if (!res.ok) throw new Error('Failed to download grammar');
  const data = await res.json();
  
  const formatted = data.patterns.map(p => ({
    id: p.id,
    pattern: p.pattern,
    meaning: p.meanings?.en || p.meanings || '',
    explanation: p.explanations?.en || p.explanations || '',
    conjugation: p.conjugations?.join(', ') || p.formation || '',
    examples: (p.examples || []).map(ex => ({
      japanese: ex.japanese,
      furigana: ex.furigana || ex.reading || '',
      english: ex.english || ex.meanings?.en || ''
    })).slice(0, 3)
  }));

  await fs.writeFile(path.join(DATA_DIR, 'grammar.json'), JSON.stringify(formatted, null, 2));
  console.log(`Saved ${formatted.length} N5 Grammar patterns.`);
}

async function downloadVocab() {
  console.log('Downloading N5 Vocabulary...');
  const res = await fetch('https://raw.githubusercontent.com/gauravaccentureproducts/JLPTSuccess/master/N5/data/vocab.json');
  if (!res.ok) throw new Error('Failed to download vocabulary');
  const data = await res.json();

  const formatted = data.entries.map(v => ({
    id: v.id,
    word: v.form || v.expression,
    reading: v.reading || v.kana || '',
    meaning: v.gloss || v.meanings?.en || v.meaning || '',
    partOfSpeech: v.pos || v.partOfSpeech || 'noun',
    lesson: v.section || 'General Words',
    examples: (v.examples || []).map(ex => ({
      japanese: ex.ja || ex.japanese || '',
      english: ex.translation_en || ex.english || ''
    })).slice(0, 2)
  }));

  await fs.writeFile(path.join(DATA_DIR, 'vocab.json'), JSON.stringify(formatted, null, 2));
  console.log(`Saved ${formatted.length} N5 Vocabulary words.`);
}

async function downloadKanji() {
  console.log('Downloading N5 Kanji...');
  const kanjiUrl = 'https://raw.githubusercontent.com/gauravaccentureproducts/JLPTSuccess/master/N5/data/kanji.json';
  let kanjiList = [];
  try {
    const res = await fetch(kanjiUrl);
    if (res.ok) {
      const data = await res.json();
      console.log('Found Kanji database in JLPTSuccess, processing...');
      const entries = data.entries || data.kanjis || data;
      kanjiList = entries.map(k => ({
        character: k.glyph || k.kanji || k.character,
        meanings: Array.isArray(k.meanings) ? k.meanings : [k.meanings?.en || k.meaning || ''],
        onyomi: k.on || k.onyomi || [],
        kunyomi: k.kun || k.kunyomi || [],
        strokes: k.stroke_count || k.strokeCount || 0,
        examples: (k.n5_compounds || k.examples || []).slice(0, 3).map(ex => ({
          word: ex.form || ex.word,
          reading: ex.reading || ex.kana || '',
          meaning: ex.gloss || ex.meaning || ''
        }))
      }));
    }
  } catch (e) {
    console.error('Error parsing primary kanji.json, falling back to manual list.', e);
  }

  if (kanjiList.length === 0) {
    const n5KanjiChars = [
      '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '百', '千', '万', '円', '日', '月', 
      '火', '水', '木', '金', '土', '国', '会', '人', '年', '大', '小', '中', '長', '半', '分', '時', 
      '男', '女', '子', '学', '生', '先', '何', '父', '母', '行', '来', '出', '入', '書', '聞', '読', 
      '見', '話', '買', '食', '飲', '休', '前', '後', '午', '朝', '夜', '今', '週', '新', '古', '高', 
      '安', '多', '少', '友', '足', '手', '目', '耳', '口', '名', '川', '山', '天', '気', '空', '雨', 
      '電', '車', '語', '間', '道', '駅', '右', '左', '北', '南', '東', '西', '外', '内', '上', '下', 
      '白', '赤', '青', '黒', '花', '魚', '校', '店'
    ];

    console.log(`Fetching parameters for ${n5KanjiChars.length} N5 Kanji via kanjiapi.dev...`);
    for (const char of n5KanjiChars) {
      try {
        const charRes = await fetch(`https://kanjiapi.dev/v1/kanji/${encodeURIComponent(char)}`);
        if (charRes.ok) {
          const detail = await charRes.json();
          kanjiList.push({
            character: char,
            meanings: detail.meanings || [],
            onyomi: detail.on_readings || [],
            kunyomi: detail.kun_readings || [],
            strokes: detail.stroke_count || 0,
            examples: []
          });
        }
      } catch (err) {
        console.error(`Error fetching detail for kanji ${char}:`, err.message);
      }
    }
  }

  await fs.writeFile(path.join(DATA_DIR, 'kanji.json'), JSON.stringify(kanjiList, null, 2));
  console.log(`Saved ${kanjiList.length} N5 Kanji characters.`);
}

async function run() {
  await ensureDir(DATA_DIR);

  await fs.writeFile(path.join(DATA_DIR, 'kana.json'), JSON.stringify(KANA_DATA, null, 2));
  console.log('Saved static Kana definitions.');

  try {
    await downloadVocab();
  } catch (e) {
    console.error('Error downloading vocab:', e);
  }

  try {
    await downloadGrammar();
  } catch (e) {
    console.error('Error downloading grammar:', e);
  }

  try {
    await downloadKanji();
  } catch (e) {
    console.error('Error downloading kanji:', e);
  }

  console.log('All N5 syllabus data successfully compiled!');
}

run();
