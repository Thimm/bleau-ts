export interface Route {
    id: number
    name: string
    grade: string
    grade_numeric: number
    latitude: number
    longitude: number
    steepness: string
    sit_start: number
    area_id: number
    area_name: string
    bleau_info_id: string
    popularity: number
}

export interface FilterState {
    gradeRange: [number, number]
    steepness: string[]
    areas: string[]
    sitStart: 'all' | 'sit' | 'standing'
    popularityRange: [number, number]
    search: string
}

export interface AreaFeature {
    type: 'Feature'
    geometry: {
        type: 'Point'
        coordinates: [number, number]
    }
    properties: {
        name: string
        areaId: number
        priority: number
        southWestLat: string
        southWestLon: string
        northEastLat: string
        northEastLon: string
    }
}

export interface AreasData {
    type: 'FeatureCollection'
    features: AreaFeature[]
} 