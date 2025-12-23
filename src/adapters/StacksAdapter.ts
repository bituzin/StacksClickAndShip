import type { SessionTypes } from '@walletconnect/types';
import { AdapterBlueprint } from '@reown/appkit-controllers';
import type { CaipNetwork, ChainNamespace } from '@reown/appkit-common';

export interface StacksAdapterOptions {
  projectId: string;
  networks: CaipNetwork[];
}

export class StacksAdapter extends AdapterBlueprint {
  declare provider: any;
  private session: SessionTypes.Struct | undefined;
  public projectId: string;
  private _networks: CaipNetwork[];

  constructor(options: StacksAdapterOptions) {
    super();
    this.projectId = options.projectId;
    this._networks = options.networks;
    this.namespace = 'stacks' as ChainNamespace;
  }

  async setUniversalProvider(universalProvider: any): Promise<void> {
    this.provider = universalProvider;
  }

  getWalletConnectProvider(): any {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    return this.provider;
  }

  async syncConnection(): Promise<any> {
    if (!this.provider || !this.session) {
      throw new Error('Not connected');
    }
    const accounts = await this.getAccounts({ id: 'stacks:1', namespace: 'stacks' });
    return {
      id: 'stacks:1',
      type: 'WALLET_CONNECT' as const,
      chainId: 1,
      provider: this.provider,
      address: accounts.accounts[0]?.address || ''
    };
  }

  async connect(_params: AdapterBlueprint.ConnectParams): Promise<AdapterBlueprint.ConnectResult> {
    try {
      // Initialize Universal Provider if not already done
      if (!this.provider) {
        // Dynamic import to use the correct version
        const { default: UniversalProvider } = await import('@walletconnect/universal-provider');
        this.provider = await UniversalProvider.init({
          projectId: this.projectId,
          metadata: {
            name: 'Stacks Click & Ship',
            description: 'Stacks blockchain application',
            url: window.location.origin,
            icons: [window.location.origin + '/vite.svg']
          }
        });
      }

      // Connect to WalletConnect
      const session = await this.provider.connect({
        optionalNamespaces: {
          stacks: {
            chains: this._networks.map(n => n.caipNetworkId),
            methods: [
              'stx_getAddresses',
              'stx_signTransaction',
              'stx_callContract',
              'stx_signMessage',
              'stx_transferStx'
            ],
            events: ['accountsChanged', 'chainChanged']
          }
        }
      });

      this.session = session;

      // Get accounts
      const accounts = await this.getAccounts({ id: 'stacks:1', namespace: 'stacks' });

      return {
        id: 'stacks:1',
        type: 'WALLET_CONNECT' as const,
        address: accounts.accounts[0]?.address || '',
        chainId: 'stacks:1',
        provider: this.provider
      };
    } catch (error) {
      console.error('StacksAdapter connect error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<{ connections: never[] }> {
    try {
      if (this.provider && this.session) {
        await this.provider.disconnect();
      }
      this.session = undefined;
      return { connections: [] };
    } catch (error) {
      console.error('StacksAdapter disconnect error:', error);
      return { connections: [] };
    }
  }

  async getAccounts(_params: AdapterBlueprint.GetAccountsParams & { namespace: ChainNamespace }): Promise<AdapterBlueprint.GetAccountsResult> {
    try {
      if (!this.provider || !this.session) {
        return { accounts: [] };
      }

      // Get addresses using stx_getAddresses method
      const result = await this.provider.request({
        method: 'stx_getAddresses',
        params: {}
      }, `stacks:1`);

      const addresses = (result as any)?.addresses || [];
      const accounts = addresses
        .filter((addr: any) => addr.symbol === 'STX')
        .map((addr: any) => ({
          address: addr.address,
          chainId: 'stacks:1',
          type: 'stacks' as const
        }));

      return { accounts };
    } catch (error) {
      console.error('StacksAdapter getAccounts error:', error);
      return { accounts: [] };
    }
  }

  async switchNetwork(_params: AdapterBlueprint.SwitchNetworkParams): Promise<void> {
    // Stacks doesn't require explicit network switching in WalletConnect
    // The wallet handles network selection
  }

  async signMessage(params: AdapterBlueprint.SignMessageParams): Promise<AdapterBlueprint.SignMessageResult> {
    try {
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }

      const result = await this.provider.request({
        method: 'stx_signMessage',
        params: {
          address: params.address,
          message: params.message,
          messageType: 'utf8',
          network: 'mainnet'
        }
      }, 'stacks:1');

      return {
        signature: (result as any).signature
      };
    } catch (error) {
      console.error('StacksAdapter signMessage error:', error);
      throw error;
    }
  }

  async sendTransaction(params: any): Promise<AdapterBlueprint.SendTransactionResult> {
    try {
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }

      const result = await this.provider.request({
        method: 'stx_signTransaction',
        params: {
          transaction: params.transaction,
          broadcast: true,
          network: params.network || 'mainnet'
        }
      }, `stacks:${params.chainId || 1}`);

      return {
        hash: (result as any).txid
      };
    } catch (error) {
      console.error('StacksAdapter sendTransaction error:', error);
      throw error;
    }
  }

  // Call Stacks smart contract
  async callContract(params: {
    contract: string;
    functionName: string;
    functionArgs: string[];
    chainId?: number;
  }): Promise<{ txid: string; transaction: string }> {
    try {
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }

      const result = await this.provider.request({
        method: 'stx_callContract',
        params: {
          contract: params.contract,
          functionName: params.functionName,
          functionArgs: params.functionArgs
        }
      }, `stacks:${params.chainId || 1}`);

      return result as { txid: string; transaction: string };
    } catch (error) {
      console.error('StacksAdapter callContract error:', error);
      throw error;
    }
  }

  async syncConnections(): Promise<void> {
    // Sync connections if needed
  }

  async syncConnectors(): Promise<void> {
    // Sync connectors if needed
  }

  async getBalance(_params: AdapterBlueprint.GetBalanceParams): Promise<AdapterBlueprint.GetBalanceResult> {
    // This would require calling Stacks API
    return {
      balance: '0',
      symbol: 'STX'
    };
  }

  // Stub methods required by AdapterBlueprint
  async estimateGas(): Promise<AdapterBlueprint.EstimateGasTransactionResult> {
    throw new Error('estimateGas not implemented for Stacks');
  }

  async writeContract(): Promise<AdapterBlueprint.WriteContractResult> {
    throw new Error('writeContract not implemented - use callContract instead');
  }

  async walletGetAssets(_params: AdapterBlueprint.WalletGetAssetsParams): Promise<AdapterBlueprint.WalletGetAssetsResponse> {
    return [] as any;
  }

  parseUnits(): AdapterBlueprint.ParseUnitsResult {
    return BigInt(0);
  }

  formatUnits(): AdapterBlueprint.FormatUnitsResult {
    return '0';
  }

  async getCapabilities(): Promise<unknown> {
    return {};
  }

  async grantPermissions(): Promise<unknown> {
    return {};
  }

  async revokePermissions(): Promise<`0x${string}`> {
    return '0x';
  }
}
