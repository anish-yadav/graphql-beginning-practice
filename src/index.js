const { ApolloServer, gql, PubSub } = require("apollo-server");

const typeDefs = gql`
    type Query {
        hello: String
    }

    type User {
        id: ID!
        username: String
        firstLetter: String
    }

    type Error {
        field : String!
        message: String!
    }
    
    type RegisterResponse {
        user : User
        errors:[Error!]
    }
    input UserInfo {
        username: String!
        password: String!
    }
    type Mutation {
        register(userInfo: UserInfo) : RegisterResponse
    }


    type Subscription {
        newUser: User!  
    }
`
const NEW_USER = "NEW_USER"
const resolvers = {
    Subscription:{
        newUser:{
            subscribe: (parent, args, {pubsub}) => pubsub.asyncIterator(NEW_USER)
        }
    },


    User : {
        firstLetter: parent => {
            return parent.username[0]
        }
    },
    Query :{ 
        hello: () => "Hello World"
    },
    Mutation :{ 
        register: (_,{userInfo:{username}},{pubsub}) => {
            const user = {
                id: 1,
                username
            }
            pubsub.publish(NEW_USER, {
                newUser: user
            })
            const errors = [{
                field: "username",
                message: "Invalid"
            }]
            return {
                errors,
                user 
            }
        }
    }
}
const pubsub = new PubSub()

const server = new ApolloServer({ typeDefs, resolvers, context: ({req,res}) => ({req,res,pubsub})})
server.listen().then(({ url }) => {
    console.log(`Server started at ${url}`)
})
