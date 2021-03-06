// Core interfaces
import { createAgent, IDIDManager, IResolver, IDataStore, IKeyManager, IMessageHandler } from '@veramo/core'

// Core identity manager plugin
import { DIDManager } from '@veramo/did-manager'

// Ethr did identity provider
import { EthrDIDProvider } from '@veramo/did-provider-ethr'

// Web did identity provider
import { WebDIDProvider } from '@veramo/did-provider-web'

// Core key manager plugin
import { KeyManager } from '@veramo/key-manager'


// Custom key management system for RN
import { KeyManagementSystem } from '@veramo/kms-local'

import { ISelectiveDisclosure, SelectiveDisclosure, SdrMessageHandler } from '@veramo/selective-disclosure'

// 
import { MessageHandler } from '@veramo/message-handler'
import { JwtMessageHandler } from '@veramo/did-jwt'

//
import { W3cMessageHandler } from '@veramo/credential-w3c'

// Storage plugin using TypeOrm
import { Entities, KeyStore, DIDStore, IDataStoreORM, DataStore, DataStoreORM } from '@veramo/data-store'

// TypeORM is installed with `@veramo/data-store`
import { createConnection } from 'typeorm'

import config from '@i3-market/config'

// This will be the name for the local sqlite database for demo purposes
const DATABASE_FILE = 'database.sqlite'

// You will need to get a project ID from infura https://www.infura.io
const INFURA_PROJECT_ID = '-'

const dbConnection = createConnection({
  type: 'sqlite',
  database: DATABASE_FILE,
  synchronize: true,
  logging: ['error', 'info', 'warn'],
  entities: Entities,
})

const rinkebyProviderData = {
  defaultKms: 'local',
  network: 'rinkeby',
  rpcUrl: 'https://rinkeby.infura.io/v3/' + INFURA_PROJECT_ID,
}

const ganacheProviderData = {
  defaultKms: 'local',
  network: 'ganache',
  rpcUrl: 'http://127.0.0.1:7545',
}

const i3marketProviderData = {
  defaultKms: 'local',
  network: 'i3m',
  rpcUrl: config.rpcUrl
}


export const agent = createAgent<
  IDIDManager & IKeyManager & IDataStore & IDataStoreORM & IResolver &
  ISelectiveDisclosure & IMessageHandler & IDataStore & IDataStoreORM
>({
  plugins: [
    new KeyManager({
      store: new KeyStore(dbConnection),
      kms: {
        local: new KeyManagementSystem(),
      },
    }),
    new DIDManager({
      store: new DIDStore(dbConnection),
      defaultProvider: 'did:ethr:rinkeby',
      providers: {
        'did:ethr:rinkeby': new EthrDIDProvider(rinkebyProviderData),
        'did:ethr:ganache': new EthrDIDProvider(ganacheProviderData),
        'did:ethr:i3m': new EthrDIDProvider(i3marketProviderData),
        'did:web': new WebDIDProvider({
          defaultKms: 'local',
        }),
      },
    }),    
    new SelectiveDisclosure(),
    new DataStore(dbConnection),
    new DataStoreORM(dbConnection),
    new MessageHandler({
      messageHandlers: [
        new JwtMessageHandler(),
        new SdrMessageHandler(),
        new W3cMessageHandler(),
      ]
    })
  ],
})
