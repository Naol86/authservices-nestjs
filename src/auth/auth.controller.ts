import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './dto/index.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.usersService.register(registerDto);
    if (!user) {
      return {
        success: false,
        message: 'Email already exists',
      };
    }
    return {
      success: true,
      message: 'Registration successful. Please verify your email.',
      user,
    };
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    const isVerified = await this.usersService.verifyEmail(token);
    if (!isVerified) {
      return {
        success: false,
        message: 'Invalid or expired token',
      };
    }
    return {
      success: true,
      message: 'Email verified',
    };
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.isEmailVerified) {
      return {
        success: false,
        message: 'Email not verified or user not found',
      };
    }
    const isPasswordValid = await this.usersService.comparePasswords(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid email or password',
      };
    }

    return this.authService.login(user);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // Initiates the Google OAuth2 login flow
  }

  @Get('google/url')
  async googleAuthUrl() {
    const url = await this.authService.getGoogleAuthUrl();
    return { url };
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req) {
    const user = await this.authService.validateGoogleUser(req.user);
    return this.authService.login(user);
  }
}
