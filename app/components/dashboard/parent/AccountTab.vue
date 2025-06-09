<template>
  <div class="space-y-6">
    <!-- Personal Information -->
    <div class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 border-b">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-900">Personal Information</h2>
          <button
            v-if="!isEditing"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            @click="startEditing"
          >
            Edit Profile
          </button>
        </div>
      </div>

      <div class="p-6">
        <form v-if="isEditing" @submit.prevent="saveProfile">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input
                v-model="editForm.firstName"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input
                v-model="editForm.lastName"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                v-model="editForm.phone"
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
              <input
                v-model="editForm.dateOfBirth"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
          </div>

          <div class="mt-6 flex space-x-4">
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
            <button
              type="button"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              @click="cancelEditing"
            >
              Cancel
            </button>
          </div>
        </form>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <p class="text-gray-900">{{ personalInfo.firstName }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <p class="text-gray-900">{{ personalInfo.lastName }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <p class="text-gray-900">{{ personalInfo.phone || 'Not provided' }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <p class="text-gray-900">{{ formatDate(personalInfo.dateOfBirth) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Children Management -->
    <div class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 border-b">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">Children</h3>
          <button
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            @click="showAddChildModal = true"
          >
            Add Child
          </button>
        </div>
      </div>

      <div class="p-6">
        <div class="space-y-4">
          <div v-for="child in children" :key="child.id" class="flex items-center justify-between p-4 border rounded-lg">
            <div class="flex items-center space-x-4">
              <img :src="child.avatar" :alt="child.name" class="w-12 h-12 rounded-full">
              <div>
                <h4 class="font-medium text-gray-900">{{ child.name }}</h4>
                <p class="text-sm text-gray-600">{{ child.grade }} • {{ child.email }}</p>
                <div class="flex items-center space-x-2 mt-1">
                  <span
                    :class="[
                      'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                      child.plan === 'Premium' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    ]"
                  >
                    {{ child.plan }} Plan
                  </span>
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <button
                class="px-3 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors text-sm"
                @click="editChild(child)"
              >
                Edit
              </button>
              <button
                class="px-3 py-1 text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors text-sm"
                @click="removeChild(child.id)"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Billing & Address -->
    <div class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">Billing & Address</h3>
      </div>

      <div class="p-6 space-y-6">
        <!-- Billing Address -->
        <div class="flex items-center justify-between py-4 border-b">
          <div>
            <h4 class="text-lg font-medium text-gray-900">Billing Address</h4>
            <div class="text-gray-600">
              <p>{{ billingAddress.street }}</p>
              <p>{{ billingAddress.city }}, {{ billingAddress.state }} {{ billingAddress.zipCode }}</p>
              <p>{{ billingAddress.country }}</p>
            </div>
          </div>
          <button
            class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            @click="showBillingModal = true"
          >
            Edit
          </button>
        </div>

        <!-- Shipping Address -->
        <div class="flex items-center justify-between py-4">
          <div>
            <h4 class="text-lg font-medium text-gray-900">Shipping Address</h4>
            <div v-if="addressSameAsBilling" class="text-gray-600">
              <p class="text-sm">Same as billing address</p>
            </div>
            <div v-else class="text-gray-600">
              <p>{{ shippingAddress.street }}</p>
              <p>{{ shippingAddress.city }}, {{ shippingAddress.state }} {{ shippingAddress.zipCode }}</p>
              <p>{{ shippingAddress.country }}</p>
            </div>
          </div>
          <button
            class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            @click="showShippingModal = true"
          >
            Edit
          </button>
        </div>
      </div>
    </div>

    <!-- Family Settings -->
    <div class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">Family Settings</h3>
      </div>

      <div class="p-6 space-y-6">
        <!-- Parental Controls -->
        <div class="flex items-center justify-between py-4 border-b">
          <div>
            <h4 class="text-lg font-medium text-gray-900">Parental Controls</h4>
            <p class="text-gray-600">Manage content restrictions and screen time limits</p>
          </div>
          <button
            class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            @click="showParentalControlsModal = true"
          >
            Configure
          </button>
        </div>

        <!-- Notifications -->
        <div class="flex items-center justify-between py-4">
          <div>
            <h4 class="text-lg font-medium text-gray-900">Email Notifications</h4>
            <p class="text-gray-600">Receive updates about your children's progress</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              v-model="settings.emailNotifications"
              type="checkbox"
              class="sr-only peer"
            >
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
          </label>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <AddChildModal
      :is-open="showAddChildModal"
      @close="showAddChildModal = false"
      @child-added="handleChildAdded"
    />

    <EditChildModal
      :is-open="showEditChildModal"
      :child="selectedChild"
      @close="showEditChildModal = false"
      @child-updated="handleChildUpdated"
    />

    <BillingUpdateModal
      :is-open="showBillingModal"
      :current-address="billingAddress"
      @close="showBillingModal = false"
      @payment-updated="handlePaymentUpdated"
    />

    <ShippingAddressModal
      :is-open="showShippingModal"
      :current-address="shippingAddress"
      :same-as-billing="addressSameAsBilling"
      @close="showShippingModal = false"
      @address-updated="handleShippingUpdated"
      @same-as-billing-updated="handleSameAsBillingUpdated"
    />

    <ParentalControlsModal
      :is-open="showParentalControlsModal"
      @close="showParentalControlsModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AddChildModal from '../common/AddChildModal.vue';
import EditChildModal from '../common/EditChildModal.vue';
import BillingUpdateModal from '../common/BillingUpdateModal.vue';
import ShippingAddressModal from '../common/ShippingAddressModal.vue';
import ParentalControlsModal from '../common/ParentalControlsModal.vue';

const personalInfo = ref({
  firstName: 'Sarah',
  lastName: 'Johnson',
  phone: '+1 (555) 987-6543',
  dateOfBirth: '1985-06-20'
});

const children = ref([
  {
    id: 1,
    name: 'Emma Johnson',
    email: 'emma.johnson@student.edu',
    grade: 'Grade 10',
    avatar: '/child1-avatar.png',
    plan: 'Premium'
  },
  {
    id: 2,
    name: 'Liam Johnson',
    email: 'liam.johnson@student.edu',
    grade: 'Grade 8',
    avatar: '/child2-avatar.png',
    plan: 'Free'
  }
]);

const billingAddress = ref({
  street: '123 Main Street',
  city: 'San Francisco',
  state: 'CA',
  zipCode: '94102',
  country: 'United States'
});

const shippingAddress = ref({
  street: '123 Main Street',
  city: 'San Francisco',
  state: 'CA',
  zipCode: '94102',
  country: 'United States'
});

const addressSameAsBilling = ref(true);

const settings = ref({
  emailNotifications: true
});

// Edit mode
const isEditing = ref(false);
const editForm = ref({ ...personalInfo.value });

// Modal states
const showAddChildModal = ref(false);
const showEditChildModal = ref(false);
const showBillingModal = ref(false);
const showShippingModal = ref(false);
const showParentalControlsModal = ref(false);
const selectedChild = ref(null);

// Methods
const startEditing = () => {
  isEditing.value = true;
  editForm.value = { ...personalInfo.value };
};

const cancelEditing = () => {
  isEditing.value = false;
  editForm.value = { ...personalInfo.value };
};

const saveProfile = () => {
  personalInfo.value = { ...editForm.value };
  isEditing.value = false;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const editChild = (child: any) => {
  selectedChild.value = child;
  showEditChildModal.value = true;
};

const removeChild = (childId: number) => {
  if (confirm('Are you sure you want to remove this child from your account?')) {
    children.value = children.value.filter((child) => child.id !== childId);
  }
};

// Event handlers
const handleChildAdded = (newChild: any) => {
  children.value.push({ ...newChild, id: Date.now() });
};

const handleChildUpdated = (updatedChild: any) => {
  const index = children.value.findIndex((child) => child.id === updatedChild.id);
  if (index !== -1) {
    children.value[index] = updatedChild;
  }
};

const handlePaymentUpdated = (data: { card: any; address: any }) => {
  // Update billing address
  billingAddress.value = data.address;
  if (addressSameAsBilling.value) {
    shippingAddress.value = data.address;
  }

  // Handle payment method updates (would typically update payment method state)
  console.log('Payment method updated:', data.card);
  // In a real implementation, you would update payment method state here
};

const handleShippingUpdated = (address: any) => {
  shippingAddress.value = address;
  addressSameAsBilling.value = false;
};

const handleSameAsBillingUpdated = (sameAsBilling: boolean) => {
  addressSameAsBilling.value = sameAsBilling;
  if (sameAsBilling) {
    shippingAddress.value = { ...billingAddress.value };
  }
};
</script>
