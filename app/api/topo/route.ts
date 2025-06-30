import { NextRequest, NextResponse } from 'next/server'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'path'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const routeId = searchParams.get('routeId')

    if (!routeId) {
        return NextResponse.json({ error: 'Route ID is required' }, { status: 400 })
    }

    try {
        const dbPath = path.join(process.cwd(), 'public', 'boolder.db')
        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        })

        const topoInfo = await db.get(`
      SELECT l.topo_id, l.coordinates
      FROM problems p 
      JOIN lines l ON p.id = l.problem_id 
      WHERE p.id = ?
      LIMIT 1
    `, [routeId])

        await db.close()

        if (!topoInfo) {
            return NextResponse.json({ error: 'No topo information found for this route' }, { status: 404 })
        }

        return NextResponse.json({
            topo_id: topoInfo.topo_id,
            coordinates: topoInfo.coordinates ? JSON.parse(topoInfo.coordinates) : null,
            image_url: `https://assets.boolder.com/proxy/topos/${topoInfo.topo_id}`
        })
    } catch (error) {
        console.error('Error fetching topo information:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
} 