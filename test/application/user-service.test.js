const dbHandler = require("../db-handler");
const { configureContainer } = require("../../server/container");
const DITokens = require("../../server/container.tokens");
const UserModel = require("../../server/models/Auth/User");
const { ensureTestUserCreated } = require("../api/test-data/create-user");
const { ROLES } = require("../../server/constants/authorization.constants");

let container;
let userService;
let roleService;

beforeAll(async () => {
  await dbHandler.connect();
  container = configureContainer();
  userService = container.resolve(DITokens.userService);
  roleService = container.resolve(DITokens.roleService);
});
afterEach(async () => {
  await UserModel.deleteMany();
});
afterAll(async () => {
  await dbHandler.closeDatabase();
});

describe("UserService", () => {
  it("should get user ", async () => {
    const { id } = await ensureTestUserCreated();
    await userService.getUser(id);
  });

  it("should find no user by role id ", async () => {
    await roleService.syncRoles();
    const role = await roleService.getRoleByName(ROLES.ADMIN);
    const result = await userService.findByRoleId(role.id);
    expect(result?.length).toBeFalsy();
  });

  it("should get users", async () => {
    await ensureTestUserCreated();
    const users = await userService.listUsers(5);
    expect(users.length).toBeGreaterThanOrEqual(1);
  });

  it("should get user roles", async () => {
    const { id } = await ensureTestUserCreated();
    const userRoles = await userService.getUserRoles(id);
    expect(userRoles).toEqual([]);
  });
});
