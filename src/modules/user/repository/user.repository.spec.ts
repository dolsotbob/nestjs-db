import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepository } from './user.repository';
import { User } from '../../../common/db/entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let mockRepo: jest.Mocked<Repository<User>>;

  const createUserDto: CreateUserDto = {
    userId: 'testuser',
    email: 'test@example.com',
    password: '1234',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            count: jest.fn(),
            merge: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
            exists: jest.fn(),
          },
        },
      ],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
    mockRepo = module.get(getRepositoryToken(User));
  });

  it('새 사용자를 생성해야 합니다.', async () => {
    const newUser = { ...createUserDto, id: 1 } as User;
    mockRepo.create.mockReturnValue(newUser);
    mockRepo.save.mockResolvedValue(newUser);

    const result = await userRepository.create(createUserDto);
    expect(result).toEqual(newUser);
    expect(mockRepo.create).toHaveBeenCalledWith(createUserDto);
    expect(mockRepo.save).toHaveBeenCalledWith(newUser);
  });

  it('모든 사용자를 조회해야 합니다.', async () => {
    const users = [{ id: 1 }, { id: 2 }] as User[];
    mockRepo.find.mockResolvedValue(users);
    const result = await userRepository.findAll();
    expect(result).toEqual(users);
  });

  it('특정 사용자를 조회해야 합니다.', async () => {
    const user = { id: 1, userId: 'testuser' } as User;
    mockRepo.findOne.mockResolvedValue(user);
    const result = await userRepository.findOne({ userId: 'testuser' });
    expect(result).toEqual(user);
  });

  it('전체 사용자 수를 계산해야 합니다.', async () => {
    mockRepo.count.mockResolvedValue(5);
    const result = await userRepository.countAll();
    expect(result).toBe(5);
  });

  it('userId로 사용자가 존재하는지 확인해야 합니다.', async () => {
    // 방법 1 (Count)
    // mockRepo.count.mockResolvedValue(1);

    // 방법 2 (Exists)
    mockRepo.exists.mockResolvedValue(true);
    const exists = await userRepository.existsByUserId('testuser');
    expect(exists).toBe(true);
  });

  it('사용자를 수정해야 합니다.', async () => {
    // 방법 1 (Merge)
    // const existingUser = { id: 1, userId: 'testuser' } as User;
    // const updatedUser = { ...existingUser, email: 'updated@example.com' };
    // mockRepo.findOne.mockResolvedValue(existingUser);
    // mockRepo.merge.mockReturnValue(updatedUser);
    // mockRepo.save.mockResolvedValue(updatedUser);

    // const result = await userRepository.update('testuser', {
    //   email: 'updated@example.com',
    // });

    // expect(result).toEqual(updatedUser);

    // 방법 2 (Update)
    const existingUser = {
      id: 1,
      userId: 'testuser',
      email: 'old@example.com',
    } as User;
    const updatedUser = {
      ...existingUser,
      email: 'updated@example.com',
    } as User;

    mockRepo.findOne
      .mockResolvedValueOnce(existingUser)
      .mockResolvedValueOnce(updatedUser);

    mockRepo.update.mockResolvedValue({
      raw: {},
      affected: 1,
      generatedMaps: [],
    });

    const result = await userRepository.update('testuser', {
      email: 'updated@example.com',
    });

    expect(mockRepo.update).toHaveBeenCalledWith(1, {
      email: 'updated@example.com',
    });
    expect(result).toEqual(updatedUser);
  });

  it('사용자를 삭제해야 합니다.', async () => {
    await userRepository.delete('testuser');
    expect(mockRepo.delete).toHaveBeenCalledWith({ userId: 'testuser' });
  });
});