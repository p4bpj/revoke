import { NextRequest } from 'next/server'
import { query } from '@/lib/db'

type DbNftApproval = {
  id: number
  contract_address: string
  owner: string
  approved: string
  token_id: string
  block_number: number
  block_hash: string
  tx_hash: string
  created_at: string
  updated_at: string
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const owner = (searchParams.get('owner') || '').toLowerCase()

  if (!owner || !/^0x[a-fA-F0-9]{40}$/.test(owner)) {
    return new Response(JSON.stringify({ error: 'Invalid owner address' }), { status: 400 })
  }

  const hasDbConfig =
    !!process.env.DATABASE_URL ||
    (!!process.env.PGHOST && !!process.env.PGUSER && !!process.env.PGDATABASE)

  // In local/dev, if DB isn't configured, return empty approvals so the client falls back to on-chain
  if (!hasDbConfig && process.env.NODE_ENV !== 'production') {
    return new Response(JSON.stringify({ approvals: [] }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  }

  try {
    const sql = `
      SELECT id, contract_address, owner, approved, token_id, block_number, block_hash, tx_hash, created_at, updated_at
      FROM nft_approvals
      WHERE lower(owner) = $1 AND approved <> '0x0000000000000000000000000000000000000000'
      ORDER BY block_number DESC, id DESC
    `
    const { rows } = await query<DbNftApproval>(sql, [owner])

    return new Response(JSON.stringify({ approvals: rows }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  } catch (err) {
    console.error('DB error fetching NFT approvals', err)
    // In dev, degrade gracefully to enable on-chain fallback
    if (process.env.NODE_ENV !== 'production') {
      return new Response(JSON.stringify({ approvals: [] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    }
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
  }
}
