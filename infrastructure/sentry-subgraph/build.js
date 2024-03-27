const fs = require('fs');
const path = require('path');

// Directory containing the schema files, relative to the project root
const schemaDir = path.relative(process.cwd(), path.join(__dirname, './schema'));

// Output path for the merged schema, relative to the project root
const outputPath = path.relative(process.cwd(), path.join(__dirname, './schema.graphql'));

console.log('Starting to merge schema files from:', schemaDir);

// Read all files from the schema directory
fs.readdir(path.join(process.cwd(), schemaDir), (err, files) => {
	if (err) {
		console.error('Error reading the schema directory:', err);
		return;
	}

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

	files.forEach(file => {
		if (path.extname(file) === '.graphql') {
			const filePath = path.join(process.cwd(), schemaDir, file);
			const fileContents = fs.readFileSync(filePath, 'utf8');

			// Correctly format the comment with the file name and path to form a proper rectangle with minimum length twice as long
			const relativeFilePath = path.relative(process.cwd(), filePath);
			const maxContentLength = Math.max(file.length, relativeFilePath.length) * 2; // Making the minimum length twice as long
			const headerFooterLength = maxContentLength + 4; // Adding padding spaces
			const headerFooter = `#`.repeat(headerFooterLength) + `\n`;
			const formatLine = (line) => `# ${line.padEnd(maxContentLength)} #\n`;
			const fileComment = 
				headerFooter +
				formatLine(file) +
				formatLine(relativeFilePath) +
				headerFooter;
			mergedSchema += fileComment + fileContents + '\n\n';
			console.log(`Merging schema from: ${file}`);
		}
	});

	// Write the merged schema to a file
	fs.writeFileSync(path.join(process.cwd(), outputPath), mergedSchema);
	console.log(`Merged schema written to ${outputPath}`);
});