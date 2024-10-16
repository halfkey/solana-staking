import React, { useState, useMemo } from 'react';
import { WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import ValidatorList from './components/ValidatorList';
import ValidatorDetails from './components/ValidatorDetails';
import SearchBar from './components/SearchBar';

import '@solana/wallet-adapter-react-ui/styles.css';

function App() {
  const [validators, setValidators] = useState([]);
  const [selectedValidator, setSelectedValidator] = useState(null);
  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], []);

  const handleSelectValidator = (validator) => {
    try {
      setSelectedValidator(validator);
    } catch (error) {
      console.error('Error selecting validator:', error);
      // You could set an error state here and display it to the user
    }
  };

  return (
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
        <div className="min-h-screen bg-crypto-dark">
          <header className="bg-crypto-medium shadow">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
              <h1 className="text-3xl font-bold text-crypto-text">Solana Staking App</h1>
              <div className="flex items-center space-x-4">
                <SearchBar validators={validators} onSelectValidator={handleSelectValidator} />
                <WalletMultiButton className="custom-wallet-button" />
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {selectedValidator ? (
              <ValidatorDetails 
                validator={selectedValidator} 
                onBack={() => setSelectedValidator(null)} 
              />
            ) : (
              <ValidatorList 
                setValidators={setValidators} 
                onSelectValidator={handleSelectValidator} 
              />
            )}
          </main>
        </div>
      </WalletModalProvider>
    </WalletProvider>
  );
}

export default App;
