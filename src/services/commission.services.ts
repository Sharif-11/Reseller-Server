import ApiError from '../utils/ApiError'
import prisma from '../utils/prisma'

export class CommissionService {
  private hasOverlappingRanges = (
    ranges: { startPrice: number; endPrice: number }[]
  ): boolean => {
    ranges.sort((a, b) => a.startPrice - b.startPrice)
    for (let i = 0; i < ranges.length - 1; i++) {
      if (ranges[i].endPrice >= ranges[i + 1].startPrice) {
        return true
      }
    }
    return false
  }

  private validateAmountsArray = (input: { amounts: number[] }[]): boolean => {
    const validLengths = input.map(
      ({ amounts }) => amounts.filter(amount => amount !== null).length
    )
    return validLengths.every(length => length === validLengths[0])
  }
  private createCommissionEntries = (
    data: {
      startPrice: number
      endPrice: number
      amounts: number[]
    }[]
  ) => {
    const commissionEntries = data
      .map(({ startPrice, endPrice, amounts }) =>
        amounts.map((commission, index) => ({
          startPrice,
          endPrice,
          level: index + 1,
          commission,
        }))
      )
      .flat()
    return commissionEntries
  }

  async createCommissions(
    data: {
      startPrice: number
      endPrice: number
      amounts: number[]
    }[]
  ) {
    // Validation: Check if amounts arrays are consistent
    if (!this.validateAmountsArray(data)) {
      throw new Error(
        'All amounts arrays must have the same length (excluding empty elements).'
      )
    }

    // Validation: Check for overlapping ranges
    if (this.hasOverlappingRanges(data)) {
      throw new Error('Input contains overlapping ranges.')
    }

    // Prepare data for batch insertion

    // Use Prisma createMany for batch insertion
    const commissionEntries = this.createCommissionEntries(data)
    try {
      await prisma.commission.createMany({
        data: commissionEntries,
        skipDuplicates: true, // Prevent duplication in case of unique constraint violations
      })
      return await this.getFullCommissionTable()
    } catch (error) {
      throw new ApiError(400, 'Error creating commissions.')
    }
    // Return the newly created rows
  }
  async getCommissionsByPrice(price: number) {
    // Fetch all commissions matching the given price range
    const commissions = await prisma.commission.findMany({
      where: {
        startPrice: { lte: price },
        endPrice: { gte: price },
      },
      orderBy: { level: 'asc' }, // Ensure the commissions are sorted by level
    })

    if (commissions.length === 0) {
      throw new Error(`No commissions found for price: ${price}`)
    }

    // Extract and return the commission amounts as an array
    return commissions
  }
  async updateCommissionTable(
    data: {
      startPrice: number
      endPrice: number
      amounts: number[]
    }[]
  ): Promise<any[]> {
    // Validation: Ensure amounts arrays are consistent
    if (!this.validateAmountsArray(data)) {
      throw new Error(
        'All amounts arrays must have the same length (excluding empty elements).'
      )
    }

    // Validation: Check for overlapping ranges
    if (this.hasOverlappingRanges(data)) {
      throw new Error('Input contains overlapping ranges.')
    }
    const commissionEntries = this.createCommissionEntries(data)
    // Transaction to replace the existing table
    await prisma.$transaction([
      prisma.commission.deleteMany(), // Delete all existing rows
      prisma.commission.createMany({
        data: commissionEntries,
        skipDuplicates: false, // Ensure all rows are inserted
      }),
    ])

    return await this.getFullCommissionTable()
  }
  async getFullCommissionTable() {
    // Fetch all rows from the commission table
    const commissions = await prisma.commission.findMany({
      orderBy: [{ startPrice: 'asc' }, { level: 'asc' }], // Sort by startPrice and level
    })

    // Group commissions by startPrice and endPrice
    const groupedData = commissions.reduce((acc, curr) => {
      const { startPrice, endPrice, level, commission } = curr

      const key = `${startPrice}-${endPrice}`
      if (!acc[key]) {
        acc[key] = {
          startPrice: Number(startPrice),
          endPrice: Number(endPrice),
          amounts: [],
        }
      }

      // Place the commission in the correct position based on the level
      acc[key].amounts[level - 1] = commission.toNumber()

      return acc
    }, {} as Record<string, { startPrice: number; endPrice: number; amounts: number[] }>)

    // Convert grouped data to an array
    return Object.values(groupedData)
  }
  async calculateCommissions(userPhone: string, price: number) {
    // Step 1: Fetch all commission levels for the given price
    const commissions = await prisma.commission.findMany({
      where: {
        startPrice: { lte: price },
        endPrice: { gte: price },
      },
      orderBy: { level: 'asc' }, // Ensure commissions are sorted by level
    })

    // Step 2: Fetch all parents of the user using a recursive CTE-like logic
    const parentTree: {
      phoneNo: string
      name: string
      level: number
    }[] = await prisma.$queryRawUnsafe(
      `
      WITH RECURSIVE parent_tree AS (
        -- Base case: start with the target user
        SELECT 
          "phoneNo", 
          "name", 
          0 AS "level", 
          "referredByPhone"
        FROM "users"
        WHERE "phoneNo" = '${userPhone}' -- Replace with the target user's phone number
  
        UNION ALL
  
        -- Recursive case: find the parent of each user in the tree
        SELECT 
          u."phoneNo", 
          u."name", 
          pt."level" + 1 AS "level", 
          u."referredByPhone"
        FROM "users" u
        JOIN parent_tree pt ON u."phoneNo" = pt."referredByPhone"
      )
      SELECT 
        "phoneNo", 
        "name", 
        "level"
      FROM parent_tree
      WHERE "phoneNo" != '${userPhone}' -- Exclude the target user
      ORDER BY "level";
    `,
      userPhone
    )

    // Step 3: Map commissions to the parent tree
    const result = parentTree.map((parent: any) => {
      const commission = commissions.find(c => c.level === parent.level)
      return {
        phoneNo: parent.phoneNo,
        name: parent.name,
        level: parent.level,
        commissionAmount: commission ? commission.commission : 0, // Assign commission if found
      }
    })
    console.log({ commissions, parentTree, result })
    return result
  }
}

export default new CommissionService()
