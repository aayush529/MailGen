import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MailService } from './mail.service';
import { GenerateMailDto } from './dto/generate-mail.dto';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async generateMail(@Body() dto: GenerateMailDto, @Req() req: any) {
    const userName = req.user.name || 'User';
    const emailText = await this.mailService.generateMail(dto, userName);
    return { email: emailText };
  }
}
