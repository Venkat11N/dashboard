import bcrypt from "bcryptjs";

async function run() {
  const hash = await bcrypt.hash("password123", 10);
  console.log("Generated hash:", hash);
}

run();
