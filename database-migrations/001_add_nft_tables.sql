-- Migration: Add NFT approval tables
-- Date: 2024-01-15
-- Description: Add tables for NFT individual approvals and operator approvals

-- Table for individual NFT approvals (approve(to, tokenId))
CREATE TABLE IF NOT EXISTS nft_approvals (
  id SERIAL PRIMARY KEY,
  contract_address TEXT NOT NULL,
  owner TEXT NOT NULL,
  approved TEXT NOT NULL,
  token_id TEXT NOT NULL,
  block_number INTEGER NOT NULL,
  block_hash TEXT NOT NULL,
  tx_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Create unique constraint to prevent duplicates
  UNIQUE(contract_address, owner, token_id)
);

-- Table for operator approvals (setApprovalForAll(operator, approved))
CREATE TABLE IF NOT EXISTS nft_operator_approvals (
  id SERIAL PRIMARY KEY,
  contract_address TEXT NOT NULL,
  owner TEXT NOT NULL,
  operator TEXT NOT NULL,
  approved BOOLEAN NOT NULL,
  block_number INTEGER NOT NULL,
  block_hash TEXT NOT NULL,
  tx_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Create unique constraint to prevent duplicates
  UNIQUE(contract_address, owner, operator)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_nft_approvals_owner ON nft_approvals(owner);
CREATE INDEX IF NOT EXISTS idx_nft_approvals_contract ON nft_approvals(contract_address);
CREATE INDEX IF NOT EXISTS idx_nft_approvals_block ON nft_approvals(block_number);

CREATE INDEX IF NOT EXISTS idx_nft_operator_approvals_owner ON nft_operator_approvals(owner);
CREATE INDEX IF NOT EXISTS idx_nft_operator_approvals_contract ON nft_operator_approvals(contract_address);
CREATE INDEX IF NOT EXISTS idx_nft_operator_approvals_block ON nft_operator_approvals(block_number);

-- Add comments for documentation
COMMENT ON TABLE nft_approvals IS 'Individual NFT approvals (approve function calls)';
COMMENT ON TABLE nft_operator_approvals IS 'NFT operator approvals (setApprovalForAll function calls)';

COMMENT ON COLUMN nft_approvals.contract_address IS 'NFT contract address';
COMMENT ON COLUMN nft_approvals.owner IS 'NFT owner address';
COMMENT ON COLUMN nft_approvals.approved IS 'Address approved to transfer this specific NFT';
COMMENT ON COLUMN nft_approvals.token_id IS 'Specific NFT token ID';

COMMENT ON COLUMN nft_operator_approvals.contract_address IS 'NFT contract address';
COMMENT ON COLUMN nft_operator_approvals.owner IS 'NFT owner address';
COMMENT ON COLUMN nft_operator_approvals.operator IS 'Operator address (can transfer all NFTs)';
COMMENT ON COLUMN nft_operator_approvals.approved IS 'Whether operator is approved (true/false)';
