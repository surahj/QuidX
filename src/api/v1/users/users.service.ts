import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User, Prisma, Profile, Guest } from '@prisma/postgres/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { EmailService } from '@modules/emails/email.service';
import { PageOptionsDto } from '@common/dto/page-options.dto';
import { PostgresPrismaService } from '@database/postgres-prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly emailService: EmailService,
    private readonly prisma: PostgresPrismaService,
  ) {}

  public async createUser(
    data: Prisma.UserCreateInput,
  ): Promise<User & { profile: Profile }> {
    return this.usersRepository.create({
      data,
      include: {
        profile: true,
      },
    }) as Promise<User & { profile: Profile }>;
  }

  public async createGuest(data: Prisma.GuestCreateInput): Promise<Guest> {
    const { email } = data;
    const guest = await this.usersRepository.findGuest({ where: { email } });

    if (guest) throw new BadRequestException('pdf already sent to your email');
    const pdfLink =
      'https://www.hipdf.com/preview?share_id=qmymDq7Zf6l7swK3ThoiSQ';

    await this.emailService.sendEmailToDownloadPdf({ email, link: pdfLink });
    return this.usersRepository.createGuest({
      data,
    }) as Promise<Guest>;
  }

  public async getUserById(id: string): Promise<User & { profile: Profile }> {
    return this.usersRepository.findById(id, { includeProfile: true });
  }

  public async getUserByEmail(
    email: string,
  ): Promise<User & { profile: Profile }> {
    return this.usersRepository.find({
      where: { email },
      include: {
        profile: true,
      },
    }) as Promise<User & { profile: Profile }>;
  }

  public async updateById(
    id: string,
    data: Prisma.UserUpdateInput,
  ): Promise<User> {
    return this.usersRepository.update({
      where: { id },
      data,
    }) as Promise<User>;
  }

  public async updateUserProfile(
    id: string,
    data: UpdateUserDto,
  ): Promise<Profile> {
    return this.usersRepository.findUserProfileByIdAndUpdate(
      id,
      data,
    ) as Promise<Profile>;
  }

  public async getUserProfile(id: string): Promise<Profile[]> {
    return this.usersRepository.getUserProfile(id) as Promise<Profile[]>;
  }

  async getAllUsers(adminId: string, options: PageOptionsDto) {
    const admin = await this.usersRepository.findById(adminId);

    if (admin.role !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not allowed to perform this action',
      );
    }

    const { skip, take, searchTerm, sortBy, sortDir } = options;

    const where: Prisma.UserWhereInput = {};

    if (searchTerm) {
      where.AND = [
        {
          email: {
            contains: searchTerm,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: {
          [sortBy]: sortDir.toLowerCase(),
        },
        select: {
          id: true,
          email: true,
          credit: true,
          bonusCredit: true,
          isEmailVerified: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          paymentHistories: {
            select: {
              id: true,
              amount: true,
              status: true,
              createdAt: true,
              currency: true,
              packageId: true,
            },
          },
        },
        skip,
        take,
      }),

      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((u) => ({
        ...u,
        paymentHistories: u.paymentHistories.map((p) => ({
          ...p,
          amount: p.amount.toNumber(),
        })),
      })),
      total,
    };
  }
}
