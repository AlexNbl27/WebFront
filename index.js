let users = [];

async function fetchUsers() {
  const response = await fetch("https://randomuser.me/api/?results=20");
  const data = await response.json();
  users = data.results;
  return users;
}

function renderUsers(renderedUsers) {
  const usersDisplayed = document.getElementById("users-displayed");
  usersDisplayed.textContent = `Number of users displayed: ${renderedUsers.length} on ${users.length}`;
  const tbody = document.querySelector("#tbl-users tbody");
  tbody.innerHTML = "";
  const rows = renderedUsers.map((user) => {
    const gender = user.gender === "female" ? "👩" : "👨";
    return `
            <tr>
                <td><img src="${user.picture.thumbnail}" alt=""></td>
                <td>${user.name.first} ${user.name.last}</td>
                <td>${gender}</td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td>${user.dob.age}</td>
            </tr>
        `;
  });
  tbody.innerHTML = rows.join("");
}

function searchUsersByName(users, searchTerm) {
  return users.filter((user) =>
    `${user.name.first} ${user.name.last}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );
}

function filterUsersByGender(users, gender) {
  if (gender === "male" || gender === "female") {
    return users.filter((user) => user.gender === gender);
  }
  return users;
}

document.getElementById("fetch-users").addEventListener("click", async () => {
  users = await fetchUsers();
  renderUsers(users);
});

document
  .getElementById("search-users")
  .addEventListener("input", async (event) => {
    const searchTerm = event.target.value;
    const filteredUsers = searchUsersByName(users, searchTerm);
    renderUsers(filteredUsers);
  });

document
  .getElementById("filter-users")
  .addEventListener("change", async (event) => {
    const selectedOption = event.target.value;
    const filteredUsers = filterUsersByGender(users, selectedOption);
    renderUsers(filteredUsers);
  });
