<template>
  <pricing-table :slice="mockData" />
</template>
<script>
import { PricingTable } from '@/../src'
import mockData from '@/../src/slices/PricingTable/mock.json'
export default {
  components: {
    PricingTable
	},
	layout: 'example',
  data() {
    return {
      mockData
    }
  }
}
</script>
