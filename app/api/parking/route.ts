import { NextRequest, NextResponse } from 'next/server'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'path'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const areaName = searchParams.get('area')

    if (!areaName) {
        return NextResponse.json({ error: 'Area name is required' }, { status: 400 })
    }

    try {
        const dbPath = path.join(process.cwd(), 'public', 'boolder.db')
        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        })

        const parkingInfo = await db.get(`
      SELECT p.name as parking_name, p.google_url, pr.distance_in_minutes, pr.transport
      FROM areas a 
      JOIN poi_routes pr ON a.id = pr.area_id 
      JOIN pois p ON pr.poi_id = p.id 
      WHERE a.name = ? AND p.poi_type = 'parking'
      ORDER BY pr.distance_in_minutes ASC
      LIMIT 1
    `, [areaName])

        await db.close()

        if (!parkingInfo) {
            return NextResponse.json({ error: 'No parking information found for this area' }, { status: 404 })
        }

        return NextResponse.json(parkingInfo)
    } catch (error) {
        console.error('Error fetching parking information:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
} 