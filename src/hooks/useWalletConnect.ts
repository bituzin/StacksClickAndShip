import { useState, useEffect, useCallback } from 'react';
import SignClient from '@walletconnect/sign-client';
import { SessionTypes, PairingTypes } from '@walletconnect/types';
import { getSdkError } from '@walletconnect/utils';

// Stacks JSON-RPC Methods Types
export interface StxAddress {
  symbol: string;
  address: string;
}

export interface StxTransferParams {
  sender: string;
  recipient: string;
  amount: string;
  memo?: string;
  network?: 'mainnet' | 'testnet' | 'devnet';
}

export interface StxSignTransactionParams {
  transaction: string;
  broadcast?: boolean;
  network?: 'mainnet' | 'testnet' | 'devnet';
}

export interface StxSignMessageParams {
  address: string;
  message: string;
  messageType?: 'utf8' | 'structured';
  network?: 'mainnet' | 'testnet' | 'devnet';
  domain?: string;
}

export interface StxSignStructuredMessageParams {
  message: string | object;
  domain: string | object;
}

export interface StxCallContractParams {
  contract: string;
  functionName: string;
  functionArgs: string[];
}

export interface WalletConnectState {
  signClient: SignClient | null;
  session: SessionTypes.Struct | null;
  accounts: string[];
  isConnecting: boolean;
  isConnected: boolean;
  uri: string;
  pairings: PairingTypes.Struct[];
}

const WALLET_CONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID'; // Replace with your WalletConnect project ID from https://cloud.walletconnect.com
const STACKS_CHAIN_ID = 'stacks:1'; // mainnet, use 'stacks:2147483648' for testnet

// Singleton to prevent multiple initializations
let signClientInstance: SignClient | null = null;
let isInitializing = false;

// Global shared state - single source of truth
let globalState: WalletConnectState = {
  signClient: null,
  session: null,
  accounts: [],
  isConnecting: false,
  isConnected: false,
  uri: '',
  pairings: []
};

// Global state synchronization - notify all hook instances about state changes
const stateListeners: Set<(state: WalletConnectState) => void> = new Set();

const updateGlobalState = (update: Partial<WalletConnectState>) => {
  globalState = { ...globalState, ...update };
  stateListeners.forEach(listener => listener(globalState));
};

