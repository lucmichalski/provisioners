import { baseProvisionerType } from '..'

export const removeApplyMixin = (base: baseProvisionerType) => class extends base {

    async removeApply() {

        const namespace = this.manager.document.metadata.namespace
        const projects = this.spec.projects || false
        const storage = this.spec.storage || '2Gi'
    
        await this.manager.cluster
            .begin('Uninstall Node-RED services')
                .deleteFile('../../k8s/pvc.yaml', { namespace, storage })
                .deleteFile('../../k8s/deployment.yaml', { namespace, projects })
                .deleteFile('../../k8s/service.yaml', { namespace })
            .end()
    }
}