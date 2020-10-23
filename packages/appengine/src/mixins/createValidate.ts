import { baseProvisionerType } from '../index'


export const createValidateMixin = (base: baseProvisionerType) => class extends base {
	async createValidate() {

		if (!this.spec.parsed)
			this.parseInputsToSpec(null)

	}
}