export const useWalletConnect = () => {
  // Use global state directly
  const [state, setState] = useState<WalletConnectState>(globalState);

  // Initialize WalletConnect client
  const initializeClient = useCallback(async () => {
    // Return existing instance if already initialized
    if (signClientInstance) {
      // Check for existing sessions and restore them
      const sessions = signClientInstance.session.getAll();
      console.log('🔄 Restoring WalletConnect sessions:', sessions.length);
      if (sessions.length > 0) {
        const lastSession = sessions[sessions.length - 1];
        console.log('✅ Session restored:', lastSession.topic);
        updateGlobalState({
          signClient: signClientInstance,
          session: lastSession,
          accounts: lastSession.namespaces?.stacks?.accounts || [],
          isConnected: true,
          pairings: signClientInstance.pairing.getAll({ active: true })
        });
      }
      
      return signClientInstance;
    }

    // Prevent multiple simultaneous initializations
    if (isInitializing) {
      return null;
    }

    try {
      isInitializing = true;
      
      // Validate Project ID
      if (!WALLET_CONNECT_PROJECT_ID || WALLET_CONNECT_PROJECT_ID === 'YOUR_PROJECT_ID') {
        throw new Error('WalletConnect Project ID is not set. Please add VITE_WALLETCONNECT_PROJECT_ID to your .env file');
      }

      const client = await SignClient.init({
        projectId: WALLET_CONNECT_PROJECT_ID,
        metadata: {
          name: 'Stacks Click & Ship',
          description: 'Stacks blockchain dApp with WalletConnect',
          url: window.location.origin,
          icons: [`${window.location.origin}/favicon.ico`]
        }
      });

      signClientInstance = client;

      updateGlobalState({
        signClient: client,
        pairings: client.pairing.getAll({ active: true })
      });

      // Setup event listeners
      setupEventListeners(client);

      // Check for existing sessions and restore them automatically
      const sessions = client.session.getAll();
      console.log('🔍 Found existing sessions:', sessions.length);
      
      if (sessions.length > 0) {
        const lastSession = sessions[sessions.length - 1];
        console.log('✅ Auto-restoring session:', lastSession.topic);
        console.log('📱 Accounts:', lastSession.namespaces?.stacks?.accounts);
        
        // Verify session is still active by sending a ping
        try {
          await client.ping({ topic: lastSession.topic });
          console.log('🏓 Session is active');
          
          updateGlobalState({
            session: lastSession,
            accounts: lastSession.namespaces?.stacks?.accounts || [],
            isConnected: true
          });
        } catch (pingError) {
          console.warn('⚠️ Session ping failed, removing dead session:', pingError);
          try {
            await client.disconnect({
              topic: lastSession.topic,
              reason: getSdkError('USER_DISCONNECTED')
            });
          } catch {}
          // Don't restore if ping fails
        }
      }

      return client;
    } catch (error) {
      console.error('Failed to initialize WalletConnect client:', error);
      throw error;
    } finally {
      isInitializing = false;
    }
  }, []);

  // Setup event listeners
  const setupEventListeners = (client: SignClient) => {
    // Session connected
    client.on('session_event', (event) => {
      console.log('Session event:', event);
    });

    // Session updated
    client.on('session_update', ({ topic, params }) => {
      console.log('Session updated:', topic, params);
      const session = client.session.get(topic);
      updateGlobalState({
        session,
        accounts: session.namespaces?.stacks?.accounts || []
      });
    });

    // Session deleted
    client.on('session_delete', () => {
      console.log('Session deleted');
      updateGlobalState({
        session: null,
        accounts: [],
        isConnected: false
      });
    });
  };

  // Connect wallet
  const connect = useCallback(async () => {
    if (!state.signClient) {
      throw new Error('SignClient not initialized. Please check your WalletConnect Project ID in .env file');
    }

    try {
      updateGlobalState({ isConnecting: true, uri: '' });

      // Use requiredNamespaces for guaranteed support
      const requiredNamespaces = {
        stacks: {
          methods: [
            'stx_signTransaction'
          ],
          chains: [STACKS_CHAIN_ID],
          events: []
        }
      };

      const optionalNamespaces = {
        stacks: {
          methods: [
            'stx_getAddresses',
            'stx_transferStx',
            'stx_signMessage',
            'stx_signStructuredMessage',
            'stx_callContract'
          ],
          chains: [STACKS_CHAIN_ID],
          events: ['accountsChanged', 'chainChanged']
        }
      };

      const { uri, approval } = await state.signClient.connect({
        requiredNamespaces,
        optionalNamespaces
      });

      if (uri) {
        console.log('WalletConnect URI generated:', uri);
        updateGlobalState({ uri });
      }

      const session = await approval();
      
      console.log('✅ WalletConnect session approved:', session);
      console.log('📱 Connected accounts:', session.namespaces?.stacks?.accounts);
      
      updateGlobalState({
        session,
        accounts: session.namespaces?.stacks?.accounts || [],
        isConnected: true,
        isConnecting: false,
        uri: ''
      });

      // Session is automatically persisted by WalletConnect SDK
      console.log('💾 Session persisted by WalletConnect SDK');

      return session;
    } catch (error) {
      console.error('Failed to connect:', error);
      updateGlobalState({ isConnecting: false, uri: '' });
      throw error;
    }
  }, [state.signClient]);

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    if (!state.signClient) {
      throw new Error('No SignClient initialized');
    }

    try {
      // Disconnect all active sessions
      const sessions = state.signClient.session.getAll();
      console.log('🔌 Disconnecting all sessions:', sessions.length);
      
      for (const session of sessions) {
        try {
          await state.signClient.disconnect({
            topic: session.topic,
            reason: getSdkError('USER_DISCONNECTED')
          });
          console.log('✅ Disconnected session:', session.topic);
        } catch (err) {
          console.warn('Failed to disconnect session:', session.topic, err);
        }
      }

      updateGlobalState({
        session: null,
        accounts: [],
        isConnected: false
      });
      
      console.log('✅ All sessions disconnected');
    } catch (error) {
      console.error('Failed to disconnect:', error);
      throw error;
    }
  }, [state.signClient]);

  // Get Stacks addresses
  const getAddresses = useCallback(async (): Promise<StxAddress[]> => {
    if (!state.signClient || !state.session) {
      throw new Error('No active session');
    }

    try {
      const result = await state.signClient.request<{ addresses: StxAddress[] }>({
        topic: state.session.topic,
        chainId: STACKS_CHAIN_ID,
        request: {
          method: 'stx_getAddresses',
          params: {}
        }
      });

      return result.addresses;
    } catch (error) {
      console.error('Failed to get addresses:', error);
      throw error;
    }
  }, [state.signClient, state.session]);

  // Transfer STX
  const transferStx = useCallback(async (params: StxTransferParams): Promise<{ txid: string; transaction: string }> => {
    if (!state.signClient || !state.session) {
      throw new Error('No active session');
    }

    try {
      const result = await state.signClient.request<{ txid: string; transaction: string }>({
        topic: state.session.topic,
        chainId: STACKS_CHAIN_ID,
        request: {
          method: 'stx_transferStx',
          params
        }
      });

      return result;
    } catch (error) {
      console.error('Failed to transfer STX:', error);
      throw error;
    }
  }, [state.signClient, state.session]);

  // Sign transaction
  const signTransaction = useCallback(async (params: StxSignTransactionParams): Promise<{ signature: string; transaction: string; txid?: string }> => {
    if (!state.signClient || !state.session) {
      throw new Error('No active session');
    }

    try {
      const result = await state.signClient.request<{ signature: string; transaction: string; txid?: string }>({
        topic: state.session.topic,
        chainId: STACKS_CHAIN_ID,
        request: {
          method: 'stx_signTransaction',
          params
        }
      });

      return result;
    } catch (error) {
      console.error('Failed to sign transaction:', error);
      throw error;
    }
  }, [state.signClient, state.session]);

  // Sign message
  const signMessage = useCallback(async (params: StxSignMessageParams): Promise<{ signature: string }> => {
    if (!state.signClient || !state.session) {
      throw new Error('No active session');
    }

    try {
      const result = await state.signClient.request<{ signature: string }>({
        topic: state.session.topic,
        chainId: STACKS_CHAIN_ID,
        request: {
          method: 'stx_signMessage',
          params
        }
      });

      return result;
    } catch (error) {
      console.error('Failed to sign message:', error);
      throw error;
    }
  }, [state.signClient, state.session]);

  // Sign structured message
  const signStructuredMessage = useCallback(async (params: StxSignStructuredMessageParams): Promise<{ signature: string; publicKey?: string }> => {
    if (!state.signClient || !state.session) {
      throw new Error('No active session');
    }

    try {
      const result = await state.signClient.request<{ signature: string; publicKey?: string }>({
        topic: state.session.topic,
        chainId: STACKS_CHAIN_ID,
        request: {
          method: 'stx_signStructuredMessage',
          params
        }
      });

      return result;
    } catch (error) {
      console.error('Failed to sign structured message:', error);
      throw error;
    }
  }, [state.signClient, state.session]);

  // Call contract
  const callContract = useCallback(async (params: StxCallContractParams): Promise<{ txid: string; transaction: string }> => {
    if (!state.signClient || !state.session) {
      throw new Error('No active session');
    }

    try {
      const result = await state.signClient.request<{ txid: string; transaction: string }>({
        topic: state.session.topic,
        chainId: STACKS_CHAIN_ID,
        request: {
          method: 'stx_callContract',
          params
        }
      });

      return result;
    } catch (error) {
      console.error('Failed to call contract:', error);
      throw error;
    }
  }, [state.signClient, state.session]);

  // Initialize on mount (only once)
  useEffect(() => {
    let mounted = true;
    
    const init = async () => {
      if (mounted) {
        try {
          await initializeClient();
        } catch (error) {
          console.error('WalletConnect initialization error:', error);
          // Show user-friendly error
          if (error instanceof Error && error.message.includes('Project ID')) {
            alert('WalletConnect configuration error: Please set VITE_WALLETCONNECT_PROJECT_ID in your .env file');
          }
        }
      }
    };
    
    init();
    
    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array - run only once

  // Subscribe to global state changes
  useEffect(() => {
    const listener = (newState: WalletConnectState) => {
      setState(newState);
    };
    
    stateListeners.add(listener);
    
    // Sync with existing session immediately on mount
    if (signClientInstance) {
      const sessions = signClientInstance.session.getAll();
      if (sessions.length > 0) {
        const lastSession = sessions[sessions.length - 1];
        console.log('🔄 Syncing hook state with existing session:', lastSession.topic);
        
        // Verify session is actually active
        signClientInstance.ping({ topic: lastSession.topic })
          .then(() => {
            console.log('🏓 Session verified active');
            updateGlobalState({
              signClient: signClientInstance,
              session: lastSession,
              accounts: lastSession.namespaces?.stacks?.accounts || [],
              isConnected: true,
              pairings: signClientInstance!.pairing.getAll({ active: true })
            });
          })
          .catch((pingError) => {
            console.warn('⚠️ Session is not active, clearing:', pingError);
            // Remove dead session
            signClientInstance!.disconnect({
              topic: lastSession.topic,
              reason: getSdkError('USER_DISCONNECTED')
            }).catch(() => {});
            
            updateGlobalState({
              signClient: signClientInstance,
              session: null,
              accounts: [],
              isConnected: false,
              pairings: signClientInstance!.pairing.getAll({ active: true })
            });
          });
      }
    }
    
    return () => {
      stateListeners.delete(listener);
    };
  }, []);

  // Monitor session health periodically
  useEffect(() => {
    if (!state.session || !state.signClient) return;

    const healthCheck = setInterval(async () => {
      try {
        await state.signClient!.ping({ topic: state.session!.topic });
        console.log('🏓 Session health check passed');
      } catch (error) {
        console.error('❌ Session health check failed, disconnecting:', error);
        updateGlobalState({
          session: null,
          accounts: [],
          isConnected: false
        });
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(healthCheck);
  }, [state.session, state.signClient]);

  return {
    ...state,
    connect,
    disconnect,
    getAddresses,
    transferStx,
    signTransaction,
    signMessage,
    signStructuredMessage,
    callContract
  };
};

// Add debug logging after hook definition
if (typeof window !== 'undefined') {
  (window as any).__debugWC = () => {
    console.log('SignClient instance:', signClientInstance);
    if (signClientInstance) {
      console.log('Active sessions:', signClientInstance.session.getAll());
    }
  };
}
