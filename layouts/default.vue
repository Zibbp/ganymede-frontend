<template>
  <div>
    <ClientOnly>
      <LayoutNavbar />
    </ClientOnly>
    <Toast />
    <ConfirmDialog></ConfirmDialog>
    <slot />
  </div>
</template>

<script setup></script>

<style lang="scss" scoped></style>
