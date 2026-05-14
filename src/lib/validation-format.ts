export function formatValidationIssues(issues: any[]): string {
  try {
    const fieldMap: Record<string, string> = {
      title: 'Item Title',
      description: 'Description',
      price: 'Price',
      condition: 'Condition',
      categoryName: 'Category',
      categoryId: 'Category',
      categorySlug: 'Category',
      location: 'Location',
      campus: 'Campus',
      status: 'Status',
      images: 'Photos',
      'images.imageUrl': 'Photo URL',
      'images.sortOrder': 'Photo order',
    }

    const humanize = (raw: string | undefined, pathLabel: string) => {
      if (!raw) return `${pathLabel} is invalid`

      const s = String(raw)

      const minStringMatch = s.match(/String must contain at least (\d+) character/)
      if (minStringMatch) {
        const n = minStringMatch[1]
        return `${pathLabel} must be at least ${n} ${Number(n) === 1 ? 'character' : 'characters'} long`
      }

      if (/Invalid url/i.test(s)) {
        return `${pathLabel} must be a valid URL`
      }

      if (/Invalid email/i.test(s)) {
        return `${pathLabel} must be a valid email address`
      }

      if (/Number must be greater than or equal to ([-\d\.]+)/i.test(s)) {
        return `${pathLabel} ${s.toLowerCase()}`
      }

      return `${pathLabel} ${s.charAt(0) === ':' ? s.slice(1).trim() : s}`
    }

    return issues
      .map((issue) => {
        const pathArr = Array.isArray(issue.path) ? issue.path : []
        const key = pathArr.length > 0 ? String(pathArr[0]) : ''
        let pathLabel = fieldMap[key] ?? (pathArr.length ? pathArr.join('.') : 'Field')

        if (pathArr[0] === 'images' && Array.isArray(pathArr) && pathArr.length > 1) {
          const sub = String(pathArr[pathArr.length - 1])
          pathLabel = fieldMap[`images.${sub}`] ?? pathLabel
        }

        return humanize(issue.message ?? String(issue), pathLabel)
      })
      .join('; ')
  } catch (e) {
    return 'Invalid input'
  }
}
