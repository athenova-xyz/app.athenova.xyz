import { PrismaClient, CourseStatus } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create 5 users
  const users = await Promise.all(
    Array.from({ length: 5 }).map(() =>
      prisma.user.create({
        data: {
          walletAddress: faker.finance.ethereumAddress().toLowerCase(),
          role: 'CREATOR',
          username: faker.internet.username().toLowerCase(),
          displayName: faker.person.fullName(),
          email: faker.internet.email().toLowerCase(),
          avatarUrl: faker.image.avatar(),
          bio: faker.lorem.sentence(),
          metadata: {},
        },
      })
    )
  )

  // Each user gets 1-3 courses
  for (const user of users) {
    const courseCount = faker.number.int({ min: 1, max: 3 })
    for (let i = 0; i < courseCount; i++) {
      await prisma.course.create({
        data: {
          title: faker.lorem.sentence({ min: 2, max: 5 }),
          slug: `${faker.lorem.slug()}-${faker.string.alphanumeric(6).toLowerCase()}`,
          authorId: user.id,
          status: faker.helpers.arrayElement([
            CourseStatus.DRAFT,
            CourseStatus.PUBLISHED,
            CourseStatus.ARCHIVED,
          ]),
          version: 1,
          content: { blocks: [] },
          draft: { blocks: [] },
          plainText: faker.lorem.paragraphs({ min: 1, max: 3 }),
          publishedAt: faker.date.past(),
        },
      })
    }
  }

  console.log('Seed complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
