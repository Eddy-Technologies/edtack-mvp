<script setup lang="ts">
// Backward-compatibility redirect: /chat/:charSlug/:threadId → /chat/:threadId
definePageMeta({ layout: false });
const route = useRoute();
const threadId = route.params.threadId as string;
navigateTo(`/chat/${threadId}`, { replace: true, redirectCode: 301 });
</script>
