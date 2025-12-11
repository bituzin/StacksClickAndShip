import { AppConfig, UserSession, showConnect, openContractDeploy } from '@stacks/connect';
import { StacksTestnet, StacksMainnet } from '@stacks/network';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

// Status updates
function updateStatus(message, type = 'info') {
    const statusEl = document.getElementById('status');
    statusEl.innerHTML = message;
    statusEl.className = `status ${type}`;
    statusEl.style.display = 'block';
}

// Check if already signed in
if (userSession.isUserSignedIn()) {
    document.getElementById('deployBtn').disabled = false;
    updateStatus('✅ Już połączono z Leather Wallet!', 'success');
}

// Connect wallet
document.getElementById('connectBtn').addEventListener('click', () => {
    updateStatus('🔄 Otwieranie Leather Wallet...', 'info');
    
    showConnect({
        appDetails: {
            name: 'Stacks Click & Ship - Deploy',
            icon: window.location.origin + '/vite.svg',
        },
        redirectTo: '/',
        onFinish: () => {
            document.getElementById('deployBtn').disabled = false;
            updateStatus('✅ Połączono z Leather Wallet!', 'success');
            window.location.reload();
        },
        onCancel: () => {
            updateStatus('❌ Połączenie anulowane.', 'error');
        },
        userSession,
    });
});

// Deploy contract
document.getElementById('deployBtn').addEventListener('click', async () => {
    const network = new StacksMainnet();

    const contractCode = document.getElementById('contractCode').value.trim();
    const contractName = document.getElementById('contractName').value.trim();

    if (!contractCode) {
        updateStatus('❌ Wklej kod kontraktu!', 'error');
        return;
    }

    if (!contractName) {
        updateStatus('❌ Podaj nazwę kontraktu!', 'error');
        return;
    }

    updateStatus(`🔄 Przygotowywanie deployu na mainnet...`, 'info');

    openContractDeploy({
        contractName: contractName,
        codeBody: contractCode,
        network: network,
        onFinish: (data) => {
            const explorerUrl = `https://explorer.hiro.so/txid/${data.txId}`;
            
            updateStatus(
                `✅ <strong>Deploy wysłany!</strong><br><br>` +
                `<strong>TX ID:</strong> ${data.txId}<br>` +
                `<strong>Link:</strong> <a href="${explorerUrl}" target="_blank" style="color:#ff7b00">${explorerUrl}</a><br><br>` +
                `📝 Kontrakt: <strong>${data.stacksAddress}.${contractName}</strong>`,
                'success'
            );
        },
        onCancel: () => {
            updateStatus('❌ Deploy anulowany.', 'error');
        },
    });
});
