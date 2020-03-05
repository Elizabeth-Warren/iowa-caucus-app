<template functional>
  <div :class="[data.class, data.staticClass, 'bg-white', 'px-8', 'py-6']">
    <slot />
  </div>
</template>
