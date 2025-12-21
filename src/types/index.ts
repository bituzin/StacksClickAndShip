import { UserSession } from '@stacks/connect';

export interface StacksClickAndShipProps {
  isAuthenticated: boolean;
  connectWallet: () => void;
  userSession: UserSession;
}

export interface Poll {
  'poll-id'?: { value: number };
  creator?: { value: string } | { data: string } | string;
  title?: { value: string } | { data: string };
  description?: { value: string } | { data: string };
  'options-count'?: { value: number };
  'ends-at'?: { value: number | bigint };
  'is-active'?: { value: boolean };
  'blocks-remaining'?: { value: number };
  'total-votes'?: { value: number };
  [key: string]: any;
}

export interface LeaderboardEntry {
  user: string;
  total: number;
}

export interface LastGm {
  user: string;
  block: number;
}

export interface TxPopup {
  show: boolean;
  txId: string;
}
