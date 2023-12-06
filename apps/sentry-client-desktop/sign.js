const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');

const TEMP_DIR = path.join(__dirname, 'release', 'temp');

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR);
}

function sign(configuration) {
  // credentials from ssl.com
  const USER_NAME = process.env.WINDOWS_SIGN_USER_NAME;
  const USER_PASSWORD = process.env.WINDOWS_SIGN_USER_PASSWORD;
  const USER_TOTP = process.env.WINDOWS_SIGN_USER_TOTP;
  if (USER_NAME && USER_PASSWORD && USER_TOTP) {
    console.log(`Signing ${configuration.path}`);
    const { name, dir } = path.parse(configuration.path);
    // CodeSignTool can't sign in place without verifying the overwrite with a
    // y/m interaction so we are creating a new file in a temp directory and
    // then replacing the original file with the signed file.
    const tempFile = path.join(TEMP_DIR, name);
    const setDir = `cd ../../infrastructure/CodeSignTool-v1.3.0-windows`;
    const signFile = `CodeSignTool sign -input_file_path="${configuration.path}" -output_dir_path="${TEMP_DIR}" -username="${USER_NAME}" -password="${USER_PASSWORD}" -totp_secret="${USER_TOTP}"`;
    const moveFile = `mv "${tempFile}" "${dir}"`;
    childProcess.execSync(`${setDir} && ${signFile} && ${moveFile}`, { stdio: 'inherit' });
  } else {
    console.warn(`sign.js - Can't sign file ${configuration.path}, missing value for:
${USER_NAME ? '' : 'WINDOWS_SIGN_USER_NAME'}
${USER_PASSWORD ? '' : 'WINDOWS_SIGN_USER_PASSWORD'}
${USER_TOTP ? '' : 'WINDOWS_SIGN_USER_TOTP'}
`);
    process.exit(1);
  }
}

exports.default = sign;