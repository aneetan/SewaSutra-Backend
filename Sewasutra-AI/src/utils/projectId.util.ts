  export function generateProjectId(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 10).toUpperCase()
    return `CON-${timestamp}-${random}`
  }