const Tesseract = require('tesseract.js');
const fetch = require('node-fetch');
const fs = require('fs');

async function downloadImage(url, imagePath) {
  const response = await fetch(url);
  const buffer = await response.buffer();
  fs.writeFileSync(imagePath, buffer);
}

async function recognizeTextFromImage(imagePath) {
  const { data: { text } } = await Tesseract.recognize(
    imagePath,
    'eng',
    { logger: (m) => console.log(m) }
  );
  return text;
}

(async () => {
  const imageUrl = 'https://img.ltwebstatic.com/images3_ccc/2023/08/18/5b/1692345959195eb645a51727da9f981d8039890187.gif';
  const imagePath = 'src/dark-images.jpg';

  await downloadImage(imageUrl, imagePath);
  const recognizedText = await recognizeTextFromImage(imagePath);

  console.log('Recognized text:', recognizedText);
  fs.writeFileSync('recognizedText.txt', recognizedText);
})();
