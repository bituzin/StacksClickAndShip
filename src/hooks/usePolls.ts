import React from 'react';
import { callReadOnlyFunction } from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';
import { VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_NAME } from '../constants/contracts';
import { Poll } from '../types';
import { fetchCurrentBlock, parseValue } from '../utils/blockchain';

export function usePolls(userAddress: string | null) {
  const [activePolls, setActivePolls] = React.useState<Poll[]>([]);
  const [closedPolls, setClosedPolls] = React.useState<Poll[]>([]);
  const [isLoadingPolls, setIsLoadingPolls] = React.useState(false);

  const fetchPolls = React.useCallback(async () => {
    if (!userAddress) return;
    
    try {
      setIsLoadingPolls(true);
      console.log('🔍 Rozpoczynam pobieranie głosowań...');
      const { uintCV } = await import('@stacks/transactions');
      
      const currentBlock = await fetchCurrentBlock();
      console.log('📍 Current block height:', currentBlock);
      
      const statsRes = await callReadOnlyFunction({
        contractAddress: VOTING_CONTRACT_ADDRESS,
        contractName: VOTING_CONTRACT_NAME,
        functionName: 'get-global-stats',
        functionArgs: [],
        network: new StacksMainnet(),
        senderAddress: userAddress,
      });
      
      const stats = (statsRes as any).value?.data;
      const totalPolls = stats?.['total-polls'] ? parseValue(stats['total-polls'].value) : 0;
      
      console.log('✅ Total polls:', totalPolls);
      
      if (totalPolls === 0) {
        console.log('⚠️ Brak głosowań w kontrakcie');
        setActivePolls([]);
        setClosedPolls([]);
        return;
      }
      
      console.log(`🔄 Pobieranie ${totalPolls} głosowań...`);
      const pollPromises = [];
      for (let i = 1; i <= totalPolls; i++) {
        pollPromises.push(
          callReadOnlyFunction({
            contractAddress: VOTING_CONTRACT_ADDRESS,
            contractName: VOTING_CONTRACT_NAME,
            functionName: 'get-poll-full-details',
            functionArgs: [uintCV(i)],
            network: new StacksMainnet(),
            senderAddress: userAddress,
          }).catch(err => {
            console.error(`❌ Błąd pobierania głosowania #${i}:`, err);
            return null;
          })
        );
      }
      
      const pollResults = await Promise.all(pollPromises);
      const active: Poll[] = [];
      const closed: Poll[] = [];
      
      for (let i = 0; i < pollResults.length; i++) {
        const res = pollResults[i];
        if (!res) continue;
        
        const pollData = (res as any).value?.data;
        
        if (pollData) {
          const endBlockHeight = pollData['ends-at'] ? parseValue(pollData['ends-at'].value) : 0;
          const isActiveFromContract = pollData['is-active']?.value || false;
          const blocksRemainingCalculated = Math.max(0, endBlockHeight - currentBlock);
          
          pollData['blocks-remaining'] = { value: blocksRemainingCalculated };
          pollData['is-active-calculated'] = { value: isActiveFromContract };
          
          if (isActiveFromContract) {
            active.push(pollData);
          } else {
            closed.push(pollData);
          }
        }
      }
      
      console.log(`✅ Znaleziono ${active.length} aktywnych i ${closed.length} zakończonych głosowań`);
      setActivePolls(active);
      setClosedPolls(closed);
    } catch (e) {
      console.error('❌ Błąd pobierania głosowań:', e);
    } finally {
      setIsLoadingPolls(false);
    }
  }, [userAddress]);

  return { activePolls, closedPolls, isLoadingPolls, fetchPolls };
}
