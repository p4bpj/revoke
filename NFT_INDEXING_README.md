# NFT Indexing Extension

This document explains the NFT indexing functionality added to the Kasplex Revoke application.

## Overview

The NFT indexing extension allows the application to fetch NFT approvals from a database instead of scanning the blockchain directly, providing much faster performance and complete historical data.

## Database Schema

### NFT Individual Approvals (`nft_approvals`)
Stores individual NFT approvals created by `approve(to, tokenId)` calls.

```sql
CREATE TABLE nft_approvals (
  id SERIAL PRIMARY KEY,
  contract_address TEXT NOT NULL,  -- NFT contract address
  owner TEXT NOT NULL,            -- NFT owner address  
  approved TEXT NOT NULL,         -- Address approved to transfer this NFT
  token_id TEXT NOT NULL,         -- Specific NFT token ID
  block_number INTEGER NOT NULL,
  block_hash TEXT NOT NULL,
  tx_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(contract_address, owner, token_id)
);
```

### NFT Operator Approvals (`nft_operator_approvals`)
Stores operator approvals created by `setApprovalForAll(operator, approved)` calls.

```sql
CREATE TABLE nft_operator_approvals (
  id SERIAL PRIMARY KEY,
  contract_address TEXT NOT NULL,  -- NFT contract address
  owner TEXT NOT NULL,            -- NFT owner address
  operator TEXT NOT NULL,         -- Operator address (can transfer ALL NFTs)
  approved BOOLEAN NOT NULL,      -- Whether operator is approved
  block_number INTEGER NOT NULL,
  block_hash TEXT NOT NULL,
  tx_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(contract_address, owner, operator)
);
```

## API Endpoints

### GET `/api/nft-approvals?owner=0x...`
Returns individual NFT approvals for a specific owner.

**Response:**
```json
{
  "approvals": [
    {
      "id": 123,
      "contract_address": "0x...",
      "owner": "0x...",
      "approved": "0x...",
      "token_id": "1234",
      "block_number": 156789,
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### GET `/api/operator-approvals?owner=0x...`
Returns operator approvals (setApprovalForAll) for a specific owner.

**Response:**
```json
{
  "approvals": [
    {
      "id": 456,
      "contract_address": "0x...",
      "owner": "0x...",
      "operator": "0x...",
      "approved": true,
      "block_number": 156790,
      "updated_at": "2024-01-15T10:31:00Z"
    }
  ]
}
```

## Events Indexed

The indexer should monitor these events:

### ERC721 Individual Approval
```solidity
event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
```
- **Topic**: `0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925`

### ERC721/ERC1155 Operator Approval
```solidity
event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
```
- **Topic**: `0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31`

## Frontend Integration

The `fetchNFTApprovals()` function now:

1. **First attempts** to fetch from indexer API endpoints
2. **Enriches data** with contract metadata (name, symbol)
3. **Falls back** to on-chain scanning if API fails
4. **Maintains compatibility** with existing UI components

## Rollback Instructions

If issues occur, you can safely rollback:

```bash
# Switch back to main branch
git checkout main

# Delete the feature branch (optional)
git branch -D feature/nft-indexing
```

The main branch remains unchanged and fully functional.

## Performance Benefits

| **Indexer** | **Direct On-Chain** |
|-------------|-------------------|
| ⚡ Fast API queries | 🐌 Scans 50k blocks |
| 📊 Complete history | 🔍 Limited recent data |
| 💰 Efficient database | 💸 Many RPC calls |
| 🔄 Always up-to-date | ⏰ Scan-dependent |

## Database Migration

Run the migration script to create the tables:

```sql
psql -d your_database -f database-migrations/001_add_nft_tables.sql
```

## Next Steps

To complete the implementation:

1. **Update Go indexer** to monitor NFT events
2. **Populate database** with historical NFT approval data  
3. **Test with real NFT data** on Kasplex testnet
4. **Monitor performance** and adjust as needed
