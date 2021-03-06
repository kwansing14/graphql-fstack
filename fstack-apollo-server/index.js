const { ApolloServer, UserInputError, gql } = require('apollo-server');
const { v4: uuidv4 } = require('uuid');

let persons = [
  {
    name: 'Arto Hellas',
    phone: '040-123543',
    street: 'Tapiolankatu 5 A',
    city: 'Espoo',
    id: '3d594650-3436-11e9-bc57-8b80ba54c431',
    a: 'a',
  },
  {
    name: 'Matti Luukkainen',
    phone: '040-432342',
    street: 'Malminkaari 10 A',
    city: 'Helsinki',
    id: '3d599470-3436-11e9-bc57-8b80ba54c431',
    a: 'b',
  },
  {
    name: 'Venla Ruuska',
    street: 'Nallemäentie 22 C',
    city: 'Helsinki',
    id: '3d599471-3436-11e9-bc57-8b80ba54c431',
    a: 'c',
  },
];

const typeDefs = gql`
  type Address {
    street: String!
    city: String!
    a: String!
  }

  type Person {
    name: String!
    phone: String
    address: Address!
    id: ID!
  }

  enum YesNo {
    YES
    NO
  }

  type Query {
    personCount: Int!
    allPersons(phone: YesNo): [Person!]!
    findPerson(name: String!): Person
  }

  # added ENUM yesno to allpersons
  # type Query {
  #   personCount: Int!
  #   allPersons: [Person!]!
  #   findPerson(name: String!): Person
  # }

  type Mutation {
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person
    editNumber(name: String!, phone: String!): Person
  }
`;

const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: (root, args) => {
      console.log(args); // {phone:'YES'}
      if (!args.phone) {
        return persons;
      }
      const byPhone = (person) =>
        args.phone === 'YES' ? person.phone : !person.phone;
      return persons.filter(byPhone);
    },
    findPerson: (root, args) => persons.find((p) => p.name === args.name),
  },
  // Query: {
  //   personCount: () => persons.length,
  //   allPersons: () => persons,
  //   findPerson: (root, args) => persons.find((p) => p.name === args.name),
  // },
  Person: {
    address: (root) => {
      return {
        street: root.street,
        city: root.city,
        a: root.a,
      };
    },
  },
  Mutation: {
    addPerson: (root, args) => {
      if (persons.find((p) => p.name === args.name)) {
        throw new UserInputError('Name must be unique', {
          invalidArgs: args.name,
        });
      }

      const person = { ...args, id: uuidv4() };
      persons = persons.concat(person);
      return person;
    },
    editNumber: (root, args) => {
      console.log('1...', args);
      const person = persons.find((p) => p.name === args.name);
      console.log('2...', args);
      console.log(person);
      if (!person) return null;

      const updatedPerson = { ...person, phone: args.phone };
      console.log('updatedPerson', updatedPerson);
      persons = persons.map((p) => (p.name === args.name ? updatedPerson : p));
      return updatedPerson;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
