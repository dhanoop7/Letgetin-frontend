import type {
  UserProfile,
  StorageUsage,
  SecurityIssue,
  ActivityControl,
  ContactItem,
  SubscriptionItem,
  HelpArticle,
  AccountType,
} from '../types/user.types'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import { ProfileService } from '@/features/profile/services/profileService'
import { recruiterService } from '@/features/recruiter/services/recruiterService'

class UserService {
  private cachedProfile: UserProfile | null = null

  /**
   * Determine the effective account type (Candidate, Company, Startup, Institution)
   * based on the authenticated session or explicit override.
   */
  getAccountType(overrideType?: string | null): AccountType {
    if (overrideType) {
      const lower = overrideType.toLowerCase()
      if (lower === 'company') return 'Company'
      if (lower === 'startup') return 'Startup'
      if (lower === 'institution') return 'Institution'
      if (lower === 'candidate') return 'Candidate'
    }

    const authUser = useAuthStore.getState().user
    if (!authUser) return 'Candidate'

    const role = (authUser.role || '').toLowerCase()
    const entity = (authUser.entityType || '').toLowerCase()

    if (entity === 'institution' || role === 'institution') return 'Institution'
    if (entity === 'startup' || role === 'startup') return 'Startup'
    if (entity === 'company' || role === 'company' || role === 'recruiter') return 'Company'

    return 'Candidate'
  }

  async getUserProfile(explicitAccountType?: string | null): Promise<UserProfile> {
    const authUser = useAuthStore.getState().user
    const accountType = this.getAccountType(explicitAccountType)

    let baseName = authUser?.fullName || authUser?.username || 'User'
    let baseEmail = authUser?.email || ''
    let basePhone = authUser?.phone || '+1 (555) 019-2834'
    let baseBirthday = 'October 14, 1994'
    let baseGender = 'Rather not say'
    let orgName = ''

    if (accountType === 'Candidate') {
      try {
        const candidateProfile = await ProfileService.getProfile()
        if (candidateProfile) {
          if (candidateProfile.personal?.firstName) {
            baseName = `${candidateProfile.personal.firstName} ${candidateProfile.personal.lastName || ''}`.trim()
          }
          if (candidateProfile.contact?.email) baseEmail = candidateProfile.contact.email
          if (candidateProfile.contact?.phone) basePhone = candidateProfile.contact.phone
          if (candidateProfile.personal?.dob) baseBirthday = candidateProfile.personal.dob
          if (candidateProfile.personal?.bio) baseGender = candidateProfile.personal.bio
        }
      } catch {
        // Fallback to authUser
      }
    } else {
      // Company / Startup / Institution
      try {
        const orgProfile = await recruiterService.getOrgProfile()
        if (orgProfile) {
          if (orgProfile.name) {
            orgName = orgProfile.name
            baseName = orgProfile.name
          }
          if (orgProfile.ceoEmail) baseEmail = orgProfile.ceoEmail
          if (orgProfile.phone) basePhone = orgProfile.phone
          if (orgProfile.founded) baseBirthday = orgProfile.founded
          baseGender = `${accountType} Organization`
        }
      } catch {
        // Fallback to authUser
      }
    }

    const firstChar = (baseName || baseEmail || 'U').charAt(0).toUpperCase()

    this.cachedProfile = {
      id: authUser?.id || authUser?._id || 'usr_1',
      name: baseName,
      nickname: orgName || authUser?.username || baseName.split(' ')[0] || 'User',
      email: baseEmail || `${accountType.toLowerCase()}@letgetin.com`,
      phone: basePhone,
      avatarText: firstChar,
      birthday: baseBirthday,
      gender: baseGender,
      passwordLastChanged: 'Aug 8, 2023',
      accountType,
      role: authUser?.role,
      entityType: authUser?.entityType,
      organizationName: orgName,
    }

    return { ...this.cachedProfile }
  }

  async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const current = this.cachedProfile || (await this.getUserProfile())
    const accountType = current.accountType || 'Candidate'

