import React from 'react';
import { openContractCall } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';

interface VoteProps {
  fetchPolls: () => void;
  setTxPopup: (popup: { show: boolean; txId: string }) => void;
}

const VOTING_CONTRACT_ADDRESS = 'SP2Z3M34KEKC79TMRMZB24YG30FE25JPN83TPZSZ2';
const VOTING_CONTRACT_NAME = 'votingv1';

export default function VoteCard({ fetchPolls, setTxPopup }: VoteProps) {
  const [showCreateVoteModal, setShowCreateVoteModal] = React.useState(false);
  const [voteTitle, setVoteTitle] = React.useState('');
  const [voteDescription, setVoteDescription] = React.useState('');
  const [voteOptions, setVoteOptions] = React.useState(['', '']);
  const [voteDuration, setVoteDuration] = React.useState(100);
  const [votesPerUser, setVotesPerUser] = React.useState(1);
  const [requiresSTX, setRequiresSTX] = React.useState(false);
  const [minSTXAmount, setMinSTXAmount] = React.useState(0);

  const addVoteOption = () => {
    if (voteOptions.length < 10) {
      setVoteOptions([...voteOptions, '']);
    }
  };

  const removeVoteOption = (index: number) => {
    if (voteOptions.length > 2) {
      const newOptions = voteOptions.filter((_, i) => i !== index);
      setVoteOptions(newOptions);
    }
  };

  const updateVoteOption = (index: number, value: string) => {
    const newOptions = [...voteOptions];
    newOptions[index] = value;
    setVoteOptions(newOptions);
  };

  const resetVoteForm = () => {
    setVoteTitle('');
    setVoteDescription('');
    setVoteOptions(['', '']);
    setVoteDuration(100);
    setVotesPerUser(1);
    setRequiresSTX(false);
    setMinSTXAmount(0);
    setShowCreateVoteModal(false);
  };

  const handleCreateVote = async () => {
    if (!voteTitle.trim()) {
      alert('Podaj tytuł głosowania');
      return;
    }
    const filledOptions = voteOptions.filter(opt => opt.trim() !== '');
    if (filledOptions.length < 2) {
      alert('Podaj co najmniej 2 opcje');
      return;
    }
    try {
      const { stringUtf8CV, uintCV, someCV, noneCV, boolCV } = await import('@stacks/transactions');
      const optionArgs = [
        stringUtf8CV(filledOptions[0] || ''),
        ...Array.from({length: 9}, (_, i) =>
          filledOptions[i+1] ? someCV(stringUtf8CV(filledOptions[i+1])) : noneCV()
        )
      ];
      const durationInBlocks = Math.ceil(voteDuration / 10);
      if (durationInBlocks < 10) {
        alert(`Duration too short! Minimum is 10 blocks (100 minutes). You have ${durationInBlocks} blocks.`);
        return;
      }
      const functionArgs = [
        stringUtf8CV(voteTitle),
        stringUtf8CV(voteDescription),
        ...optionArgs,
        uintCV(durationInBlocks),
        uintCV(votesPerUser),
        boolCV(requiresSTX),
        uintCV(minSTXAmount * 1000000)
      ];
      await openContractCall({
        contractAddress: VOTING_CONTRACT_ADDRESS,
        contractName: VOTING_CONTRACT_NAME,
        functionName: 'create-poll',
        functionArgs,
        network: new StacksMainnet(),
        onFinish: (data) => {
          setTxPopup({ show: true, txId: data.txId });
          resetVoteForm();
          setTimeout(() => fetchPolls(), 5000);
        },
        onCancel: () => {},
      });
    } catch (e) {
      alert('Błąd przy tworzeniu głosowania: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  return (
    <div className="bg-orange-900/40 rounded-xl p-6 border border-orange-500/20 hover:border-orange-400/50 transition-all cursor-pointer">
      <h3 className="text-xl text-white mb-2">Vote</h3>
      <p className="text-orange-300 mb-4">Create and participate in on-chain polls</p>
      <button onClick={() => setShowCreateVoteModal(true)} className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold py-2 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl">Create Poll</button>
      {showCreateVoteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full">
            <h2 className="text-2xl mb-4">Create Poll</h2>
            <input value={voteTitle} onChange={e => setVoteTitle(e.target.value)} placeholder="Title" className="w-full mb-2 p-2 border rounded" />
            <textarea value={voteDescription} onChange={e => setVoteDescription(e.target.value)} placeholder="Description" className="w-full mb-2 p-2 border rounded" />
            {voteOptions.map((opt, i) => (
              <div key={i} className="flex mb-2">
                <input value={opt} onChange={e => updateVoteOption(i, e.target.value)} placeholder={`Option ${i+1}`} className="flex-1 p-2 border rounded" />
                {voteOptions.length > 2 && <button onClick={() => removeVoteOption(i)} className="ml-2 text-red-500">X</button>}
              </div>
            ))}
            <button onClick={addVoteOption} className="mb-2 text-blue-500">+ Add Option</button>
            <input type="number" value={voteDuration} onChange={e => setVoteDuration(Number(e.target.value))} placeholder="Duration (minutes)" className="w-full mb-2 p-2 border rounded" />
            <input type="number" value={votesPerUser} onChange={e => setVotesPerUser(Number(e.target.value))} placeholder="Votes per user" className="w-full mb-2 p-2 border rounded" />
            <label className="flex items-center mb-2">
              <input type="checkbox" checked={requiresSTX} onChange={e => setRequiresSTX(e.target.checked)} className="mr-2" />Requires STX
            </label>
            {requiresSTX && <input type="number" value={minSTXAmount} onChange={e => setMinSTXAmount(Number(e.target.value))} placeholder="Min STX" className="w-full mb-2 p-2 border rounded" />}
            <div className="flex gap-2 mt-4">
              <button onClick={handleCreateVote} className="bg-orange-600 text-white px-4 py-2 rounded">Create</button>
              <button onClick={resetVoteForm} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
