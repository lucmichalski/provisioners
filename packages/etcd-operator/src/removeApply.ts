import { baseProvisionerType } from './index'

export const removeApplyMixin = (base: baseProvisionerType) => class extends base {
    async removeApply() {
        // TODO: Implement deprovision
    }
}