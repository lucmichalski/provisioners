import { baseProvisionerType } from '../index'
import { metadata } from 'core-js/fn/reflect'

export const removeApplyMixin = (base: baseProvisionerType) => class extends base {

    toMySqlClusterDoc = (namespace) => ({
        apiVersion: 'mysql.presslabs.org/v1alpha1',
        kind: 'MysqlCluster',
        metadata: { namespace }
    })

    toMySqlServiceDoc = (namespace) => ({
        kind: 'Service',
        metadata: {
            namespace,
            name: 'mysql'
        }
    })

    async removeApply() {
        const namespace = this.manager.document.metadata.namespace
        const mysqlClusterDoc = this.toMySqlClusterDoc(namespace)

        await this.manager.cluster
            .begin('Remove MySQL data')
                .list(mysqlClusterDoc)
                .do(async (result, processor) => {
                    // There should be just one MySqlCluster
                    if (result?.object?.items?.length)
                        for(const instance of result?.object?.items) {
                            instance.apiVersion = mysqlClusterDoc.apiVersion
                            instance.kind = mysqlClusterDoc.kind
                            // Remove the finalizer so it doesn't block uninstall
                            await this.manager.cluster.patch(instance, [{ 'op': 'remove', 'path': '/metadata/finalizers'}])
                            processor.delete(instance)
                        }
                })
            .end()

        // It is then safe to remove the following
        // You may not have to remove the following because owners takes care of most of it
        await this.manager.cluster
            .begin('De-provisioning the app')
                .deleteFile('../../k8s/preview/preview.yaml', { namespace })
                .deleteFile('../../k8s/full/1-mysql-operator.yaml', { namespace })
                .deleteFile('../../k8s/full/2-minio-operator.yaml', { namespace })
                .deleteFile('../../k8s/full/3-mattermost-operator.yaml', { namespace })
                .deleteFile('../../k8s/full/4-mattermost-cluster.yaml', { namespace })
                .deleteFile('../../k8s/full/remove-stragglers.yaml', { namespace })
            .end()

        // Do not remove the CRDs as there could be other instances of mattermost
        // or the relevant instances

        // TODO: There are ConfigMaps and Secrets left behind.
    }
}