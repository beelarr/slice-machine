<template>
  <call-to-action :slice="mockData" />
</template>
<script>
import { CallToAction } from '@/../src'
import mockData from '@/../src/slices/CallToAction/mock.json'
export default {
  components: {
    CallToAction
	},
	layout: 'example',
  data() {
    return {
      mockData
    }
  }
}
</script>
