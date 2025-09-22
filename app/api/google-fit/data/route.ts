import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { accessToken, dataType = "steps", startTime, endTime } = await request.json()

    if (!accessToken) {
      return NextResponse.json({ error: "Access token required" }, { status: 400 })
    }

    // Default to today if no time range provided
    const now = new Date()
    const start = startTime || new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() * 1000000
    const end = endTime || now.getTime() * 1000000

    // Map data types to Google Fit data source IDs
    const dataSourceMap: Record<string, string> = {
      steps: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps",
      calories: "derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended",
      distance: "derived:com.google.distance.delta:com.google.android.gms:merge_distance_delta",
      heart_points: "derived:com.google.heart_minutes:com.google.android.gms:merge_heart_minutes",
    }

    const dataSourceId = dataSourceMap[dataType] || dataSourceMap.steps

    // Fetch data from Google Fit API
    const response = await fetch(
      `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataSourceId}/dataPointChanges?startTime=${start}&endTime=${end}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch Google Fit data", details: data }, { status: response.status })
    }

    // Process and aggregate the data
    const totalValue =
      data.insertedDataPoint?.reduce((sum: number, point: any) => {
        const value = point.value?.[0]?.intVal || point.value?.[0]?.fpVal || 0
        return sum + value
      }, 0) || 0

    return NextResponse.json({
      dataType,
      value: Math.floor(totalValue),
      startTime: start,
      endTime: end,
      dataPoints: data.insertedDataPoint?.length || 0,
    })
  } catch (error) {
    console.error("Google Fit data fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch fitness data" }, { status: 500 })
  }
}
