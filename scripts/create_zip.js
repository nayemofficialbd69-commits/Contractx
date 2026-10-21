import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

const zip = new JSZip();

function addDirectoryToZip(dirPath, zipFolder, exclude = ['node_modules', '.git', 'dist', '.aistudio']) {
  if (!fs.existsSync(dirPath)) return;
  const items = fs.readdirSync(dirPath);
  for (const item of items) {
    if (exclude.includes(item)) continue;
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      const subFolder = zipFolder.folder(item);
      addDirectoryToZip(fullPath, subFolder, exclude);
    } else {
      const data = fs.readFileSync(fullPath);
      zipFolder.file(item, data);
    }
  }
}

async function makeZip() {
  console.log('Generating ConnectX Messenger full project zip bundle...');

  // Ensure public folder exists
  if (!fs.existsSync('public')) {
    fs.mkdirSync('public', { recursive: true });
  }

  // Add Android project
  if (fs.existsSync('android')) {
    const androidFolder = zip.folder('android');
    addDirectoryToZip('android', androidFolder);
  }

  // Add Admin Panel
  if (fs.existsSync('admin-panel')) {
    const adminFolder = zip.folder('admin-panel');
    addDirectoryToZip('admin-panel', adminFolder);
  }

  // Add root files
  const rootFiles = [
    'firestore.rules',
    'storage.rules',
    'firebase-blueprint.json',
    'security_spec.md',
    '.env.example',
    'package.json',
    'tsconfig.json'
  ];

  for (const file of rootFiles) {
    if (fs.existsSync(file)) {
      zip.file(file, fs.readFileSync(file));
    }
  }

  // Add instructions on building on PC AND building directly on an Android device
  zip.file(
    'BUILD_ON_ANDROID_DEVICE_GUIDE.md',
    `# How to Build APK Directly on an Android Device (No PC Required)

You can compile this Android project directly on your Android phone/tablet using Termux!

## Requirements:
- Android phone with at least 4GB RAM and 3GB free storage
- **Termux** app (Download from F-Droid or GitHub, NOT the outdated Play Store version)

## Step-by-Step Instructions:

1. Open Termux and update packages:
   \`\`\`bash
   pkg update && pkg upgrade -y
   \`\`\`

2. Install OpenJDK 17 and developer utilities:
   \`\`\`bash
   pkg install openjdk-17 git unzip wget -y
   \`\`\`

3. Unzip the project files:
   \`\`\`bash
   unzip connectx_messenger_full_project.zip -d connectx
   cd connectx/android
   \`\`\`

4. Grant execute permission to Gradle wrapper:
   \`\`\`bash
   chmod +x gradlew
   \`\`\`

5. Set your JAVA_HOME:
   \`\`\`bash
   export JAVA_HOME=$PREFIX/opt/openjdk-17
   \`\`\`

6. Build the Debug APK:
   \`\`\`bash
   ./gradlew assembleDebug
   \`\`\`

7. Find your APK at:
   \`\`\`text
   app/build/outputs/apk/debug/app-debug.apk
   \`\`\`
   Copy it to your phone's Download folder:
   \`\`\`bash
   termux-setup-storage
   cp app/build/outputs/apk/debug/app-debug.apk /sdcard/Download/ConnectX.apk
   \`\`\`
   Then open your phone's File Manager > Downloads and tap ConnectX.apk to install!
`
  );

  const content = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

  // 1. Write to public/ for HTTP serving
  fs.writeFileSync('public/connectx_messenger_full_project.zip', content);

  // 2. Write to project root
  fs.writeFileSync('connectx_messenger_full_project.zip', content);

  // 3. Write directly into the AI Studio Artifacts directory
  const artifactDir = '.aistudio/artifacts/brain/181eced8-06b9-4e99-be0f-6c7f4a8f85ae';
  if (fs.existsSync(artifactDir)) {
    const artifactZipPath = path.join(artifactDir, 'connectx_messenger_full_project.zip');
    fs.writeFileSync(artifactZipPath, content);

    const metadata = {
      RequestFeedback: false,
      Summary: "Complete ConnectX Messenger production project ZIP containing the full Android Kotlin Jetpack Compose source tree, standalone Admin Panel, Gradle build files, Manifest, and Firebase security rules.",
      UserFacing: true
    };
    fs.writeFileSync(
      path.join(artifactDir, 'connectx_messenger_full_project.zip.metadata.json'),
      JSON.stringify(metadata, null, 2)
    );
    console.log('Successfully written to Artifacts directory: ' + artifactZipPath);
  }

  console.log('Successfully created public/connectx_messenger_full_project.zip (' + (content.length / 1024).toFixed(1) + ' KB)');
}

makeZip().catch(console.error);
