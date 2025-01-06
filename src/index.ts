import { NativeStakingConfig, NativeStakingSDK } from '@marinade.finance/native-staking-sdk';
import { Connection, PublicKey } from '@solana/web3.js';

interface Staking {
  accounts: number;
  balance: number;
}

class MarinadeNativeChecker {
  private marinade: NativeStakingSDK;
  private address: string;

  constructor(address: string, rpcEndpoint: string) {
    const config = new NativeStakingConfig({ connection: new Connection(rpcEndpoint) })
    this.marinade = new NativeStakingSDK(config)
    this.address = address;
    console.log("MarinadeNativeChecker initialized with address: ", address, " and rpcEndpoint: ", rpcEndpoint);
  }

  private async fetchMarinadeBalance(): Promise<Staking> {
    const stakeAccounts = await this.marinade.getStakeAccounts(new PublicKey(this.address));
 
    const stakeAccountsBalance = stakeAccounts.all.reduce((accumulator, account) => {
      return accumulator + (account.account.lamports ?? 0);
    }, 0);
 
    return {
      accounts: stakeAccounts.all.length,
      balance: stakeAccountsBalance,
    };
  }

  async checkBalance(): Promise<void> {
    try {
      const balance = await this.fetchMarinadeBalance();
      console.log('Staking Summary:');
      console.log(`Number of accounts: ${balance.accounts}`);
      console.log(`Total balance (lamports): ${balance.balance}`);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  }
}

const address = process.env.WALLET_ADDRESS
if (!address) {
    throw new Error('WALLET_ADDRESS is required. Set up env variable with your wallet address');
}
const rpcEndpoint = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';

const checker = new MarinadeNativeChecker(address, rpcEndpoint);
checker.checkBalance();