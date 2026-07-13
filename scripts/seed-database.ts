#!/usr/bin/env tsx

/**
 * Database seeding script for initial setup
 * Creates admin user and default categories
 * Usage: npm run seed
 */

import { hashPassword } from 'better-auth/crypto'
import { Prisma } from '@prisma/client'
import { 
  prisma, 
  checkDatabaseConnection, 
  disconnectDatabase,
  safeDatabaseOperation,
  checkMigrationStatus
} from '../lib/db'
import { env } from '../lib/env'
import { CONTENT_PAGE_DEFINITIONS } from '../lib/content-page-definitions'

interface SeedOptions {
  skipExisting?: boolean
  verbose?: boolean
}

async function seedDatabase(options: SeedOptions = {}) {
  const { skipExisting = true, verbose = false } = options
  
  console.log('🌱 Starting database seeding...')
  console.log('=' .repeat(50))
  
  try {
    // Check database connection
    console.log('\n📡 Checking database connection...')
    const isConnected = await checkDatabaseConnection()
    
    if (!isConnected) {
      console.log('❌ Database connection failed. Please check your DATABASE_URL.')
      process.exit(1)
    }
    
    // Check migration status
    console.log('\n🔄 Checking migration status...')
    const migrationStatus = await checkMigrationStatus()
    
    if (migrationStatus.error && !migrationStatus.error.includes('Database not initialized')) {
      console.log(`❌ Migration check failed: ${migrationStatus.error}`)
      console.log('💡 Please run: npx prisma db push')
      process.exit(1)
    }
    
    if (migrationStatus.error?.includes('Database not initialized')) {
      console.log('ℹ️  No Prisma migrations table found; continuing after prisma db push sync')
    } else if (!migrationStatus.isUpToDate) {
      console.log('⚠️  Pending migrations found. Please run: npx prisma db push')
      if (migrationStatus.pendingMigrations) {
        migrationStatus.pendingMigrations.forEach(migration => {
          console.log(`   - ${migration}`)
        })
      }
      process.exit(1)
    }
    
    console.log('✅ Database is ready for seeding')
    
    // Seed admin user
    await seedAdminUser(skipExisting, verbose)
    
    // Seed article categories
    await seedArticleCategories(skipExisting, verbose)
    
    // Seed event categories
    await seedEventCategories(skipExisting, verbose)
    
    // Seed reading material categories
    await seedReadingMaterialCategories(skipExisting, verbose)

    // Seed starter website content
    await seedServiceGroups(skipExisting, verbose)
    await seedContentPages(skipExisting, verbose)
    
    console.log('\n' + '='.repeat(50))
    console.log('✅ Database seeding completed successfully!')
    console.log('🚀 Your application is ready to use')
    
    // Display admin credentials
    if (env.ADMIN_EMAIL && env.ADMIN_PASSWORD) {
      console.log('\n📋 Admin Credentials:')
      console.log(`   Email: ${env.ADMIN_EMAIL}`)
      console.log('   Password: configured in .env.local')
      console.log('   ⚠️  Please change the admin password after first login')
    }
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error)
    process.exit(1)
  } finally {
    await disconnectDatabase()
  }
}

async function seedAdminUser(skipExisting: boolean, verbose: boolean) {
  console.log('\n👤 Seeding admin user...')
  
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
    console.log('⚠️  ADMIN_EMAIL and ADMIN_PASSWORD not set in environment')
    console.log('   Skipping admin user creation')
    return
  }
  
  const result = await safeDatabaseOperation(async () => {
    // Check if admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: env.ADMIN_EMAIL }
    })

    const legacyLocalAdmin = await prisma.user.findUnique({
      where: { email: 'admin@localhost.local' },
    })
    
    if (existingUser) {
      if (skipExisting) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name: 'Pieter',
            role: 'ADMIN',
            emailVerified: true,
          },
        })
        await upsertCredentialAccount(existingUser.id, env.ADMIN_PASSWORD!)
        if (verbose) {
          console.log(`   Admin user already exists: ${env.ADMIN_EMAIL}`)
        }
        return { created: false, user: existingUser }
      } else {
        // Update existing user
        const updatedUser = await prisma.user.update({
          where: { email: env.ADMIN_EMAIL },
          data: {
            name: 'Pieter',
            role: 'ADMIN',
            emailVerified: true,
          }
        })
        await upsertCredentialAccount(updatedUser.id, env.ADMIN_PASSWORD!)
        return { created: false, updated: true, user: updatedUser }
      }
    }

    if (legacyLocalAdmin) {
      const updatedUser = await prisma.user.update({
        where: { id: legacyLocalAdmin.id },
        data: {
          email: env.ADMIN_EMAIL!,
          name: 'Pieter',
          role: 'ADMIN',
          emailVerified: true,
        },
      })
      await upsertCredentialAccount(updatedUser.id, env.ADMIN_PASSWORD!)
      return { created: false, updated: true, user: updatedUser }
    }
    
    // Create new admin user
    const newUser = await prisma.user.create({
      data: {
        email: env.ADMIN_EMAIL!,
        name: 'Pieter',
        role: 'ADMIN',
        emailVerified: true,
      }
    })
    await upsertCredentialAccount(newUser.id, env.ADMIN_PASSWORD!)
    
    return { created: true, user: newUser }
  }, 'Admin user seeding')
  
  if (result.success) {
    if (result.data.created) {
      console.log(`✅ Admin user created: ${env.ADMIN_EMAIL}`)
    } else if (result.data.updated) {
      console.log(`✅ Admin user updated: ${env.ADMIN_EMAIL}`)
    } else {
      console.log(`ℹ️  Admin user already exists: ${env.ADMIN_EMAIL}`)
    }
  } else {
    console.log(`❌ Failed to create admin user: ${result.error}`)
    throw new Error(result.error)
  }
}

