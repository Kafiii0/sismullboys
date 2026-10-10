async function main() {
  const res = await fetch('https://en.wikipedia.org/w/api.php?action=parse&page=Airbus&prop=images&format=json');
  const json = await res.json();
  console.log('IMAGES IN AIRBUS PAGE:', json.parse.images);
}
main();
