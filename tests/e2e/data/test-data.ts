import { faker } from '@faker-js/faker/locale/zh_CN';

export interface UserInfo {
  name: string;
  gender: '男' | '女' | '';
  age: string;
  city: string;
  occupation: string;
  education: string;
  phone: string;
}

export interface TestAnswer {
  questionId: string;
  answer: string;
}

export interface DiscAnswer {
  questionId: string;
  most: string;
  least: string;
}

export class TestData {
  static getDefaultData(): UserInfo {
    return {
      name: '测试用户',
      gender: '男',
      age: '25',
      city: '北京',
      occupation: '软件工程师',
      education: '本科',
      phone: '13800138000'
    };
  }

  static getRandomData(): UserInfo {
    return {
      name: faker.person.fullName(),
      gender: faker.helpers.arrayElement(['男', '女']),
      age: faker.number.int({ min: 18, max: 60 }).toString(),
      city: faker.location.city(),
      occupation: faker.person.jobTitle(),
      education: faker.helpers.arrayElement(['高中', '专科', '本科', '硕士', '博士']),
      phone: faker.phone.number()
    };
  }

  static getInvalidData(): UserInfo {
    return {
      name: '', // 空名字
      gender: '男',
      age: 'abc', // 无效年龄
      city: '北京',
      occupation: '软件工程师',
      education: '本科',
      phone: '123' // 无效手机号
    };
  }

  static getDefaultTestAnswers(): TestAnswer[] {
    return [
      { questionId: '1', answer: 'A' },
      { questionId: '2', answer: 'B' },
      { questionId: '3', answer: 'C' },
      { questionId: '4', answer: 'D' },
      { questionId: '5', answer: 'E' }
    ];
  }

  static getRandomTestAnswers(): TestAnswer[] {
    return Array.from({ length: 5 }, (_, i) => ({
      questionId: (i + 1).toString(),
      answer: faker.helpers.arrayElement(['A', 'B', 'C', 'D', 'E'])
    }));
  }

  static getDefaultDiscAnswers(): DiscAnswer[] {
    return [
      { questionId: '1', most: 'A', least: 'E' },
      { questionId: '2', most: 'B', least: 'D' },
      { questionId: '3', most: 'C', least: 'A' },
      { questionId: '4', most: 'D', least: 'B' },
      { questionId: '5', most: 'E', least: 'C' }
    ];
  }

  static getRandomDiscAnswers(): DiscAnswer[] {
    return Array.from({ length: 5 }, (_, i) => {
      const options = ['A', 'B', 'C', 'D', 'E'];
      const most = faker.helpers.arrayElement(options);
      const least = faker.helpers.arrayElement(options.filter(o => o !== most));
      return {
        questionId: (i + 1).toString(),
        most,
        least
      };
    });
  }
} 