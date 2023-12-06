const http = require('https');
const fs = require('fs');
const unzipper = require('unzipper');

function download(filename, url) {
  if (fs.existsSync(filename)) {
    return;
  }
  
  var request = http.get(url, function(response) {
    response.pipe(unzipper.Extract({path: filename}));
  });
}

download("infrastructure/CodeSignTool-v1.3.0-windows", "https://www.ssl.com/download/codesigntool-for-windows/");