    if (accountType === 'Candidate') {
      try {
        await ProfileService.updateProfile({
          personal: {
            firstName: updates.name ? updates.name.split(' ')[0] : current.name.split(' ')[0] || '',
            lastName: updates.name ? updates.name.split(' ').slice(1).join(' ') : current.name.split(' ').slice(1).join(' ') || '',
            headline: '',
            dob: updates.birthday || current.birthday,
            bio: updates.gender || current.gender,
          },
          contact: {
            fullName: updates.name || current.name,
            email: updates.email || current.email,
            phone: updates.phone || current.phone,
            city: '',
            country: '',
            linkedin: '',
          },
        })
      } catch {
        // Graceful update in case backend API is in local mock mode
      }
    } else {
      try {
        const entity = (accountType.toLowerCase() === 'startup'
          ? 'startup'
          : accountType.toLowerCase() === 'institution'
          ? 'institution'
          : 'company') as 'company' | 'startup' | 'institution';
        await recruiterService.saveOrgProfile({
          entity,
          name: updates.name || current.name,
          ceoEmail: updates.email || current.email,
          phone: updates.phone || current.phone,
          founded: updates.birthday || current.birthday,
        })
      } catch {
        // Graceful update
      }
    }

    this.cachedProfile = {
      ...current,
      ...updates,
      avatarText: updates.name ? updates.name.charAt(0).toUpperCase() : current.avatarText,
    }

    return { ...this.cachedProfile }
  }

  async getStorageUsage(): Promise<StorageUsage> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    return {
      usedGb: 0.68,
      totalGb: 15,
      usedPercentage: 4,
    }
  }

  async getSecurityIssues(): Promise<SecurityIssue[]> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    return [
      {
        id: 'sec_1',
        title: '2-Step Verification disabled',
        description: 'Add an extra layer of security to prevent unauthorized access.',
        severity: 'medium',
      },
    ]
  }

  async getActivityControls(): Promise<ActivityControl[]> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    return [
      { id: 'act_1', title: 'Web & App Activity', status: 'On' },
      { id: 'act_2', title: 'Location History', status: 'On' },
      { id: 'act_3', title: 'Usage History', status: 'On' },
    ]
  }

  async getContacts(): Promise<ContactItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    return [
      { id: 'c_1', name: 'Sarah Connor', email: 'sarah@letgetin.com', avatarText: 'S' },
      { id: 'c_2', name: 'John Doe', email: 'john@letgetin.com', avatarText: 'J' },
      { id: 'c_3', name: 'Emma Watson', email: 'emma@letgetin.com', avatarText: 'E' },
    ]
  }

  async getSubscriptions(accountType?: AccountType): Promise<SubscriptionItem[]> {
    const effectiveType = accountType || this.cachedProfile?.accountType || this.getAccountType()

    if (effectiveType === 'Company') {
      return [
        {
          id: 'sub_co_1',
          title: 'Company Recruiter Pro',
          description: '250 AI Sourcing Credits & Talent Pool',
          cost: '₹2,500/mo',
          status: 'Active',
        },
        {
          id: 'sub_co_2',
          title: 'Enterprise ATS & Screening Suite',
          description: 'Unlimited Candidate Sourcing & Verification',
          cost: '₹10,000/yr',
          status: 'Active',
        },
      ]
    }

    if (effectiveType === 'Startup') {
      return [
        {
          id: 'sub_st_1',
          title: 'DPIIT Startup Accelerator Plan',
          description: 'FastTrack Hiring & Pitch Deck Showcase',
          cost: '₹1,500/mo',
          status: 'Active',
        },
        {
          id: 'sub_st_2',
          title: 'Founders Seed & Grant Suite',
          description: 'Cloud Grants & Sovereign Subsidies Access',
          cost: '₹7,500/yr',
          status: 'Active',
        },
      ]
    }

    if (effectiveType === 'Institution') {
      return [
        {
          id: 'sub_inst_1',
          title: 'Campus Placement & Drive Suite',
          description: '500 Campus Credits & Batch Management',
          cost: '₹5,000/mo',
          status: 'Active',
        },
        {
          id: 'sub_inst_2',
          title: 'University Enterprise Pass',
          description: 'Complete Campus Placement & Recruiter Outreach',
          cost: '₹10,000/yr',
          status: 'Active',
        },
      ]
    }

    // Default: Candidate
    return [
      {
        id: 'sub_cand_1',
        title: 'LetGetIn Storage Plus',
        description: '100 GB Cloud Storage',
        cost: '$1.99/mo',
        status: 'Active',
      },
      {
        id: 'sub_cand_2',
        title: 'LetGetIn Pro Career Plus',
        description: 'Advanced AI Apply & Verified Resume Badge',
        cost: '$9.99/mo',
        status: 'Active',
      },
    ]
  }

  async getHelpArticles(): Promise<HelpArticle[]> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    return [
      { id: 'h_1', title: 'See and control the data in your account', category: 'Privacy' },
      { id: 'h_2', title: 'Manage your LetGetIn settings', category: 'Account' },
      { id: 'h_3', title: 'Secure an account that has suspicious activity', category: 'Security' },
    ]
  }
}

export const userService = new UserService()
