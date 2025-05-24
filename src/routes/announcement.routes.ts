import { Router } from 'express'
import announcementsController from '../controllers/announcements.controller'

const announcementRoutes = Router()
announcementRoutes.get('/', announcementsController.getAnnouncements)
announcementRoutes.put('/', announcementsController.updateAnnouncements)

export default announcementRoutes
