import { baseProvisionerType } from '../../'
import * as Handlebars from 'handlebars'
import { unlinkToken } from '../../constants'
import { createDebug } from '@traxitt/common'

const debug = createDebug()

const dashboards = [
    'dashboard-kubernetes',
    'dashboard-nodejs']

export const metricsMixin = (base: baseProvisionerType) => class extends base {
    grafanaProvisioner

    async linkGrafana(grafanaNamespace, serviceNamespace) {
        await this.unlinkGrafana(serviceNamespace, false)

        await this.grafanaProvisioner.beginConfig(grafanaNamespace, serviceNamespace, 'traxitt-system')

        const prometheusLink = this.spec['prometheus-link'] // see if there's a linked prometheus to reference

        let dataSourceName = '' // use default instead
        if (prometheusLink && prometheusLink !== unlinkToken) {
            dataSourceName = await this.grafanaProvisioner.addDataSource('prometheus', {
                access: 'proxy',
                editable: true,
                isDefault: true,
                jsonData:{
                  timeInterval: '30s'
                },
                orgId: 1,
                type: 'prometheus',
                url: `http://prometheus.${prometheusLink}.svc.cluster.local:9090`
            })
        }

        for (const dashboard of dashboards) {
            const params = {
                dataSource: dataSourceName,
                istioNamespace: serviceNamespace
            }
            await this.addDashboard(dashboard, params)
        }

        await this.grafanaProvisioner.endConfig()
    }

    async unlinkGrafana(serviceNamespace, clearLinkField = true) {
        this.grafanaProvisioner = await this.manager.getProvisionerModule('grafana') // TODO - deprecated
        await this.grafanaProvisioner.clearConfig(serviceNamespace, 'traxitt-system')
        if (clearLinkField)
            delete this.manager.document.spec.provisioner['grafana-link']
    }

    async addDashboard(name, params) {
        const source = await super.readFile(__dirname, `../../../grafana/${name}.json`)
        if (!params)
            return await this.grafanaProvisioner.addDashboard(name, source)

        // fill in template with job names, data source
        const template = Handlebars.compile(source, { noEscape: true })
        const content = template(params)
        return await this.grafanaProvisioner.addDashboard(name, content)
    }
}