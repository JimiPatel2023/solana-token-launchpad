import { NextRequest, NextResponse } from 'next/server'

type Item = {
  id: string
  name: string
  // Add other properties as needed
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
    try {
        const id_name = params.id.replace(".json", "")

        // Here you would typically fetch data from a database
        // For this example, we'll just return mock data
      
        const response = await fetch(`https://api.jsonserve.com/${id_name}`);
        const item = await response.json();
      
        // If item is not found, you might want to return a 404
        if (!item) {
          return NextResponse.json({ error: 'Item not found' }, { status: 404 })
        }
      
        return NextResponse.json(item)
    } catch (error) {
        return NextResponse.json({fuck:true})
    }
}