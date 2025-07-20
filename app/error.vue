<template>
  <div>
    <h1>Error {{ $route.query.statusCode || 'Unknown' }}</h1>
    <pre>{{ JSON.stringify($route.query, null, 2) }}</pre>
  </div>
</template>