async function upsertCredentialAccount(userId: string, password: string) {
  const passwordHash = await hashPassword(password)

  await prisma.account.upsert({
    where: {
      providerId_accountId: {
        providerId: 'credential',
        accountId: userId,
      },
    },
    update: {
      password: passwordHash,
    },
    create: {
      userId,
      providerId: 'credential',
      accountId: userId,
      password: passwordHash,
    },
  })
}

async function seedArticleCategories(skipExisting: boolean, verbose: boolean) {
  console.log('\n📰 Seeding article categories...')
  
  const categories = [
    {
      name: 'Sosiaal',
      slug: 'sosiaal',
      description: 'Sosiale gebeure en aktiwiteite',
      color: '#D97706' // Amber-600
    },
    {
      name: 'Jeug',
      slug: 'jeug',
      description: 'Jeugaktiwiteite en programme',
      color: '#F59E0B' // Amber-500
    },
    {
      name: 'Sinode',
      slug: 'sinode',
      description: 'Sinode nuus en aankondigings',
      color: '#92400E' // Amber-800
    },
    {
      name: 'Algemeen',
      slug: 'algemeen',
      description: 'Algemene gemeente nuus',
      color: '#A16207' // Amber-700
    },
    {
      name: 'Eredienste',
      slug: 'eredienste',
      description: 'Erediens aankondigings en inligting',
      color: '#78350F' // Amber-900
    }
  ]
  
  for (const category of categories) {
    const result = await safeDatabaseOperation(async () => {
      const existing = await prisma.articleCategory.findUnique({
        where: { slug: category.slug }
      })
      
      if (existing) {
        if (skipExisting) {
          return { created: false, category: existing }
        } else {
          const updated = await prisma.articleCategory.update({
            where: { slug: category.slug },
            data: category
          })
          return { created: false, updated: true, category: updated }
        }
      }
      
      const newCategory = await prisma.articleCategory.create({
        data: category
      })
      
      return { created: true, category: newCategory }
    }, `Article category: ${category.name}`)
    
    if (result.success) {
      if (result.data.created) {
        console.log(`   ✅ Created: ${category.name}`)
      } else if (result.data.updated) {
        console.log(`   ✅ Updated: ${category.name}`)
      } else if (verbose) {
        console.log(`   ℹ️  Exists: ${category.name}`)
      }
    } else {
      console.log(`   ❌ Failed: ${category.name} - ${result.error}`)
    }
  }
}

async function seedEventCategories(skipExisting: boolean, verbose: boolean) {
  console.log('\n📅 Seeding event categories...')
  
  const categories = [
    {
      name: 'Eredienste',
      color: '#92400E', // Amber-800
      description: 'Gereelde eredienste'
    },
    {
      name: 'Byeenkomste',
      color: '#A16207', // Amber-700
      description: 'Spesiale byeenkomste en vergaderings'
    },
    {
      name: 'Jeugaktiwiteite',
      color: '#D97706', // Amber-600
      description: 'Aktiwiteite vir die jeug'
    },
    {
      name: 'Sosiale Gebeure',
      color: '#F59E0B', // Amber-500
      description: 'Sosiale aktiwiteite en funksies'
    },
    {
      name: 'Opleiding',
      color: '#78350F', // Amber-900
      description: 'Opleidingsgeleenthede en kursusse'
    }
  ]
  
  for (const category of categories) {
    const result = await safeDatabaseOperation(async () => {
      const existing = await prisma.eventCategory.findUnique({
        where: { name: category.name }
      })
      
      if (existing) {
        if (skipExisting) {
          return { created: false, category: existing }
        } else {
          const updated = await prisma.eventCategory.update({
            where: { name: category.name },
            data: category
          })
          return { created: false, updated: true, category: updated }
        }
      }
      
      const newCategory = await prisma.eventCategory.create({
        data: category
      })
      
      return { created: true, category: newCategory }
    }, `Event category: ${category.name}`)
    
    if (result.success) {
      if (result.data.created) {
        console.log(`   ✅ Created: ${category.name}`)
      } else if (result.data.updated) {
        console.log(`   ✅ Updated: ${category.name}`)
      } else if (verbose) {
        console.log(`   ℹ️  Exists: ${category.name}`)
      }
    } else {
      console.log(`   ❌ Failed: ${category.name} - ${result.error}`)
    }
  }
}

