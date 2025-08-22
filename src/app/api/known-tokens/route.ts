import { NextRequest } from 'next/server'
import { query } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    // Get all known ERC20 tokens from the database
    const sql = `
      SELECT address, name, symbol, decimals, total_supply
      FROM erc20_tokens 
      ORDER BY created_at DESC 
      LIMIT 1000
    `
    
    const { rows } = await query(sql, [])
    
    return new Response(JSON.stringify({ 
      tokens: rows.map(row => row.address),
      details: rows 
    }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  } catch (err) {
    console.error('Error fetching known tokens:', err)
    
    // Return empty array on error to allow fallback
    return new Response(JSON.stringify({ tokens: [] }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  }
}
