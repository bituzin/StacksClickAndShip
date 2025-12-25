import React from 'react';
import { callReadOnlyFunction } from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';
import { VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_NAME } from '../constants/contracts';
import { parseValue } from '../utils/blockchain';

export function useUserVotingStats(userAddress: string | null) {
  const [userPollsCreated, setUserPollsCreated] = React.useState<number>(0);
  const [userPollsVoted, setUserPollsVoted] = React.useState<number>(0);
  const [userTotalVotesCast, setUserTotalVotesCast] = React.useState<number>(0);

  const fetchUserVotingStats = React.useCallback(async () => {
    if (!userAddress) {
      setUserPollsCreated(0);
      setUserPollsVoted(0);
      setUserTotalVotesCast(0);
      return;
    }
    
    try {
      console.log('📊 Pobieranie statystyk głosowań użytkownika:', userAddress);
      
      const { principalCV } = await import('@stacks/transactions');
      
      const res = await callReadOnlyFunction({
        contractAddress: VOTING_CONTRACT_ADDRESS,
        contractName: VOTING_CONTRACT_NAME,
        functionName: 'get-user-stats',
        functionArgs: [principalCV(userAddress)],
        network: new StacksMainnet(),
        senderAddress: userAddress,
      });
      
      console.log('📊 Raw user stats response:', res);
      const stats = (res as any)?.value?.data;
      console.log('📊 Parsed stats:', stats);
      
      if (stats) {
        const created = parseValue(stats['polls-created']?.value);
        const voted = parseValue(stats['polls-voted']?.value);
        const votesCast = parseValue(stats['total-votes-cast']?.value);
        
        console.log('✅ User stats - Created:', created, 'Polls voted:', voted, 'Total votes cast:', votesCast);
        
        setUserPollsCreated(created);
        setUserPollsVoted(voted);
        setUserTotalVotesCast(votesCast);
      } else {
        console.log('⚠️ Brak statystyk użytkownika');
        setUserPollsCreated(0);
        setUserPollsVoted(0);
        setUserTotalVotesCast(0);
      }
    } catch (e) {
      console.error('❌ Błąd pobierania statystyk głosowań użytkownika:', e);
      setUserPollsCreated(0);
      setUserPollsVoted(0);
      setUserTotalVotesCast(0);
    }
  }, [userAddress]);

  return { userPollsCreated, userPollsVoted, userTotalVotesCast, fetchUserVotingStats };
}
