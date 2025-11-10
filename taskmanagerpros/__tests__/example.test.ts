// Example unit test to verify Jest is working correctly

describe('Jest Setup', () => {
  it('should run basic test', () => {
    expect(true).toBe(true)
  })

  it('should perform basic arithmetic', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle array operations', () => {
    const arr = [1, 2, 3]
    expect(arr).toHaveLength(3)
    expect(arr).toContain(2)
  })

  it('should handle string operations', () => {
    const str = 'Hello, Jest!'
    expect(str).toMatch(/Jest/)
    expect(str.toLowerCase()).toBe('hello, jest!')
  })
})
