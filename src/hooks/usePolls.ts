import React from 'react';
import { callReadOnlyFunction } from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';
import { VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_NAME } from '../constants/contracts';
import { Poll } from '../types';
import { fetchCurrentBlock, parseValue } from '../utils/blockchain';

const OPTION_SLOTS = 10;
const DEFAULT_SENDER = 'SP000000000000000000002Q6VF78';

const normalizeOptionString = (value: any): string => {
  if (typeof value === 'string') {
    return value;
  }
  if (value && typeof value === 'object') {
    if ('data' in value) {
      return normalizeOptionString(value.data);
    }
    if ('value' in value) {
      return normalizeOptionString(value.value);
    }
  }
  return '';
};

const normalizeOptionNumber = (value: any): number => {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'bigint') {
    return Number(value);
  }
  if (typeof value === 'string') {
    const cleaned = Number(value.replace(/n$/, ''));
    return Number.isNaN(cleaned) ? 0 : cleaned;
  }
  if (value && typeof value === 'object') {
    if ('value' in value) {
      return normalizeOptionNumber(value.value);
    }
    if ('data' in value) {
      return normalizeOptionNumber(value.data);
    }
  }
  return 0;
};

const parseOptionsFromClarity = (optionsCv: any) => {
  const parsed: Array<{ text: string; votes: number; index: number }> = [];
  const tuple = optionsCv?.data || optionsCv?.value?.data;
  if (!tuple) {
    return parsed;
  }
  for (let i = 0; i < OPTION_SLOTS; i++) {
    const optionCv = tuple[`option-${i}`];
    if (!optionCv || !optionCv.value?.data) {
      continue;
    }
    const optionData = optionCv.value.data;
    const text = normalizeOptionString(optionData.text);
    if (!text) {
      continue;
    }
    const votes = normalizeOptionNumber(optionData.votes);
    parsed.push({ text, votes, index: i });
  }
  return parsed;
};

export function usePolls(userAddress: string | null) {
  const [activePolls, setActivePolls] = React.useState<Poll[]>([]);
  const [closedPolls, setClosedPolls] = React.useState<Poll[]>([]);
  const [isLoadingPolls, setIsLoadingPolls] = React.useState(false);

  const fetchPolls = React.useCallback(async () => {
    const senderAddress = userAddress || DEFAULT_SENDER;
    
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
        senderAddress,
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
            senderAddress,
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
        // Loguj pole options jeśli istnieje
        if (pollData && pollData.options) {
          console.log('🟢 pollData.options:', pollData.options);
        }
        if (pollData) {
          const parsedOptions = parseOptionsFromClarity(pollData.options);
          pollData.parsedOptions = parsedOptions;
          pollData.optionsList = parsedOptions;

          const endBlockHeight = pollData['ends-at'] ? parseValue(pollData['ends-at'].value) : 0;
          const isActiveCalculated = currentBlock < endBlockHeight;
          const blocksRemainingCalculated = Math.max(0, endBlockHeight - currentBlock);
          pollData['blocks-remaining'] = { value: blocksRemainingCalculated };
          pollData['is-active-calculated'] = { value: isActiveCalculated };
          if (isActiveCalculated) {
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
