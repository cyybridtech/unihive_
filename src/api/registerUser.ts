const BASE_URL = "/backend/api";


export const registerUser = async (firstName: string, lastName: string, fullName: string, email: string, phone: string, universityId: string, password: string, gender: string) => {
  const res = await fetch(`${BASE_URL}/register.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      full_name: fullName,
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      universityId,
      password,
      gender
    }),
  });

  return res.json();
};


