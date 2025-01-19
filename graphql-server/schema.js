import { makeExecutableSchema } from '@graphql-tools/schema';
import { typeDefs, resolvers } from './graphql/modules/index.js';

export const schema = makeExecutableSchema({
    typeDefs,
    resolvers
});