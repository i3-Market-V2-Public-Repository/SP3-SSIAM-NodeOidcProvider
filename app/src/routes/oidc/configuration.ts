import { Configuration } from 'oidc-provider'

import { loadJSON } from '@i3-market/util'
import config from '@i3-market/config'
import Account from '@i3-market/account'

import interactions from './interactions'
import logger from '@i3-market/logger'

export default async (): Promise<Configuration> => {
  const keys = await loadJSON(config.jwksKeysPath)
  if (!keys) {
    logger.error('JWKS file not fount')
  }

  return {
    findAccount: Account.findAccount,
    interactions,

    // TODO: Remove userinfo endpoint
    // TODO: Implement this function to add custom error views
    // renderError: async (ctx, out, error) => {
    //   return
    // },

    pkce: {
      methods: ['S256'],
      required: (ctx, client) => {
        return client.tokenEndpointAuthMethod === 'none';
      }
    },

    claims: {
      openid: ['sub', 'profile']
    },
    jwks: { keys },

    features: {
      devInteractions: { enabled: false },

      introspection: { enabled: true },
      revocation: { enabled: true }
    },

    cookies: {
      long: { signed: true, maxAge: (1 * 24 * 60 * 60) * 1000 }, // 1 day in ms
      short: { signed: true },
      keys: config.cookiesKeys
    },

    ttl: {
      AccessToken: 1 * 60 * 60, // 1 hour in seconds
      AuthorizationCode: 10 * 60, // 10 minutes in seconds
      IdToken: 1 * 60 * 60, // 1 hour in seconds
      DeviceCode: 10 * 60, // 10 minutes in seconds
      RefreshToken: 1 * 24 * 60 * 60 // 1 day in seconds
    }
  }
}
