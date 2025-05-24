import { NextFunction, Request, Response } from 'express'
import announcementServices from '../services/announcement.services'

class AnnouncementController {
  /**
   * Get all current announcements
   */
  async getAnnouncements(req: Request, res: Response, next: NextFunction) {
    try {
      const announcements = await announcementServices.getCurrentAnnouncements()

      res.status(200).json({
        statusCode: 200,
        message: 'Announcements retrieved successfully',
        success: true,
        data: announcements,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Completely replace all announcements (PUT operation)
   */
  async updateAnnouncements(req: Request, res: Response, next: NextFunction) {
    try {
      const { announcements } = req.body // Expecting array of strings
      console.clear()
      console.log('Received announcements:', announcements)
      const updated = await announcementServices.replaceAllAnnouncements(
        announcements
      )

      res.status(200).json({
        statusCode: 200,
        message: 'Announcements updated successfully',
        success: true,
        data: updated,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Clear all announcements
   */

  /**
   * Initialize announcements (for first-time setup)
   */
}

export default new AnnouncementController()
