import { baseProvisionerType } from '../index'

export const removeApplyMixin = (base: baseProvisionerType) => class extends base {
    
    async removeApply() {
        const namespace = this.manager.document.metadata.namespace
    
        const result = await this.manager.cluster.list(this.dashboardConfigMap(namespace))

        let hasDashboards = false
        let configMaps = []
        if (!result.error) {
            hasDashboards = result.object?.items?.length ? true : false
            configMaps = result.object?.items
        }

        if (hasDashboards && !this.providedDeprovisionOption('force'))
            throw Error('dashboards exist, use force option to remove')
        
        // remove added dashboards if any
        for (const configMap of configMaps) {
            configMap.kind = 'ConfigMap'
            await this.manager.cluster.delete(configMap)
        }

        // delete the other resources
        await this.manager.cluster
            .begin('Uninstall Grafana services')
                .deleteFile('../../k8s/pvc.yaml', { namespace })
                .deleteFile('../../k8s/deployment.yaml', { namespace, adminUsername:'dummy', adminPassword:'dummy' })
                .deleteFile('../../k8s/service.yaml', { namespace })
            .end()
    }
}