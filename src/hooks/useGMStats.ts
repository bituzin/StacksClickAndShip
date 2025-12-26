import React from 'react';
import { callReadOnlyFunction, principalCV, cvToString, uintCV } from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';
import { GMOK_CONTRACT_ADDRESS, GMOK_CONTRACT_NAME } from '../constants/contracts';
import { LeaderboardEntry, LastGm } from '../types';
import { parseValue } from '../utils/blockchain';

const DEFAULT_SENDER = 'SP000000000000000000002Q6VF78';
const MAX_RECENT_GMS = 25;

type RecentGmEntry = {
  id: number;
  user: string;
  blockHeight: number;
  timestamp?: number;
};

const toNumber = (value: any): number => {
  return parseValue(value?.value ?? value);
};

const toUserString = (value: any): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return cvToString(value);
};

export function useGMStats(userAddress: string | null) {
  const [todayGm, setTodayGm] = React.useState<number | null>(null);
  const [totalGm, setTotalGm] = React.useState<number | null>(null);
  const [userGm, setUserGm] = React.useState<number | null>(null);
  const [lastGm, setLastGm] = React.useState<LastGm | null>(null);
  const [lastGmAgo, setLastGmAgo] = React.useState<string | null>(null);
  const [leaderboard, setLeaderboard] = React.useState<LeaderboardEntry[]>([]);

  const senderAddress = userAddress || DEFAULT_SENDER;

  const fetchGmCounts = React.useCallback(async () => {
    try {
      const [totalRes, todayRes, userRes] = await Promise.all([
        callReadOnlyFunction({
          contractAddress: GMOK_CONTRACT_ADDRESS,
          contractName: GMOK_CONTRACT_NAME,
          functionName: 'get-total-gms-alltime',
          functionArgs: [],
          network: new StacksMainnet(),
          senderAddress
        }),
        callReadOnlyFunction({
          contractAddress: GMOK_CONTRACT_ADDRESS,
          contractName: GMOK_CONTRACT_NAME,
          functionName: 'get-daily-gm-count',
          functionArgs: [],
          network: new StacksMainnet(),
          senderAddress
        }),
        userAddress
          ? callReadOnlyFunction({
              contractAddress: GMOK_CONTRACT_ADDRESS,
              contractName: GMOK_CONTRACT_NAME,
              functionName: 'get-user-total-gms',
              functionArgs: [principalCV(userAddress)],
              network: new StacksMainnet(),
              senderAddress: userAddress
            })
          : null
      ]);

      const totalValue = toNumber((totalRes as any)?.value ?? totalRes);
      const todayValue = toNumber((todayRes as any)?.value ?? todayRes);
      setTotalGm(totalValue);
      setTodayGm(todayValue);

      if (userRes) {
        const userValue = toNumber((userRes as any)?.value ?? userRes);
        setUserGm(userValue);
      } else {
        setUserGm(null);
      }
    } catch (error) {
      console.error('Error fetching GM counts:', error);
    }
  }, [senderAddress, userAddress]);

  const fetchRecentGms = React.useCallback(
    async (total: number): Promise<RecentGmEntry[]> => {
      if (total <= 0) return [];
      const ids: number[] = [];
      const lastId = total - 1;
      for (let id = lastId; id >= 0 && ids.length < MAX_RECENT_GMS; id--) {
        ids.push(id);
      }
      const responses = await Promise.all(
        ids.map((id) =>
          callReadOnlyFunction({
            contractAddress: GMOK_CONTRACT_ADDRESS,
            contractName: GMOK_CONTRACT_NAME,
            functionName: 'get-gm-by-id',
            functionArgs: [uintCV(id)],
            network: new StacksMainnet(),
            senderAddress
          })
        )
      );

      const entries: RecentGmEntry[] = [];
      responses.forEach((res, index) => {
        const option = (res as any)?.value;
        if (option?.type !== 10) return;
        const gm = option.value?.data || option.value;
        if (!gm) return;
        const user = toUserString(gm.user);
        if (!user) return;
        const blockHeight = toNumber(gm['block-height']);
        const timestamp = toNumber(gm.timestamp);
        entries.push({
          id: ids[index],
          user,
          blockHeight,
          timestamp: Number.isFinite(timestamp) ? timestamp : undefined
        });
      });

      return entries;
    },
    [senderAddress]
  );

  const formatAgo = (timestamp?: number, blockHeight?: number) => {
    if (timestamp && timestamp > 0) {
      const diffSeconds = Math.max(0, Math.floor(Date.now() / 1000 - timestamp));
      if (diffSeconds < 120) return `${diffSeconds}s ago`;
      if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
      return `${(diffSeconds / 3600).toFixed(1)}h ago`;
    }
    if (typeof blockHeight === 'number') {
      return `${blockHeight} blocks ago`;
    }
    return null;
  };

  const fetchLastGmAndLeaderboard = React.useCallback(async () => {
    try {
      const totalRes = await callReadOnlyFunction({
        contractAddress: GMOK_CONTRACT_ADDRESS,
        contractName: GMOK_CONTRACT_NAME,
        functionName: 'get-total-gms-alltime',
        functionArgs: [],
        network: new StacksMainnet(),
        senderAddress
      });
      const totalValue = toNumber((totalRes as any)?.value ?? totalRes);
      if (!totalValue) {
        setLastGm(null);
        setLastGmAgo(null);
        setLeaderboard([]);
        return;
      }

      const entries = await fetchRecentGms(totalValue);
      if (entries.length === 0) {
        setLastGm(null);
        setLastGmAgo(null);
        setLeaderboard([]);
        return;
      }

      const latest = entries[0];
      setLastGm({ user: latest.user, block: latest.blockHeight });
      setLastGmAgo(formatAgo(latest.timestamp, latest.blockHeight));

      const uniqueUsers = Array.from(new Set(entries.map((entry) => entry.user)));
      const totals = await Promise.all(
        uniqueUsers.map((addr) =>
          callReadOnlyFunction({
            contractAddress: GMOK_CONTRACT_ADDRESS,
            contractName: GMOK_CONTRACT_NAME,
            functionName: 'get-user-total-gms',
            functionArgs: [principalCV(addr)],
            network: new StacksMainnet(),
            senderAddress
          }).then((res) => toNumber((res as any)?.value ?? res))
        )
      );

      const data: LeaderboardEntry[] = uniqueUsers
        .map((addr, index) => ({ user: addr, total: totals[index] || 0 }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

      setLeaderboard(data);
    } catch (error) {
      console.error('Error fetching GM leaderboard:', error);
      setLeaderboard([]);
    }
  }, [fetchRecentGms, senderAddress]);

  return {
    todayGm,
    totalGm,
    userGm,
    lastGm,
    lastGmAgo,
    leaderboard,
    fetchGmCounts,
    fetchLastGmAndLeaderboard
  };
}
