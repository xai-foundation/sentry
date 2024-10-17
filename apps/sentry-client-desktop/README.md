# Xai Sentry Desktop Client

An electron & vite cross platform desktop client for the Sentry Node Operator building on top of the `@sentry/core` operator services.

## Local development

Running and building is done from the root of the monorepo.
The monorepo will handle all npm dependencies

From the root run

- `pnpm desktop` to run a local dev instance with hot reload
- `pnpm -filter @sentry/sentry-client-desktop build` to create a release build for the current working os

Building the monorepo with `pnpm run build` from the root of the repo will also create a release build of the desktop client.

## Release build and signing

The desktop client is build using [`electron-builder`](https://www.electron.build/code-signing.html). The configuration for the release build is defined in `apps\sentry-client-desktop\electron-builder.json5`. The release build will create the release for the OS running the build, so for multi platform release the build has to be run on all required platforms.

### Windows

Windows signing is done with SSL.com in the release workflow using the [EV Code signing certificate](https://www.electron.build/code-signing.html#windows)

Required build environment variables for signing:


- `SSL_USERNAME` SSL.com login username
- `SSL_PASSWORD` SSL.com login password
- `SSL_TOTP_SECRET` Certificate secret to pull the actual EV certificate from the SSL.com identity

#### For testing Windows signing locally, downloading the CodeSignTool is required, `downloadCodeSignTool.js` can be used to download und extract the tool.


### MacOS

Signing the mac build can be done by the `electron-builder`. Currently the configuration is setup to sign and notarize the app.
For signing a macOS release a Apple Developer Application ID Certificate is required, detailed steps in the section below.

For integrating the electron-builder signing the certificate has to be added to the mac key-chain, for this specific environment variables need to be set during the release build process:

- `MAC_CERTIFICATE_P12_BASE64` the base64 encoded certificate and private key
- `MAC_CERTIFICATE_PASSWORD` the certificate encryption password

Electron builder signing and notarizing env: 

- `CSC_LINK` same as `MAC_CERTIFICATE_P12_BASE64`, important for electron-builder finding the identity
- `CSC_KEY_PASSWORD` same as `MAC_CERTIFICATE_PASSWORD`, important for electron-builder finding the identity from the cert above
- `APPLE_ID` The apple ID used for the Developer certificate for notarizing the app
- `APPLE_APP_SPECIFIC_PASSWORD` [App specific password](https://support.apple.com/en-us/102654) for notarizing the app
- `APPLE_TEAM_ID` The apple team id used for the account that created the certificate used for notarizing the app

#### Verify Mac Signing:

- Verify the app’s signature
  - `codesign --verify --deep --verbose --strict /path/to/sentry-client-macos.app`

- Check if Gatekeeper accepts the app after notarizing
  - `spctl --assess --type exec --verbose /path/to/sentry-client-macos.app`

- Check notarization status
  - `xcrun notarytool history --apple-id APPLE_ID --password APPLE_APP_SPECIFIC_PASSWORD --team-id APPLE_TEAM_ID`


#### Create an Apple Developer Application ID Certificate

### Step 1: Create a Certificate Signing Request (CSR)

1. Open **Keychain Access** (`Applications > Utilities > Keychain Access`).
2. From the menu, select **Keychain Access > Certificate Assistant > Request a Certificate From a Certificate Authority**.
3. Fill out the following fields:
   - **User Email Address**: Your Apple Developer account email.
   - **Common Name**: Your name or your company’s name.
   - **CA Email Address**: Leave this blank.
   - **Request is**: Select **Saved to disk**.
4. Check the box for **Let me specify key pair information**.
5. **Key Pair Information**:
   - Algorithm: Select **RSA**.
   - Key Size: Choose **2048-bit**.
6. Click **Continue** and save the CSR file to your desktop (or any location).

---

### Step 2: Submit the CSR to Apple Developer

1. Log in to your [Apple Developer Account](https://developer.apple.com/account/).
2. Go to **Certificates, Identifiers & Profiles**.
3. Under **Certificates**, click the **+** button to create a new certificate.
4. Choose the appropriate certificate type based on your need (e.g., **Developer ID Installer** or **Mac App Distribution**).
5. Upload the CSR file you generated earlier.
6. Download the new certificate (`.cer` file) provided by Apple.

---

### Step 3: Install the Certificate in Keychain Access

1. Double-click the downloaded `.cer` file to install it in **Keychain Access**.
2. Open **Keychain Access** and navigate to **login > My Certificates**.
3. Find the certificate you just installed.
   - It should appear under **My Certificates** and when expanded, should show the private key associated with it.
4. If the certificate is not under **My Certificates** or you don’t see the private key, see the troubleshooting steps below.

---

### Step 4: Export the Certificate and Private Key as a `.p12` File

1. In **Keychain Access**, go to **My Certificates**.
2. Right-click the certificate (which should now include the private key) and select **Export**.
3. Choose the **.p12** format from the list of options.
4. Set a name for the `.p12` file and choose a location to save it.
5. You will be prompted to set a password to protect the `.p12` file.
6. After setting the password, your `.p12` file will be exported and saved.

---

### Step 5: Use the `.p12` in Your Build Pipeline

Once you have your `.p12` file, you can use it in your build process for signing packages or apps, such as in GitHub Actions:

1. **Encode the `.p12` file to base64**:
   ```bash
   base64 -i certificate.p12 -o certificate.p12.base64

---

### Troubleshooting Tips

- **Missing Private Key**: If your certificate is in the **Certificates** section but not in **My Certificates**, it means the private key is not associated. This can happen if the private key wasn’t created or stored correctly during the CSR process.
  - In **Keychain Access**, go to **login > Keys** and look for a private key matching the common name of the certificate.
  - If you find the private key, you can try manually associating it with the certificate by dragging the certificate onto the key.
  - If the private key is not present, you'll need to regenerate the CSR and repeat the steps to create the certificate.

---

### Notes

- **Key Size**: Make sure to select **RSA 2048-bit** or higher, as 1024-bit is no longer considered secure.
- **Password**: You will need the password set during the `.p12` export when using the file for signing operations in your build pipeline.

---



