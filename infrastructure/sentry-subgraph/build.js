const { makeExecutableSchema } = require('@graphql-tools/schema');
const { loadFilesSync } = require('@graphql-tools/load-files');
const { mergeTypeDefs } = require('@graphql-tools/merge');

// Load and merge the type definitions
const typesArray = loadFilesSync(path.join(__dirname, './schema'), { extensions: ['graphql'] });
const typeDefs = mergeTypeDefs(typesArray);

// Create the executable schema
const schema = makeExecutableSchema({ typeDefs });