import { Connection, PublicKey } from '@solana/web3.js';
import { MarinadeState } from '@marinade.finance/marinade-ts-sdk';

interface Staking {
  accounts: number;
  balance: number;
}

class MarinadeBalanceChecker {
  private marinade: MarinadeState;
  private address: string;

  constructor(address: string, rpcEndpoint: string) {
    const connection = new Connection(rpcEndpoint);
    this.marinade = new MarinadeState(connection);
    this.address = address;
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

// Usage
const address = process.env.WALLET_ADDRESS || '';
const rpcEndpoint = process.env.RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com';

const checker = new MarinadeBalanceChecker(address, rpcEndpoint);
checker.checkBalance();