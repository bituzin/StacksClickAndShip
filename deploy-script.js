import { makeContractDeploy, broadcastTransaction, AnchorMode, StacksMainnet } from '@stacks/transactions';
import { readFileSync } from 'fs';

const network = new StacksMainnet();
const privateKey = '1527b2d36237f28183145cce838dde150f924663afdabe68720790c52676e0aa01';
const contractName = 'gm';
const codeBody = readFileSync('./contracts/gm.clar', 'utf8');

async function deployContract() {
  console.log('📝 Przygotowywanie transakcji deploy...');
  
  const txOptions = {
    contractName,
    codeBody,
    senderKey: privateKey,
    network,
    anchorMode: AnchorMode.Any,
    fee: 10000,
  };

  const transaction = await makeContractDeploy(txOptions);
  
  console.log('📡 Wysyłanie transakcji...');
  const broadcastResponse = await broadcastTransaction(transaction, network);
  
  if (broadcastResponse.error) {
    console.error('❌ Błąd:', broadcastResponse.error);
    console.error('Reason:', broadcastResponse.reason);
  } else {
    console.log('✅ Sukces!');
    console.log('Transaction ID:', broadcastResponse.txid);
    console.log('🔗 Link:', `https://explorer.hiro.so/txid/${broadcastResponse.txid}`);
  }
}

deployContract().catch(console.error);
