<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <DashboardSkeleton v-if="isLoading" variant="list" :count="3" />

    <!-- Error State -->
    <div v-else-if="error" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
        <UIcon name="i-lucide-alert-circle" class="text-red-500" size="32" />
      </div>
      <p class="text-red-600 mb-6">{{ error }}</p>
      <Button
        variant="primary"
        text="Try Again"
        @clicked="loadFamily"
      />
    </div>

    <!-- Main Content -->
    <template v-else>
      <!-- Instructions -->
      <FamilyManagementInstructions :is-parent="isParent" />

      <!-- Header with Action -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">Family Members</h2>
          <p class="text-sm text-gray-500 mt-1">
            {{ isParent ? 'Manage your family group and share credits' : 'View your family connections' }}
          </p>
        </div>
        <Button
          v-if="isParent"
          variant="primary"
          text="Invite Member"
          icon="i-lucide-user-plus"
          @clicked="showInviteModal = true"
        />
      </div>

      <!-- Family Stats -->
      <div v-if="isParent || (!isParent && activeMembers.length > 0)" class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-lg">
              <UIcon name="i-lucide-users" class="text-blue-600" size="20" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ activeMembers.length }}</p>
              <p class="text-xs text-gray-500">Active Members</p>
            </div>
          </div>
        </div>

        <div v-if="isParent" class="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center w-10 h-10 bg-amber-50 rounded-lg">
              <UIcon name="i-lucide-mail" class="text-amber-600" size="20" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ pendingInvitations.length }}</p>
              <p class="text-xs text-gray-500">Pending</p>
            </div>
          </div>
        </div>

        <div v-if="isParent" class="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center w-10 h-10 bg-emerald-50 rounded-lg">
              <UIcon name="i-lucide-coins" class="text-emerald-600" size="20" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ totalCredits }}</p>
              <p class="text-xs text-gray-500">Total Credits</p>
            </div>
          </div>
        </div>

        <div v-if="isParent" class="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center w-10 h-10 bg-violet-50 rounded-lg">
              <UIcon name="i-lucide-list-checks" class="text-violet-600" size="20" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ totalTasks }}</p>
              <p class="text-xs text-gray-500">Active Tasks</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Student Pending Invitations Section -->
      <div v-if="!isParent && pendingInvitations.length > 0" class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div class="flex items-center gap-2">
            <div class="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
              <UIcon name="i-lucide-mail-plus" class="text-blue-600" size="16" />
            </div>
            <h2 class="text-base font-semibold text-gray-900">Your Family Invitations</h2>
          </div>
        </div>

        <div class="divide-y divide-gray-100">
          <div
            v-for="invitation in pendingInvitations"
            :key="invitation.id"
            class="p-5 bg-gradient-to-r from-blue-50/50 to-transparent"
          >
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-4">
                <div class="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl flex-shrink-0">
                  <UIcon name="i-lucide-users" class="text-blue-600" size="22" />
                </div>

                <div class="min-w-0">
                  <h3 class="font-semibold text-gray-900">{{ invitation.group_name || 'Family Group' }}</h3>
                  <p class="text-sm text-gray-500">You've been invited to join this family</p>
                  <div class="flex items-center gap-1 text-xs text-gray-400 mt-1">
                    <UIcon name="i-lucide-clock" size="12" />
                    <span>{{ formatDate(invitation.invited_at) }}</span>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="secondary"
                  text="Decline"
                  size="sm"
                  @clicked="declineInvitation(invitation)"
                />
                <Button
                  variant="primary"
                  text="Accept"
                  size="sm"
                  @clicked="acceptInvitation(invitation)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Parent Pending Invitations Section -->
      <div v-if="isParent && pendingInvitations.length > 0" class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div class="flex items-center gap-2">
            <div class="flex items-center justify-center w-8 h-8 bg-amber-100 rounded-lg">
              <UIcon name="i-lucide-clock" class="text-amber-600" size="16" />
            </div>
            <h2 class="text-base font-semibold text-gray-900">Pending Invitations</h2>
          </div>
        </div>

        <div class="divide-y divide-gray-100">
          <div
            v-for="invitation in pendingInvitations"
            :key="invitation.id"
            class="p-5 hover:bg-gray-50/50 transition-colors"
          >
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-4">
                <div class="flex items-center justify-center w-10 h-10 bg-amber-50 rounded-xl flex-shrink-0">
                  <UIcon name="i-lucide-mail" class="text-amber-600" size="18" />
                </div>

                <div class="min-w-0">
                  <h3 class="font-medium text-gray-900">{{ invitation.email }}</h3>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span class="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                      <UIcon name="i-lucide-loader-2" size="10" />
                      Awaiting response
                    </span>
                    <span class="text-xs text-gray-400">{{ formatDate(invitation.invited_at) }}</span>
                  </div>
                </div>
              </div>

              <button
                class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Cancel invitation"
                @click="cancelInvitation(invitation)"
              >
                <UIcon name="i-lucide-x" size="18" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Student Empty State (no family connections and no pending invitations) -->
      <div v-if="!isParent && activeMembers.length === 0 && pendingInvitations.length === 0" class="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div class="text-center py-16 px-6">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-6">
            <UIcon name="i-lucide-users" class="text-gray-400" size="32" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">No Family Connections</h3>
          <p class="text-gray-500 max-w-sm mx-auto mb-8">
            You haven't been connected to any family members yet.
          </p>
          <div class="bg-blue-50 rounded-xl p-5 max-w-sm mx-auto">
            <div class="flex items-start gap-3">
              <div class="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg flex-shrink-0">
                <UIcon name="i-lucide-lightbulb" class="text-blue-600" size="16" />
              </div>
              <div class="text-left">
                <p class="text-sm font-medium text-blue-900 mb-1">How to get connected</p>
                <p class="text-sm text-blue-700">Ask a family member to invite you using your email address.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Members List -->
      <div v-if="isParent || (!isParent && activeMembers.length > 0)" class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div class="flex items-center gap-2">
            <div class="flex items-center justify-center w-8 h-8 bg-emerald-100 rounded-lg">
              <UIcon name="i-lucide-users" class="text-emerald-600" size="16" />
            </div>
            <h2 class="text-base font-semibold text-gray-900">
              {{ isParent ? 'Active Members' : 'Family Members' }}
            </h2>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="activeMembers.length === 0" class="text-center py-16 px-6">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-6">
            <UIcon name="i-lucide-user-plus" class="text-gray-400" size="32" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">No family members yet</h3>
          <p class="text-gray-500 max-w-sm mx-auto mb-6">
            Invite family members by email. Once they accept, they'll appear here.
          </p>
          <Button
            v-if="isParent"
            variant="primary"
            text="Send Invitation"
            icon="i-lucide-send"
            @clicked="showInviteModal = true"
          />
        </div>

        <!-- Active Members List -->
        <div v-else class="divide-y divide-gray-100">
          <div
            v-for="member in activeMembers"
            :key="member.id"
            class="p-5 hover:bg-gray-50/50 transition-colors"
          >
            <div class="flex items-center justify-between gap-4">
              <!-- Member Info -->
              <div class="flex items-center gap-4">
                <!-- Avatar -->
                <div class="relative flex-shrink-0">
                  <div :class="getAvatarClass(member.user_role)" class="flex items-center justify-center w-12 h-12 rounded-xl">
                    <span class="font-semibold text-base">
                      {{ getInitials(member.userDisplayFullName || member.email) }}
                    </span>
                  </div>
                  <div class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
                </div>

                <!-- Details -->
                <div class="min-w-0">
                  <div class="flex items-center gap-2 mb-0.5">
                    <h3 class="font-semibold text-gray-900 truncate">
                      {{ member.userDisplayFullName || member.email }}
                    </h3>
                    <span :class="getRoleBadgeClass(member.user_role)" class="px-2 py-0.5 rounded-md text-xs font-medium">
                      {{ formatRole(member.user_role) }}
                    </span>
                  </div>

                  <p class="text-sm text-gray-500 truncate mb-1.5">{{ member.email }}</p>

                  <!-- Stats -->
                  <div class="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                    <div v-if="member.credits !== undefined" class="flex items-center gap-1">
                      <UIcon name="i-lucide-coins" size="12" />
                      <span class="font-medium text-gray-600">{{ member.credits || 0 }}</span>
                      <span>credits</span>
                    </div>

                    <div v-if="member.activeTasks" class="flex items-center gap-1">
                      <UIcon name="i-lucide-list-checks" size="12" />
                      <span>{{ member.activeTasks }} tasks</span>
                    </div>

                    <div class="flex items-center gap-1">
                      <UIcon name="i-lucide-calendar" size="12" />
                      <span>Joined {{ formatDate(member.joined_at || member.created_at) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div v-if="isParent" class="flex items-center gap-2 flex-shrink-0">
                <button
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                  @click="transferCredits(member)"
                >
                  <UIcon name="i-lucide-send" size="14" />
                  Transfer Credit
                </button>
                <button
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  @click="removeMember(member)"
                >
                  <UIcon name="i-lucide-user-minus" size="14" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>

  <!-- Invite Member Modal -->
  <InviteMemberModal
    :is-open="showInviteModal"
    @close="showInviteModal = false"
    @member-invited="onMemberInvited"
  />

  <!-- Remove Confirmation Modal -->
  <RemoveMemberModal
    :is-open="showRemoveModal"
    :member="selectedMember"
    @close="showRemoveModal = false"
    @member-removed="onMemberRemoved"
  />

  <!-- Transfer Credits Modal -->
  <TransferCreditsModal
    :is-open="showTransferModal"
    :member="selectedMember"
    :parent-balance="parentBalance"
    :is-loading="isTransferLoading"
    @close="showTransferModal = false"
    @transfer="handleTransfer"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import InviteMemberModal from './InviteMemberModal.vue';
import RemoveMemberModal from './RemoveMemberModal.vue';
import TransferCreditsModal from './TransferCreditsModal.vue';
import FamilyManagementInstructions from './FamilyManagementInstructions.vue';
import Button from '~/components/common/Button.vue';
import DashboardSkeleton from '~/components/common/DashboardSkeleton.vue';

// Use me store for user role
const meStore = useMeStore();
const { isParent } = storeToRefs(meStore);

// Use credit management for parent balance
const { balance: parentBalance, fetchCredits, incrementTransactionVersion } = useCredit();

// Reactive state
const familyMembers = ref<any[]>([]);
const pendingInvitations = ref<any[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
// Removed local isParent - using store instead
const totalTasks = ref(0);

// Modal states
const showInviteModal = ref(false);
const showRemoveModal = ref(false);
const showTransferModal = ref(false);
const selectedMember = ref<any>(null);
const isTransferLoading = ref(false);

// Computed properties
const activeMembers = computed(() => {
  return familyMembers.value.filter((member) => member.status === 'active');
});

const totalCredits = computed(() => {
  return activeMembers.value.reduce((sum, member) => sum + (member.credits || 0), 0);
});

// Functions
const loadFamily = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    const response = await $fetch('/api/family/list');

    if (response.success) {
      // Check if student has pending invitations to display
      if (response.hasPendingInvitations) {
        // Student with pending invitations - show only those
        familyMembers.value = [];
        pendingInvitations.value = response.pendingInvitations || [];
        // Removed isParent assignment - using store instead
        totalTasks.value = 0;
      } else {
        // Normal flow - separate active members from pending invitations
        const allMembers = response.familyMembers || [];
        familyMembers.value = allMembers.filter((member: any) => member.status === 'active');
        pendingInvitations.value = allMembers.filter((member: any) => member.status === 'pending');

        // Removed isParent assignment - using store instead
        totalTasks.value = response.totalTasks || 0;
      }
    } else {
      throw new Error('Failed to load family members');
    }
  } catch (err: any) {
    console.error('Failed to load family:', err);
    error.value = err.data?.message || 'Failed to load family members. Please try again.';
    familyMembers.value = [];
    pendingInvitations.value = [];
  } finally {
    isLoading.value = false;
  }
};

const transferCredits = (member: any) => {
  selectedMember.value = member;
  showTransferModal.value = true;
};

const removeMember = (member: any) => {
  selectedMember.value = member;
  showRemoveModal.value = true;
};

const cancelInvitation = async (invitation: any) => {
  try {
    const response = await $fetch('/api/family/cancel-invitation', {
      method: 'POST',
      body: { invitationId: invitation.id }
    });

    if (response.success) {
      // Remove from pending invitations
      pendingInvitations.value = pendingInvitations.value.filter(
        (inv: any) => inv.id !== invitation.id
      );
    }
  } catch (err: any) {
    console.error('Failed to cancel invitation:', err);
    alert('Failed to cancel invitation. Please try again.');
  }
};

const acceptInvitation = async (invitation: any) => {
  try {
    const response = await $fetch('/api/family/accept-invitation', {
      method: 'POST',
      body: { groupId: invitation.group_id }
    });

    if (response.success) {
      // Reload family data to show updated membership
      await loadFamily();
    }
  } catch (err: any) {
    console.error('Failed to accept invitation:', err);
    alert('Failed to accept invitation. Please try again.');
  }
};

const declineInvitation = async (invitation: any) => {
  // For now, we'll just remove it from the UI since there's no decline endpoint
  // In a real implementation, you'd want to create a decline-invitation endpoint
  if (confirm('Are you sure you want to decline this invitation?')) {
    // Remove from pending invitations locally
    pendingInvitations.value = pendingInvitations.value.filter(
      (inv: any) => inv.id !== invitation.id
    );

    // If no more pending invitations, reload to show family members
    if (pendingInvitations.value.length === 0) {
      await loadFamily();
    }
  }
};

const onMemberInvited = () => {
  showInviteModal.value = false;
  loadFamily();
};

const onMemberRemoved = () => {
  showRemoveModal.value = false;
  loadFamily();
};

const onTransferCompleted = () => {
  showTransferModal.value = false;
  loadFamily();
};

const handleTransfer = async (transferData: {
  toUserInfoId: string;
  amount: number;
  note?: string;
  recipientName: string;
}) => {
  isTransferLoading.value = true;

  try {
    const transferResponse = await $fetch('/api/credits/internal-transfer', {
      method: 'POST',
      body: {
        toUserInfoId: transferData.toUserInfoId,
        amountInCents: transferData.amount,
        note: transferData.note
      },
    });

    if (transferResponse.success) {
      // Show success message and refresh family data
      alert('Transfer successful!');
      incrementTransactionVersion(); // Trigger transaction history refresh
      onTransferCompleted();
    } else {
      throw new Error('Transfer failed');
    }
  } catch (error) {
    console.error('Transfer failed:', error);
    alert('Transfer failed. Please try again.');
  } finally {
    isTransferLoading.value = false;
  }
};

// Utility functions
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

const getRoleBadgeClass = (role: string) => {
  const classMap: Record<string, string> = {
    parent: 'bg-blue-50 text-blue-700',
    child: 'bg-emerald-50 text-emerald-700',
    student: 'bg-emerald-50 text-emerald-700',
    admin: 'bg-violet-50 text-violet-700'
  };
  return classMap[role?.toLowerCase()] || 'bg-gray-100 text-gray-600';
};

const getAvatarClass = (role: string) => {
  const classMap: Record<string, string> = {
    parent: 'bg-blue-100 text-blue-700',
    child: 'bg-emerald-100 text-emerald-700',
    student: 'bg-emerald-100 text-emerald-700',
    admin: 'bg-violet-100 text-violet-700'
  };
  return classMap[role?.toLowerCase()] || 'bg-gray-100 text-gray-600';
};

const formatRole = (role: string) => {
  if (!role) return 'Member';
  const roleMap: Record<string, string> = {
    parent: 'Parent',
    child: 'Child',
    student: 'Student',
    admin: 'Admin'
  };
  return roleMap[role.toLowerCase()] || role.charAt(0).toUpperCase() + role.slice(1);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'today';
  if (diffDays === 2) return 'yesterday';
  if (diffDays <= 30) return `${diffDays - 1} days ago`;
  return date.toLocaleDateString();
};

// Load family on mount
onMounted(async () => {
  await Promise.all([
    loadFamily(),
    isParent.value ? fetchCredits() : Promise.resolve()
  ]);
});
</script>
