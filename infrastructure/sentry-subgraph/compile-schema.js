const fs = require('fs');
const path = require('path');

/**
 * Recursively reads all files from a directory and its subdirectories.
 * @param {string} dir - The directory to read from.
 * @returns {string[]} An array of file paths.
 */
function readFilesRecursively(dir) {
	const files = [];

	fs.readdirSync(dir, { withFileTypes: true }).forEach(dirent => {
		const fullPath = path.join(dir, dirent.name);
		if (dirent.isDirectory()) {
			files.push(...readFilesRecursively(fullPath));
		} else {
			files.push(fullPath);
		}
	});

	return files;
}

// Directory containing the schema files, relative to the project root
const schemaDir = path.relative(process.cwd(), path.join(__dirname, './schema'));

// Output path for the merged schema, relative to the project root
const outputPath = path.relative(process.cwd(), path.join(__dirname, './schema.graphql'));

// Check if the output file already exists
if (fs.existsSync(path.join(process.cwd(), outputPath))) {
	console.log(`Notice: ${outputPath} already exists and will be overridden.`);
}

console.log('Starting to merge schema files from:', schemaDir);

let mergedSchema = `
################################################################################
# AUTO-GENERATED FILE NOTICE                                                   #
################################################################################
# File: This is an auto-generated file combining GraphQL schema files from the #
# 'schema' directory.                                                          #
#                                                                              #
# Purpose: Attempts to use conventional methods for combining GraphQL schemas, #
# such as commented import statements or tools designed for non-web3 GraphQL   #
# libraries, were unsuccessful due to compatibility issues with The Graph's    #
# specific GraphQL types and lack of clear documentation.                      #
#                                                                              #
# Method: This workaround involves using a JavaScript file to programmatically #
# merge all schema files. Suggestions for more efficient methods to organize   #
# and combine large GraphQL schemas are welcome.                               #
################################################################################
` + "\n\n\n";

const files = readFilesRecursively(path.join(process.cwd(), schemaDir));

files.forEach(filePath => {
	if (path.extname(filePath) === '.graphql') {
		const fileContents = fs.readFileSync(filePath, 'utf8');
		const relativeFilePath = path.relative(process.cwd(), filePath);
		const fileName = path.basename(filePath);

		// Correctly format the comment with the file name and path to form a proper rectangle with minimum length twice as long
		const maxContentLength = Math.max(fileName.length, relativeFilePath.length) * 2; // Making the minimum length twice as long
		const headerFooterLength = maxContentLength + 4; // Adding padding spaces
		const headerFooter = `#`.repeat(headerFooterLength) + `\n`;
		const formatLine = (line) => `# ${line.padEnd(maxContentLength)} #\n`;
		const fileComment = 
			headerFooter +
			formatLine(fileName) +
			formatLine(relativeFilePath) +
			headerFooter;
		mergedSchema += fileComment + fileContents + '\n\n';
		console.log(`Merging schema from: ${fileName}`);
	}
});

// Write the merged schema to a file
fs.writeFileSync(path.join(process.cwd(), outputPath), mergedSchema);
console.log(`Merged schema written to ${outputPath}`);
