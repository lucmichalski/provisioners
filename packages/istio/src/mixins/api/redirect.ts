import { baseProvisionerType } from '../../'

export const httpsRedirectApiMixin = (base: baseProvisionerType) => class extends base {
    'https-redirect' = {
        find: async () => {
            const result = await this.findGateway()
            if (result.error)
                return result.error
            return {enable: result.object?.spec?.servers?.[0]?.tls?.httpsRedirect}
        },

        create: async (data) => {
            // TODO - errors - gateway has wrong name?
            const result = await this.setHttpsRedirect(data.enable)
            return result.object || result.error
        }
    }

    gateway = {
        apiVersion: 'networking.istio.io/v1alpha3',
        kind: 'Gateway',
        metadata: {
            name: 'system-gateway',
            namespace: 'c6o-system'
        }
    }

    async findGateway() {
        return await this.manager.cluster.read(this.gateway)
    }

    async setHttpsRedirect(enable) {
        return await this.manager.cluster.patch(this.gateway, [{ 'op': 'replace', 'path': '/spec/servers/0/tls/httpsRedirect', 'value': enable}])
    }
}