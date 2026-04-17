import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://uktkoaqigrufpjhiyvas.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrdGtvYXFpZ3J1ZnBqaGl5dmFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTYwNzMyNywiZXhwIjoyMDc1MTgzMzI3fQ.JuGvZ5Hc065W0vymNc0xe0SYVUlOjXC8OcjVwZM_mJo"
);

const userId = "11159d60-afe3-4b84-919e-3c6c5ccdf2c2";

const { data, error } = await supabase.auth.admin.updateUserById(userId, {
  password: "123456",
});

if (error) {
  console.error(error);
} else {
  console.log("Password reset!");
}