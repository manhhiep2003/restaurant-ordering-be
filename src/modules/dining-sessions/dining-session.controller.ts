import { Controller, Post, Body } from '@nestjs/common';
import { DiningSessionService } from './dining-session.service';
import { DiningSessionRequestDto } from 'src/modules/dining-sessions/dtos/request/dining-session.request.dto';

@Controller('public/dining-sessions')
export class DiningSessionController {
  constructor(private readonly sessionService: DiningSessionService) {}

  /**
   * API quét QR code để vào menu
   * Khách gửi lên tableId và tên đại diện
   */
  @Post('check-status')
  checkStatus(@Body() body: DiningSessionRequestDto) {
    return this.sessionService.checkOrCreateSession(body);
  }
}
