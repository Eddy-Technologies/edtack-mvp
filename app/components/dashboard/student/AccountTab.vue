<template>
  <div class="space-y-6">
    <!-- Personal Information -->
    <div class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 border-b">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-900">Personal Information</h2>
          <Button
            v-if="!isEditing"
            variant="secondary"
            text="Edit Profile"
            @clicked="startEditing"
          />
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
              <label class="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
              <input
                v-model="editForm.dateOfBirth"
                type="date"
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
          </div>

          <div class="mt-6 flex space-x-4">
            <Button
              variant="secondary"
              text="Save Changes"
              @clicked="saveProfile"
            />
            <Button
              variant="secondary"
              text="Cancel"
              @clicked="cancelEditing"
            />
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
            <label class="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <p class="text-gray-900">{{ formatDate(personalInfo.dateOfBirth) }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <p class="text-gray-900">{{ personalInfo.phone || 'Not provided' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Academic Information -->
    <div class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 space-y-6">
        <!-- Grade Level -->
        <div class="flex items-center justify-between py-4">
          <div>
            <h4 class="text-lg font-medium text-gray-900">Grade Level</h4>
            <p class="text-gray-600">{{ academicInfo.grade }}</p>
          </div>
          <Button
            variant="secondary"
            text="Change"
            @clicked="showGradeModal = true"
          />
        </div>

        <!-- Parent Information -->
        <div v-if="academicInfo.parentName" class="flex items-center justify-between py-4">
          <div>
            <h4 class="text-lg font-medium text-gray-900">Parent/Guardian</h4>
            <p class="text-gray-600">{{ academicInfo.parentName }}</p>
            <p v-if="academicInfo.parentEmail" class="text-sm text-gray-500">{{ academicInfo.parentEmail }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Subscription Access Notice -->
    <div v-if="!userPaysForSubscription" class="bg-amber-50 border border-amber-200 rounded-xl p-6">
      <div class="flex items-start space-x-3">
        <svg
          class="w-5 h-5 text-amber-600 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <h4 class="font-medium text-amber-800">Subscription Managed by Parent</h4>
          <p class="text-sm text-amber-700 mt-1">
            Your subscription is managed by your parent/guardian. You cannot make changes to your subscription plan directly.
            Contact your parent or guardian if you need to upgrade or modify your plan.
          </p>
        </div>
      </div>
    </div>

    <!-- Address Information -->
    <div class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">Address Information</h3>
      </div>

      <div class="p-6 space-y-6">
        <!-- Payment & Billing Information (only show if user pays for subscription) -->
        <div v-if="userPaysForSubscription" class="flex items-center justify-between py-4 border-b">
          <div>
            <h4 class="text-lg font-medium text-gray-900">Payment & Billing</h4>
            <div v-if="paymentMethod.lastFour" class="text-gray-600">
              <p class="flex items-center space-x-2">
                <span>•••• •••• •••• {{ paymentMethod.lastFour }}</span>
                <span class="text-sm text-gray-500">expires {{ paymentMethod.expiry }}</span>
              </p>
            </div>
            <div v-if="billingAddress.street" class="text-gray-600 mt-1">
              <p class="text-sm">{{ billingAddress.street }}, {{ billingAddress.city }}, {{ billingAddress.state }} {{ billingAddress.zipCode }}</p>
            </div>
            <div v-else class="text-gray-500">
              <p>No payment method on file</p>
            </div>
          </div>
          <Button
            variant="secondary"
            :text="paymentMethod.lastFour ? 'Update' : 'Add Payment Method'"
            @clicked="showBillingModal = true"
          />
        </div>

        <!-- Shipping Address -->
        <div class="flex items-center justify-between py-4">
          <div>
            <h4 class="text-lg font-medium text-gray-900">Shipping Address</h4>
            <div v-if="hasShippingAddress" class="text-gray-600">
              <div v-if="addressSameAsBilling && userPaysForSubscription">
                <p class="text-sm">Same as billing address</p>
              </div>
              <div v-else>
                <p>{{ shippingAddress.street }}</p>
                <p>{{ shippingAddress.city }}, {{ shippingAddress.state }} {{ shippingAddress.zipCode }}</p>
                <p>{{ shippingAddress.country }}</p>
              </div>
            </div>
            <div v-else class="text-gray-500">
              <p>No shipping address provided</p>
            </div>
          </div>
          <Button
            variant="secondary"
            :text="hasShippingAddress ? 'Edit' : 'Add'"
            @clicked="showShippingModal = true"
          />
        </div>
      </div>
    </div>

    <!-- Modals -->
    <ChangeGradeModal
      :is-open="showGradeModal"
      :current-grade="academicInfo.grade"
      @close="showGradeModal = false"
      @grade-updated="handleGradeUpdated"
    />

    <BillingUpdateModal
      :is-open="showBillingModal"
      :current-address="billingAddress"
      @close="showBillingModal = false"
      @payment-updated="handleBillingUpdated"
    />

    <ShippingAddressModal
      :is-open="showShippingModal"
      :current-address="shippingAddress"
      :same-as-billing="addressSameAsBilling"
      @close="showShippingModal = false"
      @address-updated="handleShippingUpdated"
      @same-as-billing-updated="handleSameAsBillingUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Button from '../../common/Button.vue';
import ChangeGradeModal from '../common/ChangeGradeModal.vue';
import BillingUpdateModal from '../common/BillingUpdateModal.vue';
import ShippingAddressModal from '../common/ShippingAddressModal.vue';

const personalInfo = ref({
  firstName: 'Alex',
  lastName: 'Johnson',
  dateOfBirth: '2010-03-15',
  phone: '+1 (555) 123-4567'
});

const academicInfo = ref({
  grade: 'Grade 8',
  parentName: '', // Optional field - empty means not provided
  parentEmail: ''
});

// This would come from user/subscription data
const userPaysForSubscription = ref(false); // Set to true if user pays, false if parent pays

const paymentMethod = ref({
  lastFour: '', // Empty means no payment method on file
  expiry: ''
});

const billingAddress = ref({
  street: '', // Empty means no billing address provided
  city: '',
  state: '',
  zipCode: '',
  country: ''
});

const shippingAddress = ref({
  street: '', // Empty means no shipping address provided
  city: '',
  state: '',
  zipCode: '',
  country: ''
});

const addressSameAsBilling = ref(false);

// Computed properties
const hasShippingAddress = computed(() => {
  return shippingAddress.value.street.trim() !== '' ||
    (addressSameAsBilling.value && userPaysForSubscription.value && billingAddress.value.street.trim() !== '');
});

// Edit mode
const isEditing = ref(false);
const editForm = ref({ ...personalInfo.value });

// Modal states
const showGradeModal = ref(false);
const showBillingModal = ref(false);
const showShippingModal = ref(false);

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

// Event handlers
const handleGradeUpdated = (newGrade: string) => {
  academicInfo.value.grade = newGrade;
};

const handleBillingUpdated = (data: { card: any; address: any }) => {
  // Update payment method display
  paymentMethod.value.lastFour = data.card.number.slice(-4);
  paymentMethod.value.expiry = data.card.expiry;

  // Update billing address
  billingAddress.value = data.address;
  if (addressSameAsBilling.value) {
    shippingAddress.value = { ...data.address };
  }
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