async function seedReadingMaterialCategories(skipExisting: boolean, verbose: boolean) {
  console.log('\n📚 Seeding reading material categories...')
  
  const categories = [
    {
      name: 'Preke',
      description: 'Preek toesprake en transkripsies'
    },
    {
      name: 'Bybelstudie',
      description: 'Bybelstudie materiaal en gidse'
    },
    {
      name: 'Toesprake',
      description: 'Spesiale toesprake en lesings'
    },
    {
      name: 'Liedere',
      description: 'Liedere en musiek materiaal'
    },
    {
      name: 'Algemeen',
      description: 'Algemene lees materiaal'
    }
  ]
  
  for (const category of categories) {
    const result = await safeDatabaseOperation(async () => {
      const existing = await prisma.readingMaterialCategory.findUnique({
        where: { name: category.name }
      })
      
      if (existing) {
        if (skipExisting) {
          return { created: false, category: existing }
        } else {
          const updated = await prisma.readingMaterialCategory.update({
            where: { name: category.name },
            data: category
          })
          return { created: false, updated: true, category: updated }
        }
      }
      
      const newCategory = await prisma.readingMaterialCategory.create({
        data: category
      })
      
      return { created: true, category: newCategory }
    }, `Reading material category: ${category.name}`)
    
    if (result.success) {
      if (result.data.created) {
        console.log(`   ✅ Created: ${category.name}`)
      } else if (result.data.updated) {
        console.log(`   ✅ Updated: ${category.name}`)
      } else if (verbose) {
        console.log(`   ℹ️  Exists: ${category.name}`)
      }
    } else {
      console.log(`   ❌ Failed: ${category.name} - ${result.error}`)
    }
  }
}

async function seedServiceGroups(skipExisting: boolean, verbose: boolean) {
  console.log('\n🤝 Seeding diensgroepe...')

  if (verbose) {
    console.log('   ℹ️  Diensgroepe word vanaf WordPress gemigreer; geen placeholder groepe word gesaai nie.')
  }

  return
}

async function seedContentPages(skipExisting: boolean, verbose: boolean) {
  console.log('\n📄 Seeding content pages...')

  const pages = CONTENT_PAGE_DEFINITIONS.map((definition) => ({
    slug: definition.slug,
    title: definition.title,
    description: definition.description,
    sections: definition.sections as Prisma.InputJsonValue,
    status: 'PUBLISHED' as const,
    publishedAt: new Date(),
  }))

  for (const page of pages) {
    const result = await safeDatabaseOperation(async () => {
      const existing = await prisma.contentPage.findUnique({
        where: { slug: page.slug },
      })

      if (existing) {
        if (skipExisting) {
          return { created: false, page: existing }
        }

        const updated = await prisma.contentPage.update({
          where: { slug: page.slug },
          data: page,
        })
        return { created: false, updated: true, page: updated }
      }

      const newPage = await prisma.contentPage.create({
        data: page,
      })

      return { created: true, page: newPage }
    }, `Content page: ${page.title}`)

    if (result.success) {
      if (result.data.created) {
        console.log(`   ✅ Created: ${page.title}`)
      } else if (result.data.updated) {
        console.log(`   ✅ Updated: ${page.title}`)
      } else if (verbose) {
        console.log(`   ℹ️  Exists: ${page.title}`)
      }
    } else {
      console.log(`   ❌ Failed: ${page.title} - ${result.error}`)
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received interrupt signal, shutting down gracefully...')
  await disconnectDatabase()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received termination signal, shutting down gracefully...')
  await disconnectDatabase()
  process.exit(0)
})

// Parse command line arguments
const args = process.argv.slice(2)
const skipExisting = !args.includes('--force')
const verbose = args.includes('--verbose')

console.log('🌱 Database Seeding Script')
console.log(`Options: skipExisting=${skipExisting}, verbose=${verbose}`)

seedDatabase({ skipExisting, verbose })
