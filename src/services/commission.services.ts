import { Prisma } from '@prisma/client'
import ApiError from '../utils/ApiError'
import prisma from '../utils/prisma'

export class CommissionService {
  private static validateCommissionRanges(
    data: { startPrice: number; endPrice: number; amounts: number[] }[]
  ): void {
    // Check all amounts arrays have same length
    const levelCount = new Set(data.map(item => item.amounts.length))
    if (levelCount.size > 1) {
      throw new ApiError(
        400,
        'সমস্ত কমিশন লেভেলে একই সংখ্যক অ্যামাউন্ট থাকতে হবে'
      )
    }

    // Check for non-positive values
    for (const row of data) {
      if (row.startPrice <= 0) {
        throw new ApiError(
          400,
          `শুরুর মূল্য অবশ্যই ধনাত্মক হতে হবে (পাওয়া গেছে ${row.startPrice})`
        )
      }

      if (row.endPrice && row.endPrice <= 0) {
        throw new ApiError(
          400,
          `শেষ মূল্য অবশ্যই ধনাত্মক হতে হবে (পাওয়া গেছে ${row.endPrice})`
        )
      }

      for (const amount of row.amounts) {
        if (amount <= 0) {
          throw new ApiError(
            400,
            `কমিশনের পরিমাণ অবশ্যই ধনাত্মক হতে হবে (পাওয়া গেছে ${amount})`
          )
        }
      }
    }

    // Check for overlapping ranges
    const sortedRanges = [...data].sort((a, b) => a.startPrice - b.startPrice)

    for (let i = 0; i < sortedRanges.length - 1; i++) {
      const current = sortedRanges[i]
      const next = sortedRanges[i + 1]

      if (current.endPrice >= next.startPrice) {
        throw new ApiError(
          400,
          `রেঞ্জ ওভারল্যাপ ডিটেক্টেড: ${current.startPrice}-${current.endPrice} ওভারল্যাপ করছে ${next.startPrice}-${next.endPrice} এর সাথে`
        )
      }
    }
  }

  private static transformToDatabaseFormat(
    data: { startPrice: number; endPrice: number; amounts: number[] }[]
  ): Prisma.CommissionCreateManyInput[] {
    return data.flatMap(row =>
      row.amounts.map((commission, index) => ({
        startPrice: new Prisma.Decimal(row.startPrice),
        endPrice: row.endPrice ? new Prisma.Decimal(row.endPrice) : null,
        level: index + 1,
        commission: new Prisma.Decimal(commission),
      }))
    )
  }

  async replaceCommissionTable(
    data: { startPrice: number; endPrice: number; amounts: number[] }[]
  ): Promise<
    { startPrice: number; endPrice: number | null; amounts: number[] }[]
  > {
    // Validate input data
    CommissionService.validateCommissionRanges(data)

    // Transform to database format
    const commissionEntries = CommissionService.transformToDatabaseFormat(data)

    // Transaction for atomic replacement
    return await prisma.$transaction(async tx => {
      // Clear existing data
      await tx.commission.deleteMany()

      // Insert new data
      await tx.commission.createMany({
        data: commissionEntries,
      })

      // Return the newly created data in the original format
      return this.formatCommissionTable(
        await tx.commission.findMany({
          orderBy: [{ startPrice: 'asc' }, { level: 'asc' }],
        })
      )
    })
  }

  private formatCommissionTable(
    commissions: {
      startPrice: Prisma.Decimal
      endPrice: Prisma.Decimal | null
      level: number
      commission: Prisma.Decimal
    }[]
  ): { startPrice: number; endPrice: number | null; amounts: number[] }[] {
    const grouped = new Map<
      string,
      { startPrice: number; endPrice: number | null; amounts: number[] }
    >()

    for (const commission of commissions) {
      const key = `${commission.startPrice}-${commission.endPrice}`

      if (!grouped.has(key)) {
        grouped.set(key, {
          startPrice: commission.startPrice.toNumber(),
          endPrice: commission.endPrice?.toNumber() ?? null,
          amounts: [],
        })
      }

      const group = grouped.get(key)!
      group.amounts[commission.level - 1] = commission.commission.toNumber()
    }

    return Array.from(grouped.values()).sort(
      (a, b) => a.startPrice - b.startPrice
    )
  }

  async getCommissionTable(): Promise<
    { startPrice: number; endPrice: number | null; amounts: number[] }[]
  > {
    const commissions = await prisma.commission.findMany({
      orderBy: [{ startPrice: 'asc' }, { level: 'asc' }],
    })
    return this.formatCommissionTable(commissions)
  }

  async getCommissionsByPrice(price: number) {
    if (price <= 0) {
      throw new ApiError(400, 'মূল্য অবশ্যই ধনাত্মক হতে হবে')
    }

    const commissions = await prisma.commission.findMany({
      where: {
        startPrice: { lte: price },
        OR: [
          { endPrice: { gte: price } },
          { endPrice: null }, // For open-ended ranges (e.g., 1500+)
        ],
      },
      orderBy: { level: 'asc' },
    })

    if (commissions.length === 0) {
      throw new ApiError(404, `${price} টাকার জন্য কোনো কমিশন পাওয়া যায়নি`)
    }

    return commissions.map(c => ({
      level: c.level,
      commission: c.commission.toNumber(),
    }))
  }

  async calculateUserCommissions(userPhone: string, price: number) {
    if (price <= 0) {
      throw new ApiError(400, 'মূল্য অবশ্যই ধনাত্মক হতে হবে')
    }

    const [commissions, parentTree] = await Promise.all([
      this.getCommissionsByPrice(price),
      this.getUserParentTree(userPhone),
    ])

    return parentTree.map(parent => ({
      phoneNo: parent.phoneNo,
      name: parent.name,
      level: parent.level,
      commissionAmount:
        commissions.find(c => c.level === parent.level)?.commission || 0,
    }))
  }

  private async getUserParentTree(userPhone: string) {
    return await prisma.$queryRaw<
      { phoneNo: string; name: string; level: number }[]
    >`
      WITH RECURSIVE parent_tree AS (
        SELECT 
          "phoneNo", 
          "name", 
          0 AS "level", 
          "referredByPhone"
        FROM "users"
        WHERE "phoneNo" = ${userPhone}
        
        UNION ALL
        
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
      WHERE "phoneNo" != ${userPhone}
      ORDER BY "level"
    `
  }
}

export default new CommissionService()
