import React from 'react';
import { callReadOnlyFunction, principalCV, cvToString } from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';
import { GMOK_CONTRACT_ADDRESS, GMOK_CONTRACT_NAME } from '../constants/contracts';
import { LeaderboardEntry, LastGm } from '../types';
import { fetchCurrentBlock, parseValue } from '../utils/blockchain';

export function useGMStats(userAddress: string | null) {
  const [todayGm, setTodayGm] = React.useState<number | null>(null);
  const [totalGm, setTotalGm] = React.useState<number | null>(null);
  const [userGm, setUserGm] = React.useState<number | null>(null);
  const [lastGm, setLastGm] = React.useState<LastGm | null>(null);
  const [lastGmAgo, setLastGmAgo] = React.useState<string | null>(null);
  const [leaderboard, setLeaderboard] = React.useState<LeaderboardEntry[]>([]);

  const fetchGmCounts = React.useCallback(async () => {
    try {
      const backendUrl = 'https://gm-backend-seven.vercel.app/api/stats';
      const response = await fetch(backendUrl);
      
      if (response.ok) {
        const data = await response.json();
        setTodayGm(data.today);
        setTotalGm(data.total);
        
        if (userAddress) {
          const { principalCV } = await import('@stacks/transactions');
          const userRes = await callReadOnlyFunction({
            contractAddress: GMOK_CONTRACT_ADDRESS,
            contractName: GMOK_CONTRACT_NAME,
            functionName: 'get-user-total-gms',
            functionArgs: [principalCV(userAddress)],
            network: new StacksMainnet(),
            senderAddress: userAddress,
          });
          const userVal = (userRes as any)?.value?.value;
          setUserGm(parseValue(userVal));
        }
      }
    } catch (e) {
      console.error('Error fetching GM counts:', e);
    }
  }, [userAddress]);

  const fetchLastGmAndLeaderboard = React.useCallback(async () => {
    try {
      const res = await callReadOnlyFunction({
        contractAddress: GMOK_CONTRACT_ADDRESS,
        contractName: GMOK_CONTRACT_NAME,
        functionName: 'get-last-three-gms',
        functionArgs: [],
        network: new StacksMainnet(),
        senderAddress: userAddress || 'SP000000000000000000002Q6VF78',
      });
      
      const gms = (res as any).value?.data;
      if (!gms) {
        setLastGm(null);
        setLastGmAgo(null);
        setLeaderboard([]);
        return;
      }
      
      const gmList = [];
      if (gms.first && gms.first.type === 10) gmList.push(gms.first.value);
      if (gms.second && gms.second.type === 10) gmList.push(gms.second.value);
      if (gms.third && gms.third.type === 10) gmList.push(gms.third.value);

      if (gmList.length > 0) {
        const last: any = gmList[0];
        const userObj = last.data?.user || last.user;
        const userPrincipal = typeof userObj === 'string' ? userObj : cvToString(userObj);
        const blockHeightObj = last.data?.['block-height'] || last['block-height'];
        const blockHeight = typeof blockHeightObj === 'bigint' || typeof blockHeightObj === 'number' 
          ? blockHeightObj 
          : blockHeightObj?.value;
        
        if (userPrincipal) {
          setLastGm({ user: userPrincipal, block: Number(blockHeight) });
          const currentBlock = await fetchCurrentBlock();
          const diff = currentBlock - Number(blockHeight);
          const minutes = diff * 10;
          setLastGmAgo(minutes < 60 ? `${minutes} min ago` : `${(minutes/60).toFixed(1)} h ago`);
        }
      }

      const users = Array.from(new Set(gmList.map((g: any) => {
        const userObj = g.data?.user || g.user;
        return typeof userObj === 'string' ? userObj : cvToString(userObj);
      }).filter(Boolean)));
      
      const leaderboardData = await Promise.all(users.map(async (addr: string) => {
        const res: any = await callReadOnlyFunction({
          contractAddress: GMOK_CONTRACT_ADDRESS,
          contractName: GMOK_CONTRACT_NAME,
          functionName: 'get-user-total-gms',
          functionArgs: [principalCV(addr)],
          network: new StacksMainnet(),
          senderAddress: userAddress || 'SP000000000000000000002Q6VF78',
        });
        let total = 0;
        if (res && (res as any).value && (res as any).value.value !== undefined) {
          total = parseValue((res as any).value.value);
        }
        return { user: addr, total };
      }));
      
      leaderboardData.sort((a, b) => b.total - a.total);
      setLeaderboard(leaderboardData);
    } catch (e) {
      console.error('Error fetching last GM and leaderboard:', e);
    }
  }, [userAddress]);

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
