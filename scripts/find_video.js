process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
async function main() {
  try {
    const res = await fetch('https://www.ptsecurity.com/ww-en/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const html = await res.text();
    const matches = html.match(/(https?:\/\/[^"'\s>]+\.(?:mp4|webm|webp|gif))/gi) || [];
    const relativeMatches = html.match(/(\/[^"'\s>]+\.(?:mp4|webm))/gi) || [];
    console.log('ABSOLUTE:', Array.from(new Set(matches)));
    console.log('RELATIVE:', Array.from(new Set(relativeMatches)));

    const videoTags = html.match(/<video[^>]*>[\s\S]*?<\/video>/gi) || [];
    console.log('VIDEO TAGS:', videoTags.slice(0, 5));
  } catch (err) {
    console.error(err);
  }
}
main();
