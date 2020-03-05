<template>
  <div class="bg-lightLiberty" :style="styles"></div>
</template>

<script>
import serializeObject from '../util/serializeObject';

export default {
  props: {
    address: {
      type: String,
      required: true,
    },
  },
  computed: {
    styles() {
      const params = {
        center: this.address,
        zoom: 13,
        scale: 2,
        size: '600x300',
        maptype: 'roadmap',
        key: process.env.VUE_APP_GOOGLE_API,
        markers: `size:mid|color:0xc7001e|label:|${this.address}`,
      };
      const backgroundImage = `url(https://maps.googleapis.com/maps/api/staticmap?${serializeObject(
        params
      )})`;

      return {
        backgroundImage,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        paddingTop: '50%',
      };
    },
  },
};
</script>
