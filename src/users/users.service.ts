import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async create(data: Prisma.UserCreateInput) {
    const d = { ...data, email: data.email.toLowerCase() };
    return this.prisma.user.create({ data: d });
  }

  async update(id: number, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async register(userData: Prisma.UserCreateInput) {
    // check if the user is already in the database
    const user = await this.findByEmail(userData.email);
    if (user) {
      if (!user.isEmailVerified) {
        // Resend verification email
        await this.sendVerificationEmail(user.email, user.verificationToken);
      }
      return false;
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Generate verification token
    const verificationToken = randomBytes(32).toString('hex');

    const newUser = await this.create({
      ...userData,
      verificationToken,
      password: hashedPassword,
    });

    await this.sendVerificationEmail(newUser.email, verificationToken);

    delete newUser.password;
    delete newUser.verificationToken;

    return newUser;
  }

  async sendVerificationEmail(email: string, token: string) {
    // Send email with verification link
    const verificationLink = `${process.env.BACKEND_URL}/auth/verify-email?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: 'Email Verification',
      text: `Click on the link to verify your email: ${verificationLink}`,
    };

    await transporter.sendMail(mailOptions);
  }

  async verifyEmail(token: string): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      return false;
    }
    const res = await this.prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true, verificationToken: null },
    });
    if (!res) {
      return false;
    }
    return true;
  }

  async comparePasswords(password: string, hashedPassword: string) {
    return bcrypt.compare(password, hashedPassword);
  }
}
