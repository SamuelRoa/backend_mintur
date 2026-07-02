const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");

const ROOT_DIR = "C:\\Proyectos\\Plataforma_turistica_COTATUR\\imagenes_mintur";
const OUTPUT_FILE = path.join(__dirname, "..", "cloudinary-urls.json");

cloudinary.config({
  cloud_name: "dqe0chrwm",
  api_key: "418825994297954",
  api_secret: "A4q6OGqulqlP_xRuvAnVTIdJdhQ",
});

const EXT_TO_FMT = {
  ".jpg": "jpg",
  ".jpeg": "jpg",
  ".png": "png",
  ".webp": "webp",
};

async function uploadFile(filePath, folder) {
  const ext = path.extname(filePath).toLowerCase();
  const format = EXT_TO_FMT[ext];
  if (!format) {
    console.log(`  Skipping unsupported format: ${filePath}`);
    return null;
  }
  const publicId = path.basename(filePath, ext);
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      public_id: publicId,
      format,
      folder: `mintur/${folder}`,
      overwrite: true,
    });
    console.log(`  OK: ${path.basename(filePath)} -> ${result.secure_url}`);
    return { file: path.basename(filePath), publicId, url: result.secure_url, folder };
  } catch (err) {
    console.error(`  FAIL: ${path.basename(filePath)}: ${err.message}`);
    return null;
  }
}

async function processSubDir(subDir, folderName) {
  const dirPath = path.join(ROOT_DIR, subDir);
  if (!fs.existsSync(dirPath)) {
    console.log(`\nDirectory not found: ${dirPath}`);
    return [];
  }
  const files = fs.readdirSync(dirPath).filter(f =>
    /\.(jpg|jpeg|png|webp)$/i.test(f)
  );
  console.log(`\n=== ${folderName} ===`);
  console.log(`Found ${files.length} images in ${dirPath}`);

  const results = [];
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const r = await uploadFile(filePath, folderName);
    if (r) results.push(r);
  }
  return results;
}

async function main() {
  const allResults = [];

  const destinosResults = await processSubDir("Destinos", "destinos");
  allResults.push(...destinosResults);

  const eventosResults = await processSubDir("Eventos", "eventos");
  allResults.push(...eventosResults);

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allResults, null, 2), "utf-8");
  console.log(`\nDone. ${allResults.length} total images uploaded.`);
  console.log(`Mapping saved to: ${OUTPUT_FILE}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
