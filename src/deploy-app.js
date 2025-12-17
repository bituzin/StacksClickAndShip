// Wait for StacksConnect to load
window.addEventListener('DOMContentLoaded', () => {
    if (!window.StacksConnect) {
        console.error('StacksConnect not loaded!');
        return;
    }

    const { AppConfig, UserSession, showConnect, openContractDeploy } = window.StacksConnect;
    const { StacksTestnet, StacksMainnet } = window.StacksNetwork;

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
                name: 'Stacks Click & Ship',
                icon: window.location.origin + '/icon.png',
            },
            redirectTo: '/',
            onFinish: () => {
                document.getElementById('deployBtn').disabled = false;
                updateStatus('✅ Połączono z Leather Wallet!', 'success');
            },
            onCancel: () => {
                updateStatus('❌ Połączenie anulowane.', 'error');
            },
            userSession,
        });
    });

    // Deploy contract
    document.getElementById('deployBtn').addEventListener('click', async () => {
        const networkSelect = document.getElementById('network');
        const network = networkSelect.value === 'testnet' 
            ? new StacksTestnet() 
            : new StacksMainnet();

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

        updateStatus(`🔄 Przygotowywanie deployu na ${networkSelect.value}...`, 'info');

        openContractDeploy({
            contractName: contractName,
            codeBody: contractCode,
            network: network,
            onFinish: (data) => {
                const explorerUrl = networkSelect.value === 'testnet'
                    ? `https://explorer.hiro.so/txid/${data.txId}?chain=testnet`
                    : `https://explorer.hiro.so/txid/${data.txId}`;
                
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
});
