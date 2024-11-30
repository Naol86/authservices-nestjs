import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '@prisma/client';
import * as querystring from 'querystring';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateGoogleUser(profile: any): Promise<User> {
    const { email, firstName, lastName, picture, provider, providerId } =
      profile;

    let user = await this.usersService.findByEmail(email);
    if (!user) {
      return this.usersService.create({
        email,
        firstName,
        lastName,
        profilePicture: picture,
        isEmailVerified: true,
        provider,
        providerId,
      });
    } else if (!user.isEmailVerified) {
      user = await this.usersService.update(user.id, {
        isEmailVerified: true,
        verificationToken: null,
        provider: 'google',
      });
    }

    return user;
  }

  async login(user: User): Promise<{ accessToken: string; user: User }> {
    const payload = { userId: user.id, email: user.email };
    const token = this.jwtService.sign(payload);
    // await this.usersService.updateToken(user.id, token);
    delete user.password;
    return { accessToken: token, user: user };
  }

  getGoogleAuthUrl(): string {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = 'http://localhost:8000/auth/google/callback';
    const scope = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ].join(' ');

    const params = querystring.stringify({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope,
      access_type: 'offline',
      prompt: 'consent',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }
}
