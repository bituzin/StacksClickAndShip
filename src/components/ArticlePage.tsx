import { useParams, Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const articles = {
  'what-is-stacks': {
    title: 'What is Stacks?',
    level: 'Beginner',
    content: `# What is Stacks?

Stacks is a Layer 2 blockchain built on Bitcoin. Its core mission is to bring smart contracts and decentralized applications (dApps) to Bitcoin without requiring changes to the Bitcoin base layer itself.

## Key Features & How It Works

🔗 **Built on Bitcoin**  
Stacks is anchored to Bitcoin. All major transactions are settled on the Bitcoin blockchain, inheriting its unparalleled security and finality.

🔄 **Proof of Transfer (PoX)**  
This unique consensus mechanism uses existing Bitcoin to secure the network. Participants ("miners") commit BTC to process transactions and mint new STX tokens, while others can "stack" STX to earn Bitcoin rewards.

📜 **Clarity Smart Contracts**  
Developers write contracts in Clarity, a secure and predictable programming language. Clarity's code is transparent and avoids hidden pitfalls, making DeFi and dApps on Bitcoin safer.

⚡ **Stacks Token (STX)**  
The native cryptocurrency of the network. It's used for transaction fees, deploying smart contracts, and participating in the PoX consensus.

## Why It Matters

Stacks unlocks Bitcoin's potential beyond just a store of value. It enables a new wave of innovation on the most secure blockchain, including:

- 🏦 Bitcoin DeFi (lending, borrowing, trading)
- 🎨 NFTs secured by Bitcoin
- 🌐 Decentralized social apps & more

**In short:** Stacks acts as the smart contract layer for Bitcoin, transforming it into a full-fledged, programmable ecosystem.`
  },
  'pox': {
    title: 'Proof of Transfer (PoX): Ecological Bitcoin Consensus',
    level: 'Intermediate',
    content: `# Proof of Transfer (PoX): Ecological Bitcoin Consensus

Imagine you could use existing Bitcoins to secure an entirely new blockchain network. That’s exactly what **Proof of Transfer (PoX)** does—an innovative mechanism that, instead of wasting energy, leverages value already secured in the Bitcoin network.

## ⚡ What is Proof of Transfer?

**Proof of Transfer (PoX)** is a consensus mechanism that uses an **existing blockchain (Bitcoin)** to secure a **new network (Stacks)**. It’s like building a new, secure building on the foundation of an old, indestructible fortress.

## 🔄 How Does It Work? A Simple Analogy

Imagine Bitcoin as **old gold coins** with huge value and security. Instead of melting them down to make new ones (Proof of Work), PoX says:

1.  **You transfer** some old gold coins to a special box.
2.  In return, you get the right to **mint (mine)** new silver coins in a brand new kingdom (Stacks).
3.  Your old gold isn’t destroyed—it moves on to others who help secure the new network.

## 🏗️ Main System Components

### **Miners**
They send Bitcoin in special transactions. Whoever commits more BTC has a higher chance to mine a new Stacks block and receive a reward in new tokens (STX).

### **Stackers**
These are people who **lock** their STX tokens in the network. In return, they receive **Bitcoin** sent by miners! It’s passive BTC income for helping secure the network.

## ✅ Key Advantages of PoX

**Ecological**
It doesn’t consume huge amounts of electricity like Proof of Work. It uses energy already spent to secure Bitcoin.

**Secure**
It inherits security from Bitcoin. To attack the Stacks network, you’d first have to attack Bitcoin—which is practically impossible.

**Supports Bitcoin**
Creates steady, cyclical demand for Bitcoin, since miners must keep buying it to participate.

**Rewarding**
Creates a unique economy where users (Stackers) are rewarded with **real Bitcoin** for participating in the network.

## 🔗 PoX vs Other Mechanisms

**Proof of Work (Bitcoin):** “Burn energy to prove commitment.”
**Proof of Stake (Ethereum 2.0, Cardano):** “Lock your own tokens to prove commitment.”
**Proof of Transfer (Stacks):** “Transfer value from an older, more secure network (BTC) to prove commitment to a new one.”

## 🎯 Summary: Why Does It Matter?

Proof of Transfer is a brilliant solution that:
1.  **Unlocks Bitcoin’s potential** from being just “digital gold” and lets it become the foundation for apps (DeFi, NFT).
2.  **Creates synergy**—the new network (Stacks) gains security, and Bitcoin gains extra utility and demand.
3.  **Is sustainable**—it doesn’t repeat the energy consumption problems, using what already exists.

**In short:** Proof of Transfer is an economic bridge between the indestructible world of Bitcoin and the innovative world of smart contracts and apps. It’s value recycling instead of energy recycling.`
  },
  'bitcoin-layer2': {
    title: 'Bitcoin Layer 2 Explained',
    level: 'Intermediate',
    content: `# Bitcoin Layer 2 Explained

## What is Bitcoin Layer 2 (L2)?

A Layer 2 is an additional protocol or blockchain built on top of Bitcoin's base layer (Layer 1). Its goal is to expand Bitcoin's capabilities without sacrificing its security and decentralization.

## Why do we need Layer 2 solutions?

🔋 **Bitcoin L1 Limitations:**

- Low throughput (~7 transactions per second)
- High fees during network congestion
- Limited programmability

🛠️ **The L2 Solution:**

Instead of changing Bitcoin itself, Layer 2 moves transactions off the main chain and only records the final result on Bitcoin. It's like doing calculations on a notepad and writing only the answer in the official ledger.

## Types of Layer 2 solutions

🔄 **State Channels (e.g., Lightning Network)**  
Private payment channels, instant and cheap micropayments, only channel open/close hits the main chain.

🏗️ **Sidechains (e.g., Stacks, Rootstock)**  
Independent blockchains with their own rules, two-way BTC transfer, support for smart contracts and dApps.

📜 **Client-Side Validation / Rollups (e.g., BitVM)**  
Off-chain transactions, data compression and publication to Bitcoin, security via fraud/validity proofs (still in research phase).

## Why are Bitcoin L2s important?

🚀 **Scalability**  
Faster and cheaper transactions.

🔐 **Security inheritance**  
They use Bitcoin's security and decentralization as a foundation.

💡 **Innovation**  
Enable DeFi, NFTs, and fast payments on Bitcoin without risking the main chain.

## The trade-off: security vs. scalability

Every L2 introduces new trust assumptions or technical complexity to achieve scalability. The best solutions minimize these trade-offs and maximize their connection to Bitcoin.

**Summary:** Layer 2 solutions turn Bitcoin from "digital gold" into a dynamic financial and application ecosystem, allowing it to scale globally while keeping its base layer rock-solid.`
  },
  'stacking': {
    title: 'Stacking - Earn Bitcoin: Passive Income in the Stacks Network',
    level: 'Beginner',
    content: `# Stacking - Earn Bitcoin: Passive Income in the Stacks Network 🥞💰

Imagine earning **real Bitcoin** just by holding your tokens in your wallet. This isn’t a magic investment, but a real mechanism in the Stacks network called **Stacking**.

## ⚡ What is Stacking?

**Stacking** is the process of locking your **STX** tokens in the Stacks network to help secure it. In return, you receive rewards in **Bitcoin (BTC)**. It’s like a crypto savings account where the interest is paid in BTC.

## 🔄 How Does It Work? A Simple Analogy

Imagine the Stacks network as a new cooperative:
1.  **You (the Stacker)** deposit your contribution (STX tokens) into a shared pool.
2.  **The network** uses your contribution to confirm transactions and maintain security.
3.  **Miners** pay for the privilege of mining new blocks—they pay in **Bitcoin**.
4.  **You** receive a portion of that Bitcoin as a dividend for your contribution.

## 🏗️ How to Start Stacking?

### **1. Own Enough STX**
The network has a minimum threshold that changes over time (usually from a few hundred to a few thousand STX). You can also join a **stacking pool** with a smaller amount.

### **2. Choose a Method**
*   **Solo Stacking** – via Hiro Wallet or Stacks Web Wallet
*   **Stacking Pool** – like Joinpool, Friedger Pool, Planbetter
*   **Centralized Services (CEX)** – some exchanges offer automatic stacking

### **3. Lock Tokens for a Period**
Each stacking round lasts about **2 weeks** (about 210 Bitcoin blocks). After the round, you can withdraw your STX or continue stacking.

## ✅ What Do You Need to Stack?

*   **STX tokens** (enough for the threshold or to join a pool)
*   **Active Stacks account** (address starting with 'SP' or 'ST')
*   **A small amount of STX for transaction fees**
*   **A wallet that supports Stacking** (Hiro Wallet, Xverse)

## 🎯 Key Benefits of Stacking

**Passive Income in BTC**
You earn real Bitcoin without trading or active investing.

**Supporting the Network**
Your tokens help secure the Stacks network, making it more decentralized.

**Predictability**
Rewards are relatively predictable and depend on:
*   The amount of STX you lock
*   The total value locked in the network
*   The current reward rate

## ⚠️ Important Things to Consider

**Price Fluctuation Risk**
The value of your STX may rise or fall during the lock period.

**Lock Periods**
Tokens are locked for the entire round (~2 weeks). You can’t sell them during this time.

**Fees**
Stacking pools charge a commission (usually 5-10%). Solo stacking has transaction fees.

**Minimum Threshold**
Solo stacking often requires several thousand STX. Pools have lower thresholds.

## 💡 Stacking vs. Staking – The Key Difference

**Staking (e.g., Ethereum, Cardano)**
You secure the network with its own tokens. Rewards are in **the same token**.

**Stacking (Stacks)**
You secure the network with STX tokens. Rewards are in **Bitcoin**. That’s a fundamental difference!

## 🚀 Summary: Is It Worth It?

Stacking is ideal for people who:
*   Believe in the long-term potential of the Stacks ecosystem
*   Want to passively earn Bitcoin without active trading
*   Don’t need immediate access to their STX
*   Understand the risks of locking funds

**In short:** Stacking is the most direct way to make your Stacks wallet work for you, paying you in the most valuable digital currency—Bitcoin. It’s like having a BTC printing machine powered by your belief in the future of smart contracts on Bitcoin.`
  },
  'clarity-vs-solidity': {
    title: 'Clarity vs Solidity: Key Differences',
    level: 'All',
    content: `# Clarity vs Solidity: Key Differences

  Imagine a **smart contract** as a digital agreement, and programming languages as different ways to write it.

  ## 📝 **Solidity – Like Writing with a Fast Pen**

  **Where does it work?** Mainly on Ethereum and similar blockchains.

  **How does it work?** It's a **Turing-complete language** – you can write almost anything, but sometimes unexpected bugs appear **only during execution**.

  **For whom?** For developers who want to quickly build various apps in the largest Web3 ecosystem.

  ## 🔐 **Clarity – Like Writing with a Pen Cap On**

  **Where does it work?** Only on Stacks (Bitcoin layer).

  **How does it work?** It's a **purposefully limited language** – every contract can be **fully checked before publishing**. Bugs are caught **before** anything runs.

  **For whom?** For those who value maximum security over full freedom, especially for financial apps on Bitcoin.

  ## 🎯 **Coding Style**

  **Solidity** is like JavaScript – very flexible and free-form.

  **Clarity** is like a checklist – organized and structured.

  ## 🛡️ **Security**

  **Solidity** checks security during program execution.

  **Clarity** checks security before the contract is published.

  ## 🏗️ **Work Environment**

  **Solidity** runs on Ethereum and over 50 similar blockchains.

  **Clarity** runs only on Bitcoin via the Stacks network.

  ## 💪 **Superpower**

  **Solidity** lets you do almost anything you can imagine.

  **Clarity** has built-in, direct connection to the Bitcoin blockchain.

  ## 💡 **The Most Important Difference**

  **Solidity** gives you full freedom, but with the risk that a bug will only show up when the contract is running.

  **Clarity** intentionally limits possibilities so every contract can be thoroughly checked **before** it goes live.

  ## 🤔 **Which to Choose?**

  **Solidity** if you want to build fast and use the largest set of tools and developers.

  **Clarity** if security is your top priority and you want to build apps directly on Bitcoin.

  **In short:** Solidity is a wide highway, Clarity is a safe, narrow road with lots of safeguards.`
  },
  'build-dapp': {
    title: 'Build Your First dApp',
    level: 'Beginner',
    content: `# Build Your First dApp on Stacks: Start Your Bitcoin Smart Contract Adventure \n\nImagine building an app powered by Bitcoin’s security. That’s exactly what you can do with **Stacks**—creating dApps whose backend lives on a blockchain secured by Bitcoin.\n\n## ⚡ What is a dApp on Stacks?\n\nIt’s an application whose **business logic** is written in a smart contract on the Stacks blockchain, and thanks to the **Proof of Transfer** mechanism, it’s secured by Bitcoin. The frontend is a regular website that communicates with this contract.\n\n## 🧱 Your Stacks Tech Stack\n\n### **1. Smart Contract in Clarity**\nYour “indestructible backend.” You write it in **Clarity**, a readable and secure language.\n\n### **2. Frontend in HTML/JS**\nAny website you like. Host it anywhere—GitHub Pages, Netlify, or even locally.\n\n### **3. Stacks.js – The Bridge to the Blockchain**\nA JavaScript library that lets your site:\n* Connect to the user’s wallet (Hiro, Xverse)\n* Send transactions to your contract\n* Read data from the blockchain\n\n### **4. Wallets**\n**Leather Wallet / Xverse** – wallets your users will interact with.\n\n## 🛠️ Your Starter Tools\n\n**Clarinet** – your best friend for Stacks development. It allows you to:\n* Write and test contracts locally\n* Emulate the Stacks network on your computer\n* Run automated tests for your contracts\n\n**Hiro Explorer** – your portal to the network. Browse contracts, transactions, and addresses on both testnet and mainnet.\n`
  }
};

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? articles[slug as keyof typeof articles] : undefined;

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 via-purple-900 to-pink-900">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-md mx-auto text-center bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-purple-500/30">
            <h2 className="text-3xl font-bold text-white mb-4">Article not found</h2>
            <p className="text-purple-200 mb-6">The article you're looking for doesn't exist.</p>
            <Link 
              to="/learn" 
              className="inline-block bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white py-3 px-8 rounded-full transition-all"
            >
              &larr; Back to Learn
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-purple-900 to-pink-900">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-md mx-auto">
          <Link 
            to="/learn" 
            className="inline-flex items-center text-purple-300 hover:text-purple-100 mb-6 transition-colors"
          >
            &larr; Back to Learn
          </Link>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{article.title}</h1>
              </div>
              <BookOpen className="text-purple-400" size={48} />
            </div>
            
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
            </div>

            <div className="mt-8 pt-6 border-t border-purple-500/30">
              <Link 
                to="/learn" 
                className="inline-block bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white py-3 px-8 rounded-full transition-all shadow-lg hover:shadow-xl"
              >
                &larr; Back to Learn
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
