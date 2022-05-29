import {buildSchema} from "graphql";

const users = [
  {id: 1, name: "Fong", age: 23, friendIds: [2, 3]},
  {id: 2, name: "Kevin", age: 40, friendIds: [1]},
  {id: 3, name: "Mary", age: 18, friendIds: [1]},
];

const imagesData = [
  {
    id: 1,
    title: "Stacked Brwonies",
    owner: "Ella Olson",
    category: "Desserts",
    url: "https://images.pexels.com/photos/3026804/pexels-photo-3026804.jpeg",
  },
  {
    id: 2,
    title: "Shallow focus photography of Cafe Latte",
    owner: "Kevin Menajang",
    category: "Coffee",
    url: "https://images.pexels.com/photos/982612/pexels-photo-982612.jpeg",
  },
  {
    id: 3,
    title: "Sliced Cake on White Saucer",
    owner: "Quang Nguyen Vinh",
    category: "Desserts",
    url: "https://images.pexels.com/photos/2144112/pexels-photo-2144112.jpeg",
  },
  {
    id: 4,
    title: "Beverage breakfast brewed coffee caffeine",
    owner: "Burst",
    category: "Coffee",
    url: "https://images.pexels.com/photos/374885/pexels-photo-374885.jpeg",
  },
  {
    id: 5,
    title: "Pancake with Sliced Strawberry",
    owner: "Ash",
    category: "Desserts",
    url: "https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg",
  },
];

// GraphQL Schema
export const schema = buildSchema(`
  type Image {
    id: Int
    title: String
    category: String
    owner: String
    url: String
  }
  type User {
    id: ID
    name: String
    age: Int
    friends(a: Int): [User]
  }
  type Query {
    hello: String
    image(id: Int!): Image
    images(category: String): [Image]
    user: User
    users: [User]
  }
  type Mutation {
    addUser(id: ID, name: String!, age: Int): User
  }
  type Subscription {
    userAdded: User
  }
`);


const USER_ADDED = "USER_ADDED";
// Resolver
export const root = {
  query: {
    hello: () => "world",
    user: () => users[0],
    users: () => users,
    image: (args) => {
      for (const image of imagesData) {
        if (image.id === args.id) {
          return image;
        }
      }
      return null;
    },
    images: (args) => {
      if (args.category) {
        return imagesData.filter((image) => image.category.toLowerCase() === args.category.toLowerCase());
      } else {
        return imagesData;
      }
    },
  },
  mutation: {
    addUser: (args, {pubsub}) => {
      const {id, name, age} = args;
      users.push({
        id,
        name,
        age,
        friendIds: [],
      });
      pubsub.publish(USER_ADDED, {
        userAdded: {
          id,
          name,
          age,
        },
      });
      return {
        id,
        name,
        age,
      };
    },
  },
  subscription: {
    userAdded: (args, {pubsub}) => {
      return pubsub.asyncIterator(USER_ADDED)
    },
  },
};
