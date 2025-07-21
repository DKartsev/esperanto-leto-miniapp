import { describe, it, expect } from 'vitest'
import { telegramIdToUUID } from '../services/authService'

// Test deterministic conversion

describe('telegramIdToUUID', () => {
  it('converts numeric ID to stable UUID', async () => {
    const id = 123456
    const uuid1 = await telegramIdToUUID(id)
    const uuid2 = await telegramIdToUUID(id)
    expect(uuid1).toEqual(uuid2)
    // Basic UUID v4 pattern check
    expect(uuid1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
  })

  it('produces different UUIDs for different ids', async () => {
    const id1 = 1
    const id2 = 2
    const uuid1 = await telegramIdToUUID(id1)
    const uuid2 = await telegramIdToUUID(id2)
    expect(uuid1).not.toEqual(uuid2)
  })
})
