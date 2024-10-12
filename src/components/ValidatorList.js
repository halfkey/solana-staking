import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import ValidatorDetails from './ValidatorDetails';
import { VALIDATORS_PER_PAGE, TOTAL_VALIDATORS } from '../config';

function ValidatorList() {
  const [validators, setValidators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedValidator, setSelectedValidator] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { connection } = useConnection();
  const [sortBy, setSortBy] = useState('stake'); // 'stake', 'commission'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'

  const fetchValidators = useCallback(async () => {
    try {
      const voteAccounts = await connection.getVoteAccounts();
      if (!voteAccounts || (!voteAccounts.current && !voteAccounts.delinquent)) {
        throw new Error('Invalid response from getVoteAccounts');
      }
      
      const allValidators = [...(voteAccounts.current || []), ...(voteAccounts.delinquent || [])];
      setValidators(allValidators);
    } catch (err) {
      console.error('Error fetching validators:', err);
      setError(`Failed to fetch validators: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [connection]);

  useEffect(() => {
    fetchValidators();
  }, [fetchValidators]);

  const sortedValidators = useMemo(() => {
    return [...validators].sort((a, b) => {
      if (sortBy === 'stake') {
        return sortOrder === 'desc' ? b.activatedStake - a.activatedStake : a.activatedStake - b.activatedStake;
      } else if (sortBy === 'commission') {
        return sortOrder === 'desc' ? b.commission - a.commission : a.commission - b.commission;
      }
      return 0;
    }).slice(0, TOTAL_VALIDATORS);
  }, [validators, sortBy, sortOrder]);

  const currentValidators = useMemo(() => {
    const startIndex = (currentPage - 1) * VALIDATORS_PER_PAGE;
    return sortedValidators.slice(startIndex, startIndex + VALIDATORS_PER_PAGE);
  }, [sortedValidators, currentPage]);

  const formatPubkey = (pubkey) => {
    return `${pubkey.slice(0, 4)}...${pubkey.slice(-4)}`;
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  if (loading) return <div className="text-center text-crypto-text">Loading validators...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (selectedValidator) return <ValidatorDetails validator={selectedValidator} onBack={() => setSelectedValidator(null)} />;

  return (
    <div className="bg-crypto-medium p-6 rounded-lg shadow-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-crypto-light">
          <thead>
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-crypto-muted uppercase tracking-wider">Rank</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-crypto-muted uppercase tracking-wider">Validator</th>
              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-medium text-crypto-muted uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('stake')}
              >
                Total Stake (SOL) {sortBy === 'stake' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-medium text-crypto-muted uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('commission')}
              >
                Commission {sortBy === 'commission' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-crypto-muted uppercase tracking-wider">Last Vote</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-crypto-light">
            {currentValidators.map((validator, index) => (
              <tr 
                key={validator.votePubkey}
                className="cursor-pointer hover:bg-crypto-light transition-colors duration-150"
                onClick={() => setSelectedValidator(validator)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-crypto-text">{(currentPage - 1) * VALIDATORS_PER_PAGE + index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-crypto-text">{formatPubkey(validator.votePubkey)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-crypto-text">{(validator.activatedStake / LAMPORTS_PER_SOL).toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-crypto-text">{validator.commission}%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-crypto-text">{validator.lastVote}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={currentPage} setCurrentPage={setCurrentPage} totalValidators={sortedValidators.length} />
    </div>
  );
}

function Pagination({ currentPage, setCurrentPage, totalValidators }) {
  const pageCount = Math.ceil(totalValidators / VALIDATORS_PER_PAGE);

  return (
    <nav className="mt-6 flex justify-center">
      <ul className="flex space-x-2">
        {Array.from({ length: pageCount }, (_, i) => (
          <li key={i}>
            <button
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                currentPage === i + 1
                  ? 'bg-primary-600 text-white'
                  : 'bg-crypto-light text-crypto-text hover:bg-crypto-medium'
              }`}
            >
              {i + 1}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default ValidatorList;
