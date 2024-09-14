import { User } from "../models/user.js";
import { faker } from "@faker-js/faker";
const seedUsers = async (numUser) => {
  try {
    const userPromise = [];
    for (let i = 0; i < numUser; i++) {
      const tempUser = User.create({
        name: faker.person.fullName(),
        userName: faker.internet.userName(),
        password: "password",
        profilePic: {
          url: faker.image.avatar(),
          public_id: faker.system.fileName(),
        },
      });
      userPromise.push(tempUser);
    }

    await Promise.all(userPromise);
    console.log("User created");
    process.exit(1);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

export { seedUsers };
