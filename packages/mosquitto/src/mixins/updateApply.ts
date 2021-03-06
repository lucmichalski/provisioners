import { baseProvisionerType } from '../index'

export const updateApplyMixin = (base: baseProvisionerType) => class extends base {

    async updateAddUser(appNamespace) {
        const newUser = this.spec['add-user']
        if (newUser) {
            this.manager.status?.push('Adding user to Mosquitto')
            await this.addUser(newUser.user, newUser.password, appNamespace, true)
            this.manager.document.spec.provisioner['add-user'] = '$unset'
            this.manager.status?.pop()
        }
    }

    async updateRemoveUser(appNamespace) {
        const removeUser = this.spec['remove-user']

        if (removeUser) {
            this.manager.status?.push('Removing user from Mosquitto')
            await this.removeUser(removeUser.user, appNamespace, true)
            this.manager.document.spec.provisioner['remove-user'] = '$unset'
            this.manager.status?.pop()
        }
    }

    async updateUpdateUser(appNamespace) {
        const updateUser = this.spec['update-user']

        if (updateUser) {
            this.manager.status?.push('Updating user in Mosquitto')
            await this.updateUser(updateUser.originalUsername, updateUser.newUsername, updateUser.password, appNamespace)
            this.manager.document.spec.provisioner['update-user'] = '$unset'
            this.manager.status?.pop()
        }
    }

    async updateApply() {

        const appNamespace = this.manager.document.metadata.namespace

        await this.updateAddUser(appNamespace)
        await this.updateRemoveUser(appNamespace)
        await this.updateUpdateUser(appNamespace)
    }
}