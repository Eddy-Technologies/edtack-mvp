<template>
  <div
    :class="cardClasses"
    @click="handleClick"
  >
    <div
      v-if="$slots.header || headerTitle"
      :class="headerClasses"
    >
      <slot name="header">
        <div class="flex items-center justify-between">
          <div>
            <h2
              v-if="headerTitle"
              :class="titleClasses"
            >
              {{ headerTitle }}
            </h2>
            <p
              v-if="headerSubtitle"
              class="text-gray-600 text-sm mt-1"
            >
              {{ headerSubtitle }}
            </p>
          </div>
          <slot name="headerAction" />
        </div>
      </slot>
    </div>

    <div :class="contentClasses">
      <slot />
    </div>

    <div
      v-if="$slots.footer"
      :class="footerClasses"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'default' | 'stats' | 'profile' | 'product' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  headerTitle?: string;
  headerSubtitle?: string;
  showHeaderBorder?: boolean;
  hoverable?: boolean;
  clickable?: boolean;
  extraClasses?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
  showHeaderBorder: false,
  hoverable: false,
  clickable: false,
  extraClasses: ''
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const cardClasses = computed(() => {
  const baseClasses = 'bg-white rounded-xl shadow-sm border';
  const variantClasses = {
    default: '',
    stats: '',
    profile: '',
    product: 'hover:shadow-lg transition-all duration-300',
    bordered: 'border-2'
  };

  const hoverClasses = props.hoverable ? 'hover:shadow-lg transition-shadow duration-200' : '';
  const clickableClasses = props.clickable ? 'cursor-pointer hover:shadow-lg transition-shadow duration-200' : '';
  const productHover = props.variant === 'product' ? 'transform hover:-translate-y-1' : '';

  return [
    baseClasses,
    variantClasses[props.variant],
    hoverClasses,
    clickableClasses,
    productHover,
    props.extraClasses
  ].filter(Boolean).join(' ');
});

const headerClasses = computed(() => {
  const paddingMap = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const borderClass = props.showHeaderBorder ? 'border-b' : '';

  return [
    paddingMap[props.padding],
    borderClass
  ].filter(Boolean).join(' ');
});

const contentClasses = computed(() => {
  const paddingMap = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return paddingMap[props.padding];
});

const footerClasses = computed(() => {
  const paddingMap = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return [
    paddingMap[props.padding],
    'border-t'
  ].filter(Boolean).join(' ');
});

const titleClasses = computed(() => {
  const sizeMap = {
    default: 'text-xl font-semibold text-gray-900',
    stats: 'text-lg font-semibold text-gray-900',
    profile: 'text-2xl font-bold text-gray-900',
    product: 'text-lg font-semibold text-gray-900',
    bordered: 'text-2xl font-bold text-gray-900'
  };

  return sizeMap[props.variant];
});

const handleClick = (event: MouseEvent) => {
  if (props.clickable) {
    emit('click', event);
  }
};
</script>
