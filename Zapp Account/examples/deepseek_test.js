// Node example: prints sample curl and optionally performs request
const key = process.env.DEEPSEEK_API_KEY;
const url = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.example/v1/search';

if (!key) {
  console.error('ERROR: DEEPSEEK_API_KEY is not set.');
  process.exit(1);
}

console.log('DEEPSEEK_API_URL=' + url);
console.log('DEEPSEEK_API_KEY found in environment (hidden)');

const sample = { query: 'test' };
const model = process.env.DEEPSEEK_MODEL;
if (model) sample.model = model;

console.log('\nSample curl command:\n');
console.log(
  `curl -H "Authorization: Bearer $DEEPSEEK_API_KEY" -H "Content-Type: application/json" -X POST "${url}" -d '${JSON.stringify(sample)}'`
);

if (process.env.DEEPSEEK_PERFORM_REQUEST === '1') {
  const fetch = globalThis.fetch || require('node-fetch');
  (async () => {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(sample),
    });
    console.log('\nHTTP', resp.status);
    try {
      const j = await resp.json();
      console.log(j);
    } catch (e) {
      console.log(await resp.text());
    }
  })();
}
