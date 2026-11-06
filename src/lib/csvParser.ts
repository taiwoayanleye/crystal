import { CSVParseResult } from './types'

/**
 * Parse CSV file and extract headers and rows
 * Uses basic parsing without external dependencies for MVP
 */
export async function parseCSV(file: File): Promise<CSVParseResult> {
  try {
    const text = await file.text()
    const lines = text.split('\n').filter((line) => line.trim() !== '')

    if (lines.length === 0) {
      throw new Error('CSV file is empty')
    }

    // Parse headers from first line
    const headers = parseCSVLine(lines[0])

    if (headers.length === 0) {
      throw new Error('No headers found in CSV file')
    }

    // Parse data rows
    const rows: Record<string, any>[] = []
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i])
      const row: Record<string, any> = {}

      headers.forEach((header, index) => {
        const v = values[index]
        row[header] = v === undefined || v === '' ? null : v
      })

      rows.push(row)
    }

    return {
      headers,
      rows,
      metadata: {
        rowCount: rows.length,
        columnCount: headers.length,
      },
    }
  } catch (error) {
    throw new Error(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let insideQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        current += '"'
        i++ // Skip next quote
      } else {
        insideQuotes = !insideQuotes
      }
    } else if (char === ',' && !insideQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  result.push(current.trim())
  // Return every cell (including empty ones) so columns stay aligned with headers.
  return result
}

/**
 * Validate CSV file before parsing
 */
export function validateCSVFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (file.size === 0) {
    return { valid: false, error: 'File is empty' }
  }

  if (file.size > maxSize) {
    return { valid: false, error: `File size exceeds ${maxSize / 1024 / 1024}MB limit` }
  }

  if (!file.type.includes('csv') && !file.name.endsWith('.csv')) {
    return { valid: false, error: 'File must be a CSV file' }
  }

  return { valid: true }
}
