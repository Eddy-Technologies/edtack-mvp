<template>
  <div class="dashboard-family">
    <div class="family-container">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p class="text-gray-600">Loading family members...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="flex items-center justify-center w-12 h-12 mx-auto text-red-400 mb-4">
          <UIcon name="i-lucide-alert-circle" size="48" />
        </div>
        <p class="text-red-600 mb-4">{{ error }}</p>
        <Button
          variant="primary"
          text="Try Again"
          @clicked="loadFamily"
        />
      </div>

      <!-- Main Content -->
      <div v-else class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Family Management</h1>
            <p class="text-gray-600">
              {{
                isParent
                  ? 'Create your family group and invite members by email'
                  : (!isParent && pendingInvitations.length > 0)
                    ? 'You have pending family invitations to review'
                    : 'View your family connections'
              }}
            </p>
          </div>

          <!-- Invite Member Button (Parents Only) -->
          <Button
            v-if="isParent"
            variant="primary"
            text="Invite Family Member"
            icon="i-lucide-mail-plus"
            @clicked="showInviteModal = true"
          />
        </div>

        <!-- Family Stats -->
        <div v-if="isParent || (!isParent && activeMembers.length > 0)" class="bg-white rounded-lg border p-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="text-center">
              <div class="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3">
                <UIcon name="i-lucide-users" class="text-blue-600" size="24" />
              </div>
              <p class="text-2xl font-bold text-gray-900">{{ activeMembers.length }}</p>
              <p class="text-sm text-gray-600">Active Members</p>
            </div>

            <div v-if="isParent" class="text-center">
              <div class="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mx-auto mb-3">
                <UIcon name="i-lucide-clock" class="text-yellow-600" size="24" />
              </div>
              <p class="text-2xl font-bold text-gray-900">{{ pendingInvitations.length }}</p>
              <p class="text-sm text-gray-600">Pending Invitations</p>
            </div>

            <div v-if="isParent" class="text-center">
              <div class="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-3">
                <UIcon name="i-lucide-coins" class="text-green-600" size="24" />
              </div>
              <p class="text-2xl font-bold text-gray-900">{{ totalCredits }}</p>
              <p class="text-sm text-gray-600">Total Credits</p>
            </div>

            <div v-if="isParent" class="text-center">
              <div class="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-3">
                <UIcon name="i-lucide-clipboard-list" class="text-purple-600" size="24" />
              </div>
              <p class="text-2xl font-bold text-gray-900">{{ totalTasks }}</p>
              <p class="text-sm text-gray-600">Active Tasks</p>
            </div>
          </div>
        </div>

        <!-- Student Pending Invitations Section -->
        <div v-if="!isParent && pendingInvitations.length > 0" class="bg-white rounded-lg border">
          <div class="px-6 py-4 border-b">
            <h2 class="text-lg font-semibold text-gray-900 flex items-center">
              <UIcon name="i-lucide-mail-plus" class="text-blue-600 mr-2" size="20" />
              Your Family Invitations
            </h2>
          </div>

          <div class="divide-y divide-gray-200">
            <div
              v-for="invitation in pendingInvitations"
              :key="invitation.id"
              class="p-6 bg-blue-50"
            >
              <div class="flex items-start justify-between">
                <div class="flex items-start space-x-4">
                  <div class="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full flex-shrink-0">
                    <UIcon name="i-lucide-users" class="text-blue-700" size="20" />
                  </div>

                  <div class="flex-1 min-w-0">
                    <h3 class="text-lg font-semibold text-gray-900">{{ invitation.group_name || 'Family Group' }}</h3>
                    <p class="text-gray-600 mb-2">You have been invited to join this family</p>
                    <div class="flex items-center space-x-4 text-sm text-gray-600">
                      <div class="flex items-center space-x-1">
                        <UIcon name="i-lucide-calendar" size="16" />
                        <span>Invited {{ formatDate(invitation.invited_at) }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="flex items-center space-x-2 ml-4">
                  <Button
                    variant="primary"
                    text="Accept"
                    size="sm"
                    @clicked="acceptInvitation(invitation)"
                  />
                  <Button
                    variant="secondary"
                    text="Decline"
                    size="sm"
                    @clicked="declineInvitation(invitation)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Parent Pending Invitations Section -->
        <div v-if="isParent && pendingInvitations.length > 0" class="bg-white rounded-lg border">
          <div class="px-6 py-4 border-b">
            <h2 class="text-lg font-semibold text-gray-900 flex items-center">
              <UIcon name="i-lucide-clock" class="text-yellow-600 mr-2" size="20" />
              Pending Invitations
            </h2>
          </div>

          <div class="divide-y divide-gray-200">
            <div
              v-for="invitation in pendingInvitations"
              :key="invitation.id"
              class="p-6 bg-yellow-50"
            >
              <div class="flex items-start justify-between">
                <div class="flex items-start space-x-4">
                  <div class="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full flex-shrink-0">
                    <UIcon name="i-lucide-mail" class="text-yellow-700" size="20" />
                  </div>

                  <div class="flex-1 min-w-0">
                    <h3 class="text-lg font-semibold text-gray-900">{{ invitation.email }}</h3>
                    <p class="text-gray-600 mb-2">Invitation sent</p>
                    <div class="flex items-center space-x-4 text-sm text-gray-600">
                      <div class="flex items-center space-x-1">
                        <UIcon name="i-lucide-calendar" size="16" />
                        <span>Sent {{ formatDate(invitation.invited_at) }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="flex items-center space-x-2 ml-4">
                  <span class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                    Pending
                  </span>
                  <Button
                    variant="danger"
                    text="Cancel"
                    size="sm"
                    @clicked="cancelInvitation(invitation)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Student Empty State (no family connections and no pending invitations) -->
        <div v-if="!isParent && activeMembers.length === 0 && pendingInvitations.length === 0" class="bg-white rounded-lg border">
          <div class="text-center py-16">
            <div class="flex items-center justify-center w-20 h-20 mx-auto text-gray-300 mb-6">
              <UIcon name="i-lucide-users-x" size="80" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">No Family Connections</h3>
            <p class="text-gray-500 max-w-md mx-auto mb-6">
              You haven't been connected to any family members yet. Ask a parent or family member to invite you to their family group to start sharing data and collaborating.
            </p>
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <div class="flex items-start space-x-3">
                <div class="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full flex-shrink-0">
                  <UIcon name="i-lucide-info" class="text-blue-600" size="16" />
                </div>
                <div class="text-left">
                  <p class="text-sm font-medium text-blue-900 mb-1">How to get connected:</p>
                  <p class="text-sm text-blue-700">Ask a family member to invite you using your email address from their Family Management page.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Active Members List -->
        <div v-if="isParent || (!isParent && activeMembers.length > 0)" class="bg-white rounded-lg border">
          <div class="px-6 py-4 border-b">
            <h2 class="text-lg font-semibold text-gray-900">
              {{ isParent ? 'Active Family Members' : 'Family Members' }}
            </h2>
          </div>

          <!-- Empty State -->
          <div v-if="activeMembers.length === 0" class="text-center py-12">
            <div class="flex items-center justify-center w-16 h-16 mx-auto text-gray-300 mb-4">
              <UIcon name="i-lucide-users" size="64" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              {{ isParent ? 'No active family members yet' : 'No family connections' }}
            </h3>
            <p class="text-gray-500 mb-6">
              {{ isParent ? 'Invite family members by email. Once they accept, they\'ll appear here and you can share data and credits.' : 'You haven\'t been connected to any family members yet.' }}
            </p>
            <Button
              v-if="isParent"
              variant="primary"
              text="Invite Your First Family Member"
              icon="i-lucide-mail-plus"
              @clicked="showInviteModal = true"
            />
          </div>

          <!-- Active Members List -->
          <div v-else class="divide-y divide-gray-200">
            <div
              v-for="member in activeMembers"
              :key="member.id"
              class="p-6 hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-start justify-between">
                <!-- Member Info -->
                <div class="flex items-start space-x-4">
                  <!-- Avatar -->
                  <div class="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full flex-shrink-0">
                    <span class="text-green-700 font-medium text-lg">
                      {{ getInitials(member.userDisplayFullName || member.email) }}
                    </span>
                  </div>

                  <!-- Details -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center space-x-3 mb-2">
                      <h3 class="text-lg font-semibold text-gray-900">
                        {{ member.userDisplayFullName || member.email }}
                      </h3>
                      <span :class="getRoleBadgeClass(member.user_role)" class="px-2 py-1 rounded-full text-xs font-medium">
                        {{ member.user_role ? member.user_role.charAt(0).toUpperCase() + member.user_role.slice(1) : 'Member' }}
                      </span>
                      <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        Active
                      </span>
                    </div>

                    <p class="text-gray-600 mb-3">{{ member.email }}</p>

                    <!-- Stats -->
                    <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div class="flex items-center space-x-1">
                        <UIcon name="i-lucide-calendar" size="16" />
                        <span>Joined {{ formatDate(member.joined_at || member.created_at) }}</span>
                      </div>

                      <div v-if="member.credits !== undefined" class="flex items-center space-x-1">
                        <UIcon name="i-lucide-coins" size="16" />
                        <span>{{ formatCredits(member.credits) }} credits</span>
                      </div>

                      <div v-if="member.activeTasks" class="flex items-center space-x-1">
                        <UIcon name="i-lucide-clipboard-list" size="16" />
                        <span>{{ member.activeTasks }} active tasks</span>
                      </div>

                      <div class="flex items-center space-x-1">
                        <UIcon name="i-lucide-database" size="16" />
                        <span>Data shared</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div v-if="isParent" class="flex items-center space-x-2 ml-4">
                  <Button
                    variant="secondary"
                    text="Transfer Credits"
                    size="sm"
                    @clicked="transferCredits(member)"
                  />
                  <Button
                    variant="danger"
                    text="Remove"
                    size="sm"
                    @clicked="removeMember(member)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
      @close="showTransferModal = false"
      @transfer-completed="onTransferCompleted"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Button from '../common/Button.vue';
import InviteMemberModal from './family/InviteMemberModal.vue';
import RemoveMemberModal from './family/RemoveMemberModal.vue';
import TransferCreditsModal from './family/TransferCreditsModal.vue';

// Reactive state
const familyMembers = ref<any[]>([]);
const pendingInvitations = ref<any[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const isParent = ref(false);
const totalTasks = ref(0);

// Modal states
const showInviteModal = ref(false);
const showRemoveModal = ref(false);
const showTransferModal = ref(false);
const selectedMember = ref<any>(null);

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
        isParent.value = false;
        totalTasks.value = 0;
      } else {
        // Normal flow - separate active members from pending invitations
        const allMembers = response.familyMembers || [];
        familyMembers.value = allMembers.filter((member: any) => member.status === 'active');
        pendingInvitations.value = allMembers.filter((member: any) => member.status === 'pending');

        isParent.value = response.isParent || false;
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

const viewProfile = (member: any) => {
  // Navigate to member profile or show details modal
  console.log('View profile for:', member);
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
  const classMap = {
    parent: 'bg-blue-100 text-blue-800',
    child: 'bg-green-100 text-green-800',
    admin: 'bg-purple-100 text-purple-800'
  };
  return classMap[role as keyof typeof classMap] || 'bg-gray-100 text-gray-800';
};

const formatCredits = (cents: number) => {
  return `${(cents / 100).toFixed(0)}`;
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
onMounted(() => {
  loadFamily();
});
</script>

<style scoped>
.dashboard-family {
  height: 100%;
  overflow-y: auto;
}

.family-container {
  padding: 20px;
  min-height: 100%;
  width: 100%;
  max-width: 6xl;
  margin: 0 auto;
}
</style>
