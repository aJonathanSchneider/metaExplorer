import { validateTs } from '@graphql-codegen/testing';
import { Types, mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { buildSchema, parse, GraphQLSchema, GraphQLObjectType, GraphQLEnumType } from 'graphql';
import { plugin } from '../src/index';
import {snapshotFindUserQueryVariables} from './__snapshotsToBe';
import { removeWhiteSpaces } from './utils';

/* tslint:disable */

describe('MetaExplorer', () => {
  const schema = buildSchema(/* GraphQL */ `
    scalar Date

    schema {
      query: Query
    }
    
    type Query {
      me: User!
      user(id: ID!, username: String, email: String): User
      allUsers: [User]
      search(term: String!): [SearchResult!]!
      myChats: [Chat!]!
    }
    
    enum Role {
      USER,
      ADMIN,
    }
    
    interface Node {
      id: ID!
    }
    
    union SearchResult = User | Chat | ChatMessage
    
    type User implements Node {
      id: ID!
      username: String!
      email: String!
      role: Role!
    }
    
    type Chat implements Node {
      id: ID!
      users: [User!]!
      messages: [ChatMessage!]!
    }
    
    type ChatMessage implements Node {
      id: ID!
      content: String!
      time: Date!
      user: User!
    }
    
    `);

    const query = parse(/* GraphQL */ `
    query findUser($userId: ID!, $username: String, $emailInVar: String) {
      user(id: $userId, username: $username, email: $emailInVar) {
        email,
        ...UserFields
      }
    } 
    
    fragment UserFields on User {
      id
      username
      role
    }
  `);

  it('should create a BlueprintConfigFragment for GQL-Queryvariables', async () => {
    const aMap = schema.getTypeMap();
    const b = Object.keys(aMap).join('\n');
    const result = (await plugin(
      schema,
      [{ location: '', document: query }],
      {},
      { outputFile: '' }));// as Types.ComplexPluginOutput;
      console.log(result)
    expect(removeWhiteSpaces(result.toString()).includes(removeWhiteSpaces(snapshotFindUserQueryVariables))).toBeTruthy();
  });
});
