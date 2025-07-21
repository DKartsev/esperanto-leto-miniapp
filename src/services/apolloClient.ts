import { ApolloClient, InMemoryCache } from '@apollo/client'

const uri = import.meta.env.VITE_GRAPHQL_API_URL || 'https://your-api-url/graphql'

const client = new ApolloClient({
  uri,
  cache: new InMemoryCache({
    typePolicies: {
      Plan: { keyFields: false },
      ServerPermissions: { keyFields: false },
      OwnerUsage: { keyFields: false },
      Usage: { keyFields: false },
    },
  }),
})

export default client
