import { baseProvisionerType } from '../'

export const createValidateMixin = (base: baseProvisionerType) => class extends base {

    hubToClusterMap = {
        'https://develop.hub.codezero.io': 'codezero.dev',
        'https://staging.hub.codezero.io': 'codezero.dev',
        'https://hub.codezero.io': 'codezero.cloud'
    }

    hubToFeatureKeyMap = {
        'https://develop.hub.codezero.io': '2esfjsm95kkj0c8nc7rrlh320c7omri0hu1s',
        'https://staging.hub.codezero.io': 'b510uri5ep25aspo5u8pi94nv3fdgffkhen9',
        'https://hub.codezero.io': 'p2h2meb6rh5d9ac16nskh62ee1h6gs2thnv1'
    }

    hubToStripeKeyMap = {
        'https://develop.hub.codezero.io': 'pk_test_51HXVWKKjz7Cmz2tekhX1kNx5BZXiKn0j4ROatZMROTwHDOwJPl6bnTNsH1DIqxde90FkzTCi9Ix6x5aQxhCuLr7D00tcbfVwNC',
        'https://staging.hub.codezero.io': 'pk_test_51HXVWKKjz7Cmz2tekhX1kNx5BZXiKn0j4ROatZMROTwHDOwJPl6bnTNsH1DIqxde90FkzTCi9Ix6x5aQxhCuLr7D00tcbfVwNC',
        'https://hub.codezero.io': 'pk_live_51HXVWKKjz7Cmz2te0QAP3Z3361Wmpia5EyYBY4CRSM61XrPqEOX4kIg7AWmKTAGeHGxyG9KTGANo94HJvACIibpc00pwdf0L1W'
    }

    hubToCluster = (hubURL) => {
        if (hubURL.endsWith('ngrok.io'))
            return 'codezero.dev'

        return this.hubToClusterMap[hubURL] || 'codezero.cloud'
    }

    hubToFlagKey = (hubURL) => {
        if (hubURL.endsWith('ngrok.io'))
            return '2esfjsm95kkj0c8nc7rrlh320c7omri0hu1s'

        return this.hubToFeatureKeyMap[hubURL] || 'p2h2meb6rh5d9ac16nskh62ee1h6gs2thnv1'
    }

    hubToStripeKey = (hubURL) => {
        if (hubURL.endsWith('ngrok.io'))
            return 'pk_test_51HXVWKKjz7Cmz2tekhX1kNx5BZXiKn0j4ROatZMROTwHDOwJPl6bnTNsH1DIqxde90FkzTCi9Ix6x5aQxhCuLr7D00tcbfVwNC'

        return this.hubToStripeKeyMap[hubURL] || 'pk_live_51HXVWKKjz7Cmz2te0QAP3Z3361Wmpia5EyYBY4CRSM61XrPqEOX4kIg7AWmKTAGeHGxyG9KTGANo94HJvACIibpc00pwdf0L1W'
    }

    async createValidate() {

        const {
            protocol,
            clusterId,
            clusterKey,
            clusterNamespace,
            tag,
            hubServerURL } = this.spec

        if (!clusterId)
            throw new Error('Cluster Id is required')

        if (!clusterNamespace)
            throw new Error('Cluster Namespace is required')

        if (!hubServerURL)
            throw new Error('Hub Server URL is required')

        if (!clusterKey)
            throw new Error('Cluster key is required')

        if (!protocol)
            this.spec.protocol = 'https'

        if (!tag)
            this.spec.tag = 'latest'

        if (!this.spec.clusterDomain)
            this.spec.clusterDomain = this.hubToCluster(this.spec.hubServerURL)

        this.spec.featureAuthKey = this.hubToFlagKey(this.spec.hubServerURL)
        this.spec.stripePublishableKey = this.hubToStripeKey(this.spec.hubServerURL)

        // TODO: This is a hack - we actually add the CRDs here
        // because it is required before apply is called!
        // Can't move this to the provisioner because apply expects a CRD
        if ((await this.manager.cluster.version()).gte('1.16.0'))
            await this.manager.cluster
                .begin(`Provision c6o CRDs for apiextensions.k8s.io/v1`)
                    .upsertFile('../../k8s/crds/apps.v1.yaml')
                    .upsertFile('../../k8s/crds/tasks.v1.yaml')
                    .upsertFile('../../k8s/crds/users.v1.yaml')
                    .upsertFile('../../k8s/crds/oauth.v1.yaml')
                    .upsertFile('../../k8s/crds/dock.v1.yaml')
                .end()
        else
            await this.manager.cluster
                .begin(`Provision c6o CRDs for apiextensions.k8s.io/v1beta1`)
                    .upsertFile('../../k8s/crds/apps.v1beta1.yaml')
                    .upsertFile('../../k8s/crds/tasks.v1beta1.yaml')
                    .upsertFile('../../k8s/crds/users.v1beta1.yaml')
                    .upsertFile('../../k8s/crds/oauth.v1beta1.yaml')
                    .upsertFile('../../k8s/crds/dock.v1beta1.yaml')
                .end()
    }
}
