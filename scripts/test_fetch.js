async function testFetch() {
  const urls = [
    'https://raw.githubusercontent.com/gauravaccentureproducts/JLPTSuccess/master/N5/data/grammar.json',
    'https://raw.githubusercontent.com/gauravaccentureproducts/JLPTSuccess/main/N5/data/grammar.json',
    'https://raw.githubusercontent.com/gauravaccentureproducts/JLPTSuccess/master/N5/data/vocab.json',
    'https://raw.githubusercontent.com/gauravaccentureproducts/JLPTSuccess/main/N5/data/vocab.json',
    'https://raw.githubusercontent.com/jamsinclair/open-anki-jlpt-decks/main/src/n5.csv',
    'https://kanjiapi.dev/v1/kanji/jlpt/n5'
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      console.log(`URL: ${url} -> Status: ${res.status} (${res.statusText})`);
      if (res.ok) {
        const text = await res.text();
        console.log(`  Length: ${text.length} bytes`);
        console.log(`  Sample: ${text.substring(0, 100).replace(/\r?\n/g, ' ')}...`);
      }
    } catch (e) {
      console.log(`URL: ${url} -> Error: ${e.message}`);
    }
  }
}

testFetch();
