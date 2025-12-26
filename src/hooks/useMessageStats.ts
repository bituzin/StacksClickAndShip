import React from 'react';
import { callReadOnlyFunction, principalCV, cvToString, uintCV } from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';
import { POST_MESSAGE_CONTRACT_ADDRESS, POST_MESSAGE_CONTRACT_NAME } from '../constants/contracts';
import { parseValue } from '../utils/blockchain';

const DEFAULT_SENDER = 'SP000000000000000000002Q6VF78';
const MAX_RECENT_MESSAGES = 20;

type MessageEntry = {
  id: number;
  sender: string;
  content: string;
  block: number;
  timestamp: number;
};

type MessageLeaderboardRow = {
  user: string;
  count: number;
};

const toNumber = (value: any) => parseValue(value?.value ?? value);

const toContentString = (value: any): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value.data) return value.data;
  if (value.value) return value.value;
  return '';
};

const parseMessagesTuple = (tuple: any): MessageEntry[] => {
  if (!tuple) return [];
  const list = tuple.messages?.list || [];
  const startId = toNumber(tuple.start);
  return list
    .map((entry: any, index: number) => {
      if (entry?.type !== 10) return null;
      const data = entry.value?.data || entry.value;
      if (!data) return null;
      const sender = cvToString(data.sender);
      const content = toContentString(data.content);
      const block = toNumber(data.block);
      const timestamp = toNumber(data.timestamp);
      return {
        id: startId + index,
        sender,
        content,
        block,
        timestamp
      };
    })
    .filter(Boolean) as MessageEntry[];
};

const buildLeaderboard = (messages: MessageEntry[]): MessageLeaderboardRow[] => {
  const counts: Record<string, number> = {};
  messages.forEach((msg) => {
    counts[msg.sender] = (counts[msg.sender] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([user, count]) => ({ user, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
};

export function useMessageStats(userAddress: string | null, isAuthenticated: boolean) {
  const [todayMessages, setTodayMessages] = React.useState<number | null>(null);
  const [totalMessages, setTotalMessages] = React.useState<number | null>(null);
  const [userMessages, setUserMessages] = React.useState<number | null>(null);
  const [recentMessages, setRecentMessages] = React.useState<MessageEntry[]>([]);
  const [messageLeaderboard, setMessageLeaderboard] = React.useState<MessageLeaderboardRow[]>([]);

  const senderAddress = userAddress || DEFAULT_SENDER;

  const fetchMessageCounts = React.useCallback(async () => {
    try {
      const statsRes = await callReadOnlyFunction({
        contractAddress: POST_MESSAGE_CONTRACT_ADDRESS,
        contractName: POST_MESSAGE_CONTRACT_NAME,
        functionName: 'get-stats',
        functionArgs: [],
        network: new StacksMainnet(),
        senderAddress
      });

      const stats = (statsRes as any)?.value?.data;
      let totalMessagesCount = 0;

      if (stats) {
        const todayVal = stats['today-messages'];
        const totalVal = stats['total-messages'];
        totalMessagesCount = toNumber(totalVal);
        setTodayMessages(toNumber(todayVal));
        setTotalMessages(totalMessagesCount);
      }

      if (isAuthenticated && userAddress) {
        const userRes = await callReadOnlyFunction({
          contractAddress: POST_MESSAGE_CONTRACT_ADDRESS,
          contractName: POST_MESSAGE_CONTRACT_NAME,
          functionName: 'get-user-message-count',
          functionArgs: [principalCV(userAddress)],
          network: new StacksMainnet(),
          senderAddress: userAddress
        });
        const userCount = toNumber((userRes as any)?.value ?? userRes);
        setUserMessages(userCount);
      } else {
        setUserMessages(null);
      }

      if (totalMessagesCount > 0) {
        const count = Math.min(MAX_RECENT_MESSAGES, totalMessagesCount);
        const messagesRes = await callReadOnlyFunction({
          contractAddress: POST_MESSAGE_CONTRACT_ADDRESS,
          contractName: POST_MESSAGE_CONTRACT_NAME,
          functionName: 'get-latest-messages',
          functionArgs: [uintCV(count)],
          network: new StacksMainnet(),
          senderAddress
        });
        const tuple = (messagesRes as any)?.value?.data;
        const parsed = parseMessagesTuple(tuple);
        setRecentMessages(parsed);
        setMessageLeaderboard(buildLeaderboard(parsed));
      } else {
        setRecentMessages([]);
        setMessageLeaderboard([]);
      }
    } catch (e) {
      console.error('Error fetching message counts:', e);
      setRecentMessages([]);
      setMessageLeaderboard([]);
    }
  }, [isAuthenticated, senderAddress, userAddress]);

  return {
    todayMessages,
    totalMessages,
    userMessages,
    recentMessages,
    messageLeaderboard,
    fetchMessageCounts
  };
}
