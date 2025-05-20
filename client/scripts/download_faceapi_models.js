const https = require('https');
const fs = require('fs');
const path = require('path');

const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

const models = {
  tiny_face_detector_model: [
    'tiny_face_detector_model-shard1',
    'tiny_face_detector_model-weights_manifest.json'
  ],
  face_expression: [
    'face_expression_model-shard1',
    'face_expression_model-weights_manifest.json'
  ]
};

const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
};

const downloadModels = async () => {
  try {
    for (const [modelName, files] of Object.entries(models)) {
      const modelDir = path.join(__dirname, '..', 'public', 'models', modelName);
      if (!fs.existsSync(modelDir)) {
        fs.mkdirSync(modelDir, { recursive: true });
      }
      for (const fileName of files) {
        const url = `${baseUrl}/${fileName}`;
        const dest = path.join(modelDir, fileName);
        console.log(`Downloading ${url} to ${dest}`);
        await downloadFile(url, dest);
      }
    }
    console.log('All models downloaded successfully.');
  } catch (error) {
    console.error('Error downloading models:', error);
  }
};

downloadModels();
