import PermissionModel from "../../models/Auth/Permission";
import {flattenPermissionDefinition} from "../../constants/authorization.constants";
import {NotFoundException} from "../../exceptions/runtime.exceptions";

class PermissionService {
    #permissions = [];
    #logger;

    constructor({loggerFactory}) {
        this.#logger = loggerFactory("RoleService");
    }

    get permissions() {
        return this.#permissions;
    }

    authorizePermission(requiredPermission, assignedPermissions) {
        return !!assignedPermissions.find((assignedPermission) => {
            const normalizePermission = this.#normalizePermission(assignedPermission);
            if (!normalizePermission)
                return false;
            return normalizePermission === requiredPermission;
        });
    }

    async getPermissionByName(permissionName) {
        const permission = await this.permissions.find((r) => r.name === permissionName);
        if (!permission)
            throw new NotFoundException("Permission not found");
        return permission;
    }

    async getPermission(permissionId) {
        const permission = await this.permissions.find((r) => r.id === permissionId);
        if (!permission)
            throw new NotFoundException(`Permission Id '${permissionId}' not found`);
        return permission;
    }

    async syncPermissions() {
        this.#permissions = [];
        const permissionDefinition = flattenPermissionDefinition();
        for (let permission of permissionDefinition) {
            const storedPermission = await PermissionModel.findOne({name: permission});
            if (!storedPermission) {
                const newPermission = await PermissionModel.create({
                    name: permission
                });
                this.#permissions.push(newPermission);
            } else {
                this.#permissions.push(storedPermission);
            }
        }
    }

    #normalizePermission(assignedPermission) {
        const permissionInstance = this.permissions.find((r) => r.id === assignedPermission || r.name === assignedPermission);
        if (!permissionInstance) {
            console.warn(`The permission by ID ${assignedPermission} did not exist. Skipping.`);
            return;
        }
        return permissionInstance.name;
    }
}

export default PermissionService;
