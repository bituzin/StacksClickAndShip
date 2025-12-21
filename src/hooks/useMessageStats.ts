import React from 'react';
import { callReadOnlyFunction, principalCV } from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';
import { POST_MESSAGE_CONTRACT_ADDRESS, POST_MESSAGE_CONTRACT_NAME } from '../constants/contracts';
import { parseValue } from '../utils/blockchain';

export function useMessageStats(userAddress: string | null, isAuthenticated: boolean) {
  const [todayMessages, setTodayMessages] = React.useState<number | null>(null);
  const [totalMessages, setTotalMessages] = React.useState<number | null>(null);
  const [userMessages, setUserMessages] = React.useState<number | null>(null);
  const [recentMessages, setRecentMessages] = React.useState<any[]>([]);

  const fetchMessageCounts = React.useCallback(async () => {
    try {
      const statsRes = await callReadOnlyFunction({
        contractAddress: POST_MESSAGE_CONTRACT_ADDRESS,
        contractName: POST_MESSAGE_CONTRACT_NAME,
        functionName: 'get-stats',
        functionArgs: [],
        network: new StacksMainnet(),
        senderAddress: userAddress || 'SP000000000000000000002Q6VF78',
      });

      const stats = (statsRes as any)?.value?.data;
      let totalMessagesCount = 0;
      
      if (stats) {
        const todayVal = stats['today-messages']?.value;
        const totalVal = stats['total-messages']?.value;
        totalMessagesCount = parseValue(totalVal);
        setTodayMessages(parseValue(todayVal));
        setTotalMessages(totalMessagesCount);
      }

      if (isAuthenticated && userAddress) {
        const userRes = await callReadOnlyFunction({
          contractAddress: POST_MESSAGE_CONTRACT_ADDRESS,
          contractName: POST_MESSAGE_CONTRACT_NAME,
          functionName: 'get-user-message-count',
          functionArgs: [principalCV(userAddress)],
          network: new StacksMainnet(),
          senderAddress: userAddress,
        });
        const userCount = (userRes as any)?.value?.value;
        setUserMessages(parseValue(userCount));
      }

      if (totalMessagesCount > 0) {
        const { uintCV } = await import('@stacks/transactions');
        const count = totalMessagesCount >= 20 ? 20 : totalMessagesCount;
        const messagesRes = await callReadOnlyFunction({
          contractAddress: POST_MESSAGE_CONTRACT_ADDRESS,
          contractName: POST_MESSAGE_CONTRACT_NAME,
          functionName: 'get-last-n-messages',
          functionArgs: [uintCV(count)],
          network: new StacksMainnet(),
          senderAddress: userAddress || 'SP000000000000000000002Q6VF78',
        });
        const messagesList = (messagesRes as any)?.value?.list || [];
        setRecentMessages(messagesList);
      }
    } catch (e) {
      console.error('Error fetching message counts:', e);
    }
  }, [userAddress, isAuthenticated]);

  return {
    todayMessages,
    totalMessages,
    userMessages,
    recentMessages,
    fetchMessageCounts
  };
}
