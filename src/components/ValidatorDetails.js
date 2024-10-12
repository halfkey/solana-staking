import React, { useState, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, LAMPORTS_PER_SOL, StakeProgram, Authorized, Lockup, Keypair } from '@solana/web3.js';

function ValidatorDetails({ validator, onBack }) {
  const [stakeAmount, setStakeAmount] = useState('');
  const [error, setError] = useState(null);
  const [isStaking, setIsStaking] = useState(false);
  const [transactionSignature, setTransactionSignature] = useState(null);
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const handleStakeAmountChange = useCallback((e) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,9}$/.test(value) || value === '') {
      setStakeAmount(value);
      setError(null);
    }
  }, []);

  const handleStake = useCallback(async () => {
    if (!publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      setError('Please enter a valid stake amount');
      return;
    }

    setIsStaking(true);
    setError(null);
    setTransactionSignature(null);

    try {
      const amountToStake = parseFloat(stakeAmount) * LAMPORTS_PER_SOL;
      const stakeAccount = Keypair.generate();
      
      const minimumRent = await connection.getMinimumBalanceForRentExemption(StakeProgram.space);

      const createAccountInstruction = StakeProgram.createAccount({
        fromPubkey: publicKey,
        stakePubkey: stakeAccount.publicKey,
        authorized: new Authorized(publicKey, publicKey),
        lockup: new Lockup(0, 0, publicKey),
        lamports: minimumRent + amountToStake,
      });

      const delegateInstruction = StakeProgram.delegate({
        stakePubkey: stakeAccount.publicKey,
        authorizedPubkey: publicKey,
        votePubkey: new PublicKey(validator.votePubkey),
      });

      const transaction = new Transaction().add(createAccountInstruction, delegateInstruction);
      
      transaction.recentBlockhash = (await connection.getRecentBlockhash('finalized')).blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection, { signers: [stakeAccount] });

      const confirmation = await connection.confirmTransaction(signature, 'confirmed');

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      setTransactionSignature(signature);
      alert(`Successfully staked ${stakeAmount} SOL with validator: ${validator.votePubkey}`);
      setStakeAmount('');
    } catch (error) {
      console.error('Error staking:', error);
      setError(`Error staking: ${error.message}`);
    } finally {
      setIsStaking(false);
    }
  }, [publicKey, stakeAmount, validator, connection, sendTransaction]);

  return (
    <div className="bg-crypto-medium p-6 rounded-lg shadow-lg">
      <button onClick={onBack} className="mb-4 text-primary-500 hover:text-primary-600">← Back to list</button>
      <h2 className="text-2xl font-bold mb-6 text-crypto-text">Validator Details</h2>
      <ValidatorInfo validator={validator} />
      <StakeForm
        stakeAmount={stakeAmount}
        handleStakeAmountChange={handleStakeAmountChange}
        handleStake={handleStake}
        error={error}
        isStaking={isStaking}
        transactionSignature={transactionSignature}
      />
    </div>
  );
}

function ValidatorInfo({ validator }) {
  return (
    <div className="mb-6 text-crypto-text space-y-2">
      <p><span className="font-medium text-crypto-muted">Node Pubkey:</span> {validator.nodePubkey}</p>
      <p><span className="font-medium text-crypto-muted">Vote Pubkey:</span> {validator.votePubkey}</p>
      <p><span className="font-medium text-crypto-muted">Commission:</span> {validator.commission}%</p>
      <p><span className="font-medium text-crypto-muted">Active Stake:</span> {(validator.activatedStake / LAMPORTS_PER_SOL).toFixed(2)} SOL</p>
      <p><span className="font-medium text-crypto-muted">Last Vote:</span> {validator.lastVote}</p>
      <p><span className="font-medium text-crypto-muted">Root Slot:</span> {validator.rootSlot}</p>
    </div>
  );
}

function StakeForm({ stakeAmount, handleStakeAmountChange, handleStake, error, isStaking, transactionSignature }) {
  return (
    <div className="mt-6">
      <label htmlFor="stakeAmount" className="block text-sm font-medium text-crypto-muted">
        Stake Amount (SOL)
      </label>
      <input
        type="text"
        id="stakeAmount"
        value={stakeAmount}
        onChange={handleStakeAmountChange}
        className="mt-1 block w-full rounded-md bg-crypto-light border-crypto-muted text-crypto-text focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
        placeholder="Enter amount to stake"
        disabled={isStaking}
      />
      {error && <p className="mt-2 text-red-500">{error}</p>}
      {transactionSignature && (
        <p className="mt-2 text-primary-500">
          Transaction sent: <a href={`https://explorer.solana.com/tx/${transactionSignature}`} target="_blank" rel="noopener noreferrer" className="underline">View on Solana Explorer</a>
        </p>
      )}
      <button
        onClick={handleStake}
        className={`mt-4 btn ${isStaking ? 'btn-secondary opacity-50 cursor-not-allowed' : 'btn-primary'}`}
        disabled={!stakeAmount || isStaking}
      >
        {isStaking ? 'Staking...' : `Stake ${stakeAmount || '0'} SOL`}
      </button>
    </div>
  );
}

export default ValidatorDetails;